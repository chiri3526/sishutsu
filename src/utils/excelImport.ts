import * as XLSX from 'xlsx';
import type { Category } from '../types';
import { calculateShareAmounts } from './calculations';

export interface ExcelRow {
  date: string;
  category: string;
  amount: number;
  memo?: string;
}

export const parseExcelFile = async (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const rows: ExcelRow[] = json.map(row => ({
          date: row['日付'] || row['date'] || '',
          category: row['カテゴリ'] || row['category'] || '',
          amount: Number(row['金額'] || row['amount'] || 0),
          memo: row['メモ'] || row['memo'] || '',
        }));

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
};

export const convertToExpenses = (
  rows: ExcelRow[],
  categories: Category[],
  userId: string
) => {
  return rows.map(row => {
    const category = categories.find(c => c.name === row.category);
    if (!category || !category.id) {
      throw new Error(`カテゴリが見つかりません: ${row.category}`);
    }

    const { husbandAmount, wifeAmount } = calculateShareAmounts(
      row.amount,
      category.shareRatio
    );

    return {
      userId,
      date: row.date,
      categoryId: category.id,
      amount: row.amount,
      memo: row.memo || '',
      husbandAmount,
      wifeAmount,
    };
  });
};
