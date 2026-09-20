export function selectedVariantId(
  searchParams: URLSearchParams,
): string | null {
  return searchParams.get("variant");
}

export function productVariantHref(
  pathname: string,
  variantId: string | undefined,
): string {
  return variantId
    ? `${pathname}?variant=${encodeURIComponent(variantId)}`
    : pathname;
}
