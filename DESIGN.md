# Polymaker Filament Presets Design System

## 1. Atmosphere & Identity

The interface is a compact, technical download workspace with translucent panels, restrained typography, and Polymaker teal used as the identifying accent. Its signature is the same information-dense surface system in two contexts: a dark standalone theme and a light wiki embed theme.

## 2. Color

### Core tokens

| Role | Token | Dark theme | Wiki theme | Usage |
| --- | --- | --- | --- | --- |
| Page background | `--bg-dark` | `#0d0d12` | `var(--wiki-bg-tint)` | Page canvas |
| Card background | `--bg-card` | `rgba(255, 255, 255, 0.05)` | `rgba(255, 255, 255, 0.96)` | Cards, sections, modal surfaces |
| Card hover | `--bg-card-hover` | `rgba(255, 255, 255, 0.08)` | `rgba(230, 250, 250, 1)` | Hovered surfaces |
| Border | `--border` | `rgba(255, 255, 255, 0.1)` | `rgba(15, 23, 42, 0.08)` | Panel and control outlines |
| Primary text | `--text` | `#e4e4e7` | `#111827` | Headings and body text |
| Muted text | `--text-muted` | `#a1a1aa` | `#6B7280` | Labels and secondary copy |
| Brand accent | `--accent` | `#00CCCC` | Inherited | Links, focus, primary actions |
| Accent highlight | `--accent-light` | `#4DE1E1` | Inherited | Hover and highlighted links |
| Gradient start | `--gradient-start` | `#00A3A3` | Inherited | Brand gradients and wiki links |
| Gradient end | `--gradient-end` | `#00CCCC` | Inherited | Brand gradients |
| Wiki tint | `--wiki-bg-tint` | `#E6FAFA` | `#E6FAFA` | Wiki background tint |
| Wiki link | `--wiki-link` | Not set | `var(--accent)` | Wiki link states |
| Wiki link hover | `--wiki-link-hover` | Not set | `var(--accent)` | Wiki link hover states |

### Theme rules

- The dark theme is the default `:root` system.
- `body.theme-wiki` overrides surface, border, text, shadow, and link tokens without changing component structure.
- Existing semantic tokens must be reused before adding direct color values.

## 3. Typography

### Font stack

- Primary: self-hosted `Figtree`, followed by `Noto Sans SC`, then `sans-serif`.
- Figtree provides normal and italic variable faces from weight `300` through `900`, with `font-display: swap`.
- Code inside installation steps keeps the project font stack and adds `monospace` as its final fallback.

### Existing scale and hierarchy

| Pattern | Size | Weight | Line height / tracking |
| --- | --- | --- | --- |
| Hero title | `clamp(1.25rem, 3vw, 1.6rem)` | `700` | `1`; `-0.01em` in English |
| Section and modal titles | `1rem` to `1.05rem` | `600` | Inherited |
| Product and control titles | `0.88rem` to `0.95rem` | `600` | `1.25` where declared |
| Control and button text | `0.8rem` to `0.9rem` | `500` to `600` | Inherited |
| Supporting copy | `0.75rem` to `0.8rem` | `400` to `500` | `1.3` to `1.5` where declared |
| Small labels and credits | `0.7rem` to `0.75rem` | `500` to `600` | Uppercase labels use `0.03em` tracking |

Chinese hero text uses the existing language-specific spacing adjustments in `style.css`; translations do not alter component hierarchy.

## 4. Spacing & Layout

### Page layout

- `.page` is centered with `max-width: 1400px`, horizontal padding of `1rem`, and a full-viewport-height flex column.
- The mobile breakpoint is `640px`; page horizontal padding becomes `0.75rem` there.
- Filters use an auto-fitting grid and become two columns at the mobile breakpoint.
- The preset list is a flexible panel with scrollable table content and a maximum height of `60vh`.

### Existing spacing conventions

- Compact inline and control gaps use the existing `0.15rem`, `0.2rem`, `0.28rem`, `0.3rem`, `0.35rem`, `0.4rem`, and `0.5rem` values.
- Panel and component padding primarily uses `0.5rem`, `0.6rem`, `0.75rem`, and `1rem` combinations.
- Section separation uses `1rem`; accordion items use a `0.5rem` gap.
- Preserve these established values when extending an existing selector. Do not introduce a new spacing scale for a one-off change.

