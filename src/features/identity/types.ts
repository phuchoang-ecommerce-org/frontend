export type FormResult = { ok: true; message?: string } | { ok: false; message: string; errors?: Record<string, string> };
export type AddressDraft = {
  label: string;
  recipientName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};
export type AddressData = AddressDraft & { id: string };
export type ProfileDraft = { name: string; email: string; phone: string };
export type DevAccount = { key: string; email: string; role: string };
