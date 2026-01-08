# Consolidated TODOs — updateWeb

This file lists the remaining work to get the project to production-ready state. Tasks are grouped and prioritized with concrete actions and file references.

---

## **High Priority**

- **API response consistency**: return a `meta` object from product list endpoints (total, totalPages, page, limit, hasMore) instead of mixing top-level properties.
  - Files: [server/Controllers/ProductController.js](server/Controllers/ProductController.js)
  - Action: Change response to `{ data: [...], meta: { total, totalPages, page, limit, hasMore } }` and update frontend hooks to consume `meta`.

- **Pagination strategy decision & implementation**: pick either offset-based (`page` + `limit`) or sort-aware cursor; implement consistently on server and client.
  - Files: [server/Controllers/ProductController.js](server/Controllers/ProductController.js), [client/src/Hook/useProduct.js](client/src/Hook/useProduct.js), [client/src/Components/Pagination/index.jsx](client/src/Components/Pagination/index.jsx)
  - Action: If offset chosen, ensure stable ordering for all sorts. If cursor chosen, implement sort-aware cursor (last sort-field value + `_id`).

- **Server-side validation & caps**: parse and validate numeric query params (`limit`, `page`, `minPrice`, `maxPrice`), enforce `maxLimit` (e.g., 100), validate `sort` values and `tag/category` inputs.
  - Files: [server/Controllers/ProductController.js](server/Controllers/ProductController.js), [server/index.js](server/index.js)

- **Authentication & authorization hardening**: ensure `UserController` uses secure password hashing, session/ JWT expiry, secure cookie flags, and admin-only routes are protected.
  - Files: [server/Controllers/UserController.js](server/Controllers/UserController.js), [server/index.js](server/index.js)

- **Search behaviour & UX**: make server search configurable (prefix vs substring). Decide and document behavior; expose query param (e.g., `mode=prefix|substring`).
  - Files: [server/Controllers/ProductController.js](server/Controllers/ProductController.js), [client/src/Api/productApi.js](client/src/Api/productApi.js)
  - Action: If substring search desired, use `new RegExp(q, 'i')` or `$regex: q` with appropriate escaping.

---

## **Medium Priority**

- **Centralize and harden API client**: use `client/src/Api/apiClient.js` consistently, add error normalization, automatic retries (optional), and timeouts.
  - Files: [client/src/Api/apiClient.js](client/src/Api/apiClient.js), [client/src/Api/productApi.js](client/src/Api/productApi.js)

- **Request cancellation & debounce**: ensure hooks using remote data (`useProduct`, `useSearch`) implement `AbortController` + debounce to avoid race conditions and wasted requests.
  - Files: [client/src/Hook/useProduct.js](client/src/Hook/useProduct.js), [client/src/Hook/useSearch.js](client/src/Hook/useSearch.js)

- **DB indexes and query optimization**: add indexes on fields used for filtering/sorting (`category`, `price`, `createdAt`, `sold`, `tags`) and analyze slow queries.
  - Files: [server/Model/Product.js](server/Model/Product.js)

- **File uploads & storage**: ensure uploaded files are validated, stored safely, filepath handling is robust, and consider CDN/remote storage for production.
  - Files: [server/index.js](server/index.js), upload middleware and [uploads/] directory.

---

## **Low Priority / Enhancements**

- **Frontend UX polish**: loading states, empty states, and error messages across product listing, product details, cart, and admin pages.
  - Files: [client/src/Page/Shop/index.jsx](client/src/Page/Shop/index.jsx), [client/src/Components/ProductList/index.jsx](client/src/Components/ProductList/index.jsx), [client/src/Page/Admin/Product.jsx](client/src/Page/Admin/Product.jsx)

- **Highlight matched text**: show matched prefix or substring in search results for better UX.
  - Files: [client/src/Components/ProductList/index.jsx](client/src/Components/ProductList/index.jsx), [client/src/Page/Admin/Product.jsx](client/src/Page/Admin/Product.jsx)

- **Accessibility**: verify keyboard navigation, ARIA attributes for dropdowns, modals, and forms.
  - Files: UI components under [client/src/Components](client/src/Components)

- **Performance**: client-side caching, server-side response caching (redis) for expensive queries, and image optimization.

---

## **Security & Production Hardening**

- **Express middleware**: add `helmet`, `express-rate-limit`, request size limits, and stricter CORS rules.
  - Files: [server/index.js](server/index.js)

- **Secrets & env handling**: ensure `.env` is used securely, no secrets committed, and document required env vars in README.
  - Files: [server/.env] (do not commit values)

- **Logging & monitoring**: add structured logging and consider integration with monitoring (Sentry, Loggly) and metrics.

---

## **Testing & CI**

- **Unit tests**: add Jest tests for utility functions, hooks, and small components.
  - Files: create `__tests__` next to modules or a `tests/` folder.

- **API integration tests**: add Jest + Supertest tests for product endpoints covering filters, search, pagination, create/edit flows.
  - Files: tests for [server/Controllers/ProductController.js](server/Controllers/ProductController.js)

- **CI pipeline**: add GitHub Actions to run lint, tests, and build on PRs then deploy on main branch.

---

## **Developer Experience**

- **Linting & formatting**: add ESLint and Prettier with recommended configs and pre-commit hooks (husky).

- **Scripts & docs**: add `npm` scripts in both client and server for `start`, `dev`, `build`, `test`, and document local dev flow in README.
  - Files: [client/package.json](client/package.json), [server/package.json](server/package.json), README.md

---

## **Project-specific action items (quick wins)**

- **Fix ProductController search mode**: document and expose `mode` param or change to substring search to match expected UX.
  - Files: [server/Controllers/ProductController.js](server/Controllers/ProductController.js), [client/src/Api/productApi.js](client/src/Api/productApi.js)

- **Wire InputSearch value in admin list**: ensure `InputSearch` passes value and `onChange` is used consistently (already partially done in admin page).
  - Files: [client/src/Components/InputSearch/index.jsx](client/src/Components/InputSearch/index.jsx), [client/src/Page/Admin/Product.jsx](client/src/Page/Admin/Product.jsx)

- **Return `meta` and update `useProduct`**: change `useProduct` to consume `meta` and use `meta.totalPages` and `meta.total` rather than relying on guessed fields.
  - Files: [client/src/Hook/useProduct.js](client/src/Hook/useProduct.js)

---

If you'd like, I can implement the top 3 items (API meta, server-side validation/caps, and making pagination consistent) in sequence. Tell me which to start with or say "implement top 3" and I'll begin and track progress in the todo list.

---

If you want, I can now implement any of the prioritized tasks. Tell me which one to start with (e.g., `SortDropdown` mapping, AbortController + debounce, or sort-aware cursor implementation).