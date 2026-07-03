---
name: Luminous Finance
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb3b0'
  on-secondary: '#670211'
  secondary-container: '#881d24'
  on-secondary-container: '#ff9996'
  tertiary: '#f9bd22'
  on-tertiary: '#402d00'
  tertiary-container: '#ce9a00'
  on-tertiary-container: '#4a3500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#881d24'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-currency:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 20px
  stack-gap: 16px
  element-gap: 12px
  glass-margin: 8px
---

## Brand & Style

The design system is centered on the concept of "Clarity through Depth." Designed for high-frequency mobile financial tracking, it utilizes a **Glassmorphic** aesthetic to create a sense of lightness and premium quality. By layering translucent surfaces over vibrant, organic background gradients, the UI minimizes cognitive load while maintaining a sophisticated, modern feel.

The brand personality is **Trustworthy, Visionary, and Precise**. It avoids the heavy, static feel of traditional banking apps in favor of a dynamic interface that feels like a tool for the future. The emotional response should be one of "Financial Calm"—where complex data feels organized and airy rather than claustrophobic.

## Colors

The palette is anchored by **Emerald Green (#10B981)**, representing growth and liquidity. In the default dark mode, the background utilizes a deep charcoal-to-forest-green gradient to provide the necessary contrast for glass panels to "shimmer."

### Functional Palette
- **Primary (Success/Income):** Emerald Green. Used for CTA buttons, positive balances, and income streams.
- **Secondary (Danger/Expense):** Coral Red. Used for spending alerts, negative balances, and "Delete" actions.
- **Tertiary (Warning):** Amber. Used for budget caps and pending transactions.
- **Surface:** Translucent White (10-15% opacity) for Light Mode or Translucent Black (20-30% opacity) for Dark Mode, both featuring a heavy backdrop blur.

## Typography

This design system utilizes **Inter** for its neutral, highly legible character, which is essential for reading financial figures at a glance. For technical data and small labels (like transaction timestamps or account numbers), **Geist** is used to provide a precise, developer-tool aesthetic that reinforces the feeling of accuracy.

High-contrast font weights (700 for totals, 400 for descriptions) create a clear information hierarchy. Numerical data should always use tabular lining to ensure columns of figures align perfectly in lists and tables.

## Layout & Spacing

The layout follows a **Fluid Mobile Grid** with a 4px base unit. Because glassmorphic panels require "breathing room" to show the background blur, the system uses generous 20px side margins.

- **The Stack:** Components are organized in vertical stacks with 16px gaps.
- **Panel Insets:** Content within glass cards should have at least 16px of internal padding to prevent text from hitting the semi-transparent borders.
- **Floating Navigation:** The primary navigation resides in a floating glass bar at the bottom of the screen, offset by 16px from the screen edge to maintain the "layered" appearance.

## Elevation & Depth

Depth is not communicated via shadows alone, but through **Backdrop Blur** and **Fresnel Borders**.

1.  **Level 0 (Background):** A soft radial gradient that moves subtly to suggest depth.
2.  **Level 1 (Default Card):** 20px backdrop blur, 1px solid white border at 10% opacity, and a subtle 4% opacity drop shadow.
3.  **Level 2 (Active/Modal):** 40px backdrop blur, 1.5px border at 20% opacity. This layer appears visually closer to the user.
4.  **Highlights:** Top-left "inner glow" or "light leak" effects are applied to buttons to give them a tactile, glass-like sheen.

## Shapes

The design system uses a **Rounded** shape language to soften the technical nature of financial data. 
- **Cards & Panels:** Use `rounded-xl` (24px) to create a friendly, modern container.
- **Buttons & Inputs:** Use `rounded-lg` (16px) for a comfortable touch target.
- **Chips:** Always use pill-shaped (full radius) to distinguish them from interactive buttons.

Borders must be consistent: 1px width for all glass containers to maintain the "thin-sheet-of-glass" metaphor.

## Components

### Buttons
- **Primary:** Solid Emerald Green with a subtle "inner-glass" shine. High contrast text (White or Deep Green).
- **Secondary (Glass):** Translucent background (10%) with a defined 1px white border. 
- **Icon Buttons:** Circular glass containers with Lucide-style line icons.

### Glass Cards
The primary container for all financial data. Cards should never have a 100% opaque background. They must use `backdrop-filter: blur(20px)` and a thin, low-opacity stroke. For negative expense cards, a faint Coral tint may be applied to the glass itself.

### Inputs
Search and numeric inputs use a "sunken" glass effect. This is achieved by using a darker translucent background than the parent card and an inner shadow to suggest the field is etched into the surface.

### Chips & Tags
Small, pill-shaped elements used for categorizing expenses (e.g., "Food", "Travel"). They use a low-opacity version of the category color with a high-saturation text label.

### Lists
Transaction lists should not use dividers. Instead, each transaction is its own subtle glass tile, or they are grouped within a single glass panel with 12px of vertical spacing between entries.