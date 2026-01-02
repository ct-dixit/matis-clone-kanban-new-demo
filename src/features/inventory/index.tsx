import React, { useCallback, useState } from 'react';
import InventoryTable from './InventoryTable';
import StockModal from './StockModal';
import InventoryFormModal from './InventoryFormModal';
import { InventoryItem } from './types';

import { Stack, Button } from '@mui/material';
import { getInventory, updateStock, addInventoryItem, editInventoryItem, deleteInventoryItem } from './inventoryApi';

const InventoryDashboard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'in' | 'out'>('in');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const handleDelete = async (id: string) => {
    await deleteInventoryItem(id);
    setInventory((prev: InventoryItem[]) => prev.filter((item: InventoryItem) => item.id !== id));
  };

  React.useEffect(() => {
    getInventory().then(setInventory);
  }, []);

  const handleStockAction = useCallback((item: InventoryItem, type: 'in' | 'out') => {
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);
  }, []);

  const handleModalSubmit = async (amount: number) => {
    if (!selectedItem) return;
    const updated = await updateStock({ itemId: selectedItem.id, type: modalType, amount });
    if (updated) {
      setInventory((prev: InventoryItem[]) => prev.map((item: InventoryItem) => (item.id === updated.id ? updated : item)));
    }
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (item: any) => {
    if (editItem) {
      // Edit
      const updated = await editInventoryItem(item);
      if (updated) {
        setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
    } else {
      // Add
      const added = await addInventoryItem(item);
      setInventory((prev) => [...prev, added]);
    }
    setFormOpen(false);
    setEditItem(null);
  };

  return (
    <>
      <InventoryTable data={inventory} onStockAction={handleStockAction} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
      <StockModal open={modalOpen} onClose={() => setModalOpen(false)} item={selectedItem} type={modalType} onSubmit={handleModalSubmit} />
      <InventoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        initialValues={editItem || undefined}
        onSubmit={handleFormSubmit}
        isEdit={!!editItem}
      />
    </>
  );
};

export default InventoryDashboard;
