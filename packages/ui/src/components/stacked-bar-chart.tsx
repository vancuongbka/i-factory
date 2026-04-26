'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface StackedBarSeries {
  dataKey: string;
  color: string;
  label: string;
}

export interface StackedBarChartProps {
  data: object[];
  series: StackedBarSeries[];
  xAxisKey: string;
  yAxisDomain?: [number, number];
  height?: number;
  className?: string;
}

export function StackedBarChart({
  data,
  series,
  xAxisKey,
  yAxisDomain,
  height = 280,
  className,
}: StackedBarChartProps) {
  return (
    <div className={className ?? ''} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.label}
              fill={s.color}
              stackId="stack"
              radius={i === series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
