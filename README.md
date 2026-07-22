# MyRad Images

A medical-imaging patient portal — React + Vite + TypeScript port of the original single-file HTML/JS app. Patients can request studies from imaging centers, self-upload from a CD/DVD, view images and reports, and share securely with providers, family, or friends. Includes imaging-center staff, walk-in enrollment, and provider-review views.

## Stack

- **React 18 + TypeScript** (strict)
- **Vite 6** build tooling
- **SCSS** — organized partials (`src/styles`), design tokens as CSS custom properties, mobile-first responsive
- **axios** — single client with a mock adapter that serves an in-memory, `localStorage`-persisted DB (`src/api`)
- **TanStack Query** — all server data flows through query/mutation hooks (`src/hooks`)
- **Zustand** — UI/ephemeral state only (navigation, modals, wizards, forms)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Architecture

```
src/
  api/            axios client, mock REST adapter, in-memory DB, endpoints, query keys
  components/
    common/       Icon, StudyIcon, Dropdown, SignaturePad
    layout/       AppShell, Sidebar, TopNav, BottomNav, ScreenRouter, PatientSelector
    overlays/     GetSheet, Share/Confirm/Notice/Confirm + Add Provider/Family/Center modals
  constants/      study types, body-part groups, wizard steps
  data/           seed data
  features/       one folder per screen (auth, home, images, requests, shared, wizard,
                  selfUpload, staff, profile, centers, billing, viewer, notify, help)
  hooks/          queries, mutations, useDomainData, useAppActions
  store/          Zustand slices (auth, nav, dialog, wizard, selfUpload, staff, share, forms)
  styles/         SCSS: abstracts (vars/mixins), base (tokens/responsive), components
  types/          shared domain models
```

### Data layer

The UI never touches data directly — it calls TanStack Query hooks, which call endpoint
functions, which hit the axios instance. In this demo the axios `adapter` is a small in-memory
REST server (`src/api/mockAdapter.ts`) backed by a `localStorage`-persisted store. To point at a
real backend, drop the mock adapter and set a `baseURL` in `src/api/client.ts`; the hooks and
components stay unchanged.

### Notes

- Auth, uploads, and payments are mocked (no real network/credentials), matching the source prototype.
- State persists across reloads (people, providers, centers, requests, shares, self-uploads).
