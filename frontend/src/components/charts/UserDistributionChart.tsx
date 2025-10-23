'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface UserDistributionData {
  totalPharmacies: number;
  totalSuppliers: number;
  totalUsers: number;
}

interface UserDistributionChartProps {
  data: UserDistributionData;
}

const COLORS = [
  'hsl(142.1 76.2% 36.3%)', // Green for Pharmacies
  'hsl(221.2 83.2% 53.3%)', // Blue for Suppliers
  'hsl(215.4 16.3% 46.9%)', // Gray for Others
];

export default function UserDistributionChart({ data }: UserDistributionChartProps) {
  const otherUsers = Math.max(0, data.totalUsers - data.totalPharmacies - data.totalSuppliers);
  
  const chartData = [
    { name: 'Pharmacies', value: data.totalPharmacies },
    { name: 'Fournisseurs', value: data.totalSuppliers },
    { name: 'Autres', value: otherUsers },
  ].filter(item => item.value > 0); // Only show non-zero values

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / data.totalUsers) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="h-64 w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            ))}
          </Pie>
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
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{
              fontSize: '14px',
              paddingTop: '20px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}