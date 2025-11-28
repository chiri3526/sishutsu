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
