# Meals Page Redesign - Apple-like Minimal Aesthetic

## Executive Summary

This document outlines a comprehensive redesign of the meals page to achieve a clean, minimal Apple-like aesthetic while maximizing the space available for displaying meals. The redesign focuses on reducing visual clutter, implementing consistent sizing, and creating a more refined user experience.

---

## 1. Current Design Analysis

### 1.1 Current Structure

```
Current Layout:
+--------------------------------------------------+
|  WeekTray (Fixed Header ~140px)                  |
|  [Day slots with stacked thumbnails]             |
|  [Progress bar] [Multiple action buttons]        |
+--------------------------------------------------+
|  Search Bar (Sticky ~50px)                       |
+--------------------------------------------------+
|  Horizontal Row: "Heavy Hitters" (Large cards)   |
|  Horizontal Row: "The Bench" (Medium cards)      |
|  Horizontal Row: "The Archive" (Small cards)     |
+--------------------------------------------------+
```

### 1.2 Current Issues

| Issue | Impact | Priority |
|-------|--------|----------|
| Variable card sizes (3 tiers) | Visual inconsistency, complex mental model | High |
| Heavy fixed header (~140px) | Wasted vertical space | High |
| Horizontal scrolling rows | Inefficient use of screen real estate | High |
| Multiple badges per card | Visual clutter, distracts from content | Medium |
| Busy hover states | Overwhelming interaction feedback | Medium |
| Gradient overlays on images | Reduces image clarity | Low |

---

## 2. Design Principles

### 2.1 Apple-like Design Philosophy

1. **Content First** - Let meal photos be the hero
2. **Generous White Space** - Allow content to breathe
3. **Consistent Sizing** - Uniform elements create visual harmony
4. **Subtle Hierarchy** - Use typography and spacing, not size differences
5. **Minimal Chrome** - Reduce visible UI elements
6. **Refined Interactions** - Purposeful, subtle animations
7. **Maximum Display** - Grid layout shows more meals at once

### 2.2 Visual Language

```
Apple-inspired Visual Language:
- Clean, crisp edges with subtle shadows
- Monochromatic backgrounds with content color
- Typography-driven hierarchy
- Subtle, purposeful motion
- Contextual controls (appear when needed)
- Consistent, predictable spacing
```

---

## 3. Proposed Redesign

### 3.1 New Layout Architecture

```
New Layout:
+--------------------------------------------------+
|  Minimal WeekTray (Collapsible ~60px collapsed)  |
|  [7 day circles] [Expand/Collapse] [Add]         |
+--------------------------------------------------+
|                                                  |
|  Responsive Grid of Uniform Meal Cards           |
|  +--------+  +--------+  +--------+  +--------+ |
|  |        |  |        |  |        |  |        | |
|  | Meal   |  | Meal   |  | Meal   |  | Meal   | |
|  | Card   |  | Card   |  | Card   |  | Card   | |
|  +--------+  +--------+  +--------+  +--------+ |
|                                                  |
|  +--------+  +--------+  +--------+  +--------+ |
|  |        |  |        |  |        |  |        | |
|  | Meal   |  | Meal   |  | Meal   |  | Meal   | |
|  | Card   |  | Card   |  | Card   |  | Card   | |
|  +--------+  +--------+  +--------+  +--------+ |
|                                                  |
+--------------------------------------------------+
```

### 3.2 WeekTray Redesign

**Current vs Proposed:**

| Aspect | Current | Proposed |
|--------|---------|----------|
| Height | ~140px fixed | 60px collapsed, 120px expanded |
| Day display | Stacked thumbnails with titles | Simple filled/empty circles |
| Actions | 5+ visible buttons | Contextual, minimal |
| Progress | Visible bar | Subtle indicator on hover |
| Behavior | Always expanded | Collapsible by default |

**New WeekTray Design:**

```
Collapsed State (Default):
+----------------------------------------------------------+
|  [M] [T] [W] [T] [F] [S] [S]  |  Week 3/7 filled  [+]   |
|   o   o   o   x   o   o   o   |                        |
+----------------------------------------------------------+

Expanded State (On click/tap):
+----------------------------------------------------------+
|  [M]      [T]      [W]      [T]      [F]      [S]      [S] |
|  Pasta    Salad    empty    Tacos    empty    empty    empty|
|  +1 more           +Add              +Add     +Add    +Add|
+----------------------------------------------------------+
|  [Clear Week]                    [Shop Mode]  [Settings] |
+----------------------------------------------------------+
```

**Key Changes:**
- Day circles show fill status with subtle color
- Expand/collapse on click/tap
- Actions hidden until expanded
- Minimal visual weight when collapsed

### 3.3 MealCard Redesign

**Current vs Proposed:**

| Aspect | Current | Proposed |
|--------|---------|----------|
| Size | 3 sizes (280/200/160px) | 1 uniform size |
| Image overlay | Dark gradient | Clean, no overlay |
| Badges | 3+ visible badges | Minimal, contextual |
| Hover state | Multiple elements appear | Single subtle action |
| Shadow | Visible shadow | Subtle elevation on hover |

