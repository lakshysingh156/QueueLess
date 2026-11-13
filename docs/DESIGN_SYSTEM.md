# QueueLess Design System

## Principles

1. **Calm, high-contrast readability:** Make key actions and care information easy to scan, especially in stressful situations.
2. **A coherent product, not a set of pages:** The public landing page, care workspace, emergency guide, and account preview share one dark visual language while retaining layouts suited to their purpose.
3. **Desktop-first workspace:** The care experience uses a persistent navigation rail, a compact utility bar, clear section hierarchy, and information-dense panels. Smaller screens retain access to the same routes.
4. **Transparent data provenance:** Synthetic queues and unverified directory details are identified wherever they are shown. QueueLess does not diagnose or dispatch emergency services.
5. **Functional affordances:** Search controls, navigation, filters, and emergency actions should perform the action their labels promise; avoid fake status indicators and disabled-looking controls without an explanation.

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| Application background | `#0b0c0f` | Workspace canvas |
| Sidebar / secondary surface | `#0e1013` | Navigation rail and supporting regions |
| Panel surface | `#111317` | Cards, lists, and dashboard sections |
| Raised surface | `#15181d` | Inputs, selected states, and nested panels |
| Standard border | `#23262d` | Panel outlines and dividers |
| Primary text | `#f0f1f3` | Headings and key values |
| Secondary text | `#9298a4` | Descriptions and supporting details |
| Primary action | `#239cff` | Search and primary actions |
| Success | `#35c58b` | Positive and lowest-estimate indicators |
| Emergency | `#ff6473` | Emergency navigation and warnings |
| Caution | `#eab54d` | Unverified details and caution states |

## Navigation

- The public site has a compact horizontal header.
- Care routes use a fixed desktop sidebar grouped by workspace, care discovery, and safety.
- The utility bar provides working symptom/department search; `Ctrl+K` focuses it.
- The active route is visibly selected and marked with `aria-current="page"`.
- Emergency navigation stays visually distinct and never substitutes for direct emergency contact.

## Typography

Font family: **Inter**, system-ui, -apple-system, sans-serif.

- Page titles: 24–31px, medium weight, tight tracking.
- Panel titles: 13–16px, medium weight.
- Body copy: 11–14px, with comfortable line-height.
- Labels and metadata: 9–11px; use sparingly and preserve contrast.
- Monospaced uppercase overlines distinguish section metadata from user-facing content.

## Components

- **Primary actions:** Blue, high-contrast buttons with concise verbs and visible hover/focus states.
- **Panels:** Dark raised surfaces, subtle one-pixel borders, and restrained radii; avoid heavy shadows.
- **Status badges:** Blue for informational states, green for positive states, amber for caution, and rose for emergency.
- **Queue forecast:** Muted dark track, blue default estimate, green suggested slot, and amber elevated queue.
- **Empty/error states:** Explain what happened and provide a clear recovery action when available.

## Accessibility and Motion

- Interactive controls have keyboard focus indicators and meaningful accessible names.
- Search is operable by keyboard, including the displayed shortcut.
- Emergency contact links remain actual `tel:` links.
- Respect `prefers-reduced-motion` and avoid relying on color alone to communicate status.
