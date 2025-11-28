import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'categories'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refetch: fetchCategories };
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
  return await addDoc(collection(db, 'categories'), category);
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  return await updateDoc(doc(db, 'categories', id), category);
};

export const deleteCategory = async (id: string) => {
  return await deleteDoc(doc(db, 'categories', id));
};
