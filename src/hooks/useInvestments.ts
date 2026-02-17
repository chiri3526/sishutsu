import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  Expense,
  Category,
  InvestmentUsage,
  InvestmentHistoryItem,
  InvestmentType,
} from '../types';

interface UseInvestmentsReturn {
  stockInvestmentTotal: number;
  suiInvestmentTotal: number;
  stockHistory: InvestmentHistoryItem[];
  suiHistory: InvestmentHistoryItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInvestments = (userId: string | null): UseInvestmentsReturn => {
  const [stockInvestmentTotal, setStockInvestmentTotal] = useState(0);
  const [suiInvestmentTotal, setSuiInvestmentTotal] = useState(0);
  const [stockHistory, setStockHistory] = useState<InvestmentHistoryItem[]>([]);
  const [suiHistory, setSuiHistory] = useState<InvestmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortByDateDesc = (items: InvestmentHistoryItem[]) =>
    [...items].sort((a, b) => b.date.localeCompare(a.date));

  const buildInvestmentItems = (expenses: Expense[], type: InvestmentType): InvestmentHistoryItem[] =>
    expenses.map((expense, index) => ({
      id: `expense-${expense.id || `${type}-${index}`}`,
      type,
      entryType: 'investment',
      date: expense.date,
      displayAmount: type === 'stock' ? expense.amount * -1 : expense.amount,
      memo: expense.memo,
    }));

  const buildUsageItems = (usages: InvestmentUsage[], type: InvestmentType): InvestmentHistoryItem[] =>
    usages.map((usage, index) => ({
      id: `usage-${usage.id || `${type}-${index}`}`,
      type,
      entryType: 'usage',
      date: usage.date,
      displayAmount: usage.amount * -1,
      memo: usage.memo,
    }));

  const fetchInvestments = useCallback(async () => {
    if (!userId) {
      setStockInvestmentTotal(0);
      setSuiInvestmentTotal(0);
      setStockHistory([]);
      setSuiHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // カテゴリを取得
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

      // 「株つみたて」と「すい積立」のカテゴリIDを取得
      const stockCategory = categories.find(cat => cat.name === '株つみたて');
      const suiCategory = categories.find(cat => cat.name === 'すい積立');

      // 支出データを取得
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );
      const usagesQuery = query(
        collection(db, 'investment_usages'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const [expensesSnapshot, usagesSnapshot] = await Promise.all([
        getDocs(expensesQuery),
        getDocs(usagesQuery),
      ]);

      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      const usages = usagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InvestmentUsage[];

      const stockExpenses = stockCategory
        ? expenses.filter(exp => exp.categoryId === stockCategory.id)
        : [];
      const suiExpenses = suiCategory
        ? expenses.filter(exp => exp.categoryId === suiCategory.id)
        : [];

      const stockUsages = usages.filter(usage => usage.type === 'stock');
      const suiUsages = usages.filter(usage => usage.type === 'sui');

      const stockInvestTotal = stockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const suiInvestTotal = suiExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const stockUsageTotal = stockUsages.reduce((sum, usage) => sum + usage.amount, 0);
      const suiUsageTotal = suiUsages.reduce((sum, usage) => sum + usage.amount, 0);

      // stockTotal = (sum(E_stock.amount) * -1) - sum(U_stock.amount)
      const stockTotal = (stockInvestTotal * -1) - stockUsageTotal;
      // suiTotal = sum(E_sui.amount) - sum(U_sui.amount)
      const suiTotal = suiInvestTotal - suiUsageTotal;

      setStockInvestmentTotal(stockTotal);
      setSuiInvestmentTotal(suiTotal);
      setStockHistory(
        sortByDateDesc([
          ...buildInvestmentItems(stockExpenses, 'stock'),
          ...buildUsageItems(stockUsages, 'stock'),
        ])
      );
      setSuiHistory(
        sortByDateDesc([
          ...buildInvestmentItems(suiExpenses, 'sui'),
          ...buildUsageItems(suiUsages, 'sui'),
        ])
      );
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('データの取得に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  return {
    stockInvestmentTotal,
    suiInvestmentTotal,
    stockHistory,
    suiHistory,
    loading,
    error,
    refetch: fetchInvestments
  };
};

export const addInvestmentUsage = async (
  usage: Omit<InvestmentUsage, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  return await addDoc(collection(db, 'investment_usages'), {
    ...usage,
    createdAt: now,
    updatedAt: now,
  });
};
