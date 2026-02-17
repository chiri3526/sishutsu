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
export interface Investment {
  id?: string;
  userId: string;
  type: 'stock' | 'sui'; // 株つみたて or すい積立
  amount: number;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  memo?: string;
  createdAt?: string; // Firestore timestamp
  updatedAt?: string; // Firestore timestamp
}

export interface InvestmentSummary {
  stockTotal: number;
  suiTotal: number;
  totalInvestment: number;
}