**New MealCard Design:**

```
+---------------------------+
|                           |
|      [Meal Image]         |
|      Clean, no overlay    |
|                           |
+---------------------------+
|  Meal Title               |
|  Protein  |  Tags         |
+---------------------------+

On Hover:
+---------------------------+
|      [Meal Image]         |
|      [Quick Add +]        |  <- Subtle button appears
|                           |
+---------------------------+
|  Meal Title               |
|  Protein  |  Tags         |
+---------------------------+
```

**Card Specifications:**
- **Size**: 220px × 280px (optimal for grid layout)
- **Image ratio**: 4:3 (clean, consistent)
- **Border radius**: 16px (Apple standard)
- **Shadow**: None by default, subtle elevation on hover
- **Background**: Pure white (light) / Dark gray (dark mode)

**Badge System (Simplified):**
- **Effort indicator**: Small colored dot on hover only
- **Days since cooked**: Subtle text, no badge
- **Votes**: Hidden by default, shown in details

### 3.4 Grid Layout System

**Responsive Grid Configuration:**

```css
/* Mobile (1-2 columns) */
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
gap: 12px;

/* Tablet (3-4 columns) */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
gap: 16px;

/* Desktop (4-6 columns) */
grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
gap: 20px;

/* Large Desktop (6-8 columns) */
grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
gap: 24px;
```

**Benefits:**
- Shows 8-20+ meals at once (vs 3-5 in horizontal rows)
- Natural responsive behavior
- Efficient use of screen space
- Easy scanning and comparison

### 3.5 Tier System (Redesigned)

**Current Approach:** Visual size differentiation
**New Approach:** Subtle visual grouping with labels

```
+----------------------------------------------------------+
|  Recent Favorites                              [View All] |
|  +--------+  +--------+  +--------+  +--------+          |
|  |        |  |        |  |        |  |        |          |
|  +--------+  +--------+  +--------+  +--------+          |
+----------------------------------------------------------+
|  The Collection                                          |
|  +--------+  +--------+  +--------+  +--------+          |
|  |        |  |        |  |        |  |        |          |
|  +--------+  +--------+  +--------+  +--------+          |
|  +--------+  +--------+  +--------+  +--------+          |
|  |        |  |        |  |        |  |        |          |
|  +--------+  +--------+  +--------+  +--------+          |
+----------------------------------------------------------+
```

**Changes:**
- Two sections instead of three (Recent + Collection)
- Same card size throughout
- Subtle section headers
- "Recent" shows last 14 days favorites
- "Collection" shows all meals sorted by recency

---

## 4. Color System Refinements

### 4.1 Light Mode

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F5F7;      /* Apple system gray */
--bg-tertiary: #FAFAFA;

/* Text */
--text-primary: #1D1D1F;      /* Apple system black */
--text-secondary: #86868B;    /* Apple system gray */
--text-tertiary: #AEAEB2;

/* Accents */
--accent-primary: #007AFF;    /* Apple blue */
--accent-success: #34C759;    /* Apple green */
--accent-warning: #FF9500;    /* Apple orange */

/* Surfaces */
--surface-card: #FFFFFF;
--surface-elevated: #FFFFFF;
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.12);
```

### 4.2 Dark Mode

```css
/* Backgrounds */
--bg-primary: #000000;
--bg-secondary: #1C1C1E;
--bg-tertiary: #2C2C2E;

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #98989D;
--text-tertiary: #636366;

/* Surfaces */
--surface-card: #1C1C1E;
--surface-elevated: #2C2C2E;
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.4);
```

---

## 5. Typography System

### 5.1 Font Stack

```css
/* Primary: SF Pro Display equivalent */
--font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
                'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

/* Monospace: SF Mono equivalent */
--font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
```

### 5.2 Type Scale

```css
/* Headers */
--text-h1: 34px / 700 / -0.02em letter-spacing
--text-h2: 28px / 600 / -0.02em letter-spacing
--text-h3: 22px / 600 / -0.01em letter-spacing

/* Body */
--text-body: 17px / 400 / normal
--text-caption: 15px / 400 / normal
--text-micro: 13px / 500 / -0.01em letter-spacing

/* Card Title */
--text-card-title: 17px / 600 / -0.01em letter-spacing
--text-card-meta: 13px / 400 / normal
```

---

## 6. Animation Guidelines

### 6.1 Motion Principles

1. **Purposeful** - Every animation serves a purpose
2. **Subtle** - Enhance, don't distract
3. **Quick** - 200-300ms for most interactions
4. **Natural** - Use ease-out curves

### 6.2 Specific Animations

```css
/* Card Hover */
transition: transform 200ms ease-out, box-shadow 200ms ease-out;
transform: translateY(-2px);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

