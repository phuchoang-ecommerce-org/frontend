"use server";

import { z } from "zod";

import {
  ApiParseError,
  ApiProblem,
  ApiTransportError,
  apiMutate,
} from "@/lib/api";
import { CsrfError, requireCsrf } from "@/lib/session";

import {
  AdminCategorySchema,
  AdminProductImageSchema,
  AdminProductSchema,
  AdminVariantSchema,
  BulkResultSchema,
  CategoryWriteSchema,
  ImageWriteSchema,
  PriceChangeSchema,
  ProductWriteSchema,
  PublicationChangeSchema,
  VariantWriteSchema,
  type AdminCategory,
  type AdminProduct,
  type AdminVariant,
  type BulkResult,
} from "../schema/catalog";

export interface AdminActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  fieldErrors?: Record<string, string>;
  formError?: string;
  conflict?: "duplicate-sku" | "removal-blocked" | "category-removal-blocked";
  blocking?: { productCount: number; childCategoryCount: number };
}

function asRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === "object"
    ? (input as Record<string, unknown>)
    : {};
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [
      issue.path.join(".") || "_form",
      issue.message,
    ]),
  );
}

async function withCsrf<TInput, TOutput>(
  input: unknown,
  schema: z.ZodType<TInput>,
  execute: (value: TInput) => Promise<TOutput>,
): Promise<AdminActionResult<TOutput>> {
  const { csrfToken, ...rest } = asRecord(input);
  const parsed = schema.safeParse(rest);
  if (!parsed.success)
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  try {
    await requireCsrf(csrfToken);
    return { ok: true, data: await execute(parsed.data) };
  } catch (error) {
    return mapActionError<TOutput>(error);
  }
}

function mapActionError<T>(error: unknown): AdminActionResult<T> {
  if (error instanceof CsrfError)
    return {
      ok: false,
      formError: "Your session needs to be refreshed. Please try again.",
    };
  if (error instanceof ApiProblem) {
    if (error.problem.errors.length > 0) {
      return {
        ok: false,
        fieldErrors: Object.fromEntries(
          error.problem.errors.map((item) => [
            item.field,
            item.detail ?? item.code,
          ]),
        ),
      };
    }
    if (error.problem.blocking) {
      return {
        ok: false,
        conflict: "category-removal-blocked",
        blocking: error.problem.blocking,
      };
    }
    if (error.problem.status === 409)
      return { ok: false, conflict: "removal-blocked" };
    return {
      ok: false,
      formError:
        error.problem.status === 403
          ? "This action is not available to your account."
          : "Something went wrong. Please try again.",
    };
  }
  if (error instanceof ApiTransportError)
    return {
      ok: false,
      formError: "The service could not be reached. Please try again.",
    };
  if (error instanceof ApiParseError) throw error;
  throw error;
}

export async function createAdminProduct(
  input: unknown,
): Promise<AdminActionResult<AdminProduct>> {
  return withCsrf(input, ProductWriteSchema, (body) =>
    apiMutate(
      { method: "POST", path: "/products", body, cache: "no-store" },
      AdminProductSchema,
    ),
  );
}

export async function updateAdminProduct(
  productId: string,
  input: unknown,
): Promise<AdminActionResult<AdminProduct>> {
  return withCsrf(input, ProductWriteSchema, (body) =>
    apiMutate(
      {
        method: "PATCH",
        path: "/products/{productId}",
        pathParams: { productId },
        body,
        cache: "no-store",
      },
      AdminProductSchema,
    ),
  );
}

export async function deleteAdminProduct(
  productId: string,
  input: unknown,
): Promise<AdminActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
    await apiMutate(
      {
        method: "DELETE",
        path: "/products/{productId}",
        pathParams: { productId },
        cache: "no-store",
      },
      z.void(),
    );
    return { ok: true };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function setAdminProductPublication(
  productId: string,
  input: unknown,
): Promise<AdminActionResult<AdminProduct>> {
  return withCsrf(input, PublicationChangeSchema, (body) =>
    apiMutate(
      {
        method: "PUT",
        path: "/products/{productId}/publication",
        pathParams: { productId },
        body,
        cache: "no-store",
      },
      AdminProductSchema,
    ),
  );
}

