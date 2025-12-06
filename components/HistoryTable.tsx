import React from 'react';
import { ReceiptData } from '../types';

interface HistoryTableProps {
  invoices: ReceiptData[];
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ invoices, onDelete }) => {
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
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoices.map((inv) => {
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
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-xs font-medium"
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