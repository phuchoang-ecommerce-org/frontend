import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

export type CustomerAddress = components["schemas"]["CustomerAddress"];
export type CustomerAddressWrite = components["schemas"]["CustomerAddressWrite"];

const addressSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  recipientName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().min(1),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  phone: z.string().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

const addressPageSchema = z.object({
  items: z.array(addressSchema),
  page: z.object({
    size: z.number().int().positive(),
    next: z.string().optional(),
    total: z.number().int().nonnegative().optional(),
  }),
});

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function listAddresses(
  accessToken: string,
): Promise<CustomerAddress[]> {
  const response = await backendRequest("/accounts/me/addresses?size=100", {
    headers: bearer(accessToken),
    cache: "no-store",
  });
  if (!response.ok) throw response;
  return addressPageSchema.parse(await response.json()).items as CustomerAddress[];
}

export async function createAddress(
  accessToken: string,
  address: CustomerAddressWrite,
): Promise<Response> {
  return backendRequest("/accounts/me/addresses", {
    method: "POST",
    headers: bearer(accessToken),
    body: JSON.stringify(address),
    cache: "no-store",
  });
}

export async function replaceAddress(
  accessToken: string,
  addressId: string,
  address: CustomerAddressWrite,
): Promise<Response> {
  return backendRequest(
    `/accounts/me/addresses/${encodeURIComponent(addressId)}`,
    {
      method: "PUT",
      headers: bearer(accessToken),
      body: JSON.stringify(address),
      cache: "no-store",
    },
  );
}

export async function deleteAddress(
  accessToken: string,
  addressId: string,
): Promise<Response> {
  return backendRequest(
    `/accounts/me/addresses/${encodeURIComponent(addressId)}`,
    {
      method: "DELETE",
      headers: bearer(accessToken),
      cache: "no-store",
    },
  );
}
