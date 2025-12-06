export interface ReceiptData {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  amount: number;
  currency: string;
  pickupLocation: string;
  dropoffLocation: string;
  tripType: string; // Inferred context e.g., "Commute", "Personal"
}

export interface MonthlyStat {
  month: string; // YYYY-MM
  totalSpent: number;
  tripCount: number;
  status: 'Safe' | 'Warning' | 'OverBudget';
  remainingBudget: number;
}

export const MONTHLY_ALLOWANCE = 6500;