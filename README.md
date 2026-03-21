# Marketplace Frontend

Separate React client for the marketplace gateway.

## Run

```bash
npm install
npm run dev
```

By default Vite proxies `/api` to `http://127.0.0.1:8000`.

## Environment

Use `.env` if needed:

```bash
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8000
VITE_API_BASE_URL=
```

- `VITE_DEV_PROXY_TARGET` is used only by the Vite dev server.
- `VITE_API_BASE_URL` is used in the browser at runtime. Leave it empty when frontend and gateway share the same origin.

## Build

```bash
npm run build
```
