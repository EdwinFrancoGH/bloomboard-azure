# BloomBoard (Vite + React) - Azure Static build + ZIP

This project is a small Vite + React app using Tailwind and framer-motion. It includes the BloomBoard component.

## Quick start (locally)
1. `npm install`
2. `npm run dev` (development)
3. `npm run build` (produces `dist/`)
4. `npm run serve` (preview built site)

## Deploy to Azure Static Web Apps
- Option A: Use the included GitHub Actions workflow for Azure Static Web Apps (create a Static Web App in Azure and link your repository).
- Option B: Use Azure App Service for static sites (deploy `dist/` via ZIP deploy or GitHub Actions).

See `.github/workflows/azure-static-web-apps.yml` for a starter workflow configuration.

## Notes
- This ZIP contains the source. CI in Azure (or locally) will run `npm install` and `npm run build` to generate the actual static files.
