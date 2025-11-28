import { useState, useMemo } from 'react';
import { Box, Paper, Typography, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
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

  if (expensesLoading || categoriesLoading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>ダッシュボード</Typography>
      
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>月を選択</InputLabel>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="月を選択">
          {monthlyTotals.map(m => (
            <MenuItem key={m.month} value={m.month}>{m.month}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>総支出</Typography>
            <Typography variant="h4">¥{currentTotal.toLocaleString()}</Typography>
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

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>夫負担額</Typography>
            <Typography variant="h4">¥{husbandTotal.toLocaleString()}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {currentTotal > 0 ? ((husbandTotal / currentTotal) * 100).toFixed(1) : 0}%
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>妻負担額</Typography>
            <Typography variant="h4">¥{wifeTotal.toLocaleString()}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {currentTotal > 0 ? ((wifeTotal / currentTotal) * 100).toFixed(1) : 0}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>月別支出推移</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...monthlyTotals].reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="総支出" />
              <Line type="monotone" dataKey="husbandTotal" stroke="#82ca9d" name="夫" />
              <Line type="monotone" dataKey="wifeTotal" stroke="#ffc658" name="妻" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>カテゴリ別割合</Typography>
          <ResponsiveContainer width="100%" height={300}>
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
        </Paper>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>カテゴリ別支出</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryExpenses as any}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoryName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="金額" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};
