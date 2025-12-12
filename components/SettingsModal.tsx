import React, { useState, useEffect, useRef } from 'react';

// Redefining Theme type here since we might delete ThemeToggle.tsx
export type Theme = 'light' | 'dark' | 'system';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  monthlyAllowance: number;
  onUpdateAllowance: (amount: number) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  monthlyAllowance,
  onUpdateAllowance,
}) => {
  const [tempBudget, setTempBudget] = useState(monthlyAllowance.toString());
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state when opening and Handle Accessibility
  useEffect(() => {
    if (isOpen) {
      setTempBudget(monthlyAllowance.toString());

      // Save current focus
      const previousActiveElement = document.activeElement as HTMLElement;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';

      // Focus modal container or first element
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector('button, input');
          if (firstFocusable) (firstFocusable as HTMLElement).focus();
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
        if (previousActiveElement) {
          previousActiveElement.focus();
        }
      };
    }
  }, [isOpen, monthlyAllowance, onClose]);

  if (!isOpen) return null;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(tempBudget);
    if (!isNaN(val) && val > 0) {
      setIsSavingBudget(true);
      try {
        await onUpdateAllowance(val);
        onClose();
      } finally {
        setIsSavingBudget(false);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-black rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 id="settings-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#86BC25] ${
                    theme === t
                      ? 'border-[#86BC25] bg-[#86BC25]/5 text-[#86BC25]'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t === 'light' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  )}
                  {t === 'dark' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  )}
                  {t === 'system' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  )}
                  <span className="capitalize font-medium">{t}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Budget Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Budget</h3>
            <form onSubmit={handleSaveBudget} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="mb-4">
                <label htmlFor="monthly-allowance-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Allowance (₹)</label>
                <input
                  id="monthly-allowance-input"
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-[#86BC25] outline-none text-gray-900 dark:text-white"
                  placeholder="e.g. 6500"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Set your monthly spending limit. We'll warn you when you get close.
                </p>
              </div>
              <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingBudget || parseInt(tempBudget) === monthlyAllowance}
                    className="px-4 py-2 bg-[#86BC25] hover:bg-[#76a821] text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC25]"
                  >
                    {isSavingBudget ? 'Saving...' : 'Update Limit'}
                  </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
};