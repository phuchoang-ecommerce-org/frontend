import "server-only";

/**
 * Cursor pagination only — there is no unpaginated list endpoint and no
 * offset concept anywhere in this API (Integration Contract §3). This
 * module deliberately has no function that accepts or produces a page
 * number.
 */
export interface Page<T> {
  items: T[];
  next: string | null;
  total?: number;
}

export function cursorQuery(cursor?: string, size?: number): Record<string, string> {
  const query: Record<string, string> = {};
  if (cursor !== undefined) query.cursor = cursor;
  if (size !== undefined) query.size = String(size);
  return query;
}
