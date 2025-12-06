import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { DashboardStats } from './components/DashboardStats';
import { HistoryTable } from './components/HistoryTable';
import { AnalysisChart } from './components/AnalysisChart';
import { ThemeToggle, Theme } from './components/ThemeToggle';
import { parseReceipt } from './services/geminiService';
import { ReceiptData, MonthlyStat, MONTHLY_ALLOWANCE } from './types';

// Placeholder data for initial visualization if empty
const DEMO_DATA: ReceiptData[] = [];

// Skip Links Component for Accessibility
const SkipLinks = () => {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.querySelector(id) as HTMLElement;
    if (element) {
      // Ensure element is focusable for screen readers
      if (!element.getAttribute('tabIndex')) {
        element.setAttribute('tabIndex', '-1');
        element.style.outline = 'none';
      }
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed top-0 left-0 z-[100] w-full pointer-events-none">
      {[
        { href: "#main-content", label: "Skip to main content" },
        { href: "#monthly-allowance-card", label: "Skip to monthly allowance" },
        { href: "#utilization-card", label: "Skip to utilization" },
        { href: "#analysis-trend-chart", label: "Skip to spend analysis trend" },
        { href: "#upload-section", label: "Skip to file upload (Alt + U)" },
        { href: "#trips-section", label: "Skip to trips in month" },
      ].map((link, index) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleSkip(e, link.href)}
          className="absolute top-0 left-4 -translate-y-full focus:translate-y-4 bg-[#86BC25] text-black px-6 py-3 rounded-b-lg font-bold shadow-lg pointer-events-auto transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-black underline decoration-2 z-50"
          style={{ zIndex: 100 - index }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

function App() {
  const [invoices, setInvoices] = useState<ReceiptData[]>(DEMO_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  // Derived state for dark mode specifically (to pass to charts etc)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State to track which month is currently being viewed (YYYY-MM)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + U to focus upload
      if (e.altKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        fileInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load from local storage on mount (simple persistence)
  useEffect(() => {
    // Try to load new key first
    let saved = localStorage.getItem('deloitte-travel-invoices');
    if (!saved) {
      // Fallback to old key migration
      saved = localStorage.getItem('uber-tracker-invoices');
    }
    
    if (saved) {
      try {
        setInvoices(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('deloitte-travel-invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Handle Theme Changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        setIsDarkMode(systemTheme === 'dark');
      } else {
        root.classList.add(t);
        setIsDarkMode(t === 'dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system changes if mode is system
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleUpload = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    
    let successCount = 0;
    const errors: string[] = [];
    const newInvoices: ReceiptData[] = [];

    try {
      // Process files concurrently
      const results = await Promise.allSettled(files.map(file => parseReceipt(file)));
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newInvoices.push(result.value);
          successCount++;
        } else {
          console.error(`Failed to parse file ${files[index].name}:`, result.reason);
          errors.push(files[index].name);
        }
      });
      
      if (newInvoices.length > 0) {
        setInvoices(prev => [...newInvoices, ...prev]);
        // Optional: Switch view to the month of the first uploaded receipt
        if (newInvoices[0].date) {
            setSelectedMonthKey(newInvoices[0].date.substring(0, 7));
        }
      }

      if (errors.length > 0) {
        if (successCount === 0) {
           setError(`Failed to process all ${files.length} receipts. Please ensure they are valid receipts.`);
        } else {
           setError(`Processed ${successCount} receipts. Failed: ${errors.length} (${errors.join(', ')}).`);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during processing.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Aggregation Logic
  const monthlyStats: MonthlyStat[] = useMemo(() => {
    const groups: { [key: string]: MonthlyStat } = {};

    invoices.forEach(inv => {
      // Extract YYYY-MM
      const monthKey = inv.date.substring(0, 7); 
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          month: monthKey,
          totalSpent: 0,
          tripCount: 0,
          status: 'Safe',
          remainingBudget: MONTHLY_ALLOWANCE
        };
      }
      
      groups[monthKey].totalSpent += inv.amount;
      groups[monthKey].tripCount += 1;
      groups[monthKey].remainingBudget = Math.max(0, MONTHLY_ALLOWANCE - groups[monthKey].totalSpent);
      
      // Determine status
      if (groups[monthKey].totalSpent > MONTHLY_ALLOWANCE) {
        groups[monthKey].status = 'OverBudget';
      } else if (groups[monthKey].totalSpent >= 5000) {
        groups[monthKey].status = 'Warning';
      }
    });

    // Sort descending by month
    return Object.values(groups).sort((a, b) => b.month.localeCompare(a.month));
  }, [invoices]);

  // Handle Month Navigation
  const navigateMonth = (direction: number) => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    // Create date object (day 15 to avoid month-end rollover issues)
    const date = new Date(year, month - 1 + direction, 15);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonthKey(`${newYear}-${newMonth}`);
  };

  // Helper to calculate relative month name
  const getRelativeMonthName = (offset: number) => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    // Create date object (day 15 to avoid month-end rollover issues)
    const date = new Date(year, month - 1 + offset, 15);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const selectedMonthStats = monthlyStats.find(m => m.month === selectedMonthKey) || {
    month: selectedMonthKey,
    totalSpent: 0,
    tripCount: 0,
    status: 'Safe',
    remainingBudget: MONTHLY_ALLOWANCE
  } as MonthlyStat;

  // Format month name for display
  const monthDisplay = new Date(selectedMonthKey + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filter history table for the selected month
  const selectedMonthInvoices = useMemo(() => {
    return invoices.filter(inv => inv.date.startsWith(selectedMonthKey)).sort((a, b) => b.date.localeCompare(a.date));
  }, [invoices, selectedMonthKey]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans pb-12 transition-colors duration-200">
      <SkipLinks />
      
      {/* Header */}
      <header role="banner" className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#86BC25] rounded-full flex items-center justify-center transition-colors" aria-hidden="true">
              <span className="text-black font-bold text-lg">D</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Travel Tracker</h1>
          </div>
          <nav className="flex items-center space-x-6" aria-label="Main Navigation">
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
          </nav>
        </div>
      </header>

      <main 
        id="main-content" 
        role="main" 
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 focus:outline-none"
        tabIndex={-1}
      >
        
        {/* Top Section: Dashboard + Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column: Stats */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white" id="overview-heading">
                Overview: {monthDisplay}
              </h2>
              <nav aria-label="Month Navigation" className="flex bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-1 transition-colors">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
                  aria-label={`Go to previous month, ${getRelativeMonthName(-1)}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px] text-center select-none border-x border-gray-100 dark:border-gray-800 mx-1" aria-hidden="true">
                  {new Date(selectedMonthKey + '-02').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
                  aria-label={`Go to next month, ${getRelativeMonthName(1)}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </nav>
            </div>

            <section aria-labelledby="overview-heading">
              <DashboardStats currentMonthStats={selectedMonthStats} />
            </section>
            
            <section className="mt-8" aria-label="Spend Analysis Trend Chart">
              <AnalysisChart 
                stats={monthlyStats} 
                selectedMonth={selectedMonthKey}
                onMonthSelect={setSelectedMonthKey}
                isDarkMode={isDarkMode}
              />
            </section>
          </div>

          {/* Right Column: Actions */}
          <div className="lg:col-span-1 space-y-6">
            <section 
                id="upload-section" 
                aria-labelledby="upload-heading"
                className="focus:outline-none"
                tabIndex={-1}
            >
              <h2 id="upload-heading" className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Receipts</h2>
              <FileUpload ref={fileInputRef} onUpload={handleUpload} isProcessing={isProcessing} />
              {error && (
                <div role="alert" className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </section>

            {/* Live Region for Analysis Text */}
            <div 
              role="status" 
              aria-live="polite" 
              className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30 transition-colors"
            >
              <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-2">Analysis for {new Date(selectedMonthKey + '-02').toLocaleDateString('en-US', { month: 'long' })}</h3>
              <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">
                Total spent: <span className="font-bold">₹{selectedMonthStats.totalSpent.toLocaleString()}</span>. 
                <br/>
                Average per trip: <span className="font-bold">₹{selectedMonthStats.tripCount > 0 ? Math.round(selectedMonthStats.totalSpent / selectedMonthStats.tripCount) : 0}</span>.
                <br className="mb-2"/>
                <span className={
                  selectedMonthStats.status === 'Safe' ? 'text-[#86BC25]' :
                  selectedMonthStats.status === 'Warning' ? 'text-amber-500' : 'text-red-500'
                }>
                  {selectedMonthStats.status === 'Safe' && " You are within limit."}
                  {selectedMonthStats.status === 'Warning' && " You are approaching limit."}
                  {selectedMonthStats.status === 'OverBudget' && " You have exceeded limit."}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Detailed Table */}
        <section 
            id="trips-section" 
            className="mt-12 focus:outline-none" 
            aria-labelledby="history-heading"
            tabIndex={-1}
        >
           <div className="flex items-center justify-between mb-2">
            <h2 id="history-heading" className="text-lg font-semibold text-gray-900 dark:text-white">Trips in {monthDisplay}</h2>
            {selectedMonthInvoices.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">Showing {selectedMonthInvoices.length} trips</span>
            )}
           </div>
          <HistoryTable invoices={selectedMonthInvoices} onDelete={handleDelete} />
          
          {selectedMonthInvoices.length === 0 && invoices.length > 0 && (
            <div className="text-center mt-4">
                <button 
                    onClick={() => setSelectedMonthKey(invoices[0].date.substring(0, 7))} // Jump to latest available
                    className="text-[#86BC25] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#86BC25] rounded-sm p-1"
                >
                    View most recent activity
                </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;