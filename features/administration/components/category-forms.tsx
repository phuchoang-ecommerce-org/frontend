"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
  type AdminActionResult,
} from "@/features/administration/server/actions";
import type {
  AdminCategory,
  AdminCategoryNode,
} from "@/features/administration/schema/catalog";

const initialState: AdminActionResult = { ok: false };

export function flattenCategories(
  nodes: AdminCategoryNode[],
): AdminCategoryNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenCategories(node.children ?? []),
  ]);
}

function optionalValue(value: FormDataEntryValue | null): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function categoryInput(formData: FormData): Record<string, unknown> {
  const sortOrder = optionalValue(formData.get("sortOrder"));
  return {
    name: optionalValue(formData.get("name")),
    parentId: optionalValue(formData.get("parentId")),
    imageUrl: optionalValue(formData.get("imageUrl")),
    ...(sortOrder ? { sortOrder: Number(sortOrder) } : {}),
    featured: formData.get("featured") === "on",
    csrfToken: formData.get("csrfToken"),
  };
}

export function CategoryList({
  categories,
}: {
  categories: AdminCategoryNode[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Categories</h1>
        <p className="mt-1 text-sm text-neutral-700">
          Organize storefront navigation without breaking product reachability.
        </p>
      </div>
      <CreateCategoryForm categories={categories} />
      <div className="rounded-card border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flattenCategories(categories).map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {"— ".repeat(category.depth)}
                    {category.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{category.slug}</p>
                </TableCell>
                <TableCell>{category.parentId ?? "Root"}</TableCell>
                <TableCell>{category.featured ? "Featured" : "—"}</TableCell>
                <TableCell>{category.sortOrder ?? "—"}</TableCell>
              </TableRow>
            ))}
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No categories exist yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateCategoryForm({
  categories,
}: {
  categories: AdminCategoryNode[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await createAdminCategory(categoryInput(formData));
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  return (
    <details className="rounded-card border border-border bg-surface p-4">
      <summary className="cursor-pointer font-medium text-primary">
        Create category
      </summary>
      <Form action={formAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <CsrfField />
        <FormField name="name" label="Name" error={state.fieldErrors?.name}>
          <Input required />
        </FormField>
        <CategoryParentSelect
          categories={categories}
          error={state.fieldErrors?.parentId}
        />
        <FormField
          name="imageUrl"
          label="Image URL"
          error={state.fieldErrors?.imageUrl}
        >
          <Input type="url" />
        </FormField>
        <FormField
          name="sortOrder"
          label="Display order"
          error={state.fieldErrors?.sortOrder}
        >
          <Input inputMode="numeric" />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-primary">
          <input
            name="featured"
            type="checkbox"
            className="size-5 accent-primary"
          />{" "}
          Include in featured categories
        </label>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create category"}
          </Button>
        </div>
        {state.formError ? <FormMessage>{state.formError}</FormMessage> : null}
      </Form>
    </details>
  );
}

export function CategoryEditor({
  category,
  categories,
}: {
  category: AdminCategory;
  categories: AdminCategoryNode[];
}) {
  const router = useRouter();
  const blockedIds = new Set([
    category.id,
    ...descendantIds(category.id, categories),
  ]);
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await updateAdminCategory(
        category.id,
        categoryInput(formData),
      );
      if (result.ok) router.refresh();
      return result;
    },
    { ok: true, data: category },
  );
  return (
    <Form
      action={formAction}
      className="p-5 max-w-3xl rounded-card border border-border bg-surface"
    >
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-semibold text-primary">{category.name}</h1>
        <p className="mt-1 text-sm text-neutral-700">
          Move a category only to an eligible parent. The server verifies the
          tree before saving.
        </p>
      </div>
      <CsrfField />
      <FormField name="name" label="Name" error={state.fieldErrors?.name}>
        <Input required defaultValue={category.name} />
      </FormField>
      <CategoryParentSelect
        categories={categories}
        selected={category.parentId}
        blockedIds={blockedIds}
        error={state.fieldErrors?.parentId}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          name="imageUrl"
          label="Image URL"
          error={state.fieldErrors?.imageUrl}
        >
          <Input type="url" defaultValue={category.imageUrl} />
        </FormField>
        <FormField
          name="sortOrder"
          label="Display order"
          error={state.fieldErrors?.sortOrder}
        >
          <Input inputMode="numeric" defaultValue={category.sortOrder} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm text-primary">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={category.featured}
          className="size-5 accent-primary"
        />{" "}
        Include in featured categories
      </label>
      {state.formError ? <FormMessage>{state.formError}</FormMessage> : null}
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save category"}
        </Button>
      </div>
    </Form>
  );
}

function CategoryParentSelect({
  categories,
  selected,
  blockedIds = new Set<string>(),
  error,
}: {
  categories: AdminCategoryNode[];
  selected?: string | undefined;
  blockedIds?: Set<string> | undefined;
  error?: string | undefined;
}) {
  return (
    <div className="gap-1.5 flex flex-col">
      <label
        htmlFor="field-parentId"
        className="text-sm font-medium text-primary"
      >
        Parent category
      </label>
      <select
        id="field-parentId"
        name="parentId"
        defaultValue={selected}
        className="h-control-sm rounded-control border border-border bg-surface px-3 text-sm text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <option value="">Root category</option>
        {flattenCategories(categories).map((candidate) => (
          <option
            key={candidate.id}
            value={candidate.id}
            disabled={blockedIds.has(candidate.id)}
          >
            {"— ".repeat(candidate.depth)}
            {candidate.name}
            {blockedIds.has(candidate.id) ? " (not eligible)" : ""}
          </option>
        ))}
      </select>
      <p className="text-xs text-neutral-700">
        This category and its descendants cannot become its parent.
      </p>
      {error ? <FormMessage>{error}</FormMessage> : null}
    </div>
  );
}

function descendantIds(parentId: string, nodes: AdminCategoryNode[]): string[] {
  for (const node of nodes) {
    if (node.id === parentId)
      return flattenCategories(node.children ?? []).map((child) => child.id);
    const nested = descendantIds(parentId, node.children ?? []);
    if (nested.length > 0) return nested;
  }
  return [];
}

export function DeleteCategoryControl({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await deleteAdminCategory(categoryId, {
        csrfToken: formData.get("csrfToken"),
      });
      if (result.ok) router.push("/admin/categories");
      return result;
    },
    initialState,
  );
  return (
    <section className="p-5 max-w-3xl rounded-card border border-neutral-300 bg-neutral-50">
      <h2 className="text-lg font-semibold text-primary">Remove category</h2>
      <p className="mt-1 text-sm text-neutral-700">
        Products and child categories must be reassigned first.
      </p>
      <Modal>
        <ModalTrigger asChild>
          <Button type="button" variant="outline" className="mt-4">
            <Trash2 aria-hidden="true" className="size-icon" />
            Remove category
          </Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Remove this category?</ModalTitle>
            <ModalDescription>
              The server will refuse deletion if products or child categories
              are still assigned.
            </ModalDescription>
          </ModalHeader>
          <form action={formAction}>
            <CsrfField />
            <ModalFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Removing…" : "Confirm removal"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      {state.conflict === "category-removal-blocked" && state.blocking ? (
        <FormMessage className="mt-4">
          Reassign {state.blocking.productCount} products and{" "}
          {state.blocking.childCategoryCount} child categories before removing
          this category.
        </FormMessage>
      ) : null}
      {state.formError ? (
        <FormMessage className="mt-4">{state.formError}</FormMessage>
      ) : null}
    </section>
  );
}
