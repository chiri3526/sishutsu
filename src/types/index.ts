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
