import { useState } from 'react';
import { Box, Paper, Typography, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { parseExcelFile, convertToExpenses } from '../utils/excelImport';
import type { ExcelRow } from '../utils/excelImport';
import { addExpense } from '../hooks/useExpenses';

export const ExcelImport = () => {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const rows = await parseExcelFile(file);
      setPreview(rows);
    } catch (err) {
      setError('ファイルの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user || preview.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const expenses = convertToExpenses(preview, categories, user.uid);
      
      for (const expense of expenses) {
        await addExpense(expense);
      }

      setSuccess(true);
      setPreview([]);
    } catch (err: any) {
      setError(err.message || 'インポートに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        Excel取り込み
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Excelファイルをアップロードして支出データを一括登録できます。
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          必要な列: 日付, カテゴリ, 金額, メモ（任意）
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          ファイルを選択
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </Button>

        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>インポートが完了しました</Alert>}
      </Paper>

      {preview.length > 0 && (
        <Paper sx={{ overflowX: 'auto' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              プレビュー ({preview.length}件)
            </Typography>
            <Button variant="contained" onClick={handleImport} disabled={loading}>
              インポート実行
            </Button>
          </Box>
          <TableContainer>
            <Table size="small" sx={{ minWidth: { xs: 500, sm: 600 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>日付</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>カテゴリ</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>金額</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>メモ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {row.date || <span style={{ color: 'red' }}>日付なし</span>}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{row.category}</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>¥{row.amount.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{row.memo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {preview.length > 10 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                ...他 {preview.length - 10} 件
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};
