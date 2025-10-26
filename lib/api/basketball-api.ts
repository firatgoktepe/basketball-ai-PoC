import { useMutation, useQuery } from "@tanstack/react-query";

// Backend API types
export interface BackendScoreEvent {
  type: "score";
  frame: number;
  timestamp: number;
  confidence: number;
  mode: "nbaction_exact";
}

export interface BackendVideoInfo {
  fps: number;
  frames: number;
}

export interface BackendResults {
  video: BackendVideoInfo;
  scores: BackendScoreEvent[];
  total_scores: number;
}

export interface BackendJobStatus {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  filename?: string;
  created_at?: string;
  results?: BackendResults;
  video_url?: string;
  error?: string;
}

export interface BackendUploadResponse {
  job_id: string;
  status: string;
  message: string;
}

// API configuration
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
).replace(/\/$/, "");

// Debug: Log the backend URL being used
console.log("Backend URL:", BACKEND_URL);

// Real video compression using MediaRecorder API
const compressVideo = async (file: File, quality: number = 0.7, maxResolution: number = 1280): Promise<File> => {
  console.log(`Compressing video: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  console.log(`Settings: quality=${quality}, maxResolution=${maxResolution}p`);

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      let newWidth = Math.min(video.videoWidth, maxResolution);
      let newHeight = newWidth / aspectRatio;

      // If height is too large, scale down
      if (newHeight > maxResolution) {
        newHeight = maxResolution;
        newWidth = newHeight * aspectRatio;
      }

      console.log(`Original: ${video.videoWidth}x${video.videoHeight} → Compressed: ${newWidth}x${newHeight}`);

      // Create MediaRecorder for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(
        canvas.captureStream(30), // 30fps
        {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: Math.floor(1000000 * quality) // Adjust bitrate based on quality
        }
      );

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm',
          lastModified: Date.now()
        });

        console.log(`Compressed: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) → ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(1)}MB)`);
        resolve(compressedFile);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        reject(new Error('Video compression failed'));
      };

      // Start recording
      mediaRecorder.start();

      // Draw video frames to canvas
      const drawFrame = () => {
        if (ctx && video.videoWidth > 0) {
          ctx.drawImage(video, 0, 0, newWidth, newHeight);
        }
      };

      // Draw frames at 30fps
      const frameInterval = 1000 / 30;
      let lastTime = 0;

      const animate = (currentTime: number) => {
        if (currentTime - lastTime >= frameInterval) {
          drawFrame();
          lastTime = currentTime;
        }

        if (!video.paused && !video.ended) {
          requestAnimationFrame(animate);
        } else {
          mediaRecorder.stop();
        }
      };

      video.onplay = () => {
        requestAnimationFrame(animate);
      };

      // Start video playback
      video.currentTime = 0;
      video.play();
    };

    video.onerror = () => {
      reject(new Error('Video loading failed'));
    };

    video.src = URL.createObjectURL(file);
  });
};

// Upload via proxy (always use proxy to avoid CORS issues)
const uploadViaProxy = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<BackendUploadResponse> => {
  console.log("Uploading via Next.js API route (proxy)...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("generate_video", "true");

  const response = await fetch("/api/upload-proxy", {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(30 * 60 * 1000), // 30 minutes timeout
  });

  console.log("Proxy response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed:", errorText);
    throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
};


// Main upload function with optimizations
export const uploadVideo = async (
  file: File,
  options: {
    compress?: boolean;
    quality?: number;
    maxResolution?: number;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<BackendUploadResponse> => {
  const { compress = true, quality = 0.7, maxResolution = 1280, onProgress } = options;

  console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...`);

  try {
    let fileToUpload = file;

    // Apply compression if requested and file is large enough
    if (compress && file.size > 20 * 1024 * 1024) { // Only compress files > 20MB
      console.log(`Compression requested: quality=${quality}, maxResolution=${maxResolution}p`);
      console.log("Optimizing file for faster upload...");

      try {
        fileToUpload = await compressVideo(file, quality, maxResolution);
        console.log(`Compression completed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB`);
      } catch (compressionError) {
        console.warn("Compression failed, uploading original file:", compressionError);
        fileToUpload = file;
      }
    } else if (compress) {
      console.log(`Compression requested but file too small (${(file.size / 1024 / 1024).toFixed(1)}MB), uploading original`);
    }

    // Upload via proxy (always use proxy to avoid CORS issues)
    return await uploadViaProxy(fileToUpload, onProgress);

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const getJobStatus = async (
  jobId: string
): Promise<BackendJobStatus> => {
  console.log("Checking job status via proxy for job:", jobId);

  const response = await fetch(`/api/status-proxy/${jobId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Status check failed: ${response.status} ${response.statusText}`, errorText);

    // If it's a 404, the job might have been cleaned up or never existed
    if (response.status === 404) {
      throw new Error(`Job not found: ${jobId}. The backend may have cleaned up this job.`);
    }

    throw new Error(`Status check failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Job status response:", data);
  return data;
};

export const downloadProcessedVideo = async (jobId: string): Promise<Blob> => {
  console.log("Downloading processed video via proxy for job:", jobId);

  const response = await fetch(`/api/download-proxy/${jobId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Download failed:", errorText);
    throw new Error(`Download failed: ${response.statusText} - ${errorText}`);
  }

  return response.blob();
};

// React Query hooks
export const useUploadVideo = () => {
  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: Parameters<typeof uploadVideo>[1] }) =>
      uploadVideo(file, options),
    onError: (error) => {
      console.error("Video upload failed:", error);
    },
  });
};

export const useJobStatus = (jobId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["jobStatus", jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Stop polling if job is completed or failed
      const data = query.state.data;
      if (data && (data.status === "completed" || data.status === "failed")) {
        return false; // Stop polling
      }
      return 2000; // Poll every 2 seconds
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 (job not found) - backend cleaned up the job
      if (error instanceof Error && error.message.includes("404")) {
        console.log("Job not found (404), stopping polling - backend may have cleaned up job");
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
};

export const useDownloadVideo = () => {
  return useMutation({
    mutationFn: downloadProcessedVideo,
    onError: (error) => {
      console.error("Video download failed:", error);
    },
  });
};
