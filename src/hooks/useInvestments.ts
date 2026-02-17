import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Expense, Category } from '../types';

interface UseInvestmentsReturn {
  stockInvestmentTotal: number;
  suiInvestmentTotal: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInvestments = (userId: string | null): UseInvestmentsReturn => {
  const [stockInvestmentTotal, setStockInvestmentTotal] = useState(0);
  const [suiInvestmentTotal, setSuiInvestmentTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = async () => {
    if (!userId) {
      setStockInvestmentTotal(0);
      setSuiInvestmentTotal(0);
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
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      // カテゴリごとに合計を計算
      const stockTotal = stockCategory
        ? expenses
            .filter(exp => exp.categoryId === stockCategory.id)
            .reduce((sum, exp) => sum + exp.amount, 0)
        : 0;

      const suiTotal = suiCategory
        ? expenses
            .filter(exp => exp.categoryId === suiCategory.id)
            .reduce((sum, exp) => sum + exp.amount, 0)
        : 0;

      setStockInvestmentTotal(stockTotal);
      setSuiInvestmentTotal(suiTotal);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('データの取得に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [userId]);

  return {
    stockInvestmentTotal,
    suiInvestmentTotal,
    loading,
    error,
    refetch: fetchInvestments
  };
};
