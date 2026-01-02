// Add a new inventory item
export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  const newItem: InventoryItem = {
    ...item,
    id: (Date.now() + Math.random()).toString()
  };
  inventory.push(newItem);
  return { ...newItem };
};

// Edit an existing inventory item
export const editInventoryItem = async (item: InventoryItem): Promise<InventoryItem | null> => {
  const idx = inventory.findIndex((i) => i.id === item.id);
  if (idx === -1) return null;
  inventory[idx] = { ...item };
  return { ...inventory[idx] };
};
// inventoryApi.ts
// Mock API and types for Inventory System
import { InventoryItem, StockTransaction } from './types';

// Mock inventory data
let inventory: InventoryItem[] = [
  {
    id: '1',
    productName: 'Wireless Mouse',
    sku: 'WM-1001',
    category: 'Accessories',
    currentStock: 25,
    unitPrice: 15.99
  },
  {
    id: '2',
    productName: 'Mechanical Keyboard',
    sku: 'MK-2002',
    category: 'Accessories',
    currentStock: 8,
    unitPrice: 59.99
  },
  {
    id: '3',
    productName: 'HD Monitor',
    sku: 'HDM-3003',
    category: 'Displays',
    currentStock: 0,
    unitPrice: 129.99
  },
  {
    id: '4',
    productName: 'USB-C Hub',
    sku: 'USBC-4004',
    category: 'Accessories',
    currentStock: 15,
    unitPrice: 29.99
  },
  {
    id: '5',
    productName: 'Laptop Stand',
    sku: 'LS-5005',
    category: 'Accessories',
    currentStock: 12,
    unitPrice: 24.99
  },
  {
    id: '6',
    productName: 'Webcam',
    sku: 'WC-6006',
    category: 'Cameras',
    currentStock: 20,
    unitPrice: 49.99
  },
  {
    id: '7',
    productName: 'Bluetooth Speaker',
    sku: 'BS-7007',
    category: 'Audio',
    currentStock: 10,
    unitPrice: 39.99
  },
  {
    id: '8',
    productName: 'Portable SSD',
    sku: 'SSD-8008',
    category: 'Storage',
    currentStock: 5,
    unitPrice: 99.99
  },
  {
    id: '9',
    productName: 'Ergonomic Chair',
    sku: 'EC-9009',
    category: 'Furniture',
    currentStock: 3,
    unitPrice: 199.99
  },
  {
    id: '10',
    productName: 'Desk Lamp',
    sku: 'DL-1010',
    category: 'Lighting',
    currentStock: 18,
    unitPrice: 19.99
  }
];

export const getInventory = async (): Promise<InventoryItem[]> => {
  // Simulate API delay
  return new Promise((resolve) => setTimeout(() => resolve([...inventory]), 300));
};

export const updateStock = async (transaction: StockTransaction): Promise<InventoryItem | null> => {
  const idx = inventory.findIndex((item) => item.id === transaction.itemId);
  if (idx === -1) return null;
  let newStock = inventory[idx].currentStock;
  if (transaction.type === 'in') {
    newStock += transaction.amount;
  } else if (transaction.type === 'out') {
    newStock = Math.max(0, newStock - transaction.amount);
  }
  inventory[idx] = { ...inventory[idx], currentStock: newStock };
  return { ...inventory[idx] };
};

export const deleteInventoryItem = async (itemId: string): Promise<boolean> => {
  const initialLength = inventory.length;
  inventory = inventory.filter((item) => item.id !== itemId);
  return inventory.length < initialLength;
};
