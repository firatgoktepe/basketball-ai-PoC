"use client";

import { useState } from "react";
import { Play, Settings, Zap } from "lucide-react";
import { Tooltip, LabelWithTooltip } from "@/components/ui/Tooltip";
import { HelpText } from "@/components/ui/HelpText";

interface ProcessingControlsProps {
  onStartAnalysis: () => void;
  disabled?: boolean;
}

export function ProcessingControls({
  onStartAnalysis,
  disabled = false,
}: ProcessingControlsProps) {
  const handleStartAnalysis = () => {
    onStartAnalysis();
  };

  const getEstimatedTime = () => {
    // Backend processing time estimation
    return 2; // ~2x video duration for backend processing
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          Video Analysis
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Upload your basketball video for AI-powered score detection
        </p>
      </div>

      <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Backend Processing Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Backend Processing</span>
          </div>
          <p className="text-xs text-blue-700">
            Your video will be processed by our GPU-accelerated backend using
            NBAction (YOLO) for score detection. Estimated processing time: ~
            {getEstimatedTime()}x video duration.
          </p>
        </div>

        {/* Start Analysis Button */}
        <div className="pt-2 sm:pt-4">
          <button
            onClick={handleStartAnalysis}
            disabled={disabled}
            className="w-full py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Analysis
          </button>

          <p className="text-xs text-muted-foreground text-center mt-2 px-2">
            Estimated processing time: ~{getEstimatedTime()}x video duration
          </p>
        </div>
      </div>
    </div>
  );
}
