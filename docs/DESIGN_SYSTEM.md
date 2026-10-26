# QueueLess Design System

## Principles & Visual Identity

The QueueLess design system is inspired by the calm typography, generous whitespace, and restrained product craft of Fernand ([getfernand.com](https://getfernand.com/)), adapted for healthcare navigation:

1. **Calm, High-Contrast Readability**: Healthcare navigation happens in stressful moments. Interfaces must be calm, free of visual noise, and immediately legible.
2. **Transparent Data Provenance**: Simulated queue models, historical averages, and verified factual details (addresses, phone numbers, government health schemes) are clearly distinguished.
3. **No AI Clutter / No Artificial Tropes**: No oversized glowing pills, no generic floating glass cards, no fake live tickers, and no medical diagnosis claims.
4. **Predictable Component System**: Reusable utility classes and shared token primitives ensure consistency across discovery, comparison, and detail pages.

---

## Color Tokens

| Token | Hex / Value | Usage |
|---|---|---|
| Canvas Background | `#ffffff` / `#fbfcfd` | Standard light surface for data and comparison views |
| Canvas Inset | `#f6f8fa` | Subtle secondary background for preview sections |
| Navy Dark Hero | `#07101c` | High-contrast hero section with terrain canvas |
| Primary Blue | `#2563eb` (`hover: #1d4ed8`) | Primary actions, key badges, links |
| Subtle Blue Tint | `#eff6ff` / `#dbeafe` | Selected state backgrounds, icon containers |
| Neutral Ink Primary | `#0f172a` | Headers, titles, primary text |
| Neutral Ink Secondary| `#334155` / `#64748b` | Body copy, descriptions |
| Neutral Ink Muted | `#94a3b8` / `#cbd5e1` | Subtitles, disabled states, borders |
| Border Standard | `#e2e8f0` / `#d1d5db` | Card borders, inputs, hairline dividers |
| Emergency Rose | `#e11d48` / `#be123c` | Urgent emergency notices, 108/112 call triggers |
| Emergency Tint | `#fff1f2` / `#fecdd3` | Emergency banner background and borders |
| Success Emerald | `#16a34a` / `#15803d` | Lowest wait indicator, available doctors |
| Warning Amber | `#f59e0b` / `#b45309` | High queue load, simulated data badges |

---

## Navigation

- Sticky landing-page navigation uses the deep navy surface (`#07101c`) with high-contrast light labels and a blue primary action.
- Data pages retain the translucent white navigation surface for continuity with their light canvas.
- Emergency navigation remains rose-colored to keep the action visually distinct.

---

## Typography

Font family: **Inter**, system-ui, -apple-system, sans-serif.

- **Display Headline**: `clamp(2.25rem, 5vw, 3.75rem)`, font-weight 600, line-height 1.12, letter-spacing `-0.025em`.
- **Section Heading**: `1.5rem` to `1.875rem`, font-weight 600, letter-spacing `-0.02em`.
- **Card Title**: `0.875rem` to `1rem`, font-weight 600, letter-spacing `-0.01em`.
- **Body Regular**: `0.875rem` (14px), line-height 1.6, text color `#334155`.
- **Caption / Meta**: `0.75rem` (12px) to `0.6875rem` (11px), font-weight 500, text color `#64748b`.
- **Mono Tags**: Font mono, uppercase, letter-spacing `0.06em` for numerical badges.

---

## Component Standards

### 1. Buttons (`.btn`)
- `.btn-primary`: Blue background (`#2563eb`), white text, 8px border-radius.
- `.btn-secondary`: White card background, `#d1d5db` border, subtle shadow.
- `.btn-ghost-dark`: Translucent white border and text for dark hero surfaces.
- `.btn-danger`: Rose-red background (`#e11d48`), white text for emergency callouts.
- Sizing: `.btn-sm` (padding 6px 12px), `.btn-lg` (padding 11px 22px).

### 2. Cards (`.card`)
- Base: White background, 1px solid `#e2e8f0`, 12px border radius.
- Interactive: `.card-hover` adds smooth border transition to `#93c5fd` and subtle blue elevation shadow (`0 4px 20px rgba(37, 99, 235, 0.07)`).

### 3. Badges (`.badge`)
- Pill-shaped (`rounded-full`), 2px-9px padding, font-weight 600, text size `0.6875rem` (11px).
- Variants: `.badge-blue`, `.badge-green`, `.badge-red`, `.badge-amber`, `.badge-gray`.

### 4. Hourly Forecast Bars (`.bar-track`, `.bar-fill`)
- Track: `#f1f5f9` rounded bar, height 5px.
- Fill: Blue by default, emerald (`.bar-fill-green`) for the suggested lowest-wait arrival slot, amber (`.bar-fill-amber`) for hours exceeding 65% capacity.

---

## Accessibility & Motion

- **Keyboard Navigation**: Explicit `:focus-visible` styling (`outline: 2px solid #2563eb`, `outline-offset: 2px`) on all interactive buttons, inputs, and hospital card triggers.
- **Screen Reader Clarity**: `aria-label` attributes on breadcrumbs, telephone anchors, and icons.
- **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, transitions and canvas animation loops are cancelled, rendering a single sharp frame.
