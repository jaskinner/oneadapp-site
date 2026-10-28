# oneAD theme

Source of truth: [`theme/tokens.css`](theme/tokens.css). The app vendors that file. This site inlines the same file in `index.html`. `node scripts/check-inlined-tokens.mjs` fails if the inlined `:root` and `.dark` blocks differ from the file.

Direction is Call Sheet: warm paper, ink rules, one marigold action. The site is light-only. `.dark` is in the token file for the app. Do not put marigold on `--accent` (that token is a hover fill). Use `--signal`. Do not use `--signal` as text on paper (1.89:1). The signal button is flat: 2px ink border, 2px radius, no hard offset shadow, no translate on hover.

`--danger` is badge text. In light it is the same hex as `--destructive`. In dark, `--destructive` on `--danger-bg` is 2.48:1, so badge text uses `--danger` (`#FF9C92`, 8.04:1) and button text stays `--destructive-foreground`.

Ratios below are measured from the hex (WCAG 2 relative luminance), not copied from a guess.

## Color

### Light (`:root`)

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--background` | `#F2EEE2` | page paper | foreground **15.14:1** |
| `--foreground` | `#1A1917` | text, ink | |
| `--card` / `--popover` | `#FDFBF5` | cards, dialogs | foreground **16.98:1** |
| `--primary` / `-foreground` | `#1A1917` / `#F2EEE2` | primary button | **15.14:1** |
| `--secondary` | `#E7E2D3` | secondary fills | foreground **13.57:1** |
| `--muted` | `#ECE8DB` | quiet bands, sidebar | foreground **14.33:1**; muted-foreground **6.25:1** |
| `--muted-foreground` | `#57534A` | secondary text | **6.60:1** on background, **7.40:1** on card |
| `--accent` | `#E8E3D5` | hover fill only | foreground **13.70:1** |
| `--border` | `#D6D0C0` | decorative 1px rules | not a 3:1 boundary |
| `--input` | `#857F6E` | field borders | **3.44:1** on background, **3.86:1** on card |
| `--ring` / `--link` | `#1E4FA3` | focus ring, links | **6.70:1** on background, **7.51:1** on card |
| `--signal` / `-foreground` | `#EBA010` / `#1A1917` | beta CTA only | **8.00:1** |
| `--destructive` / `-foreground` | `#A3241A` / `#FFFFFF` | error, delete | **7.43:1** |
| `--danger` / `--danger-bg` | `#A3241A` / `#FBE0DC` | declined badge | **5.95:1** |
| `--success` / `--success-bg` | `#1B6B43` / `#DDF1E5` | accepted badge | **5.51:1** |
| `--warning` / `--warning-bg` | `#7A4B00` / `#FBE7B0` | pending badge | **6.05:1** |

Sidebar tokens match the light block in `theme/tokens.css`: sidebar is `--muted`, sidebar-primary is `--primary`, sidebar-accent is `#E3DECF` (foreground **13.06:1**).

### Dark (`.dark`)

Agreed values:

| Token | Hex | Contrast |
|---|---|---|
| `--background` | `#121211` | foreground `#F1EEE7` **16.18:1** |
| `--card` / `--popover` | `#1C1B19` | foreground **14.85:1** |
| `--primary` / `-foreground` | `#F1EEE7` / `#121211` | **16.18:1** |
| `--secondary` / `--muted` | `#2A2926` | foreground **12.55:1** |
| `--muted-foreground` | `#A9A498` | **7.54:1** on background, **6.93:1** on card, **5.85:1** on muted |
| `--border` | `#3A3833` | decorative |
| `--input` | `#6F6B60` | **3.52:1** on background, **3.24:1** on card. On muted it is **2.73:1**; do not draw field borders on muted. |
| `--ring` / `--link` | `#8DB4F2` | **8.88:1** on background |
| `--signal` / `-foreground` | `#EBA010` / `#121211` | **8.54:1** |
| `--destructive` / `-foreground` | `#B3261E` / `#FFFFFF` | **6.54:1** |
| `--success` / `--success-bg` | `#6FD6A0` / `#16301F` | **7.99:1** |
| `--warning` / `--warning-bg` | `#F5C451` / `#33260A` | **9.07:1** |
| `--danger` / `--danger-bg` | `#FF9C92` / `#3A1512` | **8.04:1** |

Dark values that list did not include, chosen and checked:

