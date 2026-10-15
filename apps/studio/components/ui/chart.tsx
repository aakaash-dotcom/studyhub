import { cn } from "./button";

/**
 * Charts, hand-rolled in SVG.
 *
 * No charting dependency: these are four shapes (bars, sparkline, progress,
 * donut), the whole file is smaller than the smallest charting library's type
 * definitions, and it stays crisp in the light theme without a theming layer.
 */

/** Grouped bars: what is scheduled vs what actually went out, per day. */
export function BarChart({
  data,
  series,
  height = 132,
}: {
  data: { label: string; values: number[] }[];
  series: { name: string; className: string }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.flatMap((point) => point.values));
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full">
      <div className="relative" style={{ height }}>
        {gridLines.map((fraction) => (
          <div
            key={fraction}
            className="absolute inset-x-0 border-t border-dashed border-line/70"
            style={{ bottom: `${fraction * 100}%` }}
          >
            <span className="absolute -top-2 right-0 bg-white px-1 text-[10px] text-muted">{Math.round(max * fraction)}</span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-end gap-1.5">
          {data.map((point) => (
            <div key={point.label} className="group flex h-full flex-1 flex-col justify-end">
              <div className="flex h-full items-end justify-center gap-[3px]">
                {point.values.map((value, index) => (
                  <div
                    key={index}
                    className={cn("w-2.5 rounded-t-[3px] transition-all sm:w-3", series[index]?.className ?? "bg-slate-300")}
                    style={{ height: `${Math.max(value === 0 ? 0 : 4, (value / max) * 100)}%` }}
                    title={`${series[index]?.name ?? ""}: ${value}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((point) => (
          <div key={point.label} className="flex-1 text-center text-[10.5px] text-muted">
            {point.label}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {series.map((line) => (
          <span key={line.name} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
            <span className={cn("h-2 w-2 rounded-sm", line.className)} />
            {line.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Tiny trend line for stat cards. Values are raw counts, not percentages. */
export function Sparkline({ values, className = "stroke-indigo-500" }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - min) / range) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
      <polyline points={points} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className={className} strokeLinecap="round" />
    </svg>
  );
}

/** Usage against a limit — per-account daily caps, mostly. */
export function ProgressBar({
  value,
  max,
  tone = "brand",
  showLabel = false,
}: {
  value: number;
  max: number;
  tone?: "brand" | "success" | "warning" | "danger";
  showLabel?: boolean;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const tones = {
    brand: "bg-indigo-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
  } as const;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", tones[tone])} style={{ width: `${pct}%` }} />
      </div>
      {showLabel ? (
        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted">
          {value}/{max}
        </span>
      ) : null}
    </div>
  );
}

/** Share-of-total ring, used for the platform mix. */
export function DonutRing({
  segments,
  size = 96,
  center,
}: {
  segments: { value: number; className: string; label: string }[];
  size?: number;
  center?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={10} className="stroke-slate-100" />
        {total > 0
          ? segments.map((segment) => {
              const length = (segment.value / total) * circumference;
              const circle = (
                <circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={10}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  className={segment.className}
                />
              );
              offset += length;
              return circle;
            })
          : null}
      </svg>
      {center ? (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[13px] font-semibold text-ink">{center}</span>
        </div>
      ) : null}
    </div>
  );
}
