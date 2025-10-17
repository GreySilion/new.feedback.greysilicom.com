# Pricing Plans Component

A responsive and animated pricing section for your Feedback Platform's landing page, featuring three distinct pricing tiers with smooth animations and hover effects.

## Features

- Three pricing tiers: Standard, Premium, and Custom
- Responsive design (1 column on mobile, 3 columns on desktop)
- Smooth animations using Framer Motion
- Hover effects with scale and glow
- "Most Popular" badge for the Premium plan
- Gradient accents and modern card design
- Accessible and keyboard-navigable

## Installation

1. Ensure you have the required dependencies installed:
   - `framer-motion`
   - `lucide-react`
   - `next/link` (comes with Next.js)

2. Import the component in your page:

```tsx
import PricingPlans from '@/app/components/PricingPlans/PricingPlans';
```

## Usage

Simply include the component in your page:

```tsx
<PricingPlans />
```

## Customization

The component is highly customizable through the `pricingPlans` array in the component file. You can modify:
- Plan names and prices
- Feature lists
- Color schemes
- Button text and actions
- Animation effects

## Styling

The component uses Tailwind CSS for styling. You can customize the colors, spacing, and other styles by modifying the Tailwind classes in the component.

## Accessibility

- Semantic HTML5 elements
- Proper heading hierarchy
- Keyboard navigation support
- Sufficient color contrast
- ARIA attributes where needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 12+)
- Chrome for Android

## License

MIT
