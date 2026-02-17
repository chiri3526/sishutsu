import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const seedCategories = async () => {
  const categories = [
    { name: '食費', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '電気代', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '水道代', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: 'ガス代', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '通信費', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '家賃', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '交通費', shareRatio: { husband: 0.6, wife: 0.4 } },
    { name: '医療費', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '娯楽費', shareRatio: { husband: 0.5, wife: 0.5 } },
    { name: '日用品', shareRatio: { husband: 0.5, wife: 0.5 } },
  ];

  for (const category of categories) {
    await addDoc(collection(db, 'categories'), category);
  }

  console.log('カテゴリの初期データを作成しました');
};

export const seedInvestments = async (userId: string) => {
  const investments = [
    { userId, type: 'stock' as const, amount: 50000, date: '2024-01-15', memo: '1月の株つみたて' },
    { userId, type: 'stock' as const, amount: 50000, date: '2024-02-15', memo: '2月の株つみたて' },
    { userId, type: 'stock' as const, amount: 50000, date: '2024-03-15', memo: '3月の株つみたて' },
    { userId, type: 'sui' as const, amount: 30000, date: '2024-01-20', memo: '1月のすい積立' },
    { userId, type: 'sui' as const, amount: 30000, date: '2024-02-20', memo: '2月のすい積立' },
    { userId, type: 'sui' as const, amount: 30000, date: '2024-03-20', memo: '3月のすい積立' },
  ];

  for (const investment of investments) {
    await addDoc(collection(db, 'investments'), {
      ...investment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  console.log('つみたての初期データを作成しました');
};
