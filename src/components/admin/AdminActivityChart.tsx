"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";

interface AdminActivityChartProps {
  data: {
    date: string;
    uniqueActiveMembers: number;
    flightIntentCount: number;
  }[];
}

export function AdminActivityChart({ data }: AdminActivityChartProps) {
  const width = 1000;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  
  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => [d.uniqueActiveMembers, d.flightIntentCount]);
  const maxValue = Math.max(...allValues, 1);
  const roundedMaxValue = Math.ceil(maxValue / 5) * 5 || 5;

  const getX = (index: number) => {
    return padding.left + (index * usableWidth) / (data.length - 1);
  };

  const getY = (value: number) => {
    return padding.top + usableHeight - (value / roundedMaxValue) * usableHeight;
  };

  const memberPoints = data
    .map((d, i) => `${getX(i)},${getY(d.uniqueActiveMembers)}`)
    .join(" ");

  const flightPoints = data
    .map((d, i) => `${getX(i)},${getY(d.flightIntentCount)}`)
    .join(" ");

  return (
    <div className="admin-chart-container w-full overflow-x-auto">
      <div className="min-w-[600px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ display: "block" }}
        >
          {/* Grid lines (Y-axis) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + usableHeight * ratio;
            const value = Math.round(roundedMaxValue * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--admin-border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="var(--admin-muted-text)"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % 2 !== 0 && data.length > 10) return null; // Show every other date if many
            const x = getX(i);
            return (
              <text
                key={d.date}
                x={x}
                y={height - 15}
                textAnchor="middle"
                fontSize="12"
                fill="var(--admin-muted-text)"
              >
                {format(parseISO(d.date), "dd.MM", { locale: da })}
              </text>
            );
          })}

          {/* Lines */}
          <polyline
            points={memberPoints}
            fill="none"
            stroke="var(--admin-info-text)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={flightPoints}
            fill="none"
            stroke="var(--admin-success-text)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points (dots) */}
          {data.map((d, i) => (
            <React.Fragment key={d.date}>
              <circle
                cx={getX(i)}
                cy={getY(d.uniqueActiveMembers)}
                r="4"
                fill="var(--admin-info-text)"
              />
              <circle
                cx={getX(i)}
                cy={getY(d.flightIntentCount)}
                r="4"
                fill="var(--admin-success-text)"
              />
            </React.Fragment>
          ))}
        </svg>
      </div>

      <div className="flex gap-6 mt-4 px-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--admin-info-text)" }}
          />
          <span className="text-sm font-medium">Aktive medlemmer</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--admin-success-text)" }}
          />
          <span className="text-sm font-medium">Flyvemeldinger</span>
        </div>
      </div>
    </div>
  );
}
