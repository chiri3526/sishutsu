import * as XLSX from 'xlsx';
import type { Category } from '../types';
import { calculateShareAmounts } from './calculations';

export interface ExcelRow {
  date: string;
  category: string;
  amount: number;
  memo?: string;
}

// Excelのシリアル値を日付文字列に変換
const convertExcelDate = (value: any): string => {
  console.log('Converting date:', value, 'Type:', typeof value);
  
  // 空の場合
  if (!value && value !== 0) {
    return '';
  }
  
  // 既に文字列の場合
  if (typeof value === 'string') {
    // YYYY-MM-DD形式かチェック
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
      const parts = value.split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // YYYY/MM/DD形式の場合
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(value)) {
      const parts = value.split('/');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // MM/DD/YYYY形式の場合
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      const parts = value.split('/');
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  
  // 数値（Excelシリアル値）の場合
  if (typeof value === 'number') {
    try {
      // Excelの日付シリアル値を変換（1900年1月1日からの日数）
      const date = XLSX.SSF.parse_date_code(value);
      const year = date.y;
      const month = String(date.m).padStart(2, '0');
      const day = String(date.d).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      console.log('Converted serial to:', result);
      return result;
    } catch (error) {
      console.error('Error converting serial date:', error);
      return '';
    }
  }
  
  // Dateオブジェクトの場合
  if (value instanceof Date && !isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  console.warn('Could not convert date value:', value);
  return '';
};

export const parseExcelFile = async (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 生データを取得（デバッグ用）
        const jsonRaw = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as any[];
        console.log('Raw Excel data:', jsonRaw[0]); // 最初の行をログ出力
        
        const rows: ExcelRow[] = jsonRaw.map((row, index) => {
          // すべての可能な列名をチェック
          const dateValue = row['日付'] || row['date'] || row['Date'] || row['DATE'] || 
                           row['ひづけ'] || row['ヒヅケ'] || '';
          
          console.log(`Row ${index} date value:`, dateValue, typeof dateValue);
          
          return {
            date: convertExcelDate(dateValue),
            category: row['カテゴリ'] || row['category'] || row['Category'] || row['CATEGORY'] || '',
            amount: Number(row['金額'] || row['amount'] || row['Amount'] || row['AMOUNT'] || 0),
            memo: row['メモ'] || row['memo'] || row['Memo'] || row['MEMO'] || '',
          };
        });

        console.log('Converted rows:', rows);
        resolve(rows);
      } catch (error) {
        console.error('Excel parse error:', error);
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
