import React from 'react';
import { MonthlyStat } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardStatsProps {
  currentMonthStats: MonthlyStat | null;
  monthlyAllowance: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ currentMonthStats, monthlyAllowance }) => {
  const spent = currentMonthStats?.totalSpent || 0;
  const remaining = Math.max(0, monthlyAllowance - spent);
  
  // Visual percentage capped at 100% for the bar
  const visualPercentage = Math.min(100, (spent / monthlyAllowance) * 100);
  // Actual percentage for display
  const actualPercentage = monthlyAllowance > 0 ? (spent / monthlyAllowance) * 100 : 0;

  let statusColor = '#86BC25'; // Deloitte Green
  let statusText = 'Within Limit';
  
  if (spent > monthlyAllowance) {
    statusColor = '#EF4444'; // Red
    statusText = 'Exceeded Limit';
  } else if (spent >= (monthlyAllowance * 0.8)) {
    statusColor = '#F59E0B'; // Amber/Yellow
    statusText = 'Approaching Limit';
  }

  const data = [
    { name: 'Spent', value: spent },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" 
      aria-live="polite" 
      aria-atomic="true"
    >
      {/* Main Budget Card */}
      <div 
        id="monthly-allowance-card"
        className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 col-span-1 md:col-span-2 relative overflow-hidden transition-colors duration-200 focus:outline-none"
        tabIndex={-1}
        role="region"
        aria-label="Monthly Allowance"
      >
        <div className="flex justify-between items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider" aria-hidden="true">Monthly Allowance</h2>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white" aria-label={`Spent ${spent.toLocaleString()} rupees`}>₹{spent.toLocaleString()}</span>
              <span className="text-gray-400 dark:text-gray-500 font-medium" aria-hidden="true">/ ₹{monthlyAllowance.toLocaleString()}</span>
              <span className="sr-only">out of {monthlyAllowance.toLocaleString()} limit</span>
            </div>
            <p className="mt-2 text-sm font-bold" style={{ color: statusColor }}>
              {statusText}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Remaining</h3>
            <p className={`text-2xl font-bold ${remaining === 0 ? 'text-red-500 dark:text-red-400' : 'text-[#86BC25] '}`} aria-label={`Remaining ${remaining.toLocaleString()} rupees`}>
              ₹{remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden" role="progressbar" aria-valuenow={visualPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Budget usage percentage">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${visualPercentage}%`, backgroundColor: statusColor }}
          ></div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gray-50 dark:bg-gray-900 rounded-full z-0 opacity-50 transition-colors duration-200" aria-hidden="true"></div>
      </div>

      {/* Mini Chart Card */}
      <div 
        id="utilization-card"
        className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center transition-colors duration-200 focus:outline-none" 
        tabIndex={-1}
        role="region"
        aria-label="Utilization"
      >
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2 w-full text-left" aria-hidden="true">Utilization</h3>
        <div className="w-full h-32" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                <Cell key="spent" fill={statusColor} />
                <Cell key="remaining" fill="#374151" className="dark:fill-gray-700 fill-gray-200" />
              </Pie>
              <Tooltip 
                 formatter={(value: number) => `₹${value.toLocaleString()}`} 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {actualPercentage.toFixed(1)}% Used
        </div>
      </div>
    </div>
  );
};