### Shape tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--radius` | `8px` | Controls, accordion items, nested panels |
| `--radius-lg` | `12px` | Cards, issue sections, modal surfaces |

Pill controls use the existing `999px` radius where a circular or capsule shape is required.

## 5. Components

### Cards and sections

- **Structure:** `.card` or a semantic section wrapper around its title and content.
- **Surface:** `--bg-card`, `--border`, `--radius-lg`, backdrop blur, and the shared shadow convention.
- **Variants:** filters, slicer selector, preset list, warnings, and known issues.
- **Responsive behavior:** compact padding at the `640px` breakpoint.

### Buttons and controls

- **Structure:** native buttons with inherited typography; SVG is used for action icons.
- **Variants:** primary, secondary, download, icon, theme toggle, and dropdown toggle.
- **States:** hover, focus-visible, disabled, loading, selected, and hidden states are represented by selectors or state classes.
- **Accessibility:** retain native button semantics and visible focus treatment.

### Dropdowns and filters

- **Structure:** `.dropdown`, `.dropdown-toggle`, and `.dropdown-menu` with `.dropdown-option` children.
- **States:** `.is-open`, `.is-active`, and `.is-disabled` control interaction and visibility.
- **Theme behavior:** dark and wiki themes share structure and override only presentation.

### Preset table

- **Structure:** a semantic table inside `.table-wrap` with a sticky header and scrollable overflow.
- **Presentation:** fixed layout, compact type, tokenized borders, and theme-specific header treatment.
- **Responsive behavior:** cell padding and type size reduce at the mobile breakpoint.

### Modals

- **Structure:** `.modal`, overlay, content, header, body, and action controls.
- **State:** `.is-open` enables pointer interaction and reveals the modal; ARIA state is updated by JavaScript.
- **Surface:** uses the shared card tokens, large radius, and elevated modal shadow.
- **Conversion guide variant:** uses a wider modal, a warning panel, localized step text, and language-specific screenshots with reserved dimensions and lazy loading.

### Accordion

- **Structure:** `.accordion` contains `.accordion-item`; each item contains a native `.accordion-header` button followed by `.accordion-content` and `.accordion-body`.
- **Initial folded state:** apply `.is-collapsed` to `.accordion-item` and `aria-expanded="false"` to its header button.
- **Expanded state:** the shared JavaScript removes `.is-collapsed` and sets `aria-expanded="true"`.
- **Behavior:** `app.js` binds every `.accordion-header`, so issue sections must reuse this exact class and ARIA pattern rather than add a separate interaction.
- **Resolved history:** `.resolved-issues-group` is the final compact `.accordion-item` inside the Known Issues accordion. A plain divider and muted text distinguish it from ongoing warning items; its header has no background or padding. A centered minimum height balances the label vertically between the divider and card edge. A small arrow sits directly after the label and rotates with the shared accordion state. The collapsed header is the only resolved-history row visible initially, and expanding it reveals the semantic `.resolved-issue-title` and issue details without nesting another accordion.

## 6. Motion & Interaction

| Convention | Value | Usage |
| --- | --- | --- |
| Shared transition | `--transition: 0.15s ease` | Borders, backgrounds, colors, shadows, and small transforms |
| Accordion icon | `transform 0.2s ease` | Rotates when an item is collapsed |
| Accordion content | `max-height 0.3s ease, padding 0.3s ease` | Existing expand and collapse behavior |
| Modal content | `transform 0.2s ease` | Scale and vertical entrance |

Interactive components preserve the existing hover and focus-visible states. State changes are represented by classes such as `.is-open`, `.is-collapsed`, `.is-active`, `.is-disabled`, and `.is-hidden`, with ARIA attributes updated alongside visual state where implemented.

## 7. Depth & Surface

The existing strategy is mixed: translucent tonal surfaces are separated by tokenized borders, backdrop blur, and shadows. Standard cards use `--shadow: 0 2px 12px rgba(0, 0, 0, 0.35)` in the dark theme and `0 8px 28px rgba(148, 163, 184, 0.35)` in the wiki theme. Modals and open dropdowns use stronger existing shadows to indicate elevation. New sections that belong to an established component family must share that family’s surface and depth rules rather than introduce a distinct treatment.
