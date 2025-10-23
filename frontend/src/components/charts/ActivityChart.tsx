'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ActivityData {
  date: string;
  announcements: number;
  requests: number;
  retours: number;
  total: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    Annonces: item.announcements,
    Demandes: item.requests,
    Retours: item.retours,
  }));

  return (
    <div className="h-64 w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
          <XAxis 
            dataKey="date" 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
            animationDuration={200}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: '14px'
            }}
          />
          <Line
            type="monotone"
            dataKey="Annonces"
            stroke="hsl(142.1 76.2% 36.3%)"
            strokeWidth={3}
            dot={{ fill: 'hsl(142.1 76.2% 36.3%)', r: 4, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 8, stroke: 'hsl(142.1 76.2% 36.3%)', strokeWidth: 2, fill: 'white' }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="Demandes"
            stroke="hsl(24.6 95% 53.1%)"
            strokeWidth={3}
            dot={{ fill: 'hsl(24.6 95% 53.1%)', r: 4, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 8, stroke: 'hsl(24.6 95% 53.1%)', strokeWidth: 2, fill: 'white' }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="Retours"
            stroke="hsl(221.2 83.2% 53.3%)"
            strokeWidth={3}
            dot={{ fill: 'hsl(221.2 83.2% 53.3%)', r: 4, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 8, stroke: 'hsl(221.2 83.2% 53.3%)', strokeWidth: 2, fill: 'white' }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}