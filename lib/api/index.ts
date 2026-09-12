import "server-only";

// The one fetch client (ADR-0036, Feature Structure.md §2). Nothing outside
// lib/api imports from any other file in this folder (rule I-4) — everything
// a caller needs is re-exported here.

export { apiQuery, apiMutate } from "./client";
export { ApiParseError, ApiProblem, ApiTransportError } from "./errors";
export { ERROR_SCREEN_MAP, type ErrorScreenOutcome } from "./error-map";
export { readOptionalSection } from "./authz";
export { cursorQuery, toPage, type Page } from "./pagination";
export { AddressSchema, type Address } from "./address";
export {
  asProductId,
  asSkuId,
  asCartId,
  asOrderId,
  ProductIdSchema,
  SkuIdSchema,
  CartIdSchema,
  OrderIdSchema,
  type ProductId,
  type SkuId,
  type CartId,
  type OrderId,
} from "./ids";
export { MoneySchema, formatMoney, type Money } from "./money";
export {
  ProblemSchema,
  FieldErrorSchema,
  PageSchema,
  pageEnvelopeSchema,
  type Problem,
  type FieldError,
} from "./schema";
