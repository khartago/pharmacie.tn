'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RegionData {
  regionName: string;
  requestCount: number;
}

interface RegionChartProps {
  data: RegionData[];
}

const COLORS = [
  'hsl(221.2 83.2% 53.3%)', // Blue
  'hsl(142.1 76.2% 36.3%)', // Green
  'hsl(24.6 95% 53.1%)',    // Orange
  'hsl(262.1 83.3% 57.8%)', // Purple
  'hsl(336.1 83.3% 57.8%)', // Pink
  'hsl(158.1 64.4% 51.6%)', // Teal
  'hsl(38.2 92.4% 50.2%)',  // Amber
  'hsl(0 84.2% 60.2%)',     // Red
];

export default function RegionChart({ data }: RegionChartProps) {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    region: item.regionName,
    demandes: item.requestCount,
  }));

  return (
    <div className="h-64 w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
          <XAxis 
            dataKey="region" 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: 'var(--shadow-lg)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            cursor={{ fill: 'hsl(var(--accent))' }}
            animationDuration={200}
          />
          <Bar 
            dataKey="demandes" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}