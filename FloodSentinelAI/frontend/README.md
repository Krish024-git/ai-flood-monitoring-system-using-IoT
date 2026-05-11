# FloodSentinelAI React Dashboard

This folder contains the premium IoT dashboard served by the existing FastAPI `/dashboard` route.

## Current Runtime

FastAPI serves:

- `flood-dashboard.html`
- `css/iot-dashboard.css`
- `js/iot-dashboard-app.js`

The dashboard polls the existing `/sensor-data` API every 5 seconds and does not require backend changes.

## Vite Development

Install Node.js, then run:

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/sensor-data` and `/update-data` to `http://127.0.0.1:8000`.
