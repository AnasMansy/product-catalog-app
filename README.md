# Product Catalog Starter

Frontend-only product management starter built with Next.js App Router, React, TypeScript, Redux Toolkit, Tailwind CSS, and the DummyJSON public API.

## Setup Instructions

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Validation commands:

```bash
npm run lint
npm run build
```

## Tech Stack Used

- Next.js 16 with App Router
- React 19
- TypeScript
- Redux Toolkit
- React Redux
- Tailwind CSS v4
- Native `fetch`
- DummyJSON API

## Environment Variables

- The project uses DummyJSON as a public API for products and real login/token requests.
- `NEXT_PUBLIC_API_BASE_URL` is a public client-side variable and is safe to expose.
- Copy `.env.example` to `.env.local` when you want to override the default configuration locally.
- Vercel users can add `NEXT_PUBLIC_API_BASE_URL` in `Project Settings -> Environment Variables`, or rely on the built-in fallback if it is not set.

## Live Demo Link

product-catalog-app-eosin-eight.vercel.app

## Features Included

- Real login against the DummyJSON auth API
- Client-side demo registration stored in localStorage
- Token and user persistence in localStorage plus Redux state
- Protected `/products` and `/products/[id]` routes
- Product listing, category filtering, search, and product details
- Load-more pagination with 12 products per page
- Loading, error, and empty states
- Redux-backed caching with a 5-minute cache duration for products and categories

## Frontend-Only Notes

- This project does not create a backend, database, or custom auth server.
- DummyJSON is used for product data and the real login/token API.
- Registration is implemented as a client-side demo flow because there is no backend or database.
- The demo registration stores a single demo account in localStorage under `demoUser`.
- Protected routes require a token. That token can come from:
  - the real DummyJSON login API, or
  - the generated local demo token created after a successful demo login

## Authentication and Registration

- Real login uses `POST https://dummyjson.com/auth/login`.
- Successful login stores the access token and user session in localStorage and Redux.
- Logout clears the stored token and user session.
- The `/register` page validates:
  - name
  - username
  - email format
  - password length
  - password confirmation
- After demo registration succeeds, the app redirects to `/login` with a success message.
- Demo login checks the registered local account and generates a fake token in the format `demo-token-{timestamp}`.

## Caching Management

- Redux state is the caching layer for:
  - product lists
  - categories
- Product list cache entries are stored by active query/category key.
- Categories are reused from Redux state while the cache is fresh.
- Cache duration is `5 minutes`.
- Refetching only happens when:
  - the cache is empty, or
  - the cached data has expired, or
  - a forced retry is triggered

## Bonus Feature

- The products page includes optional load-more pagination.
- The initial request loads 12 products.
- Each click on `Load more products` fetches the next 12 and appends them to the grid.
- Search and category filtering reset pagination back to the first page.

## Project Structure

```text
src/
  app/
    layout.tsx
    loading.tsx
    error.tsx
    page.tsx
    login/
      page.tsx
    register/
      page.tsx
    products/
      page.tsx
      loading.tsx
      error.tsx
      [id]/
        page.tsx
        loading.tsx
  components/
    Navbar.tsx
    ProductCard.tsx
    SearchBar.tsx
    CategoryFilter.tsx
    LoadingSpinner.tsx
    ErrorMessage.tsx
    ProtectedRoute.tsx
    pages/
      LoginPageClient.tsx
      RegisterPageClient.tsx
      ProductsPageClient.tsx
      ProductDetailsPageClient.tsx
  lib/
    api.ts
    authStorage.ts
  store/
    store.ts
    hooks.ts
    provider.tsx
    slices/
      authSlice.ts
      productsSlice.ts
  types/
    auth.ts
    product.ts
```

## API Endpoints Used

- `POST https://dummyjson.com/auth/login`
- `GET https://dummyjson.com/products`
- `GET https://dummyjson.com/products/{id}`
- `GET https://dummyjson.com/products/search?q={query}`
- `GET https://dummyjson.com/products/categories`
- `GET https://dummyjson.com/products/category/{category}`

## Available Routes

- `/`
- `/login`
- `/register`
- `/products`
- `/products/[id]`

## Evaluation Criteria

Candidates will be evaluated based on:

- Code quality
- Component architecture
- Responsiveness
- Performance
- UX/UI implementation
- Git practices
