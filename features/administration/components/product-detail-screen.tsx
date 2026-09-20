import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SectionSkeleton } from "@/components/ui/section-state";
import { ApiProblem } from "@/lib/api";

import {
  DeleteProductControl,
  ImageManager,
  PublicationControl,
  VariantManager,
} from "./product-actions";
import { ProductForm } from "./product-form";
import {
  getAdminProduct,
  listAdminCategories,
  listAdminProductVariants,
} from "../server/queries";

export async function AdminProductDetailScreen({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<SectionSkeleton lines={6} />}>
        <ProductEditor productId={productId} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton lines={5} />}>
        <ProductVariants productId={productId} />
      </Suspense>
    </div>
  );
}

async function ProductEditor({ productId }: { productId: string }) {
  let product: Awaited<ReturnType<typeof getAdminProduct>>;
  let categories: Awaited<ReturnType<typeof listAdminCategories>>;
  try {
    [product, categories] = await Promise.all([
      getAdminProduct(productId),
      listAdminCategories(),
    ]);
  } catch (error) {
    if (error instanceof ApiProblem && error.problem.status === 404) notFound();
    throw error;
  }
  return (
    <>
      <ProductForm product={product} categories={categories} />
      <PublicationControl productId={product.id} status={product.publicationStatus} />
      <ImageManager productId={product.id} images={product.images} />
      <DeleteProductControl productId={product.id} />
    </>
  );
}

async function ProductVariants({ productId }: { productId: string }) {
  const variants = await listAdminProductVariants(productId);
  return <VariantManager productId={productId} variants={variants} />;
}
