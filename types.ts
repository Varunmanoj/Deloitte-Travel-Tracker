export interface ReceiptData {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  amount: number;
  currency: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface MonthlyStat {
  month: string; // YYYY-MM
  totalSpent: number;
  tripCount: number;
  status: 'Safe' | 'Warning' | 'OverBudget';
  remainingBudget: number;
}

// Default value if not set by user
export const DEFAULT_ALLOWANCE = 6500;