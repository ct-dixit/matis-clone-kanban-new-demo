// types.ts
export interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  unitPrice: number;
}

export interface StockTransaction {
  itemId: string;
  type: 'in' | 'out';
  amount: number;
}
