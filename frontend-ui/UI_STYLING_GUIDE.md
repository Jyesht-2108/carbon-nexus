# Carbon Nexus UI/UX Styling Guide

## 🎨 Design System Overview

This document outlines all visual styling applied to the Carbon Nexus frontend. **No functionality or logic was modified** - only visual presentation.

---

## 🌈 Color Palette

### Primary Colors
- **Primary**: `#0EA5A0` (Teal) - Main brand color
- **Primary Dark**: `#0C8C88` - Darker variant for gradients
- **Accent 1**: `#6366F1` (Indigo) - Secondary accent
- **Accent 2**: `#F59E0B` (Amber) - Tertiary accent

### Background Colors
- **Light Mode**: `#F8FAFC` with gradient overlay
- **Dark Mode**: `#0B0F15` with gradient overlay

### Semantic Colors
- **Muted**: `#6B7280` - Secondary text
- **Success**: Green shades for positive trends
- **Warning**: Amber/Yellow for warnings
- **Error**: Red shades for errors

---

## 🌓 Dark/Light Mode

### Implementation
- Global theme provider using Tailwind's `dark:` class
- Theme toggle in top navbar (Moon/Sun icon)
- Smooth transitions: `transition-all duration-300`
- Theme persisted in `localStorage`

### Usage
```tsx
import { useTheme } from '@/hooks/useTheme';

const { theme, toggleTheme } = useTheme();
```

### Dark Mode Styling
- Deep charcoal backgrounds
- Glass cards: `bg-white/5 backdrop-blur-xl`
- Accent glows on interactive elements
- Reduced contrast for comfort

---

## 🎭 Typography

### Font Families
- **Headings**: `Poppins` (500, 600, 700 weights)
- **Body**: `Inter` (300-700 weights)
- Loaded from Google Fonts

### Usage
```tsx
<h1 className="font-heading font-bold">Heading</h1>
<p className="font-sans">Body text</p>
```

### Scale
- Base: 14-18px
- Headings: 24-48px
- Line height: 1.6 for readability

---

## 🪟 Glass-morphism

### Glass Card
```css
.glass-card {
  @apply bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl 
         border border-gray-200/50 dark:border-gray-700/50;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}
```

### Glass Effect
```css
.glass {
  @apply bg-white/20 dark:bg-white/5 backdrop-blur-xl 
         border border-white/20 dark:border-white/10;
}
```

### Usage
- All cards use glass-card
- Overlays and modals use glass
- Sidebar and topbar have glass effect

---

## 🎬 Animations

### Framer Motion Variants

#### Fade In
```tsx
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};
```

#### Scale In
```tsx
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};
```

#### Stagger Container
```tsx
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
```

### Micro-interactions
- **Buttons**: `whileHover={{ scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}`
- **Cards**: `whileHover={{ y: -2 }}` with shadow increase
- **Icons**: Rotate on hover, scale on interaction
- **Progress bars**: Gradient animation with glow

---

## 📦 Component Styling

### Cards
- Border radius: `rounded-2xl` (16px)
- Shadow: Multi-layer soft shadows
- Hover: Lift effect with increased shadow
- Border: Subtle glass border

### Buttons
- Gradient backgrounds: `from-primary to-primary-dark`
- Glow effect: `shadow-glow`
- Rounded: `rounded-2xl`
- Hover: Scale + glow increase
- Focus: Ring with primary color

### Inputs
- Glass card background
- Border: 2px solid with focus ring
- Rounded: `rounded-2xl`
- Focus: Primary ring with offset
- Smooth transitions

### Badges/Pills
- Rounded: `rounded-full`
- Glass background with color tint
- Hover: Scale effect
- Icon + text layout

---

## 🎯 Spacing System

### Scale (8px base)
- `gap-2` = 8px
- `gap-3` = 12px
- `gap-4` = 16px
- `gap-6` = 24px
- `gap-8` = 32px

### Padding
- Cards: `p-5` or `p-6`
- Sections: `py-8` or `py-12`
- Inline elements: `px-3` to `px-5`

---

## ✨ Special Effects

### Glow Effects
```css
.shadow-glow {
  box-shadow: 0 0 20px rgba(14, 165, 160, 0.3);
}

.shadow-glow-accent1 {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
```

### Gradient Text
```tsx
<h1 className="bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Gradient Backgrounds
```tsx
<div className="bg-gradient-to-r from-primary to-primary-dark">
  Content
</div>
```

---

## 🎨 Page-Specific Styling

### Dashboard
- Staggered card animations
- Real-time pulse animations
- Gradient progress bars
- Hover lift on all cards

### Data Upload
- Animated dropzone
- Drag-active state with scale
- Progress bar with gradient glow
- Success/error states with icons

### RAG Chatbot
- Message bubbles with glass effect
- Typing indicator animation
- Smooth scroll behavior
- Document sidebar with status badges

### Activity Page
- Timeline layout
- Activity cards with hover effects
- Trend indicators with colors
- Icon animations on hover

---

## 🔧 Utility Classes

### Custom Utilities
```css
/* Glass effects */
.glass
.glass-card

/* Glow effects */
.glow-primary
.glow-accent

/* Animations */
.animate-fade-in
.animate-slide-up
.animate-scale-in
.animate-glow-pulse
```

---

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Grid Layouts
- Dashboard: 1 col mobile, 2 cols tablet, 4 cols desktop
- Cards: Responsive padding and spacing
- Sidebar: Collapsible on mobile (future enhancement)

---

## ♿ Accessibility

### Focus States
- All interactive elements have `focus-visible:ring-2`
- Ring color: Primary
- Ring offset: 2px

### Color Contrast
- WCAG AA compliant
- Dark mode optimized for reduced eye strain
- High contrast mode support (future)

### Keyboard Navigation
- Tab order preserved
- Focus indicators visible
- Skip links (future enhancement)

---

## 🎯 Animation Performance

### Best Practices Applied
- GPU-accelerated properties (transform, opacity)
- `will-change` for animated elements
- Reduced motion support (future)
- Smooth 60fps animations

### Timing
- Fast interactions: 200-300ms
- Page transitions: 400-500ms
- Ambient animations: 1-2s

---

## 🚀 Implementation Checklist

✅ Dark/Light mode toggle
✅ Glass-morphism cards
✅ Gradient text and backgrounds
✅ Smooth animations (Framer Motion)
✅ Hover micro-interactions
✅ Focus states
✅ Responsive spacing
✅ Typography hierarchy
✅ Color palette
✅ Shadow system
✅ Glow effects
✅ Progress animations
✅ Message bubble styling
✅ Upload dropzone animations
✅ Activity timeline styling

---

## 📝 Notes

- **No functionality changed** - All API calls, state management, and business logic remain identical
- **Performance maintained** - Animations are GPU-accelerated
- **Accessibility preserved** - Focus states and keyboard navigation intact
- **Theme persistence** - User preference saved to localStorage
- **Smooth transitions** - All state changes animated smoothly

---

## 🎨 Quick Reference

### Common Patterns

**Card with gradient border:**
```tsx
<Card className="border-l-4 border-l-primary">
```

**Animated button:**
```tsx
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <Button>Click me</Button>
</motion.div>
```

**Glass input:**
```tsx
<input className="glass-card rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary" />
```

**Gradient heading:**
```tsx
<h1 className="font-heading font-bold bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
  Title
</h1>
```

---

**Last Updated**: November 28, 2025
**Version**: 1.0.0
