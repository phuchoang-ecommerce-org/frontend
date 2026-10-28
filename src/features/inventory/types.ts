export type StockItem = {
  id: string;
  sku: string;
  warehouse: string;
  onHand: number;
  available: number;
  reserved: number;
  updatedAt?: string;
};
export type StockAdjustment = {
  delta: number;
  reasonCode: string;
  reason: string;
};
