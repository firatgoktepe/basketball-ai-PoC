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

// API functions
export const uploadVideo = async (
  file: File
): Promise<BackendUploadResponse> => {
  console.log("Uploading via Next.js API route to avoid CORS...");

  // Use Next.js API route as a proxy to avoid CORS
  const formData = new FormData();
  formData.append("file", file);
  formData.append("generate_video", "true");

  try {
    const response = await fetch("/api/upload-proxy", {
      method: "POST",
      body: formData,
    });

    console.log("Proxy response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed:", errorText);
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
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
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
};

export const downloadProcessedVideo = async (jobId: string): Promise<Blob> => {
  const response = await fetch(`${BACKEND_URL}/api/download/${jobId}`);

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  return response.blob();
};

// React Query hooks
export const useUploadVideo = () => {
  return useMutation({
    mutationFn: uploadVideo,
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
    refetchInterval: 2000, // Poll every 2 seconds
    retry: (failureCount, error) => {
      // Don't retry on 404 (job not found) or 500 (server error)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
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
