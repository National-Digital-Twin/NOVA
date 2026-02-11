# NOVA

**Repository:** `NOVA`
**Description:** Monorepo for the Nova application containing a React/Vite frontend and a TypeScript/Express API service.
**Repository Status:** `Private – NDTP InnerSource`

---

## Overview

This repository is part of the National Digital Twin Programme (NDTP). It provides:
- A geospatial web frontend (React + Vite) for interactive 2D/3D map visualisation and analysis.
- A REST API (Express) for geospatial data processing, asset/layer access, and location analysis, with Swagger docs.

> This repository is private and governed by the NDTP InnerSource Licence – Version 1.0.
> It is intended solely for collaboration among NDTP teams and authorised suppliers.
> It is not open source and must not be disclosed, redistributed, or published externally.

---

## Prerequisites
- Node.js 18+ (LTS recommended) and npm 9+
- Git access to the NDTP internal Git service hosting this repo
- Optional: Docker 24+ (for container builds)
- Optional: Kubernetes tooling (kubectl ≥1.26, Kustomize/Helm as per your environment)

System requirements depend on dataset sizes; 8 GB RAM is recommended for local development.

## Quick Start

### 1) Clone and install
```sh
# Clone using your internal Git URL
git clone https://github.com/National-Digital-Twin/NOVA.git
cd NOVA

# Install workspace dependencies (frontend + api)
npm install
```

### 2) Configure environment
- Frontend requires a MapTiler token:
  - Create frontend/.env.local with:
    - `VITE_MAPTILER_API_KEY=<your_maptiler_access_token>`
- Backend optional variables (api/src/config/env.ts):
  - `PORT` (default: 3000)
  - `IDENTITY_API_URL` (default: http://localhost:3001)
  - `LANDING_PAGE_URL` (default: http://localhost:3002)

### 3) Run in development
```sh
# Runs API (dev) and Frontend (dev) concurrently
npm run start
```
Access:
- Frontend: http://localhost:5173
- API base: http://localhost:3000/api
- Swagger UI: http://localhost:3000/api/docs

Notes:
- CORS is preconfigured to allow the frontend origin http://localhost:5173.

### 4) Build for production
```sh
npm run build
```
This builds both workspaces (frontend and api).

## Features
- Frontend
  - Full-screen 2D/3D map (MapLibre GL), layers, asset visualisation, searches, analysis tools
  - React 19 + Vite 6 toolchain, testing with Vitest and Testing Library
- API
  - Express 5 + TypeScript, Swagger OpenAPI 3 docs at /api/docs
  - Endpoints for health, auth, UI data (layers, assets), GeoJSON processing, and location/asset analysis
  - Configurable via environment variables; CORS enabled for local dev

## API Documentation
When the API is running, Swagger UI is available at:
- http://localhost:3000/api/docs

Illustrative routes (mounted under /api):
- GET /health – service health
- GET /auth/user – current user details
- POST /auth/logout – logout
- GET /ui/search – location search
- GET /ui/layers – available layers
- GET /ui/assets – available assets
- GET /ui/substation-geojson, GET /ui/power-line-geojson – sample GeoJSON
- POST /ui/layer/:layerId – process layer GeoJSON
- POST /ui/location/analyse, POST /ui/asset/analyse – analysis endpoints

## Testing
- Backend (API):
  ```sh
  cd api
  npm test          # run Jest tests
  npm run test:coverage
  ```
- Frontend:
  ```sh
  cd frontend
  npm test          # run Vitest tests
  npm run test:coverage
  ```

## Docker
Pre-build the applications, then build the images:
```sh
# Build workspaces
npm --workspace api run build
npm --workspace frontend run build

# Build images
docker build -f Dockerfile.backend -t nova-backend .
docker build -f Dockerfile.frontend -t nova-frontend .
```
Run containers locally:
```sh
# API (listens on 3000 in the container)
docker run -p 3000:3000 --rm nova-backend

# Frontend (served by nginx on 8080)
docker run -p 8080:8080 --rm nova-frontend
```

## Kubernetes (manifests provided)
Kustomize bases are provided under deployment/k8s for backend and frontend. Update image references (placeholders like `nova-*-image:template`) via your pipeline or overlays.
- Backend deployment exposes containerPort 80 (map from service/ingress to your backend image’s port as applicable).
- Frontend deployment exposes containerPort 8080.

## Public Funding Acknowledgment
This repository has been developed with public funding as part of the National Digital Twin Programme (NDTP), a UK Government initiative. NDTP, alongside its partners, has invested in this work to advance open, secure, and reusable digital twin technologies for any organisation, whether from the public or private sector, irrespective of size.

## Licensing
This repository, including all source code, documentation, configuration files, and related materials, is licensed under the:

**NDTP InnerSource Licence – Version 1.0**
See [LICENSE.md](LICENSE.md) for the full licence text.

> ⚠️ This repository is not open source.
> Redistribution, disclosure, or publication of any part of this repository is prohibited without the explicit, written approval of the NDTP Management Team.

All intellectual property rights are held by the Department for Business and Trade (UK) as the governing entity for the National Digital Twin Programme (NDTP).

## Security and Responsible Disclosure
We take security seriously. If you believe you have found a security vulnerability in this repository, please follow our responsible disclosure process outlined in SECURITY.md.

## Software Bill of Materials (SBOM)
This project provides a Software Bill of Materials (SBOM) to help users and integrators understand its dependencies.

### Current SBOM
Download the latest SBOM for this codebase from your platform’s dependency graph (e.g., GitHub: ../../dependency-graph/sbom).

## Contributing
We welcome contributions that align with the Programme’s objectives. Please read our CONTRIBUTING.md guidelines before submitting pull requests.

## Acknowledgements
This repository has benefited from collaboration with various organisations. For a list of acknowledgments, see ACKNOWLEDGEMENTS.md.

## Support and Contact
For questions or support, check our Issues or contact the NDTP team by emailing ndtp@businessandtrade.gov.uk.

Maintained by the National Digital Twin Programme (NDTP).

© Crown Copyright 2025. This work has been developed by the National Digital Twin Programme and is legally attributed to the Department for Business and Trade (UK) as the governing entity.