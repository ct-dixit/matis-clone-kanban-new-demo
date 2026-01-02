import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InventoryItem } from './types';

interface StockModalProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  type: 'in' | 'out';
  onSubmit: (amount: number) => void;
}

const StockModal: React.FC<StockModalProps> = ({ open, onClose, item, type, onSubmit }: StockModalProps) => {
  const formik = useFormik({
    initialValues: { amount: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError('Enter a valid number')
        .min(1, 'Amount must be at least 1')
        .test('stock-out-check', 'Cannot remove more than current stock', (value) =>
          type === 'in' || !item || value === undefined ? true : value <= item.currentStock
        )
        .required('Amount is required')
    }),
    onSubmit: (values, { resetForm }) => {
      onSubmit(Number(values.amount));
      resetForm();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {type === 'in' ? 'Stock In' : 'Stock Out'} - {item?.productName}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting || !formik.isValid}>
            {type === 'in' ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StockModal;
