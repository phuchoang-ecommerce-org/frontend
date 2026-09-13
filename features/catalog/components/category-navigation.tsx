import Link from "next/link";

import type { CategoryNode } from "../schema/category";

export function CategoryNavigation({
  categories,
}: {
  categories: CategoryNode[];
}) {
  return (
    <nav
      aria-label="Product categories"
      className="border-b border-border bg-surface"
    >
      <div className="mx-auto max-w-content px-4 py-2">
        <ul className="flex gap-3 overflow-x-auto text-sm" role="list">
          {categories.map((category) => (
            <li key={category.id} className="shrink-0">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href={`/c/${category.slug}`}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
