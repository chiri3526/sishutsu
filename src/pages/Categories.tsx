import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useCategories, addCategory, deleteCategory, updateCategory } from '../hooks/useCategories';
import type { Category } from '../types';

export const Categories = () => {
  const { categories, loading: categoriesLoading, refetch } = useCategories();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    husbandRatio: '50',
    wifeRatio: '50',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const husbandRatio = Number(formData.husbandRatio) / 100;
      const wifeRatio = Number(formData.wifeRatio) / 100;

      if (editingCategory?.id) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          shareRatio: { husband: husbandRatio, wife: wifeRatio },
        });
        setSnackbar({ open: true, message: 'カテゴリを更新しました', severity: 'success' });
      } else {
        await addCategory({
          name: formData.name,
          shareRatio: { husband: husbandRatio, wife: wifeRatio },
        });
        setSnackbar({ open: true, message: 'カテゴリを追加しました', severity: 'success' });
      }

      setOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', husbandRatio: '50', wifeRatio: '50' });
      
      // データを再取得
      await refetch();
    } catch (error) {
      setSnackbar({ open: true, message: 'エラーが発生しました', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      husbandRatio: String(category.shareRatio.husband * 100),
      wifeRatio: String(category.shareRatio.wife * 100),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('削除しますか？')) {
      setLoading(true);
      try {
        await deleteCategory(id);
        setSnackbar({ open: true, message: 'カテゴリを削除しました', severity: 'success' });
        await refetch();
      } catch (error) {
        setSnackbar({ open: true, message: '削除に失敗しました', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', husbandRatio: '50', wifeRatio: '50' });
  };

  if (categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          カテゴリ管理
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)} disabled={loading}>
          新規追加
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Paper sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: { xs: 400, sm: 500 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>カテゴリ名</TableCell>
                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>夫負担率</TableCell>
                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>妻負担率</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{category.name}</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{(category.shareRatio.husband * 100).toFixed(0)}%</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{(category.shareRatio.wife * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(category)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => category.id && handleDelete(category.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'カテゴリ編集' : 'カテゴリ追加'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="カテゴリ名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="夫負担率 (%)"
              type="number"
              value={formData.husbandRatio}
              onChange={(e) => setFormData({ ...formData, husbandRatio: e.target.value })}
              required
            />
            <TextField
              label="妻負担率 (%)"
              type="number"
              value={formData.wifeRatio}
              onChange={(e) => setFormData({ ...formData, wifeRatio: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

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
