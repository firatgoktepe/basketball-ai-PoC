"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UploadOptimizationProps {
  onOptimizationChange: (settings: {
    compress: boolean;
    quality: number;
    maxResolution: number;
  }) => void;
  defaultSettings?: {
    compress: boolean;
    quality: number;
    maxResolution: number;
  };
}

export default function UploadOptimization({
  onOptimizationChange,
  defaultSettings = {
    compress: true,
    quality: 0.7,
    maxResolution: 1280,
  },
}: UploadOptimizationProps) {
  const [compress, setCompress] = useState(defaultSettings.compress);
  const [quality, setQuality] = useState(defaultSettings.quality);
  const [maxResolution, setMaxResolution] = useState(
    defaultSettings.maxResolution
  );

  // Propagate changes to parent component immediately
  React.useEffect(() => {
    onOptimizationChange({
      compress,
      quality,
      maxResolution,
    });
  }, [compress, quality, maxResolution, onOptimizationChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Upload Optimization</CardTitle>
        <CardDescription>
          Optimize video upload speed and reduce bandwidth usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compression Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compress">Enable Compression</Label>
            <p className="text-sm text-muted-foreground">
              Compress videos before upload to reduce file size
            </p>
          </div>
          <Switch
            id="compress"
            checked={compress}
            onCheckedChange={setCompress}
          />
        </div>

        {compress && (
          <>
            {/* Quality Slider */}
            <div className="space-y-3">
              <Label htmlFor="quality">
                Compression Quality: {Math.round(quality * 100)}%
              </Label>
              <Slider
                id="quality"
                min={0.1}
                max={1}
                step={0.1}
                value={[quality]}
                onValueChange={(value) => {
                  setQuality(value[0]);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file (lower quality)</span>
                <span>Larger file (higher quality)</span>
              </div>
            </div>

            {/* Max Resolution */}
            <div className="space-y-3">
              <Label htmlFor="resolution">
                Max Resolution: {maxResolution}p
              </Label>
              <Slider
                id="resolution"
                min={480}
                max={1920}
                step={160}
                value={[maxResolution]}
                onValueChange={(value) => {
                  setMaxResolution(value[0]);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>480p (fastest)</span>
                <span>1920p (highest quality)</span>
              </div>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Upload Speed Tips
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Compression can reduce upload time by 50-80%</li>
            <li>• Lower resolution = faster upload</li>
            <li>• Files under 10MB upload directly without compression</li>
            <li>
              • Large files are automatically compressed for faster upload
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
