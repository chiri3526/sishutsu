import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { addInvestmentUsage, useInvestments } from '../hooks/useInvestments';
import type { InvestmentType } from '../types';

export const Investments = () => {
  const { user } = useAuth();
  const {
    stockInvestmentTotal,
    suiInvestmentTotal,
    stockHistory,
    suiHistory,
    loading,
    error,
    refetch,
  } = useInvestments(user?.uid || null);
  const [formData, setFormData] = useState<{
    type: InvestmentType | '';
    date: string;
    amount: string;
    memo: string;
  }>({
    type: '',
    date: format(new Date(), 'yyyy-MM'),
    amount: '',
    memo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedHistoryType, setSelectedHistoryType] = useState<InvestmentType | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedHistory = useMemo(() => {
    if (selectedHistoryType === 'stock') return stockHistory;
    if (selectedHistoryType === 'sui') return suiHistory;
    return [];
  }, [selectedHistoryType, stockHistory, suiHistory]);

  const handleSubmitUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.type || !formData.date || !formData.amount) return;

    const amount = Number(formData.amount);
    if (!Number.isInteger(amount) || amount < 1) {
      setSnackbar({ open: true, message: '使用金額は1以上の整数で入力してください', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await addInvestmentUsage({
        userId: user.uid,
        type: formData.type,
        date: `${formData.date}-01`,
        amount,
        memo: formData.memo,
      });
      await refetch();
      setFormData({
        type: '',
        date: format(new Date(), 'yyyy-MM'),
        amount: '',
        memo: '',
      });
      setSnackbar({ open: true, message: '積立使用金を登録しました', severity: 'success' });
    } catch (submitError) {
      console.error('Error adding usage:', submitError);
      setSnackbar({ open: true, message: '積立使用金の登録に失敗しました', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        つみたて
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
        <Card>
          <CardActionArea onClick={() => setSelectedHistoryType('stock')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  株つみたて
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                ¥{stockInvestmentTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                タップして履歴を確認
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card>
          <CardActionArea onClick={() => setSelectedHistoryType('sui')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Typography color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  すい積立
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                ¥{suiInvestmentTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                タップして履歴を確認
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          積立使用金を入力
        </Typography>
        <form onSubmit={handleSubmitUsage}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl required>
              <InputLabel>対象積立</InputLabel>
              <Select
                value={formData.type}
                label="対象積立"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as InvestmentType })}
                disabled={submitting}
              >
                <MenuItem value="stock">株つみたて</MenuItem>
                <MenuItem value="sui">すい積立</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="使用年月"
              type="month"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              disabled={submitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="使用金額"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              disabled={submitting}
            />

            <TextField
              label="メモ"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              disabled={submitting}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? '登録中...' : '使用金を登録'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Dialog
        open={selectedHistoryType !== null}
        onClose={() => setSelectedHistoryType(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedHistoryType === 'stock' ? '株つみたて履歴' : 'すい積立履歴'}
        </DialogTitle>
        <DialogContent>
          {selectedHistory.length === 0 ? (
            <Typography color="textSecondary">履歴はありません</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>年月</TableCell>
                    <TableCell>種別</TableCell>
                    <TableCell align="right">金額</TableCell>
                    <TableCell>メモ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.date.substring(0, 7)}</TableCell>
                      <TableCell>{item.entryType === 'investment' ? '積立' : '使用'}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: item.displayAmount < 0 ? 'error.main' : 'text.primary' }}
                      >
                        ¥{item.displayAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{item.memo || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
