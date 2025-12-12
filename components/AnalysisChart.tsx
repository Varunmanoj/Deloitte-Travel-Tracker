import React from 'react';
import { MonthlyStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Cell } from 'recharts';

interface AnalysisChartProps {
  stats: MonthlyStat[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  isDarkMode?: boolean;
  monthlyAllowance: number;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ stats, selectedMonth, onMonthSelect, isDarkMode = false, monthlyAllowance }) => {
  const chartData = stats.map(s => ({
    name: s.month,
    spent: s.totalSpent,
    allowance: monthlyAllowance,
    // Helper for tooltip
    monthName: new Date(s.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    fullMonthName: new Date(s.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })).reverse(); // Show oldest to newest

  const selectedIndex = chartData.findIndex(d => d.name === selectedMonth);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (chartData.length === 0) return;
    
    // Find current index, default to last if not found (though selectedMonth should always be valid)
    const currentIndex = selectedIndex === -1 ? chartData.length - 1 : selectedIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < chartData.length - 1) {
        onMonthSelect(chartData[currentIndex + 1].name);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        onMonthSelect(chartData[currentIndex - 1].name);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      onMonthSelect(chartData[0].name);
    } else if (e.key === 'End') {
      e.preventDefault();
      onMonthSelect(chartData[chartData.length - 1].name);
    }
  };

  return (
    <div 
      id="analysis-trend-chart"
      className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-96 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#86BC25] ring-offset-2 ring-offset-white dark:ring-offset-black"
      tabIndex={0}
      role="application"
      aria-label="Spend analysis chart. Use Left and Right arrow keys to navigate between months. Values will be updated in the analysis section below."
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Spend Analysis Trend</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline-block" aria-hidden="true">Use &larr; &rarr; to navigate</span>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart 
          data={chartData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload.length > 0) {
              onMonthSelect(data.activePayload[0].payload.name);
            }
          }}
          accessibilityLayer
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
          <ReferenceLine y={monthlyAllowance} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Limit', fill: '#EF4444', fontSize: 10 }} />
          <Bar 
            dataKey="spent" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
            cursor="pointer"
            isAnimationActive={false} // Disable animation for better performance/responsiveness during keyboard nav
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === selectedMonth ? '#86BC25' : (isDarkMode ? '#4d7c0f' : '#bef264')} 
                role="graphics-symbol"
                aria-label={`${entry.fullMonthName}: ₹${entry.spent.toLocaleString()} spent. ${entry.spent > monthlyAllowance ? 'Over limit.' : 'Within limit.'}`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};