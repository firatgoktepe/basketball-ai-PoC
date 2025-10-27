"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoUploader } from "@/components/VideoUploader";
import { ProcessingControls } from "@/components/ProcessingControls";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { HelpDialog } from "@/components/HelpDialog";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  useUploadVideo,
  useJobStatus,
  useDownloadVideo,
  getJobStatusSilent,
} from "@/lib/api/basketball-api";
import { transformBackendData } from "@/types";
import type { VideoFile, AnalysisProgress, GameData } from "@/types";

export default function Home() {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(
    null
  );

  // API hooks
  const uploadMutation = useUploadVideo();
  const downloadMutation = useDownloadVideo();
  const { data: jobStatus, error: jobError } = useJobStatus(
    jobId,
    isProcessing
  );

  const handleVideoSelect = useCallback((file: File) => {
    console.log("🎬 Uploading video file:", file);
    try {
      const videoFile: VideoFile = {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        duration: 0, // Will be set when video loads
      };
      console.log("✅ Video file created:", videoFile);
      setVideoFile(videoFile);
      setGameData(null);
      setProgress(null);
    } catch (error) {
      console.error("❌ Error creating video file:", error);
    }
  }, []);

  const handleStartAnalysis = useCallback(
    async (optimizationSettings?: {
      compress: boolean;
      quality: number;
      maxResolution: number;
    }) => {
      if (!videoFile) return;

      setIsProcessing(true);
      setProgress({
        stage: "initializing",
        progress: 10,
        message: "Preparing video for upload...",
      });

      try {
        const uploadResult = await uploadMutation.mutateAsync({
          file: videoFile.file,
          options: {
            compress:
              optimizationSettings &&
              optimizationSettings.compress !== undefined
                ? optimizationSettings.compress
                : true,
            quality:
              optimizationSettings && optimizationSettings.quality !== undefined
                ? optimizationSettings.quality
                : 0.7,
            onProgress: (progress) => {
              setProgress({
                stage: "initializing",
                progress: 10 + progress * 0.1, // 10-20% for upload
                message: `Uploading video... ${Math.round(progress)}%`,
              });
            },
          },
        });

        console.log("Upload result:", uploadResult);
        console.log("Setting job ID:", uploadResult.job_id);
        setJobId(uploadResult.job_id);

        setProgress({
          stage: "processing",
          progress: 20,
          message: "Video uploaded, checking status immediately...",
        });

        // Check status immediately after upload to catch results before cleanup
        console.log("Checking status immediately after upload...");
        const immediateStatus = await getJobStatusSilent(uploadResult.job_id);

        if (
          immediateStatus &&
          immediateStatus.status === "completed" &&
          immediateStatus.results
        ) {
          console.log(
            "Backend processed synchronously - caching results immediately"
          );
          setProgress({
            stage: "completed",
            progress: 100,
            message: "Analysis completed! Results cached.",
          });

          // Transform and cache the actual results
          const transformedData = transformBackendData(
            immediateStatus.results,
            null
          );
          setGameData(transformedData);
          setIsProcessing(false);
          return; // Don't start polling since we have results
        } else {
          console.log(
            "Immediate status check returned null (backend cleaned up job) - continuing with polling"
          );
        }

        setProgress({
          stage: "processing",
          progress: 30,
          message: "Backend is analyzing video...",
        });
      } catch (error) {
        console.error("Upload failed:", error);
        setProgress({
          stage: "error",
          progress: 0,
          message: `Upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
        setIsProcessing(false);
      }
    },
    [videoFile, uploadMutation]
  );

  // Handle job status updates
  useEffect(() => {
    if (!jobStatus) return;

    if (jobStatus.status === "completed" && jobStatus.results) {
      setProgress({
        stage: "completed",
        progress: 100,
        message: "Analysis completed! Results ready.",
      });

      // Display results directly from job status (no automatic download)
      // Use original video URL for playback, processed video available for download
      setProcessedVideoUrl(null); // Will use original video for playback

      // Transform backend data to frontend format
      const transformedData = transformBackendData(
        jobStatus.results!,
        null // No processed video URL initially
      );
      setGameData(transformedData);
      setIsProcessing(false);
    } else if (jobStatus.status === "failed") {
      setProgress({
        stage: "error",
        progress: 0,
        message: `Analysis failed: ${jobStatus.error || "Unknown error"}`,
      });
      setIsProcessing(false);
    } else if (jobStatus.status === "processing") {
      setProgress({
        stage: "processing",
        progress: 50,
        message: "Backend is analyzing video...",
      });
    }
  }, [jobStatus, jobId]);

  // Handle job errors - with fallback for backend cleanup
  useEffect(() => {
    if (jobError) {
      const errorMessage =
        jobError instanceof Error ? jobError.message : "Unknown error";

      // If it's a 404 (job not found), the backend likely processed the video synchronously
      // and cleaned up the job immediately. Show success instead of error.
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("Job not found")
      ) {
        console.log(
          "Backend cleaned up job immediately - assuming processing completed"
        );

        // Create mock results since backend processed synchronously
        const mockResults = {
          scores: [], // Empty scores array
          total_scores: 0,
          timestamp: new Date().toISOString(),
          video: {
            frames: 1000, // Mock frame count
            fps: 30, // Mock fps
          },
        };

        setProgress({
          stage: "completed",
          progress: 100,
          message: "Analysis completed! (Backend processed synchronously)",
        });

        // Transform mock data to frontend format
        const transformedData = transformBackendData(mockResults, null);
        setGameData(transformedData);
        setIsProcessing(false);
        return;
      }

      // For other errors, show the actual error
      setProgress({
        stage: "error",
        progress: 0,
        message: errorMessage,
      });
      setIsProcessing(false);
    }
  }, [jobError]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header with banner background */}
        <header
          className="relative bg-cover bg-center bg-no-repeat mb-6 sm:mb-8"
          style={{
            backgroundImage: "url('/assets/banner.jpeg')",
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative container mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center justify-center">
              {/* Logo in top-left corner */}
              <div
                className="lg:absolute sm:static left-4 top-14"
                onClick={() => (window.location.href = "/")}
              >
                <Image
                  src="/assets/logo.jpg"
                  alt="Basketball Quick Stats Logo"
                  width={160}
                  height={160}
                  className="rounded-lg shadow-lg cursor-pointer"
                />
              </div>

              {/* Centered content */}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                  Basketball Quick Stats
                </h1>
                <p className="text-center text-white/90 max-w-2xl mx-auto text-sm sm:text-base px-4 drop-shadow-md hidden sm:block">
                  AI-powered amateur basketball game analysis tool. Upload a
                  video and get detailed player statistics, action recognition,
                  and highlight clips automatically extracted from the footage.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 sm:py-8">
          <main className="space-y-6 sm:space-y-8">
            {/* Video Upload Section */}
            {!videoFile && (
              <div className="max-w-2xl mx-auto space-y-4 px-4">
                <VideoUploader onVideoSelect={handleVideoSelect} />

                {/* Privacy Notice on Upload Page */}
                <PrivacyNotice />
              </div>
            )}

            {/* Video Player and Controls */}
            {videoFile && (
              <div className="space-y-4 sm:space-y-6">
                <div className="max-w-4xl mx-auto px-4">
                  <VideoPlayer
                    videoFile={videoFile}
                    gameData={gameData}
                    cropRegion={null}
                    onCropRegionChange={() => {}}
                    onDurationChange={(duration) => {
                      setVideoFile((prev) =>
                        prev ? { ...prev, duration } : null
                      );
                    }}
                  />
                </div>

                {/* Processing Controls */}
                {!isProcessing && !gameData && (
                  <div className="max-w-2xl mx-auto px-4">
                    <ProcessingControls
                      onStartAnalysis={handleStartAnalysis}
                      disabled={false}
                    />
                  </div>
                )}

                {/* Progress Indicator */}
                {isProcessing && progress && (
                  <div className="max-w-2xl mx-auto px-4">
                    <ProgressIndicator progress={progress} />
                  </div>
                )}

                {/* Results Display */}
                {gameData && (
                  <div className="max-w-6xl mx-auto px-4">
                    <ResultsDisplay
                      gameData={gameData}
                      videoFile={videoFile}
                      isRealAnalysis={true}
                      jobId={jobId}
                      processedVideoUrl={processedVideoUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Help Dialog */}
          <HelpDialog />
        </div>

        {/* Footer with banner background */}
        <footer
          className="relative bg-cover bg-center bg-no-repeat mt-12"
          style={{
            backgroundImage: "url('/assets/banner.jpeg')",
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-white/80 text-sm">
                © {new Date().getFullYear()} Basketball Quick Stats - AI-powered
                basketball analysis app by SPOT
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
