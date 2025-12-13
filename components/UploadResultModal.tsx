import React, { useEffect, useRef } from 'react';
import { ReceiptData } from '../types';

interface DuplicateInfo {
  fileName: string;
  data: ReceiptData;
}

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicateInfo[];
  errors: string[];
}

export const UploadResultModal: React.FC<UploadResultModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  errors
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Accessibility: Focus Management and ESC Key
  useEffect(() => {
    if (isOpen) {
      const previousActiveElement = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus the modal heading immediately for screen readers and keyboard users
      setTimeout(() => {
        if (modalRef.current) {
          const titleElement = modalRef.current.querySelector('#upload-result-title') as HTMLElement;
          if (titleElement) {
              titleElement.focus();
          } else {
             // Fallback to close button
             const closeBtn = modalRef.current.querySelector('button');
             if(closeBtn) closeBtn.focus();
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Focus Trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElement) previousActiveElement.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasErrors = errors.length > 0;
  const hasDuplicates = duplicates.length > 0;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-result-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-black rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
             {hasErrors ? (
                 <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                     </svg>
                 </div>
             ) : (
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                </div>
             )}
            <h2 
                id="upload-result-title" 
                className="text-xl font-bold text-gray-900 dark:text-white focus:outline-none"
                tabIndex={-1}
            >
              Upload Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Section: Processing Errors */}
          {hasErrors && (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
              <h3 className="text-red-800 dark:text-red-300 font-semibold mb-3 flex items-center gap-2">
                Files Failed to Process
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-red-700 dark:text-red-400">
                {errors.map((err, idx) => (
                  <li key={idx} className="break-words">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: Duplicates */}
          {hasDuplicates && (
            <div>
              <div className="mb-4">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Duplicates Discarded</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The following receipts were identified as duplicates and were not added.
                  </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-black">
                    {duplicates.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300 max-w-[150px] truncate" title={item.fileName}>
                          {item.fileName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {item.data.date}<br/>
                          <span className="text-xs opacity-75">{item.data.time}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                           <div className="flex flex-col text-xs space-y-1">
                                <span className="text-gray-500 dark:text-gray-400 truncate" title={item.data.pickupLocation}>
                                    <span className="font-semibold text-gray-400 mr-1">From:</span>
                                    {item.data.pickupLocation || 'N/A'}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300 truncate" title={item.data.dropoffLocation}>
                                    <span className="font-semibold text-gray-400 mr-1">To:</span>
                                    {item.data.dropoffLocation || 'N/A'}
                                </span>
                           </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-200 whitespace-nowrap">
                          {item.data.currency} {item.data.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};
