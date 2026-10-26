export type CartLineData = {
  id: string;
  productName: string;
  variantLabel?: string;
  href: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  notice?: string;
  available: boolean;
};
export type CartChangeResult = { ok: true } | { ok: false; error: string };
export type CartTotals = {
  subtotal: string;
  shipping?: string;
  discount?: string;
  total: string;
  canCheckout: boolean;
};
export type WishlistItemData = {
  id: string;
  name: string;
  href: string;
  price: string;
  available: boolean;
};
