import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InventoryItem } from './types';

interface InventoryFormModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<InventoryItem>;
  onSubmit: (item: Omit<InventoryItem, 'id'> | InventoryItem) => void;
  isEdit?: boolean;
}

const categories = ['Accessories', 'Displays', 'Electronics', 'Other'];

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({ open, onClose, initialValues, onSubmit, isEdit }) => {
  const formik = useFormik({
    initialValues: {
      productName: initialValues?.productName || '',
      sku: initialValues?.sku || '',
      category: initialValues?.category || '',
      currentStock: initialValues?.currentStock?.toString() || '',
      unitPrice: initialValues?.unitPrice?.toString() || ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      productName: Yup.string().required('Product Name is required'),
      sku: Yup.string().required('SKU is required'),
      category: Yup.string().required('Category is required'),
      currentStock: Yup.number().typeError('Enter a valid number').min(0, 'Stock cannot be negative').required('Current Stock is required'),
      unitPrice: Yup.number().typeError('Enter a valid price').min(0, 'Unit Price cannot be negative').required('Unit Price is required')
    }),
    onSubmit: (values, { resetForm }) => {
      const item = {
        ...initialValues,
        productName: values.productName,
        sku: values.sku,
        category: values.category,
        currentStock: Number(values.currentStock),
        unitPrice: Number(values.unitPrice)
      };
      onSubmit(item as any);
      resetForm();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Product Name"
              name="productName"
              value={formik.values.productName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.productName && Boolean(formik.errors.productName)}
              helperText={formik.touched.productName && formik.errors.productName}
              fullWidth
            />
            <TextField
              label="SKU"
              name="sku"
              value={formik.values.sku}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.sku && Boolean(formik.errors.sku)}
              helperText={formik.touched.sku && formik.errors.sku}
              fullWidth
            />
            <TextField
              select
              label="Category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Current Stock"
              name="currentStock"
              type="number"
              value={formik.values.currentStock}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.currentStock && Boolean(formik.errors.currentStock)}
              helperText={formik.touched.currentStock && formik.errors.currentStock}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={formik.values.unitPrice}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
              helperText={formik.touched.unitPrice && formik.errors.unitPrice}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting || !formik.isValid}>
            {isEdit ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryFormModal;
