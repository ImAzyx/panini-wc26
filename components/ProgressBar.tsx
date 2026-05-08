interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({ current, total, label, size = "md" }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  const heights = { sm: "h-px", md: "h-1", lg: "h-1.5" };
  const complete = current === total && total > 0;

  return (
    <div className="w-full">
      {(label || size !== "sm") && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span
            className={`font-title font-semibold tracking-wide uppercase ${
              size === "lg"
                ? "text-text/60 text-sm"
                : size === "md"
                ? "text-text/50 text-xs"
                : "text-text/45 text-[10px]"
            }`}
          >
            {label}
          </span>
          <span className={`font-mono text-[10px] ${complete ? "text-lime" : "text-text/35"}`}>
            {current}
            <span className="text-text/20">/{total}</span>
            {size !== "sm" && <span className="ml-1 text-text/20">({pct}%)</span>}
          </span>
        </div>
      )}
      <div className={`w-full bg-white/[0.05] rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ${
            complete ? "bg-lime" : "bg-gold/60"
          }`}
          style={{
            width: `${pct}%`,
            ...(complete ? { boxShadow: "0 0 7px rgba(168,255,62,0.55)" } : {}),
          }}
        />
      </div>
    </div>
  );
}
