export type Product = {
  id: string;
  name: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  price: string;
  compareAtPrice?: string;
  availability: "available" | "unavailable" | "unknown";
  availabilityText?: string;
};

export type Category = {
  id: string;
  label: string;
  href: string;
  children?: Category[];
};
export type Variant = { id: string; label: string; available: boolean };
export type ProductVariant = Variant & {
  price: string;
  compareAtPrice?: string;
  availability: Product["availability"];
};
export type ProductDetailData = {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  image?: { url: string; alt: string };
  categories: { id: string; name: string }[];
  variants: ProductVariant[];
};
