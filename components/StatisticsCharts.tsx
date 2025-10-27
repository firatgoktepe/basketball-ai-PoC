"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ComposedChart,
  Legend,
} from "recharts";
import type { GameData } from "@/types";

interface StatisticsChartsProps {
  gameData: GameData;
}

export function StatisticsCharts({ gameData }: StatisticsChartsProps) {
  const team = gameData.teams[0]; // Single team from backend
  const summary = gameData.summary[team.id];

  // Helper function to format time
  const formatTime = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Score data processing for backend results
  const scoreEvents = gameData.events.filter((event) => event.type === "score");

  // Score distribution over time (cumulative)
  const scoreProgression = scoreEvents
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((event, index) => ({
      timestamp: event.timestamp,
      cumulativeScores: index + 1,
      confidence: event.confidence,
      timeFormatted: formatTime(event.timestamp),
    }));

  // Score frequency by time intervals (per minute)
  const scoreFrequency = (() => {
    const intervalMinutes = 1;
    const intervals: Record<number, number> = {};

    scoreEvents.forEach((event) => {
      const interval = Math.floor(event.timestamp / 60);
      intervals[interval] = (intervals[interval] || 0) + 1;
    });

    return Object.entries(intervals).map(([minute, count]) => ({
      minute: parseInt(minute),
      count,
      timeLabel: `${minute}:00-${parseInt(minute) + 1}:00`,
    }));
  })();

  // Confidence distribution
  const confidenceDistribution = (() => {
    const ranges = [
      { min: 0.9, max: 1.0, label: "90-100%" },
      { min: 0.8, max: 0.9, label: "80-89%" },
      { min: 0.7, max: 0.8, label: "70-79%" },
      { min: 0.6, max: 0.7, label: "60-69%" },
      { min: 0.5, max: 0.6, label: "50-59%" },
      { min: 0.0, max: 0.5, label: "0-49%" },
    ];

    return ranges.map((range) => ({
      range: range.label,
      count: scoreEvents.filter(
        (event) => event.confidence >= range.min && event.confidence < range.max
      ).length,
    }));
  })();

  // Score scatter plot data
  const scoreScatterData = scoreEvents.map((event) => ({
    timestamp: event.timestamp,
    confidence: event.confidence,
    timeFormatted: formatTime(event.timestamp),
  }));

  // Simple score breakdown
  const scoreBreakdownData = [
    {
      name: "Total Scores",
      value: scoreEvents.length,
      color: "#10b981",
    },
    {
      name: "High Confidence",
      value: scoreEvents.filter((e) => e.confidence >= 0.8).length,
      color: "#22c55e",
    },
    {
      name: "Medium Confidence",
      value: scoreEvents.filter(
        (e) => e.confidence >= 0.5 && e.confidence < 0.8
      ).length,
      color: "#f59e0b",
    },
    {
      name: "Low Confidence",
      value: scoreEvents.filter((e) => e.confidence < 0.5).length,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Over Time */}
        <div className="bg-card border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4">
            Score Distribution Over Time
          </h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoreProgression}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `Time: ${formatTime(value)}`}
                  formatter={(value) => [
                    `${value} scores`,
                    "Cumulative Scores",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeScores"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Frequency by Time */}
        <div className="bg-card border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4">
            Score Frequency by Minute
          </h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scoreFrequency}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timeLabel"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confidence Distribution and Score Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <div className="bg-card border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4">
            Score Confidence Distribution
          </h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={confidenceDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Scatter Plot */}
        <div className="bg-card border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4">Score Timeline Scatter</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                data={scoreScatterData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  fontSize={12}
                />
                <YAxis
                  dataKey="confidence"
                  domain={[0, 1]}
                  tickFormatter={(value) => `${Math.round(value * 100)}%`}
                />
                <Tooltip
                  labelFormatter={(value) => `Time: ${formatTime(value)}`}
                  formatter={(value, name) => [
                    `${Math.round((value as number) * 100)}%`,
                    "Confidence",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Scatter dataKey="confidence" fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confidence Distribution and Analysis Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <div className="bg-card border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4">
            Event Confidence Distribution
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {gameData.events.filter((e) => e.confidence >= 0.8).length}
                </div>
                <div className="text-sm text-green-700">
                  High Confidence (≥80%)
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    gameData.events.filter(
                      (e) => e.confidence >= 0.5 && e.confidence < 0.8
                    ).length
                  }
                </div>
                <div className="text-sm text-yellow-700">
                  Medium Confidence (50-79%)
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {gameData.events.filter((e) => e.confidence < 0.5).length}
                </div>
                <div className="text-sm text-red-700">
                  Low Confidence (&lt;50%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Quality Metrics */}
        <div className="bg-card border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Quality</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Detection Sources</h4>
              <div className="space-y-2">
                {Object.entries(
                  gameData.events.reduce((acc, event) => {
                    acc[event.source] = (acc[event.source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([source, count]) => (
                  <div
                    key={source}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <span className="capitalize text-sm">
                      {source.replace("_", " ")}
                    </span>
                    <span className="text-sm font-medium">{count} events</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium mb-2">Average Confidence</h4>
              <div className="text-3xl font-bold text-primary">
                {Math.round(
                  (gameData.events.reduce(
                    (sum, event) => sum + event.confidence,
                    0
                  ) /
                    gameData.events.length) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Overall detection confidence
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