| Token | Hex | Why |
|---|---|---|
| `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground`, sidebar foregrounds | `#F1EEE7` | same role as `--foreground` |
| `--popover` | `#1C1B19` | same surface as `--card` |
| `--accent` | `#34322E` | hover, one step lighter than muted. Foreground **11.04:1**, muted-foreground **5.15:1**, link **6.06:1** |
| `--sidebar` | `#2A2926` | same as muted, as in light |
| `--sidebar-primary` / `-foreground` | `#F1EEE7` / `#121211` | same as primary |
| `--sidebar-accent` | `#3C3A34` | stronger hover than `--accent`. Foreground **9.81:1**, muted-foreground **4.58:1** |
| `--sidebar-border`, `--sidebar-ring` | `#3A3833`, `#8DB4F2` | same as border and ring |

`node scripts/check-contrast.mjs` checks these pairs (4.5:1 text, 3:1 UI boundaries).

## Type

Instrument Sans, self-hosted, one variable woff2, latin subset, weight axis 400–700. File: `/fonts/instrument-sans-v1.woff2` (versioned name, immutable cache). License: `fonts/OFL.txt`. `font-display: swap`. Preload:

```html
<link rel="preload" href="/fonts/instrument-sans-v1.woff2" as="font" type="font/woff2" crossorigin>
```

Mono for labels, dates, and times is the system stack. No mono webfont.

```css
--font-sans: 'Instrument Sans', 'Instrument Sans Fallback', ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

Fallback faces are site CSS, not part of `theme/tokens.css`. Metrics come from fontaine on the shipped file (regular, `xWidthAvg` 458, which matches the capsize latin subset) and on the wght=700 instance (`xWidthAvg` 478, same as capsize bold) against Arial and Arial Bold:

| Face | `src` | `font-weight` | size-adjust | ascent | descent | line-gap |
|---|---|---|---:|---:|---:|---:|
| Regular | `local("Arial")` and the Arial Regular / ArialMT names | 400 | 102.7365% | 94.4163% | 24.3341% | 0% |
| Bold | `local("Arial Bold")`, `local("Arial-BoldMT")` | 700 | 99.5874% | 97.4019% | 25.1036% | 0% |

Weights 500 and 600 use the CSS font matching algorithm (500 → regular, 600 → bold).

| Token | Size / line-height | Use |
|---|---|---|
| `--text-xs` | 0.75rem / 1 | mono labels, badges |
| `--text-sm` | 0.875rem / 1.25 | captions, quiet note |
| `--text-base` | 1rem / 1.6 | body; 1.125rem from 640px |
| `--text-lg` | 1.25rem / 1.5 | lede |
| `--text-xl` | 1.5rem / 1.3 | h3 |
| `--text-2xl` | clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem) / 1.2 | h2, weight 700 |
| `--text-3xl` | clamp(2.25rem, 1.6rem + 3vw, 3.5rem) / 1.1 | h1, weight 700, tracking -0.02em |

## Spacing and radii

4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. Sections are 48px on small screens and 96px from 768px. Page max width 1120px. Text measure 65ch.

`--radius: 0.25rem` (4px). Buttons and inputs use 2px. Cards and the dialog use `--radius`. Pills are only the beta badge. Focus is `outline: 3px solid var(--ring); outline-offset: 2px`.

## Buttons

Signal (the "Request beta access" actions only): background `--signal`, text `--signal-foreground`, 2px ink border, radius 2px, weight 700, no offset shadow. Hover fills with ink and uses `--signal` as the text (8.00:1). Active state is `translateY(1px)`, not a hover lift. Transitions are 120ms and are removed under `prefers-reduced-motion`.

Secondary (Cancel): transparent, 2px ink border, weight 600, accent fill on hover. Minimum target size on this site is 48px (the 44px minimum, with room for the tap-target check). In-page buttons are full width below 640px. The header button stays on one line with the wordmark.

## Wordmark

Text only: "one" at 500, "AD" at 700, tracking -0.01em, ink. A 3px `--signal` bar sits under "AD". The link's accessible name is `aria-label="oneAD"`. There is no "1" mark. Favicon is `/favicon.svg`: an ink square with a 2px radius and a short signal bar, no letters.

## Page

Sticky header, height `--header-height`, with `scroll-padding-top` on `html` and `scroll-margin-top` on sections. Below 1024px the nav is a `<details>` element; the summary's name is "Menu" and the items are the same links. Opening the menu does not change the header height. Choosing a link closes it. Bands alternate `--background` and `--muted` with 1px `--border` rules. Section labels are `aria-hidden` and uppercased with `text-transform` (`01 · The problem`, and so on) over a 2px ink rule. They are not inside headings.

Cache policy is in `netlify.toml`: `max-age=31536000, immutable` only for `/fonts/instrument-sans-v1.woff2`. Every stable name uses `max-age=0, must-revalidate`.
