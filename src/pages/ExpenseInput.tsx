import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useExpenses, addExpense, deleteExpense } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { calculateShareAmounts } from '../utils/calculations';
import { format } from 'date-fns';

export const ExpenseInput = () => {
  const { user } = useAuth();
  const { expenses, loading: expensesLoading, refetch } = useExpenses(user?.uid || null);
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    amount: '',
    memo: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.categoryId || !formData.amount) return;

    const category = categories.find(c => c.id === formData.categoryId);
    if (!category) return;

    setLoading(true);
    try {
      const amount = Number(formData.amount);
      const { husbandAmount, wifeAmount } = calculateShareAmounts(amount, category.shareRatio);

      await addExpense({
        userId: user.uid,
        date: formData.date,
        categoryId: formData.categoryId,
        amount,
        memo: formData.memo,
        husbandAmount,
        wifeAmount,
      });

      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryId: '',
        amount: '',
        memo: '',
      });

      setSnackbar({ open: true, message: '支出を追加しました', severity: 'success' });
      await refetch();
    } catch (error) {
      setSnackbar({ open: true, message: 'エラーが発生しました', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('削除しますか？')) {
      setLoading(true);
      try {
        await deleteExpense(id);
        setSnackbar({ open: true, message: '支出を削除しました', severity: 'success' });
        await refetch();
      } catch (error) {
        setSnackbar({ open: true, message: '削除に失敗しました', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        支出入力
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="日付"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <FormControl required>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                label="カテゴリ"
              >
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="金額"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <TextField
              label="メモ"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              multiline
              rows={2}
            />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? '追加中...' : '追加'}
            </Button>
          </Box>
        </form>
      </Paper>

      {expensesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: { xs: 600, sm: 650 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>日付</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>カテゴリ</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>金額</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>夫負担</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>妻負担</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>メモ</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{expense.date}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{category?.name}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>¥{expense.amount.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>¥{expense.husbandAmount.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>¥{expense.wifeAmount.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{expense.memo}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => expense.id && handleDelete(expense.id)} disabled={loading}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
