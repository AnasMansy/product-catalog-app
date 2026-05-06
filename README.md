# Product Catalog  

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

 
