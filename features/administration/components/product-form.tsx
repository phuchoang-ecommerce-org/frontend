"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  createAdminProduct,
  updateAdminProduct,
  type AdminActionResult,
} from "@/features/administration/server/actions";
import type {
  AdminCategoryNode,
  AdminProduct,
} from "@/features/administration/schema/catalog";

const initialState: AdminActionResult<AdminProduct> = { ok: false };

function flattenedCategories(nodes: AdminCategoryNode[]): AdminCategoryNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenedCategories(node.children ?? []),
  ]);
}

function optionalValue(value: FormDataEntryValue | null): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function toProductInput(formData: FormData): Record<string, unknown> {
  const attributesText = optionalValue(formData.get("attributes"));
  let attributes: unknown;
  if (attributesText) {
    try {
      attributes = JSON.parse(attributesText) as unknown;
    } catch {
      return { attributesError: "Attributes must be valid JSON." };
    }
  }
  return {
    name: optionalValue(formData.get("name")),
    description: optionalValue(formData.get("description")),
    brand: optionalValue(formData.get("brand")),
    categoryId: optionalValue(formData.get("categoryId")),
    ...(attributes !== undefined ? { attributes } : {}),
    csrfToken: formData.get("csrfToken"),
  };
}

export function ProductForm({
  categories,
  product,
}: {
  categories: AdminCategoryNode[];
  product?: AdminProduct;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _previous: AdminActionResult<AdminProduct>,
      formData: FormData,
    ): Promise<AdminActionResult<AdminProduct>> => {
      const input = toProductInput(formData);
      if ("attributesError" in input)
        return {
          ok: false,
          fieldErrors: { attributes: String(input.attributesError) },
        };
      const result = product
        ? await updateAdminProduct(product.id, input)
        : await createAdminProduct(input);
      if (result.ok && result.data) {
        router.push(`/admin/products/${result.data.id}`);
        router.refresh();
      }
      return result;
    },
    product ? { ok: true, data: product } : initialState,
  );
  const selectedCategory = product?.categories[0]?.id;

  return (
    <Form
      ref={formRef}
      action={formAction}
      className="p-5 max-w-3xl rounded-card border border-border bg-surface"
    >
      <CsrfField />
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold text-primary">
          {product ? "Product details" : "New product"}
        </h1>
        <p className="text-sm text-neutral-700">
          Save the catalog record first. Storefront changes propagate within
          seconds.
        </p>
      </div>
      {state.formError ? <FormMessage>{state.formError}</FormMessage> : null}
      <FormField
        name="name"
        label="Product name"
        error={state.fieldErrors?.name}
      >
        <Input required defaultValue={product?.name} autoComplete="off" />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField name="brand" label="Brand" error={state.fieldErrors?.brand}>
          <Input defaultValue={product?.brand} autoComplete="organization" />
        </FormField>
        <div className="gap-1.5 flex flex-col">
          <label
            htmlFor="field-categoryId"
            className="text-sm font-medium text-primary"
          >
            Primary category
          </label>
          <select
            id="field-categoryId"
            name="categoryId"
            defaultValue={selectedCategory}
            className="h-control-sm rounded-control border border-border bg-surface px-3 text-sm text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <option value="">No category</option>
            {flattenedCategories(categories).map((category) => (
              <option key={category.id} value={category.id}>
                {"— ".repeat(category.depth)}
                {category.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.categoryId ? (
            <FormMessage>{state.fieldErrors.categoryId}</FormMessage>
          ) : null}
        </div>
      </div>
      <div className="gap-1.5 flex flex-col">
        <label
          htmlFor="field-description"
          className="text-sm font-medium text-primary"
        >
          Description
        </label>
        <textarea
          id="field-description"
          name="description"
          defaultValue={product?.description}
          className="min-h-28 rounded-control border border-border bg-surface px-3 py-2 text-sm text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
        />
        {state.fieldErrors?.description ? (
          <FormMessage>{state.fieldErrors.description}</FormMessage>
        ) : null}
      </div>
      <div className="gap-1.5 flex flex-col">
        <label
          htmlFor="field-attributes"
          className="text-sm font-medium text-primary"
        >
          Attributes (JSON)
        </label>
        <textarea
          id="field-attributes"
          name="attributes"
          defaultValue={
            product?.attributes
              ? JSON.stringify(product.attributes, null, 2)
              : undefined
          }
          className="min-h-28 rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
        />
        {state.fieldErrors?.attributes ? (
          <FormMessage>{state.fieldErrors.attributes}</FormMessage>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create draft"}
        </Button>
      </div>
    </Form>
  );
}
