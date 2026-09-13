import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControl } from "@/components/ui/pagination";
import { formatMoney, type Page } from "@/lib/api";
import { PackageOpen } from "lucide-react";

import type { ProductSummary } from "../schema/category";

function productPrice(product: ProductSummary): string | undefined {
  if (!product.priceFrom) return undefined;
  const from = formatMoney(product.priceFrom);
  return product.priceTo ? `${from} – ${formatMoney(product.priceTo)}` : from;
}

export function ProductGrid({
  categoryName,
  products,
  nextHref,
  previousHref,
}: {
  categoryName: string;
  products: Page<ProductSummary>;
  nextHref?: string | undefined;
  previousHref?: string | undefined;
}) {
  if (products.items.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={`Nothing in ${categoryName} yet`}
        description="Try another category while this collection is being prepared."
        action={{ label: "Browse all categories", href: "/" }}
      />
    );
  }

  return (
    <div>
      <ul
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {products.items.map((product) => {
          const price = productPrice(product);
          return (
            <li key={product.id}>
              <Link
                href={`/p/${product.id}`}
                className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Card className="duration-elevate h-full transition-shadow hover:shadow-sm">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    {product.brand ? (
                      <CardDescription>{product.brand}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {price ? (
                      <p className="font-medium text-primary">{price}</p>
                    ) : null}
                    {product.inStock === false ? (
                      <Badge variant="outline">
                        Out of stock — view options
                      </Badge>
                    ) : product.inStock === undefined ? (
                      <Badge variant="outline">Availability unknown</Badge>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
      <PaginationControl
        count={products.items.length}
        hasNext={products.next !== null}
        nextHref={nextHref}
        previousHref={previousHref}
      />
    </div>
  );
}
