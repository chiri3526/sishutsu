import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Expense } from '../types';

export const useExpenses = (userId: string | null, startDate?: string, endDate?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    if (!userId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      let filtered = data;
      if (startDate && endDate) {
        filtered = data.filter(e => e.date >= startDate && e.date <= endDate);
      }

      setExpenses(filtered);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userId, startDate, endDate]);

  return { expenses, loading, refetch: fetchExpenses };
};

export const addExpense = async (expense: Omit<Expense, 'id'>) => {
  return await addDoc(collection(db, 'expenses'), expense);
};

export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  return await updateDoc(doc(db, 'expenses', id), expense);
};

export const deleteExpense = async (id: string) => {
  return await deleteDoc(doc(db, 'expenses', id));
};
