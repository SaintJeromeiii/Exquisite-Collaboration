import { clsx } from "@/lib/format";

export function Sparkline({
  values,
  className,
  width = 84,
  height = 22,
}: {
  values: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const up = values[values.length - 1] >= values[0];
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={clsx("overflow-visible", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={up ? "var(--up)" : "var(--down)"}
        strokeWidth="1.25"
        points={pts}
      />
    </svg>
  );
}
