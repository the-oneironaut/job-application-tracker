"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(221, 83%, 53%)",  // blue
  "hsl(187, 85%, 43%)",  // cyan
  "hsl(263, 70%, 50%)",  // violet
  "hsl(271, 91%, 65%)",  // purple
  "hsl(142, 71%, 45%)",  // green
  "hsl(160, 84%, 39%)",  // emerald
  "hsl(0, 84%, 60%)",    // red
  "hsl(220, 9%, 46%)",   // gray
  "hsl(25, 95%, 53%)",   // orange
];

interface StatusChartProps {
  data: { status: string; count: number }[];
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="status"
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
