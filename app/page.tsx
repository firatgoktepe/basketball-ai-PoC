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

  // Demo function to load a sample video
  const loadDemoVideo = useCallback(() => {
    console.log("🎬 Loading demo video...");
    try {
      // Create a demo video file for testing
      const demoVideoFile: VideoFile = {
        file: new File([""], "demo_basketball_game.mp4", { type: "video/mp4" }),
        url: "/demo-video.mp4", // Fixed: Use proper public directory path
        name: "demo_basketball_game.mp4",
        size: 1024 * 1024 * 10, // 10MB
        duration: 125.4,
      };
      console.log("✅ Demo video file created:", demoVideoFile);
      setVideoFile(demoVideoFile);
      setGameData(null);
      setProgress(null);
    } catch (error) {
      console.error("❌ Error creating demo video:", error);
    }
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setProgress({
      stage: "initializing",
      progress: 0,
      message: "Uploading video to backend...",
    });

    try {
      // Upload video to backend
      const uploadResult = await uploadMutation.mutateAsync(videoFile.file);
      console.log("Upload result:", uploadResult);
      console.log("Setting job ID:", uploadResult.job_id);
      setJobId(uploadResult.job_id);

      setProgress({
        stage: "processing",
        progress: 20,
        message: "Video uploaded, processing started...",
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
  }, [videoFile, uploadMutation]);

  // Handle job status updates
  useEffect(() => {
    if (!jobStatus) return;

    if (jobStatus.status === "completed" && jobStatus.results) {
      setProgress({
        stage: "completed",
        progress: 100,
        message: "Analysis completed! Downloading processed video...",
      });

      // Download processed video
      downloadMutation.mutate(jobId!, {
        onSuccess: (videoBlob) => {
          const videoUrl = URL.createObjectURL(videoBlob);
          setProcessedVideoUrl(videoUrl);

          // Transform backend data to frontend format
          const transformedData = transformBackendData(
            jobStatus.results!,
            videoUrl
          );
          setGameData(transformedData);
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error("Download failed:", error);
          setProgress({
            stage: "error",
            progress: 0,
            message: `Download failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          });
          setIsProcessing(false);
        },
      });
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
  }, [jobStatus, jobId, downloadMutation]);

  // Handle job errors
  useEffect(() => {
    if (jobError) {
      setProgress({
        stage: "error",
        progress: 0,
        message: `Status check failed: ${
          jobError instanceof Error ? jobError.message : "Unknown error"
        }`,
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

                {/* Demo Button */}
                <div className="text-center space-y-2">
                  <button
                    onClick={loadDemoVideo}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm sm:text-base"
                  >
                    Load Demo Video (for testing)
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Use this to test the interface with a sample video
                  </p>
                </div>
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
