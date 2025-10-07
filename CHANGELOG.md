# Changelog 

**Repository:** `NOVA`  
**Description:** `Tracks all notable changes, version history, and roadmap toward 1.0.0 following Semantic Versioning.`  

All notable changes to this repository will be documented in this file.

This project follows **Semantic Versioning (SemVer)** ([semver.org](https://semver.org/)), using the format:


`[MAJOR].[MINOR].[PATCH]` 
- **MAJOR** (`X.0.0`) – Incompatible API/feature changes that break backward compatibility. 
- **MINOR** (`0.X.0`) – Backward-compatible new features, enhancements, or functionality changes. 
- **PATCH** (`0.0.X`) – Backward-compatible bug fixes, security updates, or minor corrections. 
- **Pre-release versions** – Use suffixes such as `-alpha`, `-beta`, `-rc.1` (e.g., `2.1.0-beta.1`). 
- **Build metadata** – If needed, use `+build` (e.g., `2.1.0+20250314`). 

---

## [0.90.3] - 2025-10-08

### Added
- Privacy notice


## [0.90.2] - 2025-07-24

### Added
- Power grid connectivity feature enabling substation selection and connectivity distance display (API + UI) (DPAV-1158).
- Base 3D mapping support and 3D asset view; asset panel; popups and properties panel.
- Heatmap functionality sourced from API data layers; limits and user parameter support for data layers (DPAV-1000, DPAV-994).
- Search bar (top-left) with initial behavior and refactored data-provider logic (DPAV-1129, DPAV-998).
- API services/endpoints for layers and search; associated unit tests and coverage improvements.
- UI enhancements: asset details hover popover and asset suitability hover icon (DPAV-1002).
- Data science module with initial ML algorithm for optimal location and docs/templates.

### Fixed
- Multiple UI defect batches including asset marker hover/expansion, panel wording, button display and heights, theme/styling cleanup, and exit view tweaks.
- Functional fixes: heatmap algorithm adjustments based on feedback, polygon delete button behavior, retain 3D asset bearing on placement, reapply heatmap after style change, confirmation popup placement, dimmed mask persistence, prevent wind turbine stats re-rolling, prevent asset marker loss on canceled edit.
- Visual fixes: NOVA logo, asset marker styling.
- Test stability: numerous frontend specs and non-running tests corrected.

### Changed
- UI cleanup and theme updates across components.
- CI/CD and OSPO workflows synchronized; added SBOM generation and changelog pointer to releases; removed obsolete OSS file checker workflow.
- Kubernetes and Docker deployment adjustments (manifests, config maps/secrets, Dockerfiles, path tweaks) including backend API deployment fixes; minor docs updates (README spacing).

---

## [0.90.0] - 2025-06-10

### Added
- Initial pre-stable release of NOVA with baseline frontend application and API skeleton, including production deployment scripts and release pipelines.

### Fixed
-  NA

### Changed
- 

---

## Future Roadmap to `1.0.0` 

The `0.90.x` series is part of NDTP’s **pre-stable development cycle**, meaning: 
- **Minor versions (`0.91.0`, `0.92.0`...) introduce features and improvements** leading to a stable `1.0.0`. 
- **Patch versions (`0.90.1`, `0.90.2`...) contain only bug fixes and security updates**. 
- **Backward compatibility is NOT guaranteed until `1.0.0`**, though NDTP aims to minimise breaking changes. 

Once `1.0.0` is reached, future versions will follow **strict SemVer rules**. 

---

## Versioning Policy 

1. **MAJOR updates (`X.0.0`)** – Typically introduce breaking changes that require users to modify their code or configurations. 
- **Breaking changes (default rule)**: Any backward-incompatible modifications require a major version bump. 
- **Non-breaking major updates (exceptional cases)**: A major version may also be incremented if the update represents a significant milestone, such as a shift in governance, a long-term stability commitment, or substantial new functionality that redefines the project’s scope. 
2. **MINOR updates (`0.X.0`)** – New functionality that is backward-compatible. 
3. **PATCH updates (`0.0.X`)** – Bug fixes, performance improvements, or security patches. 
4. **Dependency updates** – A **major dependency upgrade** that introduces breaking changes should trigger a **MAJOR** version bump (once at `1.0.0`). 

---

## How to Update This Changelog 

1. When making changes, update this file under the **Unreleased** section. 
2. Before a new release, move changes from **Unreleased** to a new dated section with a version number. 
3. Follow **Semantic Versioning** rules to categorise changes correctly. 
4. If pre-release versions are used, clearly mark them as `-alpha`, `-beta`, or `-rc.X`. 

---

**Maintained by the National Digital Twin Programme (NDTP).** 

© Crown Copyright 2025. This work has been developed by the National Digital Twin Programme and is legally attributed to the Department for Business and Trade (UK) as the governing entity.

Licensed under the NDTP InnerSource Licence – Version 1.0.

For full licensing terms, see [LICENSE.md](LICENSE.md).

