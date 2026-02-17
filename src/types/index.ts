export interface Expense {
  id?: string;
  userId: string;
  date: string;
  categoryId: string;
  amount: number;
  memo?: string;
  husbandAmount: number;
  wifeAmount: number;
}

export interface Category {
  id?: string;
  name: string;
  shareRatio: {
    husband: number;
    wife: number;
  };
}

export interface MonthlyTotal {
  month: string;
  total: number;
  husbandTotal: number;
  wifeTotal: number;
  previousMonthDiff?: number;
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  total: number;
  expenses: Expense[];
}

export type InvestmentType = 'stock' | 'sui';

export interface Investment {
  id?: string;
  userId: string;
  type: InvestmentType; // 株つみたて or すい積立
  amount: number;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  memo?: string;
  createdAt?: string; // Firestore timestamp
  updatedAt?: string; // Firestore timestamp
}

export interface InvestmentUsage {
  id?: string;
  userId: string;
  type: InvestmentType;
  amount: number; // positive value
  date: string; // ISO 8601 format (YYYY-MM-DD)
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestmentHistoryItem {
  id: string;
  type: InvestmentType;
  entryType: 'investment' | 'usage';
  date: string;
  displayAmount: number;
  memo?: string;
}

export interface InvestmentSummary {
  stockTotal: number;
  suiTotal: number;
  totalInvestment: number;
}
