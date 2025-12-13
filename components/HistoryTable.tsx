import React, { useState, useMemo } from 'react';
import { ReceiptData } from '../types';

interface HistoryTableProps {
  invoices: ReceiptData[];
  onDelete: (id: string) => void;
}

type SortKey = 'date' | 'amount' | 'pickupLocation';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ invoices, onDelete }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedInvoices = useMemo(() => {
    const sorted = [...invoices];
    
    sorted.sort((a, b) => {
      // Special handling for date: combine date and time for accurate sort
      if (sortConfig.key === 'date') {
        const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return sortConfig.direction === 'asc' ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
      }

      // Amount sorting
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }

      // String sorting (Pickup Location)
      if (sortConfig.key === 'pickupLocation') {
        const valA = (a.pickupLocation || '').toLowerCase();
        const valB = (b.pickupLocation || '').toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });

    return sorted;
  }, [invoices, sortConfig]);

  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
    if (!active) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 text-gray-400 opacity-40">
          <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
        </svg>
      );
    }
    return direction === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 text-[#86BC25]">
         <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 text-[#86BC25]">
        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.55-.24l-3.25-3.5a.75.75 0 111.1-1.02L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5A.75.75 0 0110 17z" clipRule="evenodd" />
      </svg>
    );
  };

  const renderSortableHeader = (label: string, key: SortKey, alignment: 'left' | 'right' = 'left') => (
    <button
      onClick={() => handleSort(key)}
      className={`group flex items-center ${alignment === 'right' ? 'ml-auto' : ''} focus:outline-none focus:text-gray-900 dark:focus:text-gray-200 transition-colors hover:text-gray-700 dark:hover:text-gray-300`}
      aria-label={`Sort by ${label} ${sortConfig.key === key ? (sortConfig.direction === 'asc' ? 'descending' : 'ascending') : ''}`}
    >
      <span className="font-semibold">{label}</span>
      <SortIcon active={sortConfig.key === key} direction={sortConfig.direction} />
    </button>
  );

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mt-6 transition-colors duration-200">
        <p className="text-gray-400 dark:text-gray-500 text-sm">No receipts tracked yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-6 transition-colors duration-200">
      <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">History</h3>
        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{invoices.length} Items</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
            <tr>
              <th className="px-6 py-3 w-32">
                {renderSortableHeader('Date', 'date')}
              </th>
              <th className="px-6 py-3">
                 {renderSortableHeader('Details', 'pickupLocation')}
              </th>
              <th className="px-6 py-3 w-32">
                {renderSortableHeader('Amount', 'amount', 'right')}
              </th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedInvoices.map((inv) => {
              return (
                <tr key={inv.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-gray-200">{inv.date}</div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs">{inv.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="w-4 inline-block text-gray-400">P:</span>
                        <span className="truncate max-w-[180px]" title={inv.pickupLocation}>{inv.pickupLocation || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-800 dark:text-gray-300 font-medium">
                        <span className="w-4 inline-block text-gray-400">D:</span>
                        <span className="truncate max-w-[180px]" title={inv.dropoffLocation}>{inv.dropoffLocation || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                    {inv.currency} {inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(inv.id)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors text-xs font-medium"
                      aria-label={`Remove receipt from ${inv.date} at ${inv.time}`}
                      title={`Remove receipt from ${inv.date} at ${inv.time}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};