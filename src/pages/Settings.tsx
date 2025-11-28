import { Box, Paper, Typography, Divider } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>設定</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>アカウント情報</Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">メールアドレス</Typography>
          <Typography variant="body1">{user?.email}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">ユーザーID</Typography>
          <Typography variant="body1">{user?.uid}</Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>AI機能</Typography>
        <Typography variant="body2" color="textSecondary">
          AI分析機能は今後実装予定です。
        </Typography>
      </Paper>
    </Box>
  );
};
