---
title: "Collapsible Section Content Animation Mismatch"
category: ui-bugs
tags:
  - animation
  - collapsible
  - radix-ui
  - tailwind-css
  - css
  - ux
severity: low
components:
  - collapsible-section
  - about-section
  - transcript-section
date_solved: 2026-02-05
description: >
  Collapsible sections displayed inconsistent animation behavior where the
  chevron icon animated smoothly on expand/collapse, but the content area
  snapped instantly without any transition effect.
---

# Radix Collapsible Content Animation Snap

## Problem

Collapsible sections (About, Transcript) had a visual mismatch:
- The chevron icon animated smoothly (rotating 180°)
- The content area snapped instantly without animation

This created a jarring user experience where part of the UI was animated but the main content was not.

## Root Cause

The Radix UI Collapsible component from shadcn/ui does not include animations by default. When the collapsible opens or closes, the content simply appears or disappears instantly. This happens because:

1. **No animation CSS defined** - The default shadcn/ui collapsible component lacks the keyframe animations needed for height transitions
2. **No animation classes applied** - The `CollapsibleContent` component doesn't reference any animation utilities
3. **Missing overflow control** - Without `overflow-hidden`, height animations would not clip content properly

## Solution

### Step 1: Add CSS Keyframe Animations

Add the animation definitions inside the `@theme inline` block in `src/app/globals.css`:

```css
@theme inline {
  /* ... existing theme variables ... */

  /* Collapsible animations */
  --animate-collapsible-down: collapsible-down 0.2s ease-out;
  --animate-collapsible-up: collapsible-up 0.2s ease-out;

  @keyframes collapsible-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-collapsible-content-height);
    }
  }

  @keyframes collapsible-up {
    from {
      height: var(--radix-collapsible-content-height);
    }
    to {
      height: 0;
    }
  }
}
```

### Step 2: Update the CollapsibleContent Component

Modify `src/components/ui/collapsible.tsx` to apply the animation classes:

```tsx
function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    />
  )
}
```

## Why This Works

### Radix `data-state` Attributes

Radix UI primitives automatically manage state through data attributes:
- `data-state="open"` when expanded
- `data-state="closed"` when collapsed

Tailwind's `data-[state=open]:` and `data-[state=closed]:` variants conditionally apply animations based on these states.

### Radix CSS Custom Properties

Radix Collapsible automatically injects `--radix-collapsible-content-height` on the content element, enabling:
- **Dynamic height animation** - No hardcoded pixel values
- **Content-aware transitions** - Works regardless of content length
- **Responsive behavior** - Adapts if content height changes

### The `overflow-hidden` Requirement

Essential because:
- During `collapsible-down`, content starts at `height: 0` - overflow hidden clips content
- During `collapsible-up`, content shrinks to `height: 0` - clips as container collapses
- Creates the smooth "reveal" and "hide" effect

## Prevention Checklist

When implementing new collapsible sections:

- [ ] Keyframes are defined (`@keyframes collapsible-down` and `collapsible-up`)
- [ ] Animation variables are registered (`--animate-collapsible-*` in `@theme`)
- [ ] Keyframes reference `var(--radix-collapsible-content-height)`
- [ ] `CollapsibleContent` has `overflow-hidden`
- [ ] Both `data-[state=open]` and `data-[state=closed]` animations are applied
- [ ] Using the wrapper component from `@/components/ui/collapsible`

## Verification Steps

1. **Visual Check**: Toggle collapsible - content should smoothly expand/collapse over ~200ms
2. **DevTools**: Select `CollapsibleContent`, verify `animation` property shows correct keyframe
3. **CSS Variable**: Check for `--radix-collapsible-content-height` when content is open

## Files Modified

| File | Change |
|------|--------|
| `src/app/globals.css` | Added keyframes and animation variables |
| `src/components/ui/collapsible.tsx` | Added animation classes to CollapsibleContent |

## Related Resources

- [Radix Collapsible Documentation](https://www.radix-ui.com/primitives/docs/components/collapsible)
- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/collapsible)
- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)

## Other Components Using This Pattern

The `data-[state=*]` animation pattern is also used by:
- `dialog.tsx` - Dialog open/close
- `sheet.tsx` - Sheet slide animations
- `dropdown-menu.tsx` - Menu state styling
- `tooltip.tsx` - Tooltip fade
- `popover.tsx` - Popover animations
- `drawer.tsx` - Drawer slide
