"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addAdminVariant,
  changeAdminVariantPrice,
  createAdminProduct,
  publishAdminProduct,
  type CatalogPriceChange,
  type CatalogProductWrite,
  type CatalogVariantWrite,
} from "@/lib/api/catalog-admin";
import { fieldErrors, problemMessage, readProblem } from "@/lib/api/backend";
import { getSession } from "@/lib/session";
import { canWriteCatalog } from "@/lib/session/roles";
import { checkActionCsrf } from "@/lib/session/csrf";

export type CatalogActionResult =
  | { ok: true; message: string; productId?: string }
  | { ok: false; message: string; errors?: Record<string, string> };

export type ProductCreateDraft = {
  name: string;
  description: string;
  brand: string;
  categoryId: string;
};
export type VariantDraft = { sku: string; price: string; currency: string };
export type PriceDraft = { price: string; currency: string; reason: string };

const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name."),
  description: z.string().trim(),
  brand: z.string().trim(),
  categoryId: z.string().trim(),
});
const moneySchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^[0-9]{1,15}(\.[0-9]{1,4})?$/, "Enter a valid positive price."),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a three-letter currency code."),
});
const variantSchema = z.object({
  sku: z.string().trim().min(1, "Enter a SKU."),
  price: moneySchema.shape.amount,
  currency: moneySchema.shape.currency,
});
const priceSchema = z.object({
  price: moneySchema.shape.amount,
  currency: moneySchema.shape.currency,
  reason: z.string().trim().min(1, "Enter a reason for the price change."),
});
const idSchema = z.string().trim().min(1, "Invalid product reference.");
const createdProductSchema = z.object({ id: z.string().min(1) });

function validationFailure(error: z.ZodError): CatalogActionResult {
  return {
    ok: false,
    message: "Check the highlighted fields.",
    errors: Object.fromEntries(
      error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    ),
  };
}

async function authorize(
  csrfToken: string,
): Promise<CatalogActionResult | null> {
  if (!(await checkActionCsrf(csrfToken))) {
    return { ok: false, message: "Reload the page and try again." };
  }
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Your session ended. Sign in and try again." };
  }
  if (!canWriteCatalog(session.account.roles)) {
    return {
      ok: false,
      message: "You do not have permission to manage catalog products.",
    };
  }
  return null;
}

function problemFailure(
  response: Response,
  fallback: string,
): Promise<CatalogActionResult> {
  return readProblem(response).then((problem) => ({
    ok: false,
    message: problemMessage(problem, fallback),
    errors: fieldErrors(problem),
  }));
}

export async function createProductAction(
  values: ProductCreateDraft,
  csrfToken: string,
): Promise<CatalogActionResult> {
  const denied = await authorize(csrfToken);
  if (denied) return denied;
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);
  const session = await getSession();
  if (!session)
    return { ok: false, message: "Your session ended. Sign in and try again." };
  const product: CatalogProductWrite = {
    name: parsed.data.name,
    ...(parsed.data.description
      ? { description: parsed.data.description }
      : {}),
    ...(parsed.data.brand ? { brand: parsed.data.brand } : {}),
    ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
  };
  try {
    const response = await createAdminProduct(session.accessToken, product);
    if (!response.ok)
      return problemFailure(response, "The product could not be created.");
    const created = createdProductSchema.safeParse(await response.json());
    if (!created.success)
      return {
        ok: false,
        message: "The product was created but returned an invalid response.",
      };
    revalidatePath("/staff/catalog");
    return {
      ok: true,
      message: "Draft product created.",
      productId: created.data.id,
    };
  } catch {
    return {
      ok: false,
      message: "The catalog service is unavailable. Try again shortly.",
    };
  }
}

export async function addVariantAction(
  productId: string,
  values: VariantDraft,
  csrfToken: string,
): Promise<CatalogActionResult> {
  const denied = await authorize(csrfToken);
  if (denied) return denied;
  const parsedProductId = idSchema.safeParse(productId);
  if (!parsedProductId.success)
    return { ok: false, message: "Invalid product reference." };
  const parsed = variantSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);
  const session = await getSession();
  if (!session)
    return { ok: false, message: "Your session ended. Sign in and try again." };
  const variant: CatalogVariantWrite = {
    sku: parsed.data.sku,
    listPrice: { amount: parsed.data.price, currency: parsed.data.currency },
    active: true,
  };
  try {
    const response = await addAdminVariant(
      session.accessToken,
      parsedProductId.data,
      variant,
    );
    if (!response.ok)
      return problemFailure(response, "The SKU could not be added.");
    revalidatePath(`/staff/catalog/products/${parsedProductId.data}/edit`);
    return { ok: true, message: "SKU added to draft product." };
  } catch {
    return {
      ok: false,
      message: "The catalog service is unavailable. Try again shortly.",
    };
  }
}

export async function publishProductAction(
  productId: string,
  csrfToken: string,
): Promise<CatalogActionResult> {
  const denied = await authorize(csrfToken);
  if (denied) return denied;
  const parsedProductId = idSchema.safeParse(productId);
  if (!parsedProductId.success)
    return { ok: false, message: "Invalid product reference." };
  const session = await getSession();
  if (!session)
    return { ok: false, message: "Your session ended. Sign in and try again." };
  try {
    const response = await publishAdminProduct(
      session.accessToken,
      parsedProductId.data,
      {
        publicationStatus: "PUBLISHED",
      },
    );
    if (!response.ok)
      return problemFailure(response, "The product could not be published.");
    revalidatePath("/staff/catalog");
    revalidatePath(`/staff/catalog/products/${parsedProductId.data}/edit`);
    return { ok: true, message: "Product published." };
  } catch {
    return {
      ok: false,
      message: "The catalog service is unavailable. Try again shortly.",
    };
  }
}

export async function changeVariantPriceAction(
  productId: string,
  variantId: string,
  values: PriceDraft,
  csrfToken: string,
): Promise<CatalogActionResult> {
  const denied = await authorize(csrfToken);
  if (denied) return denied;
  const parsedProductId = idSchema.safeParse(productId);
  const parsedVariantId = idSchema.safeParse(variantId);
  if (!parsedProductId.success || !parsedVariantId.success) {
    return { ok: false, message: "Invalid product or SKU reference." };
  }
  const parsed = priceSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);
  const session = await getSession();
  if (!session)
    return { ok: false, message: "Your session ended. Sign in and try again." };
  const change: CatalogPriceChange = {
    listPrice: { amount: parsed.data.price, currency: parsed.data.currency },
    reason: parsed.data.reason,
  };
  try {
    const response = await changeAdminVariantPrice(
      session.accessToken,
      parsedProductId.data,
      parsedVariantId.data,
      change,
    );
    if (!response.ok)
      return problemFailure(response, "The price could not be changed.");
    revalidatePath(`/staff/catalog/products/${parsedProductId.data}/edit`);
    return { ok: true, message: "Variant price updated." };
  } catch {
    return {
      ok: false,
      message: "The catalog service is unavailable. Try again shortly.",
    };
  }
}
