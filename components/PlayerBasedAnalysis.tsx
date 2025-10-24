"use client";

import { Users } from "lucide-react";
import type { GameData } from "@/types";

interface PlayerBasedAnalysisProps {
  gameData: GameData;
  onPlayerSelect?: (playerId: string, teamId: string) => void;
}

export function PlayerBasedAnalysis({
  gameData,
  onPlayerSelect,
}: PlayerBasedAnalysisProps) {
  // Backend doesn't provide player tracking, so show "No players detected" message
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Players Detected</h3>
            <p className="text-muted-foreground">
              Player tracking is not available with the current backend. The
              backend only provides score detection without individual player
              identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
