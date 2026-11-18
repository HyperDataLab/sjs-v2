# UI migration checklist

## Target

- Use shadcn/ui style source components as the shared UI core, Tailwind CSS v4 for component styling, and Framer Motion for interaction and page transitions.
- Give authenticated researcher pages one responsive dashboard shell with consistent navigation and content spacing.
- Retire handwritten page styles only after their replacement is implemented and the stylesheet has no remaining consumers.
- Keep data fetching, routes, role checks, and page behavior intact during the visual migration.

## Progress

- [x] Add Tailwind CSS v4 to Vite and introduce shared shadcn-style Button and Card primitives.
- [x] Add reusable Input, Badge, and Skeleton primitives.
- [x] Establish a shared primitive/semantic/component token system and Tailwind color mapping.
- [x] Map Bootstrap buttons, cards, forms, tabs, dropdowns, and pagination to shared design tokens.
- [x] Add shared page container/header primitives and use them in dashboard and project-list pages.
- [x] Point analytics brand, neutral, and typography tokens to the shared system.
- [x] Add a responsive dashboard shell with desktop sidebar, mobile navigation drawer, and Framer Motion transitions.
- [x] Route authenticated researcher pages through the shared shell; keep admin navigation in its existing admin layout.
- [x] Constrain all authenticated researcher route roots to the same responsive dashboard content canvas.
- [x] Align project analytics navigation to shared page-header and button primitives.
- [x] Migrate the researcher dashboard, statistics, publication chart, recent projects, quick links, trending keywords, and top-author table to shared UI primitives and Tailwind utilities.
- [x] Migrate project create/edit forms to shared page, header, card, and button primitives; align project detail loading/error/content frames.
- [x] Remove the retired researcher dashboard and chart-range stylesheets after confirming they have no remaining consumers.
- [ ] Inventory and migrate remaining route-specific styles and bootstrap-based components by route.
- [ ] Migrate project detail content, project cards, and shared dialogs to shared primitives.
- [ ] Migrate search, articles, authors, journals, keywords, geography, profile, and account pages.
- [ ] Migrate admin pages and shared dialogs/forms/tables.
- [ ] Replace remaining handwritten component styles with shared primitives and Tailwind utilities; retain vendor styles needed for charts, KaTeX, and other embedded libraries.
- [ ] Remove Bootstrap CSS and React Bootstrap only after no route or component depends on them.
- [ ] Delete each legacy stylesheet only after its imports and class usages are gone.
- [ ] Check desktop/mobile layouts, keyboard focus, reduced motion, loading/error/empty states, then run the project build and lint checks.

## Current inventory

At the start of this migration, 92 stylesheet imports/usages were found in JavaScript/JSX. Two dashboard stylesheets have since been removed. Bootstrap's global stylesheet remains active because unmigrated routes still depend on its classes. Researcher pages now share a dashboard canvas and semantic Bootstrap token bridge; project create/edit form shells and project detail page frames use shared primitives. Route-specific content styles across the remaining feature families are still in migration.
