'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface LineSeries {
  dataKey: string;
  color: string;
  label: string;
  dashed?: boolean;
}

export interface LineChartProps {
  data: object[];
  series: LineSeries[];
  xAxisKey: string;
  yAxisUnit?: string;
  yAxisDomain?: [number | string, number | string];
  height?: number;
  className?: string;
}

export function LineChart({
  data,
  series,
  xAxisKey,
  yAxisUnit,
  yAxisDomain,
  height = 280,
  className,
}: LineChartProps) {
  return (
    <div className={className ?? ''} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            unit={yAxisUnit}
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
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 5' : undefined}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
