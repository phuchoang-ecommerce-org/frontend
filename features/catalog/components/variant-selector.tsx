"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { formatMoney } from "@/lib/utils/money";

import type { Variant } from "../schema/product";
import {
  matchingPriceRange,
  selectedOptionsForVariant,
  selectedVariant,
  variantChoices,
  variantDimensions,
  type SelectedOptions,
} from "./variant-selection";

export function VariantSelector({ variants }: { variants: Variant[] }) {
  const variantId = useSearchParams().get("variant");
  return (
    <VariantSelectorControls
      key={variantId}
      initialVariantId={variantId}
      variants={variants}
    />
  );
}

function VariantSelectorControls({
  initialVariantId,
  variants,
}: {
  initialVariantId: string | null;
  variants: Variant[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<SelectedOptions>(() =>
    selectedOptionsForVariant(variants, initialVariantId),
  );
  const dimensions = useMemo(() => variantDimensions(variants), [variants]);
  const current = selectedVariant(variants, selected);
  const range = matchingPriceRange(variants, selected);

  function choose(dimension: string, value: string, impossible: boolean) {
    // An impossible value is visibly unavailable and intentionally leaves every
    // other choice in place (US-CAT-04 E1).
    if (impossible) return;
    const next = { ...selected, [dimension]: value };
    setSelected(next);
    const exact = selectedVariant(variants, next);
    router.replace(
      exact ? `${pathname}?variant=${encodeURIComponent(exact.id)}` : pathname,
      {
        scroll: false,
      },
    );
  }

  if (Object.keys(dimensions).length === 0) return null;

  return (
    <section
      aria-labelledby="variant-options-heading"
      className="mt-4 border-t border-border pt-4"
    >
      <h2
        id="variant-options-heading"
        className="text-base font-medium text-primary"
      >
        Choose an option
      </h2>
      <div className="mt-3 space-y-3">
        {Object.entries(dimensions).map(([dimension]) => (
          <fieldset key={dimension}>
            <legend className="text-sm font-medium text-primary capitalize">
              {dimension}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {variantChoices(variants, selected, dimension).map((choice) => {
                const isSelected = selected[dimension] === choice.value;
                const unavailable = choice.impossible || choice.outOfStock;
                return (
                  <button
                    aria-pressed={isSelected}
                    className="min-h-control rounded-control border border-border bg-surface px-3 text-sm text-primary outline-offset-2 hover:border-primary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-500"
                    disabled={choice.impossible}
                    key={choice.value}
                    onClick={() =>
                      choose(dimension, choice.value, choice.impossible)
                    }
                    type="button"
                  >
                    {choice.value}
                    {unavailable ? " — unavailable" : ""}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      {range ? (
        <p className="mt-4 text-lg font-medium text-primary" aria-live="polite">
          {current ? "Selected price: " : "Price: "}
          {formatMoney(range.from)}
          {range.to ? ` – ${formatMoney(range.to)}` : ""}
        </p>
      ) : (
        <p className="mt-4 text-sm text-neutral-700" role="status">
          This combination is not available. Choose another option.
        </p>
      )}
      {current?.availability?.inStock === false ? (
        <p className="mt-2 text-sm text-neutral-700" role="status">
          This selected option is currently out of stock. Availability is
          advisory.
        </p>
      ) : null}
    </section>
  );
}
