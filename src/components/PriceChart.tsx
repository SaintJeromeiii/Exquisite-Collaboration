"use client";

import { useEffect, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Ohlc } from "@/data/market";
import { usd } from "@/lib/format";

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const close = payload.find((p) => p.dataKey === "c")?.value;
  const vol = payload.find((p) => p.dataKey === "v")?.value;
  return (
    <div className="border border-line bg-bg px-2 py-1 font-mono text-[10px] text-ink">
      <div className="text-muted">{label}</div>
      {close != null ? <div>LAST {usd(close)}</div> : null}
      {vol != null ? <div className="text-dim">VOL {vol}</div> : null}
    </div>
  );
}

export function PriceChart({
  data,
  height = 220,
}: {
  data: Ohlc[];
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Client-only mount so Recharts does not hydrate against an empty SVG.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client gate
    setMounted(true);
  }, []);

  const up = data.length > 1 && data[data.length - 1].c >= data[0].c;
  const stroke = up ? "var(--up)" : "var(--down)";
  const fill = up ? "var(--fill-up)" : "var(--fill-down)";

  if (!mounted) {
    return <div style={{ height }} className="w-full bg-panel" />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fill: "var(--dim)", fontSize: 10, fontFamily: "var(--font-ibm-mono)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fill: "var(--dim)", fontSize: 10, fontFamily: "var(--font-ibm-mono)" }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => `$${Math.round(v)}`}
            domain={["auto", "auto"]}
          />
          <YAxis yAxisId="vol" hide domain={[0, "auto"]} />
          <Tooltip content={<ChartTip />} />
          <Bar yAxisId="vol" dataKey="v" fill="var(--line-2)" barSize={4} />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="c"
            stroke={stroke}
            fill={fill}
            strokeWidth={1.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
