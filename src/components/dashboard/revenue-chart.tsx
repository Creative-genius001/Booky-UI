"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { formatKobo } from "@/lib/utils";
import type { RevenuePoint } from "@/types";

/** Minimal dependency-free area chart for the revenue trend. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 560;
  const height = 220;
  const pad = useMemo(() => ({ top: 16, right: 8, bottom: 24, left: 8 }), []);

  const { path, area, points, max } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.revenue_kobo));
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

    const points = data.map((d, i) => ({
      x: pad.left + i * step,
      y: pad.top + innerH - (d.revenue_kobo / max) * innerH,
      d,
    }));

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
    const area =
      `M ${pad.left} ${pad.top + innerH} ` +
      points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
      ` L ${pad.left + (data.length > 1 ? innerW : 0)} ${pad.top + innerH} Z`;

    return { path, area, points, max };
  }, [data, pad]);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Revenue over time"
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rev-fill)" />
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 0}
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth={2}
            />
            <rect
              x={p.x - 12}
              y={pad.top}
              width={24}
              height={height - pad.top - pad.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>{data[0] && format(parseISO(data[0].date), "d MMM")}</span>
        {hover != null ? (
          <span className="font-medium text-foreground">
            {format(parseISO(data[hover].date), "d MMM")} ·{" "}
            {formatKobo(data[hover].revenue_kobo)}
          </span>
        ) : (
          <span>Peak {formatKobo(max)}</span>
        )}
        <span>
          {data.length > 0 &&
            format(parseISO(data[data.length - 1].date), "d MMM")}
        </span>
      </div>
    </div>
  );
}