export async function addAdminVariant(
  productId: string,
  input: unknown,
): Promise<AdminActionResult<AdminVariant>> {
  const result = await withCsrf(input, VariantWriteSchema, (body) =>
    apiMutate(
      {
        method: "POST",
        path: "/products/{productId}/variants",
        pathParams: { productId },
        body,
        cache: "no-store",
      },
      AdminVariantSchema,
    ),
  );
  return result.conflict === "removal-blocked"
    ? { ...result, conflict: "duplicate-sku" }
    : result;
}

export async function removeAdminVariant(
  productId: string,
  variantId: string,
  input: unknown,
): Promise<AdminActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
    await apiMutate(
      {
        method: "DELETE",
        path: "/products/{productId}/variants/{variantId}",
        pathParams: { productId, variantId },
        cache: "no-store",
      },
      z.void(),
    );
    return { ok: true };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function changeAdminVariantPrice(
  productId: string,
  variantId: string,
  input: unknown,
): Promise<AdminActionResult<AdminVariant>> {
  return withCsrf(input, PriceChangeSchema, (body) =>
    apiMutate(
      {
        method: "PUT",
        path: "/products/{productId}/variants/{variantId}/price",
        pathParams: { productId, variantId },
        body,
        cache: "no-store",
      },
      AdminVariantSchema,
    ),
  );
}

export async function addAdminProductImage(
  productId: string,
  input: unknown,
): Promise<AdminActionResult> {
  return withCsrf(input, ImageWriteSchema, (body) =>
    apiMutate(
      {
        method: "POST",
        path: "/products/{productId}/images",
        pathParams: { productId },
        body,
        cache: "no-store",
      },
      AdminProductImageSchema,
    ),
  );
}

export async function removeAdminProductImage(
  productId: string,
  imageId: string,
  input: unknown,
): Promise<AdminActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
    await apiMutate(
      {
        method: "DELETE",
        path: "/products/{productId}/images/{imageId}",
        pathParams: { productId, imageId },
        cache: "no-store",
      },
      z.void(),
    );
    return { ok: true };
  } catch (error) {
    return mapActionError(error);
  }
}

const BulkWriteSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().uuid(),
            amendment: ProductWriteSchema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export async function amendAdminProductsInBulk(
  input: unknown,
): Promise<AdminActionResult<BulkResult>> {
  return withCsrf(input, BulkWriteSchema, (body) =>
    apiMutate(
      {
        method: "POST",
        path: "/product-bulk-amendments",
        body,
        cache: "no-store",
      },
      BulkResultSchema,
    ),
  );
}

export async function createAdminCategory(
  input: unknown,
): Promise<AdminActionResult<AdminCategory>> {
  return withCsrf(input, CategoryWriteSchema, (body) =>
    apiMutate(
      { method: "POST", path: "/categories", body, cache: "no-store" },
      AdminCategorySchema,
    ),
  );
}

export async function updateAdminCategory(
  categoryId: string,
  input: unknown,
): Promise<AdminActionResult<AdminCategory>> {
  return withCsrf(input, CategoryWriteSchema, (body) =>
    apiMutate(
      {
        method: "PATCH",
        path: "/categories/{categoryId}",
        pathParams: { categoryId },
        body,
        cache: "no-store",
      },
      AdminCategorySchema,
    ),
  );
}

export async function deleteAdminCategory(
  categoryId: string,
  input: unknown,
): Promise<AdminActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
    await apiMutate(
      {
        method: "DELETE",
        path: "/categories/{categoryId}",
        pathParams: { categoryId },
        cache: "no-store",
      },
      z.void(),
    );
    return { ok: true };
  } catch (error) {
    return mapActionError(error);
  }
}
