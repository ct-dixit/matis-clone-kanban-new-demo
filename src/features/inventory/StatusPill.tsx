import React from 'react';
import { Chip, type ChipProps } from '@mui/material';

const StatusPill: React.FC<{ stock: number }> = ({ stock }) => {
  let color: ChipProps['color'] = 'success';
  let label = '';
  if (stock === 0) {
    color = 'error';
    label = 'Out of Stock';
  } else if (stock < 10) {
    color = 'warning';
    label = 'Low Stock';
  } else {
    color = 'success';
    label = 'Stock';
  }
  return <Chip label={label} color={color} size="small" />;
};

export default StatusPill;
