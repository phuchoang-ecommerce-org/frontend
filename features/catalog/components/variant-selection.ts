import type { Money } from "@/lib/utils/money";

import type { Variant } from "../schema/product";

export type SelectedOptions = Record<string, string>;

export type VariantChoice = {
  value: string;
  impossible: boolean;
  outOfStock: boolean;
};

function matchingVariants(variants: Variant[], selected: SelectedOptions) {
  return variants.filter(
    (variant) =>
      variant.active &&
      Object.entries(selected).every(
        ([dimension, value]) => variant.options?.[dimension] === value,
      ),
  );
}

export function selectedOptionsForVariant(
  variants: Variant[],
  variantId: string | null | undefined,
): SelectedOptions {
  return variants.find((variant) => variant.id === variantId)?.options ?? {};
}

export function variantDimensions(
  variants: Variant[],
): Record<string, string[]> {
  const dimensions = new Map<string, Set<string>>();
  for (const variant of variants) {
    if (!variant.active) continue;
    for (const [dimension, value] of Object.entries(variant.options ?? {})) {
      const values = dimensions.get(dimension) ?? new Set<string>();
      values.add(value);
      dimensions.set(dimension, values);
    }
  }
  return Object.fromEntries(
    Array.from(dimensions, ([dimension, values]) => [
      dimension,
      Array.from(values).sort(),
    ]),
  );
}

export function variantChoices(
  variants: Variant[],
  selected: SelectedOptions,
  dimension: string,
): VariantChoice[] {
  const values = variantDimensions(variants)[dimension] ?? [];
  const remaining = Object.fromEntries(
    Object.entries(selected).filter(([key]) => key !== dimension),
  );
  return values.map((value) => {
    const matches = matchingVariants(variants, {
      ...remaining,
      [dimension]: value,
    });
    return {
      value,
      impossible: matches.length === 0,
      outOfStock:
        matches.length > 0 &&
        matches.every((variant) => variant.availability?.inStock === false),
    };
  });
}

export function matchingPriceRange(
  variants: Variant[],
  selected: SelectedOptions,
): { from: Money; to?: Money } | undefined {
  const prices = matchingVariants(variants, selected)
    .map((variant) => variant.promotionalPrice ?? variant.listPrice)
    .filter(
      (price, index, all) =>
        all.findIndex(
          (item) =>
            item.amount === price.amount && item.currency === price.currency,
        ) === index,
    )
    .sort((left, right) =>
      left.amount.localeCompare(right.amount, undefined, { numeric: true }),
    );
  if (prices.length === 0) return undefined;
  return {
    from: prices[0]!,
    ...(prices.length > 1 ? { to: prices[prices.length - 1]! } : {}),
  };
}

export function selectedVariant(
  variants: Variant[],
  selected: SelectedOptions,
): Variant | undefined {
  const dimensions = Object.keys(variantDimensions(variants));
  if (
    dimensions.length === 0 ||
    dimensions.some((dimension) => !selected[dimension])
  )
    return undefined;
  return matchingVariants(variants, selected)[0];
}
