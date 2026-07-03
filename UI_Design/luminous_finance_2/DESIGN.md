---
name: Luminous Finance
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#494bd6'
  on-tertiary: '#ffffff'
  tertiary-container: '#9699ff'
  on-tertiary-container: '#1d17b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-data:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system for this financial product centers on "Trust through Transparency." It utilizes a refined **Glassmorphism** aesthetic to evoke a sense of depth and clarity, moving away from traditional, heavy corporate interfaces toward something that feels light, airy, and modern. 

The target audience consists of professionals and investors who value precision but appreciate a contemporary, high-end digital experience. The emotional response should be one of "calm confidence"—achieved through expansive whitespace, crisp typography, and subtle layering that suggests a sophisticated, multi-dimensional data environment.

## Colors
The palette is anchored by **Emerald Green (#10b981)**, representing growth and financial vitality. This is balanced against a sophisticated neutral scale built on slate and cool grays. 

- **Primary:** Used for key actions, success states, and positive trend indicators.
- **Secondary:** A deep forest green used for high-contrast text or grounding elements.
- **Background:** A soft vertical gradient starting from White (#FFFFFF) at the top to a very light gray (#f1f5f9) at the bottom.
- **Surface:** Translucent white (RGBA 255, 255, 255, 0.7) to allow the background gradient to shimmer through.
- **Text:** High-contrast Slate-900 (#0f172a) for maximum legibility in financial tables and reports.

## Typography
The typography strategy prioritizes structural clarity. **Manrope** provides a modern, geometric feel for headings. **Work Sans** is used for body copy due to its exceptional legibility and professional "grotesk" lineage. 

For financial data, account numbers, and currency, **JetBrains Mono** is employed. The monospaced nature ensures that columns of numbers align perfectly, aiding in rapid visual scanning of balance sheets and transaction histories.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. 

- **Desktop:** 1280px max-width container, centered. 24px gutters.
- **Tablet:** 768px - 1024px. Margins reduce to 32px.
- **Mobile:** <768px. Margins reduce to 16px. 

Spacing follows a strict 8px linear scale. Large components (like dashboard cards) should use `lg` (40px) padding to maintain the "Luminous" airy feel, while data-dense tables can scale down to `sm` (12px) internal padding.

## Elevation & Depth
Depth is created through a "Glass-Stack" hierarchy rather than traditional solid shadows:

1.  **Base Layer:** The soft white-to-gray gradient.
2.  **Surface Layer (Cards/Panels):** White with 70% opacity, a 20px backdrop blur, and a 1px solid white border at 50% opacity. 
3.  **Active Layer (Modals/Popovers):** White with 90% opacity, 30px backdrop blur, and a soft, diffused shadow (`0 20px 40px rgba(0,0,0,0.04)`).

This layering technique ensures the UI feels lightweight and premium, mimicking high-end physical hardware or etched glass.

## Shapes
A "Rounded" (Level 2) logic is applied across the system to soften the clinical nature of finance. 
- **Standard UI Elements:** 0.5rem (8px) for buttons, inputs, and small widgets.
- **Large Containers:** 1rem (16px) for dashboard cards and primary containers.
- **Interactive Tags:** 1.5rem (24px) for status chips and pill-style navigation items.

Edges should always be anti-aliased and smooth to maintain the professional aesthetic.

## Components
- **Buttons:** Primary buttons use a solid Emerald Green fill with white text. Secondary buttons are "ghost" style with a 1px Emerald border and a subtle glass hover effect.
- **Inputs:** Input fields are semi-transparent with a 1px light gray border. On focus, the border transitions to Emerald Green with a subtle outer glow.
- **Cards:** The hallmark of this design system. Cards must feature the 20px backdrop blur and the thin 1px white internal border to define the glass edge.
- **Chips/Status:** For "Success" (Emerald), "Warning" (Amber), and "Alert" (Rose), use low-opacity background tints (10%) with high-saturation text to maintain the "luminous" theme.
- **Data Tables:** Use horizontal dividers only (1px height, #e2e8f0). No vertical lines. Row hover states should use a 5% primary color tint to highlight the active data point.