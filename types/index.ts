export interface VideoFile {
  file: File;
  url: string;
  name: string;
  size: number;
  duration: number;
}

export interface Team {
  id: string;
  label: string;
  color: string;
}

export interface GameEvent {
  id: string;
  type: "score"; // Backend only provides score events
  teamId: string;
  playerId?: string; // Jersey number or player identifier
  scoreDelta?: number;
  shotType?: "2pt" | "3pt" | "1pt"; // Track the type of shot that resulted in a score (1pt for foul shots)
  timestamp: number;
  confidence: number;
  source: string;
  notes?: string;
}

export interface PlayerSummary {
  playerId: string; // Jersey number
  points: number;
  twoPointScores: number;
  threePointScores: number;
  foulShots: number;
  shotAttempts: number;
  twoPointAttempts: number;
  threePointAttempts: number;
  hitRate: number; // Percentage
  dunks: number;
  blocks: number;
  offRebounds: number;
  defRebounds: number;
  assists: number;
  turnovers: number;
  passes: number;
  dribbles: number;
}

export interface TeamSummary {
  points: number;
  twoPointScores: number;
  threePointScores: number;
  foulShots: number;
  shotAttempts: number;
  offRebounds: number;
  defRebounds: number;
  turnovers: number;
  threePointAttempts?: number;
  blocks: number;
  dunks: number;
  assists: number;
  passes: number;
  dribbles: number;
  players: PlayerSummary[]; // Per-player breakdown
}

export interface HighlightClip {
  id: string;
  eventId: string;
  eventType: string;
  teamId: string;
  playerId?: string;
  startTime: number;
  endTime: number;
  duration: number;
  description: string;
}

export interface GameData {
  video: {
    filename: string;
    duration: number;
  };
  teams: Team[];
  events: GameEvent[];
  summary: {
    [teamId: string]: TeamSummary;
  };
  highlights?: HighlightClip[]; // Optional highlight clips
}

export interface AnalysisProgress {
  stage: "initializing" | "processing" | "completed" | "error";
  progress: number; // 0-100
  message: string;
}

// Simplified analysis options for backend API
export interface AnalysisOptions {
  videoFile: File;
  onProgress: (progress: AnalysisProgress) => void;
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Data transformation function for backend results
export function transformBackendData(
  backendResults: any,
  videoUrl: string
): GameData {
  return {
    video: {
      filename: "processed_video.mp4",
      duration: backendResults.video.frames / backendResults.video.fps,
    },
    teams: [{ id: "team", label: "Team", color: "#3b82f6" }],
    events: backendResults.scores.map((score: any, index: number) => ({
      id: `score-${score.frame}`,
      type: "score" as const,
      teamId: "team",
      timestamp: score.timestamp,
      confidence: score.confidence,
      source: score.mode,
      scoreDelta: 2, // Assume 2-point scores (backend doesn't specify)
    })),
    summary: {
      team: {
        points: backendResults.total_scores * 2, // Assume 2-pts each
        twoPointScores: backendResults.total_scores,
        threePointScores: 0,
        foulShots: 0,
        shotAttempts: 0,
        offRebounds: 0,
        defRebounds: 0,
        turnovers: 0,
        blocks: 0,
        dunks: 0,
        assists: 0,
        passes: 0,
        dribbles: 0,
        players: [],
      },
    },
  };
}
