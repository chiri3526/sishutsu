import { useState, useMemo } from 'react';
import { Box, Paper, Typography, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { TrendingUp, TrendingDown, Close } from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { getMonthlyTotals, getCategoryExpenses } from '../utils/calculations';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const Dashboard = () => {
  const { user } = useAuth();
  const { expenses, loading: expensesLoading } = useExpenses(user?.uid || null);
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'total' | 'husband' | 'wife'>('total');

  const monthlyTotals = useMemo(() => getMonthlyTotals(expenses), [expenses]);
  
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const categoryExpenses = useMemo(() => 
    getCategoryExpenses(currentMonthExpenses, categories),
    [currentMonthExpenses, categories]
  );

  const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const husbandTotal = currentMonthExpenses.reduce((sum, e) => sum + e.husbandAmount, 0);
  const wifeTotal = currentMonthExpenses.reduce((sum, e) => sum + e.wifeAmount, 0);

  const currentMonthData = monthlyTotals.find(m => m.month === selectedMonth);
  const previousMonthDiff = currentMonthData?.previousMonthDiff;

  const handleCardClick = (type: 'total' | 'husband' | 'wife') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'total': return '総支出の履歴';
      case 'husband': return 'たかし負担額の履歴';
      case 'wife': return 'まみ負担額の履歴';
    }
  };

  const getDialogExpenses = () => {
    return currentMonthExpenses.map(expense => {
      const category = categories.find(c => c.id === expense.categoryId);
      return {
        ...expense,
        categoryName: category?.name || '不明'
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  };

  if (expensesLoading || categoriesLoading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        ダッシュボード
      </Typography>
      
      <FormControl sx={{ mb: 3, minWidth: { xs: '100%', sm: 200 } }}>
        <InputLabel>月を選択</InputLabel>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="月を選択">
          {monthlyTotals.map(m => (
            <MenuItem key={m.month} value={m.month}>{m.month}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3 }, mb: 3 }}>
        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => handleCardClick('total')}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              総支出
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              ¥{currentTotal.toLocaleString()}
            </Typography>
            {previousMonthDiff !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {previousMonthDiff > 0 ? <TrendingUp color="error" /> : <TrendingDown color="success" />}
                <Typography variant="body2" color={previousMonthDiff > 0 ? 'error' : 'success.main'}>
                  {previousMonthDiff > 0 ? '+' : ''}{previousMonthDiff.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => handleCardClick('husband')}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              たかし負担額
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              ¥{husbandTotal.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {currentTotal > 0 ? ((husbandTotal / currentTotal) * 100).toFixed(1) : 0}%
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => handleCardClick('wife')}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              まみ負担額
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              ¥{wifeTotal.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {currentTotal > 0 ? ((wifeTotal / currentTotal) * 100).toFixed(1) : 0}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: { xs: 2, sm: 3 }, mb: 3 }}>
        <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            月別支出推移
          </Typography>
          <Box sx={{ height: { xs: 250, sm: 300 } }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...monthlyTotals].reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="総支出" />
              <Line type="monotone" dataKey="husbandTotal" stroke="#82ca9d" name="たかし" />
              <Line type="monotone" dataKey="wifeTotal" stroke="#ffc658" name="まみ" />
            </LineChart>
          </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            カテゴリ別割合
          </Typography>
          <Box sx={{ height: { xs: 250, sm: 300 } }}>
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryExpenses as any}
                dataKey="total"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryExpenses.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          カテゴリ別支出
        </Typography>
        <Box sx={{ height: { xs: 250, sm: 300 } }}>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryExpenses as any}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoryName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="金額" />
          </BarChart>
        </ResponsiveContainer>
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{getDialogTitle()}</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ maxHeight: { xs: '60vh', sm: '70vh' }, overflowX: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>日付</TableCell>
                  <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>カテゴリ</TableCell>
                  <TableCell align="right" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>金額</TableCell>
                  {dialogType === 'husband' && <TableCell align="right" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>たかし負担</TableCell>}
                  {dialogType === 'wife' && <TableCell align="right" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>まみ負担</TableCell>}
                  <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>メモ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDialogExpenses().map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell sx={{ py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{expense.date}</TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{expense.categoryName}</TableCell>
                    <TableCell align="right" sx={{ py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>¥{expense.amount.toLocaleString()}</TableCell>
                    {dialogType === 'husband' && (
                      <TableCell align="right" sx={{ py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>¥{expense.husbandAmount.toLocaleString()}</TableCell>
                    )}
                    {dialogType === 'wife' && (
                      <TableCell align="right" sx={{ py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>¥{expense.wifeAmount.toLocaleString()}</TableCell>
                    )}
                    <TableCell sx={{ py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', maxWidth: { xs: '150px', sm: '200px' }, overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.memo || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
