export type AddressOption = { id: string; label: string; lines: string[] };
export type ShippingOption = { id: string; label: string; fee: string; estimate?: string; available: boolean };
export type OrderLine = { id: string; name: string; quantity: number; total: string; returnable?: boolean };
export type OrderTotals = { lines: OrderLine[]; subtotal: string; shipping: string; discount?: string; tax?: string; total: string; updatedAt?: string };
export type Order = { id: string; href: string; placedAt: string; status: string; total: string; itemCount: number };
export type ReturnRequest = { lines: { lineId: string; quantity: number }[]; reason: string };
