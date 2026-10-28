"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge, Button, Card, StatusMessage, TextField } from "@/components/ui";
import { focusRing } from "@/components/ui/styles";
import { csrfToken } from "@/lib/session/client-csrf";
import { formatMoney } from "@/lib/format/money";
import type {
  AdminCatalogProduct,
  AdminCatalogProductSummary,
} from "@/lib/api/catalog-admin";
import type {
  CatalogActionResult,
  PriceDraft,
  ProductCreateDraft,
  VariantDraft,
} from "../server/actions";

const emptyProduct: ProductCreateDraft = {
  name: "",
  description: "",
  brand: "",
  categoryId: "",
};
const emptyVariant: VariantDraft = { sku: "", price: "", currency: "USD" };
const emptyPrice: PriceDraft = { price: "", currency: "USD", reason: "" };

function publicationBadge(status: string) {
  if (status === "PUBLISHED") return <Badge kind="success" label="Published" />;
  if (status === "DRAFT") return <Badge kind="info" label="Draft" />;
  return <Badge kind="error" label={status} />;
}

function resultKind(result: CatalogActionResult): "success" | "error" {
  return result.ok ? "success" : "error";
}

export function StaffCatalogList({
  products,
}: {
  products: AdminCatalogProductSummary[];
}) {
  if (!products.length) {
    return (
      <Card title="No catalog products">
        <p className="text-sm text-muted-foreground">
          Create a draft product to start the catalog workflow.
        </p>
      </Card>
    );
  }
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">Catalog products</caption>
        <thead className="border-b border-border bg-soft text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Product
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Price
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3 font-medium">{product.name}</td>
              <td className="px-4 py-3">
                {publicationBadge(product.publicationStatus)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {product.priceFrom
                  ? product.priceTo &&
                    (product.priceFrom.amount !== product.priceTo.amount ||
                      product.priceFrom.currency !== product.priceTo.currency)
                    ? `${formatMoney(product.priceFrom)} – ${formatMoney(product.priceTo)}`
                    : formatMoney(product.priceFrom)
                  : "No SKU price"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/staff/catalog/products/${encodeURIComponent(product.id)}/edit`}
                  className={`rounded-control px-2 py-1 font-medium text-primary hover:bg-soft ${focusRing}`}
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductCreateForm({
  onCreate,
}: {
  onCreate: (
    values: ProductCreateDraft,
    csrfToken: string,
  ) => Promise<CatalogActionResult>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(emptyProduct);
  const [result, setResult] = useState<CatalogActionResult | null>(null);
  const [pending, setPending] = useState(false);
  const update = (field: keyof ProductCreateDraft) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (result && !result.ok) setResult(null);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const next = await onCreate(values, await csrfToken());
      setResult(next);
      if (next.ok && next.productId) {
        router.push(
          `/staff/catalog/products/${encodeURIComponent(next.productId)}/edit`,
        );
      }
    } catch {
      setResult({
        ok: false,
        message: "The draft could not be created. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <p className="text-sm text-muted-foreground">
        A product starts as a draft. Add a SKU before publishing it.
      </p>
      {result && (
        <StatusMessage kind={resultKind(result)} message={result.message} />
      )}
      <TextField
        name="name"
        label="Product name"
        value={values.name}
        required
        disabled={pending}
        error={!result?.ok ? result?.errors?.name : undefined}
        onChange={update("name")}
      />
      <TextField
        name="brand"
        label="Brand"
        value={values.brand}
        disabled={pending}
        error={!result?.ok ? result?.errors?.brand : undefined}
        onChange={update("brand")}
      />
      <TextField
        name="categoryId"
        label="Category ID"
        value={values.categoryId}
        hint="Optional. Use the category ID from catalog administration."
        disabled={pending}
        error={!result?.ok ? result?.errors?.categoryId : undefined}
        onChange={update("categoryId")}
      />
      <TextField
        name="description"
        label="Description"
        value={values.description}
        disabled={pending}
        error={!result?.ok ? result?.errors?.description : undefined}
        onChange={update("description")}
      />
      <Button type="submit" loading={pending}>
        Create draft
      </Button>
    </form>
  );
}

function VariantForm({
  productId,
  onAdd,
}: {
  productId: string;
  onAdd: (
    productId: string,
    values: VariantDraft,
    csrfToken: string,
  ) => Promise<CatalogActionResult>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(emptyVariant);
  const [result, setResult] = useState<CatalogActionResult | null>(null);
  const [pending, setPending] = useState(false);
  const update = (field: keyof VariantDraft) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (result && !result.ok) setResult(null);
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const next = await onAdd(productId, values, await csrfToken());
      setResult(next);
      if (next.ok) {
        setValues(emptyVariant);
        router.refresh();
      }
    } catch {
      setResult({
        ok: false,
        message: "The SKU could not be added. Try again.",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      {result && (
        <StatusMessage kind={resultKind(result)} message={result.message} />
      )}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_7rem]">
        <TextField
          name="sku"
          label="SKU"
          value={values.sku}
          required
          disabled={pending}
          error={!result?.ok ? result?.errors?.sku : undefined}
          onChange={update("sku")}
        />
        <TextField
          name="price"
          label="List price"
          type="number"
          value={values.price}
          required
          disabled={pending}
          error={!result?.ok ? result?.errors?.price : undefined}
          onChange={update("price")}
        />
        <TextField
          name="currency"
          label="Currency"
          value={values.currency}
          required
          disabled={pending}
          error={!result?.ok ? result?.errors?.currency : undefined}
          onChange={update("currency")}
        />
      </div>
      <Button type="submit" loading={pending}>
        Add SKU
      </Button>
    </form>
  );
}

function PriceForm({
  productId,
  variantId,
  onChangePrice,
}: {
  productId: string;
  variantId: string;
  onChangePrice: (
    productId: string,
    variantId: string,
    values: PriceDraft,
    csrfToken: string,
  ) => Promise<CatalogActionResult>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(emptyPrice);
  const [result, setResult] = useState<CatalogActionResult | null>(null);
  const [pending, setPending] = useState(false);
  const update = (field: keyof PriceDraft) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (result && !result.ok) setResult(null);
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const next = await onChangePrice(
        productId,
        variantId,
        values,
        await csrfToken(),
      );
      setResult(next);
      if (next.ok) {
        setValues(emptyPrice);
        router.refresh();
      }
    } catch {
      setResult({
        ok: false,
        message: "The price could not be changed. Try again.",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,2fr)_auto]"
      aria-busy={pending}
    >
      <TextField
        name="price"
        label="New list price"
        type="number"
        value={values.price}
        required
        disabled={pending}
        error={!result?.ok ? result?.errors?.price : undefined}
        onChange={update("price")}
      />
      <TextField
        name="currency"
        label="Currency"
        value={values.currency}
        required
        disabled={pending}
        error={!result?.ok ? result?.errors?.currency : undefined}
        onChange={update("currency")}
      />
      <TextField
        name="reason"
        label="Reason"
        value={values.reason}
        required
        disabled={pending}
        error={!result?.ok ? result?.errors?.reason : undefined}
        onChange={update("reason")}
      />
      <div className="self-end">
        <Button type="submit" variant="secondary" loading={pending}>
          Change price
        </Button>
      </div>
      {result && (
        <div className="sm:col-span-4">
          <StatusMessage kind={resultKind(result)} message={result.message} />
        </div>
      )}
    </form>
  );
}

export function ProductWorkspace({
  product,
  onAddVariant,
  onPublish,
  onChangePrice,
}: {
  product: AdminCatalogProduct;
  onAddVariant: (
    productId: string,
    values: VariantDraft,
    csrfToken: string,
  ) => Promise<CatalogActionResult>;
  onPublish: (
    productId: string,
    csrfToken: string,
  ) => Promise<CatalogActionResult>;
  onChangePrice: (
    productId: string,
    variantId: string,
    values: PriceDraft,
    csrfToken: string,
  ) => Promise<CatalogActionResult>;
}) {
  const router = useRouter();
  const [publishResult, setPublishResult] =
    useState<CatalogActionResult | null>(null);
  const [publishing, setPublishing] = useState(false);
  const canPublish =
    product.variants.length > 0 && product.publicationStatus !== "PUBLISHED";

  async function publish() {
    setPublishing(true);
    try {
      const result = await onPublish(product.id, await csrfToken());
      setPublishResult(result);
      if (result.ok) router.refresh();
    } catch {
      setPublishResult({
        ok: false,
        message: "The product could not be published. Try again.",
      });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <Card title="Add SKU">
          <VariantForm productId={product.id} onAdd={onAddVariant} />
        </Card>
        <section aria-labelledby="variant-prices" className="space-y-3">
          <div>
            <h2 id="variant-prices" className="text-xl font-semibold">
              SKUs and prices
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every price change requires an audit reason.
            </p>
          </div>
          {product.variants.length ? (
            <ul className="space-y-3">
              {product.variants.map((variant) => (
                <li
                  key={variant.id}
                  className="rounded-card border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">
                        {variant.name || variant.sku}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {variant.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatMoney(
                          variant.promotionalPrice ?? variant.listPrice,
                        )}
                      </p>
                      <Badge
                        kind={variant.active ? "success" : "error"}
                        label={variant.active ? "Active" : "Inactive"}
                      />
                    </div>
                  </div>
                  <PriceForm
                    productId={product.id}
                    variantId={variant.id}
                    onChangePrice={onChangePrice}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <Card title="No SKUs yet">
              <p className="text-sm text-muted-foreground">
                Add the first SKU before publishing this product.
              </p>
            </Card>
          )}
        </section>
      </div>
      <aside className="space-y-4 xl:sticky xl:top-4">
        <Card title="Publication">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Current status
              </span>
              {publicationBadge(product.publicationStatus)}
            </div>
            {!canPublish && product.publicationStatus !== "PUBLISHED" && (
              <p className="text-sm text-muted-foreground">
                Add at least one SKU before publishing.
              </p>
            )}
            {publishResult && (
              <StatusMessage
                kind={resultKind(publishResult)}
                message={publishResult.message}
              />
            )}
            <Button
              disabled={!canPublish}
              loading={publishing}
              onClick={() => void publish()}
            >
              Publish product
            </Button>
          </div>
        </Card>
        <Card title="Product details">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{product.name}</dd>
            </div>
            {product.brand && (
              <div>
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{product.brand}</dd>
              </div>
            )}
            {product.description && (
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd className="whitespace-pre-wrap">{product.description}</dd>
              </div>
            )}
          </dl>
        </Card>
      </aside>
    </div>
  );
}
