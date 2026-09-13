<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Product Backlog — Enterprise Commerce Platform (ECP)

**Document type:** Derived lane backlog · **Audience:** Frontend Engineering, Product Management
**Canonical source:** [PM product backlog](../product-backlog.md)

---

## How to Use This View

This is the frontend-actionable view of the canonical integrated backlog. It contains every story with non-zero FE points, preserves its sprint and contract surface, and records the other lane only as a delivery milestone. Zero-point stories are intentionally omitted unless they are named in a sprint dependency.

**Scheduled work: 289 story points + 171 enabler points = 460 points.** Estimates, priority, and schedule belong to the [canonical backlog](../product-backlog.md); update that source, then regenerate this view.

## Shared Rules

- One story is not Done until both slices and its Contract Sync have passed; see the [canonical Definition of Done](../definition-of-done.md#5-definition-of-done--the-story).
- The OpenAPI contract is normative. Amendments follow the [shared integration protocol](../integration-plan.md#5-amending-the-contract).
- The other-lane milestone is context, not a second task list. Full cross-lane scope remains in the [canonical backlog](../product-backlog.md).

## User Stories

### 4.1 Customer & Identity — 10 stories · BE 39 · FE 30 — Frontend 30 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-CUS-01` | Register Customer Account | Must | 3 | S03 | S03 | `registerAccount`<br>/register |
| `US-CUS-02` | Verify Email Address | Must | 2 | S03 | S03 | `verifyEmailAddress · resendEmailVerification`<br>/verify-email |
| `US-CUS-03` | Log In | Must | 3 | S03 | S03 | `logIn`<br>/sign-in |
| `US-CUS-04` | Log Out | Must | 1 | S03 | S03 | `logOut`<br>account menu action |
| `US-CUS-05` | Refresh Authenticated Session | Must | 5 | S04 | S04 | `renewSession`<br>internal — serialised refresh |
| `US-CUS-06` | Change Password | Must | 2 | S05 | S05 | `changeOwnPassword`<br>/account/security |
| `US-CUS-07` | Reset Forgotten Password | Must | 3 | S05 | S05 | `requestPasswordReset · completePasswordReset`<br>/forgot-password · /reset-password |
| `US-CUS-08` | Manage Profile | Must | 3 | S05 | S05 | `getOwnAccount · updateOwnProfile`<br>/account/profile |
| `US-CUS-09` | Manage Shipping Addresses | Must | 5 | S05 | S05 | `listOwnAddresses · addOwnAddress · replaceOwnAddress · removeOwnAddress`<br>/account/addresses |
| `US-CUS-10` | View Purchase History | Must | 3 | S05 | S05 | `listOrders`<br>/account/orders |

### 4.2 Product Catalog & Category — 5 stories · BE 20 · FE 24 — Frontend 24 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-CAT-01` | Browse Category Tree | Must | 5 | S06 | S06 | `listCategories · getCategory`<br>/c/[...slug] |
| `US-CAT-02` | Browse Category Product Listing | Must | 5 | S06 | S06 | `listCategoryProducts`<br>/c/[...slug] |
| `US-CAT-03` | View Product Details | Must | 8 | S07 | S07 | `getProduct · listProductVariants · getProductRatingSummary`<br>/p/[productId] |
| `US-CAT-04` | Select Product Variant | Must | 3 | S07 | S06 | `listProductVariants · getProductVariant`<br>/p/[productId] |
| `US-CAT-05` | View Featured Categories | Should | 3 | S30 | S30 | `listFeaturedCategories`<br>/ |

### 4.3 Search & Recommendation — 7 stories · BE 34 · FE 27 — Frontend 27 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-SCH-01` | Search Products by Keyword | Must | 5 | S10 | S10 | `searchProducts`<br>/search |
| `US-SCH-02` | Search Suggestions and Auto-complete | Should | 5 | S30 | S30 | `getSearchSuggestions`<br>/search — typeahead |
| `US-SCH-03` | Filter and Sort Search Results | Must | 5 | S10 | S10 | `searchProducts (facets)`<br>/search |
| `US-SCH-04` | View Popular and Recent Keywords | Could | 3 | S30 | S30 | `listPopularKeywords · listOwnRecentKeywords · removeOwnRecentKeyword · clearOwnRecentKeywords`<br>/search |
| `US-SCH-05` | View Related and Frequently-Bought-Together | Should | 3 | S30 | S30 | `listRelatedProducts · listFrequentlyBoughtTogetherForProduct · listFrequentlyBoughtTogetherForCart`<br>/p/[productId] · /cart |
| `US-SCH-06` | View Trending Products and New Arrivals | Could | 3 | S30 | S30 | `listTrendingProducts · listNewArrivals`<br>/ |
| `US-SCH-07` | Receive Personalised Recommendations | Could | 3 | S31 | S31 | `listPersonalisedRecommendations · setOwnPersonalisationPreference`<br>/ — personalised rail |

### 4.4 Inventory — 5 stories · BE 28 · FE 10 — Frontend 10 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-INV-03` | Commit Reserved Stock on Fulfilment | Must | 2 | S11 | S11 | `commitStockReservation`<br>/admin/inventory/[stockItemId] |
| `US-INV-04` | Adjust Inventory | Must | 3 | S12 | S12 | `adjustStock · listStockAdjustments`<br>/admin/inventory/[stockItemId] |
| `US-INV-05` | View Inventory Levels | Must | 5 | S12 | S12 | `listStockItems · getStockItem · listWarehouses`<br>/admin/inventory |

### 4.5 Cart & Wishlist — 8 stories · BE 31 · FE 23 — Frontend 23 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-CRT-01` | Add Item to Cart | Must | 3 | S13 | S13 | `addCartLine`<br>/cart · /p/[productId] |
| `US-CRT-02` | Update Cart Item Quantity | Must | 3 | S13 | S13 | `updateCartLineQuantity`<br>/cart |
| `US-CRT-03` | Remove Item from Cart | Must | 2 | S13 | S13 | `removeCartLine`<br>/cart |
| `US-CRT-04` | View Cart | Must | 5 | S13 | S13 | `getCurrentCart · getCart`<br>/cart |
| `US-CRT-05` | Merge Guest Cart on Login | Must | 3 | S14 | S14 | `mergeGuestCart`<br>sign-in path, server-side |
| `US-CRT-07` | Manage Wishlist | Should | 5 | S31 | S31 | `getOwnWishlist · addWishlistItem · removeWishlistItem`<br>/wishlist |
| `US-CRT-08` | Move Wishlist Item to Cart | Should | 2 | S31 | S31 | `moveWishlistItemsToCart`<br>/wishlist |

### 4.6 Checkout & Order — 10 stories · BE 55 · FE 39 — Frontend 39 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-ORD-01` | Initiate Checkout | Must | 3 | S14 | S17 | `initiateCheckout · getCurrentCheckout`<br>/checkout |
| `US-ORD-02` | Provide Shipping and Billing Information | Must | 5 | S14 | S17 | `setCheckoutShippingAddress · setCheckoutBillingInformation · selectCheckoutShippingOption`<br>/checkout/shipping · /checkout/payment |
| `US-ORD-03` | Apply Voucher at Checkout | Must | 3 | S15 | S17 | `applyCheckoutVoucher · removeCheckoutVoucher`<br>/checkout/review |
| `US-ORD-04` | Review Order Summary | Must | 5 | S15 | S17 | `getOrderSummary`<br>/checkout/review |
| `US-ORD-05` | Place Order | Must | 5 | S17 | S18 | `placeOrder`<br>/checkout/review · /checkout/confirmation/[orderId] |
| `US-ORD-06` | View Order Details | Must | 5 | S17 | S19 | `getOrder · listOrderLines`<br>/account/orders/[orderId] |
| `US-ORD-07` | Track Order | Must | 3 | S18 | S19 | `trackOrder`<br>/account/orders/[orderId]/tracking |
| `US-ORD-08` | Cancel Order | Must | 2 | S18 | S19 | `cancelOrder`<br>/account/orders/[orderId] |
| `US-ORD-09` | Request Return | Should | 3 | S31 | S31 | `requestOrderReturn · getOrderReturnRequest · resolveOrderReturn`<br>/account/orders/[orderId]/return |
| `US-ORD-10` | Advance Order Status | Must | 5 | S18 | S19 | `advanceOrderStatus · advanceOrderStatusesInBulk · setOrderInvestigationFlag`<br>/admin/orders/[orderId] |

### 4.7 Payment — 6 stories · BE 34 · FE 19 — Frontend 19 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-PAY-01` | Select Payment Method | Must | 3 | S20 | S21 | `listEligiblePaymentMethods · selectCheckoutPaymentMethod`<br>/checkout/payment |
| `US-PAY-02` | Authorise Online Payment | Must | 5 | S21 | S21 | `initiatePayment · getOrderPayment`<br>/checkout/payment/processing |
| `US-PAY-03` | Handle Payment Gateway Result | Must | 3 | S21 | S21 | `receivePaymentProviderNotification`<br>/api/auth/* — provider return handler |
| `US-PAY-04` | Settle Cash On Delivery Payment | Must | 2 | S22 | S22 | `settleCashOnDelivery`<br>/admin/payments/[paymentId] |
| `US-PAY-05` | Retry Failed Payment | Must | 3 | S22 | S22 | `retryPayment`<br>/checkout/payment/processing |
| `US-PAY-06` | Process Refund | Must | 3 | S22 | S22 | `refundPayment · listPaymentRefunds · listPaymentAttempts · listUnmatchedPayments`<br>/admin/payments/[paymentId] |

### 4.8 Shipping — 6 stories · BE 24 · FE 14 — Frontend 14 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-SHP-01` | Calculate Shipping Fee | Must | 2 | S19 | S20 | `getShippingQuotes`<br>/checkout/shipping |
| `US-SHP-02` | Estimate Delivery Date | Should | 2 | S31 | S31 | `getShippingQuotes (estimate)`<br>/checkout/shipping |
| `US-SHP-03` | Create Shipment | Must | 3 | S20 | S20 | `createShipment · listShipments`<br>/admin/shipments |
| `US-SHP-05` | View Shipment Tracking | Must | 5 | S19 | S20 | `getShipment · listShipmentTrackingEvents`<br>/account/orders/[orderId]/tracking |
| `US-SHP-06` | Confirm Delivery | Must | 2 | S20 | S20 | `confirmShipmentDelivery`<br>/admin/shipments/[shipmentId] |

### 4.9 Promotion — 5 stories · BE 29 · FE 15 — Frontend 15 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-PRM-01` | Create Promotion | Must | 5 | S16 | S15 | `createPromotion · listPromotions · generatePromotionVouchers`<br>/admin/promotions |
| `US-PRM-02` | Validate Voucher Code | Must | 2 | S15 | S15 | `validateVoucher`<br>/checkout/review |
| `US-PRM-03` | Apply Promotion to Order | Must | 3 | S15 | S15 | `PromotionRedemptionPort · listPromotionRedemptions`<br>/checkout/review |
| `US-PRM-04` | Launch Flash Sale | Must | 3 | S16 | S16 | `setPromotionStatus`<br>/admin/promotions/[promotionId] |
| `US-PRM-05` | Deactivate or Expire Promotion | Must | 2 | S16 | S16 | `updatePromotion · setPromotionStatus`<br>/admin/promotions/[promotionId] |

### 4.10 Review — 5 stories · BE 20 · FE 18 — Frontend 18 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-REV-01` | Submit Product Review | Must | 5 | S21 | S24 | `submitProductReview · addReviewImage`<br>/p/[productId] · /account/orders/[orderId] |
| `US-REV-02` | Edit Own Review | Should | 3 | S32 | S32 | `editOwnReview`<br>/account/reviews |
| `US-REV-03` | Delete Own Review | Should | 2 | S32 | S32 | `deleteOwnReview · removeReviewImage`<br>/account/reviews |
| `US-REV-04` | View Product Reviews | Must | 5 | S21 | S24 | `listProductReviews · getProductRatingSummary · reportReview`<br>/p/[productId] |
| `US-REV-05` | Moderate Review | Should | 3 | S32 | S32 | `moderateReview · listReviews · getReview`<br>/admin/reviews |

### 4.11 Notification — 4 stories · BE 19 · FE 8 — Frontend 8 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-NTF-03` | View In-App Notifications | Must | 5 | S21 | S23 | `listOwnNotifications · setNotificationReadState · dismissNotification · markNotificationsRead`<br>/account/notifications |
| `US-NTF-04` | Manage Notification Preferences | Should | 3 | S32 | S32 | `getOwnNotificationPreferences · setOwnNotificationPreferences · unsubscribeFromPromotionalNotifications`<br>/account/preferences · /unsubscribe |

### 4.12 Administration — 6 stories · BE 31 · FE 29 — Frontend 29 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-ADM-01` | Manage Products | Must | 8 | S08 | S09 | `createProduct · updateProduct · deleteProduct · setProductPublication · addProductVariant · changeVariantPrice · addProductImage · amendProductsInBulk`<br>/admin/products |
| `US-ADM-02` | Manage Categories | Must | 5 | S08 | S09 | `createCategory · updateCategory · deleteCategory`<br>/admin/categories |
| `US-ADM-03` | Manage Customer Accounts | Must | 5 | S22 | S25 | `searchAccounts · getAccount · correctAccountProfile · setAccountStatus · closeAccount · endAccountSessions`<br>/admin/customers |
| `US-ADM-04` | Manage Orders | Must | 5 | S22 | S25 | `listOrders (scoped) · advanceOrderStatusesInBulk`<br>/admin/orders |
| `US-ADM-05` | Manage Inventory Adjustments | Must | 3 | S09 | S12 | `listStockAdjustments`<br>/admin/inventory |
| `US-ADM-06` | Manage User Roles | Must | 3 | S22 | S25 | `listRoles · listAccountRoles · grantAccountRole · revokeAccountRole`<br>/admin/roles |

### 4.13 Reporting & Analytics — 6 stories · BE 33 · FE 24 — Frontend 24 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-RPT-01` | View Revenue Report | Must | 5 | S23 | S26 | `getRevenueReport`<br>/admin/reports/revenue · /admin |
| `US-RPT-02` | View Product Performance Report | Must | 3 | S23 | S26 | `getProductPerformanceReport`<br>/admin/reports/products |
| `US-RPT-03` | View Customer Report | Should | 3 | S32 | S32 | `getCustomerReport`<br>/admin/reports/customers |
| `US-RPT-04` | View Inventory Report | Must | 3 | S24 | S27 | `getInventoryReport`<br>/admin/reports/inventory · /admin |
| `US-RPT-05` | View Order and Conversion Statistics | Must | 5 | S23 | S26 | `getOrderStatisticsReport`<br>/admin/reports/orders · /admin |
| `US-RPT-06` | Export Report | Could | 5 | S32 | S32 | `requestReportExport · getReportExport · downloadReportExport`<br>/admin/reports/exports |

### 4.14 Audit & Access Control — 4 stories · BE 26 · FE 9 — Frontend 9 pts

| ID | Story | P | FE pts | Frontend sprint | Other-lane milestone | Contract surface |
|---|---|---|---:|---|---|---|
| `US-AUD-02` | Search Audit Trail | Must | 5 | S25 | S28 | `searchAuditTrail · getAuditEntry`<br>/admin/audit |
| `US-AUD-03` | Authorise Request via RBAC | Must | 2 | S04 | S04 | `every operation — AuthorizationService`<br>cross-cutting — 403/404 rendering |
| `US-AUD-04` | Enforce API Rate Limit | Must | 2 | S04 | S04 | `every operation — Redis limiter`<br>cross-cutting — 429 rendering |

## Enabler Epics

Enablers are owned entirely by this lane and remain scheduled work, never background work.

| Epic | ID | Item | FE pts | Sprint |
|---|---|---|---:|---|
| `EN-CI` | `EN-CI-3` | Frontend CI stages: type check, lint, boundary + cycle check, codegen drift | 8 | S24 |
| `EN-FE-TOOL` | `EN-FE-TOOL-1` | Tailwind + Ma tokens, shadcn/ui vendored, strict `tsc`, ESLint (boundaries + dependency-cruiser), Prettier, Vitest + Testing Library + axe, Playwright skeleton | 14 | S00 |
| `EN-FE-API` | `EN-FE-API-1` | The one fetch client; `openapi-typescript` codegen + build-failing diff; Zod boundary parsing; error-code→screen map; cursor pagination | 14 | S01 |
| `EN-FE-API` | `EN-FE-API-2` | Session custody: `ecp_session` cookie, `/api/csrf` signed double-submit, serialised refresh, `/api/auth/*` | 10 | S04 |
| `EN-FE-API` | `EN-FE-API-3` | `/api/internal/revalidate` signed callback; event-driven ISR invalidation | 8 | S09 |
| `EN-FE-API` | `EN-FE-API-4` | URL search-param encoding contract (ADR-0037); R2 streamed sections | 10 | S10 |
| `EN-MOCK` | `EN-MOCK-1` | Prism mock harness — `npm run mock:api` off `openapi.yaml`, seeded examples | 6 | S01 |
| `EN-FE-SHELL` | `EN-FE-SHELL-1` | Root layout, CSP nonce, middleware, four route-group layouts, header/footer/account sidebar/admin shell | 14 | S02 |
| `EN-FE-SHELL` | `EN-FE-SHELL-2` | `loading.tsx` / `error.tsx` / `not-found.tsx` placement and `<Suspense>` discipline per Routing §8 | 9 | S07 |
| `EN-FE-DS` | `EN-FE-DS-1` | Design system: Button, Input, Card | 6 | S02 |
| `EN-FE-DS` | `EN-FE-DS-2` | Design system: Form, EmptyState, Skeleton, Badge, motion + reduced-motion baseline | 11 | S03 |
| `EN-FE-DS` | `EN-FE-DS-3` | Design system: Table, Modal, Tooltip, pagination control | 3 | S05 |
| `EN-FE-DS` | `EN-FE-DS-4` | Admin console shell: dense navigation, filtered-list→detail→action pattern | 4 | S09 |
| `EN-FE-DS` | `EN-FE-DS-5` | Availability display — advisory and labelled — across catalog, cart and checkout | 7 | S11 |
| `EN-FE-DS` | `EN-FE-DS-6` | Order-status discriminated union; exhaustive transition rendering | 5 | S12 |
| `EN-FE-PERF` | `EN-FE-PERF-1` | R1 static generation + tag-based cache; web-vitals reporter | 7 | S06 |
| `EN-FE-PERF` | `EN-FE-PERF-2` | Per-route-class budget gate (ADR-0039) + Lighthouse CI | 6 | S28 |
| `EN-FE-E2E` | `EN-FE-E2E-1` | Playwright purchase path — the whole thin suite | 8 | S25 |
| `EN-FE-E2E` | `EN-FE-E2E-2` | Accessibility sweep: axe in component tests, token-contrast assertions, manual screen-reader pass | 13 | S27 |
| `EN-FE-E2E` | `EN-FE-E2E-3` | Release 2 regression walk — every `(admin)` route driven against the real API | 8 | S29 |
