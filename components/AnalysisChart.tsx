import React, { useMemo } from 'react';
import { ReceiptData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface AnalysisChartProps {
  invoices: ReceiptData[];
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  isDarkMode?: boolean;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ invoices, selectedMonth, onMonthSelect, isDarkMode = false }) => {
  
  // Aggregate daily spend for the selected month
  const dailyData = useMemo(() => {
    const data: Record<string, number> = {};
    
    invoices.forEach(inv => {
      if (inv.date.startsWith(selectedMonth)) {
        const day = inv.date; // YYYY-MM-DD
        data[day] = (data[day] || 0) + inv.amount;
      }
    });

    return Object.entries(data)
      .map(([date, amount]) => {
        // Parse date reliably in local time to avoid timezone shifts
        // date string is YYYY-MM-DD
        const [y, m, d] = date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d); // Local time construction
        
        return {
          fullDate: date,
          day: dateObj.getDate().toString(), // "5", "12"
          displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: amount
        };
      })
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [invoices, selectedMonth]);

  // Handle keyboard navigation to switch months
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      // Next Month (Use day 15 to be safe)
      const d = new Date(year, month - 1 + 1, 15);
      const nextMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      onMonthSelect(nextMonthStr);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // Prev Month (Use day 15 to be safe)
      const d = new Date(year, month - 1 - 1, 15);
      const prevMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      onMonthSelect(prevMonthStr);
    }
  };

  const [displayYear, displayMonth] = selectedMonth.split('-').map(Number);
  const monthName = new Date(displayYear, displayMonth - 1, 15).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (dailyData.length === 0) {
    return (
      <div 
        className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-96 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`Daily Spend Chart for ${monthName}. No data available. Use Left and Right arrow keys to change month.`}
      >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
         </svg>
         <p>No trips recorded for {monthName}</p>
         <p className="text-xs mt-2 opacity-75">Use arrow keys to change month</p>
      </div>
    );
  }

  return (
    <div 
      id="analysis-daily-chart"
      className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-96 flex flex-col transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#86BC25] ring-offset-2 ring-offset-white dark:ring-offset-black"
      tabIndex={0}
      role="application"
      aria-label={`Daily Spend Chart for ${monthName}. Use Left and Right arrow keys to navigate between months.`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Daily Spend Breakdown</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline-block" aria-hidden="true">
          {monthName}
        </span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart 
            data={dailyData} 
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            accessibilityLayer
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} 
              dy={10}
              interval={0} // Try to show all days if they fit, or let recharts handle it
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
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.displayDate;
                }
                return label;
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
            />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
              isAnimationActive={true}
            >
              {dailyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isDarkMode ? '#4d7c0f' : '#86BC25'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};