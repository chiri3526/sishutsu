import type { Expense, Category, MonthlyTotal, CategoryExpense } from '../types';

export const calculateShareAmounts = (amount: number, shareRatio: { husband: number; wife: number }) => {
  return {
    husbandAmount: Math.round(amount * shareRatio.husband),
    wifeAmount: Math.round(amount * shareRatio.wife),
  };
};

export const getMonthlyTotals = (expenses: Expense[]): MonthlyTotal[] => {
  const monthMap = new Map<string, { total: number; husbandTotal: number; wifeTotal: number }>();

  expenses.forEach(expense => {
    const month = expense.date.substring(0, 7);
    const current = monthMap.get(month) || { total: 0, husbandTotal: 0, wifeTotal: 0 };
    
    monthMap.set(month, {
      total: current.total + expense.amount,
      husbandTotal: current.husbandTotal + expense.husbandAmount,
      wifeTotal: current.wifeTotal + expense.wifeAmount,
    });
  });

  const sorted = Array.from(monthMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, data]) => ({
      month,
      ...data,
    }));

  return sorted.map((item, index) => {
    if (index < sorted.length - 1) {
      const previousTotal = sorted[index + 1].total;
      return {
        ...item,
        previousMonthDiff: ((item.total - previousTotal) / previousTotal) * 100,
      };
    }
    return item;
  });
};

export const getCategoryExpenses = (expenses: Expense[], categories: Category[]): CategoryExpense[] => {
  const categoryMap = new Map<string, { total: number; expenses: Expense[] }>();

  expenses.forEach(expense => {
    const current = categoryMap.get(expense.categoryId) || { total: 0, expenses: [] };
    categoryMap.set(expense.categoryId, {
      total: current.total + expense.amount,
      expenses: [...current.expenses, expense],
    });
  });

  return Array.from(categoryMap.entries()).map(([categoryId, data]) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      categoryId,
      categoryName: category?.name || '不明',
      ...data,
    };
  }).sort((a, b) => b.total - a.total);
};
