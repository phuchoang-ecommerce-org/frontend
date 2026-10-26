export type StockItem = {
  id: string;
  sku: string;
  productName: string;
  warehouse: string;
  available: number;
  reserved: number;
  updatedAt?: string;
};
export type StockAdjustment = {
  delta: number;
  reasonCode: string;
  reason: string;
};
