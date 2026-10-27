export type CursorSearchParams = {
  cursor?: string | string[];
  before?: string | string[];
};

export type CursorPage = {
  cursor?: string;
  before: string[];
  pageNumber: number;
};

function strings(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function readCursorPage(query: CursorSearchParams): CursorPage {
  const cursor = typeof query.cursor === "string" ? query.cursor : undefined;
  if (!cursor) return { before: [], pageNumber: 1 };
  const before = strings(query.before);
  return { cursor, before, pageNumber: before.length + 2 };
}

function cursorHref(
  basePath: string,
  cursor?: string,
  before: string[] = [],
): string {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  before.forEach((value) => params.append("before", value));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function cursorPaginationHrefs(
  basePath: string,
  page: CursorPage,
  nextCursor?: string,
): { previousHref?: string; nextHref?: string } {
  const previousCursor = page.before.at(-1);
  const previousTrail = page.before.slice(0, -1);
  return {
    ...(page.cursor
      ? {
          previousHref: cursorHref(
            basePath,
            previousCursor,
            previousTrail,
          ),
        }
      : {}),
    ...(nextCursor
      ? {
          nextHref: cursorHref(
            basePath,
            nextCursor,
            page.cursor ? [...page.before, page.cursor] : [],
          ),
        }
      : {}),
  };
}
