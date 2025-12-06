import React from 'react';
import { MonthlyStat, MONTHLY_ALLOWANCE } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Cell } from 'recharts';

interface AnalysisChartProps {
  stats: MonthlyStat[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  isDarkMode?: boolean;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ stats, selectedMonth, onMonthSelect, isDarkMode = false }) => {
  const chartData = stats.map(s => ({
    name: s.month,
    spent: s.totalSpent,
    allowance: MONTHLY_ALLOWANCE,
    // Helper for tooltip
    monthName: new Date(s.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  })).reverse(); // Show oldest to newest

  return (
    <div 
      id="analysis-trend-chart"
      className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-96 transition-colors duration-200 focus:outline-none"
      tabIndex={-1}
    >
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-6">Spend Analysis Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart 
          data={chartData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload.length > 0) {
              onMonthSelect(data.activePayload[0].payload.name);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#9CA3AF' }} 
            dy={10}
            tickFormatter={(value) => {
              // Format YYYY-MM to Short Month (e.g., Oct)
              const date = new Date(value + '-02'); // Avoid timezone day shift
              return date.toLocaleDateString('en-US', { month: 'short' });
            }}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            cursor={{ fill: isDarkMode ? '#111827' : '#F9FAFB' }}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              backgroundColor: isDarkMode ? '#111827' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#111827'
            }}
            labelFormatter={(label) => new Date(label + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
          />
          <ReferenceLine y={MONTHLY_ALLOWANCE} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Limit', fill: '#EF4444', fontSize: 10 }} />
          <Bar 
            dataKey="spent" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === selectedMonth ? '#86BC25' : (isDarkMode ? '#4d7c0f' : '#bef264')} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};