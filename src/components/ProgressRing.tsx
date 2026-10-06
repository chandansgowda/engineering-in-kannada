interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  label?: boolean;
}

export function ProgressRing({ percent, size = 56, stroke = 5, label = true }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FFD700"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (percent / 100) * c}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {percent}%
        </span>
      )}
    </div>
  );
}

export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08] ${className}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary transition-[width] duration-700 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
