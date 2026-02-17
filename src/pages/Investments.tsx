import { Box, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useInvestments } from '../hooks/useInvestments';

export const Investments = () => {
  const { user } = useAuth();
  const { stockInvestmentTotal, suiInvestmentTotal, loading, error } = useInvestments(user?.uid || null);

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
          </CardContent>
        </Card>

        <Card>
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
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