/* Card Click/Tap */
transition: transform 100ms ease-out;
transform: scale(0.98);

/* WeekTray Expand/Collapse */
transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Modal Appear */
animation: fadeSlideUp 300ms ease-out;

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 7. Component Specifications

### 7.1 WeekTray Component

```typescript
interface WeekTrayProps {
  slots: DaySlot[];
  meals: Meal[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDayClick: (dayIndex: number) => void;
  onAddMeal: () => void;
  onShopMode: () => void;
  onSettings: () => void;
}

// Behavior:
// - Default: collapsed (60px height)
// - Click to expand (120px height)
// - Day circles show fill status
// - Actions appear only when expanded
// - Swipe gesture to expand on mobile
```

### 7.2 MealCard Component

```typescript
interface MealCardProps {
  meal: Meal;
  onAdd: (meal: Meal) => void;
  onView: (meal: Meal) => void;
  showQuickAdd?: boolean;  // On hover only
}

// Behavior:
// - Uniform size (220px × 280px)
// - Clean image with no overlay
// - Title and protein visible
// - Quick add button appears on hover
// - Click anywhere to view details
// - Drag handle appears on hover (for drag mode)
```

### 7.3 MealGrid Component

```typescript
interface MealGridProps {
  meals: Meal[];
  recentMeals: Meal[];  // Last 14 days
  onAddMeal: (meal: Meal) => void;
  onViewMeal: (meal: Meal) => void;
  searchQuery?: string;
}

// Behavior:
// - Responsive grid layout
// - Two sections: Recent + Collection
// - Infinite scroll or "Load More"
// - Smooth scroll position memory
```

---

## 8. Implementation Checklist

### Phase 1: Foundation
- [ ] Update CSS variables for new color system
- [ ] Update typography system
- [ ] Create base animation utilities

### Phase 2: WeekTray Redesign
- [ ] Implement collapsible WeekTray component
- [ ] Create day circle indicators
- [ ] Add expand/collapse animation
- [ ] Move actions to expanded state only

### Phase 3: MealCard Redesign
- [ ] Create uniform card size
- [ ] Remove image overlays
- [ ] Simplify badge system
- [ ] Implement subtle hover states
- [ ] Add quick-add button on hover

### Phase 4: Grid Layout
- [ ] Replace horizontal rows with responsive grid
- [ ] Implement two-section layout (Recent + Collection)
- [ ] Add section headers
- [ ] Test responsive breakpoints

### Phase 5: Polish
- [ ] Fine-tune animations
- [ ] Test dark mode
- [ ] Optimize for mobile
- [ ] Accessibility review

---

## 9. Visual Comparison

### Before (Current)

```
+------------------------------------------------------------------+
|  [WeekTray - Heavy, Always Expanded, Multiple Buttons]          |
|  [M] [T] [W] [T] [F] [S] [S]                                     |
|  [Stacked thumbnails with titles]                                |
|  [Progress Bar] [Clear] [Shop] [AI] [Theme] [User]               |
+------------------------------------------------------------------+
|  [Search Bar]                                                     |
+------------------------------------------------------------------+
|  Heavy Hitters (Large Cards - Horizontal Scroll)                 |
|  [======] [======] [======] [======] [======]                    |
|  The Bench (Medium Cards - Horizontal Scroll)                    |
|  [====] [====] [====] [====] [====] [====]                      |
|  The Archive (Small Cards - Horizontal Scroll)                   |
|  [===] [===] [===] [===] [===] [===] [===]                       |
+------------------------------------------------------------------+
```

### After (Proposed)

```
+------------------------------------------------------------------+
|  [Minimal WeekTray - Collapsed by Default]                       |
|  [M] [T] [W] [T] [F] [S] [S]  |  Week 3/7  [+]                   |
+------------------------------------------------------------------+
|  Recent Favorites                                                |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  |  Meal  |  |  Meal  |  |  Meal  |  |  Meal  |  |  Meal  |     |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  The Collection                                                  |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  |  Meal  |  |  Meal  |  |  Meal  |  |  Meal  |  |  Meal  |     |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  |  Meal  |  |  Meal  |  |  Meal  |  |  Meal  |  |  Meal  |     |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
+------------------------------------------------------------------+
```

---

## 10. Key Metrics Improvement

| Metric | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| Meals visible (desktop) | 4-6 | 12-20 | 3x more |
| Header height | 140px | 60px | 57% reduction |
| Card sizes | 3 | 1 | Simplified |
| Visual elements per card | 5+ | 2-3 | Cleaner |
| Clicks to add meal | 2 | 1-2 | Streamlined |

---

## 11. Next Steps

1. **Review this plan** with stakeholders
2. **Switch to Code mode** for implementation
3. **Implement Phase 1** (Foundation) first
4. **Iterate** based on user feedback

This redesign will transform the meals page into a clean, minimal, Apple-inspired interface that maximizes meal visibility while maintaining all existing functionality.