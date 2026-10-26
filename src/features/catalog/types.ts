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
