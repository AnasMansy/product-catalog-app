 
## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Redux Toolkit
- React Redux
- Tailwind CSS v4
- Native `fetch`
- DummyJSON API

 

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run lint
npm run build
npm run validate:rtl -- ./path/to/output.docx
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

## Authentication Notes

- This project is frontend-only and does not create a backend.
- The login screen stores the returned DummyJSON access token in `localStorage`.
- Route protection is handled on the client through `ProtectedRoute`.
- The register page is a placeholder because no custom registration backend is part of this starter.
- The login view is prefilled with the official DummyJSON demo credentials: `emilys` / `emilyspass`.

## Local Run Commands

```bash
npm install
npm run dev
```
 