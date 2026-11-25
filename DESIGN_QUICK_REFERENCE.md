# GAS Studio Builder - Quick Reference

## Design System Cheat Sheet

### Colors (CSS Variables)
```css
/* Use these in your components */
background: var(--color-bg-primary)      /* #0a0a0a - Main canvas */
background: var(--color-bg-secondary)    /* #121212 - Panels */
background: var(--color-bg-tertiary)     /* #1a1a1a - Inputs */

border: 1px solid var(--color-border-subtle)   /* 6% white */
border: 1px solid var(--color-border-medium)   /* 10% white */

color: var(--color-text-primary)         /* 100% white */
color: var(--color-text-secondary)       /* 70% white */
color: var(--color-text-tertiary)        /* 45% white */

/* Gradient accent */
background: linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))
```

### Typography
```tsx
/* Primary UI text */
<div className="text-sm font-medium tracking-tight">

/* Code/Technical */
<div className="text-mono text-sm">

/* Headers */
<h1 className="text-base font-medium tracking-tight">
```

### Common Patterns

#### Button (Primary)
```tsx
<button
  className="px-4 py-2 text-sm font-medium rounded transition-all"
  style={{ 
    background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
    color: 'var(--color-text-primary)'
  }}
>
  Action
</button>
```

#### Button (Secondary)
```tsx
<button
  className="px-4 py-2 text-sm font-medium rounded transition-colors"
  style={{
    background: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    borderWidth: '1px',
    borderColor: 'var(--color-border-subtle)'
  }}
>
  Action
</button>
```

#### Input Field
```tsx
<input
  className="px-3 py-2 text-sm rounded outline-none transition-colors"
  style={{
    background: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    borderWidth: '1px',
    borderColor: 'var(--color-border-subtle)'
  }}
  onFocus={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-subtle)'}
/>
```

#### Panel
```tsx
<div 
  className="p-4 border-b"
  style={{ 
    background: 'var(--color-bg-secondary)',
    borderColor: 'var(--color-border-subtle)'
  }}
>
  Content
</div>
```

#### Terminal-Style Message
```tsx
<div className="space-y-1">
  <div 
    className="text-xs font-medium tracking-wide text-mono"
    style={{ color: 'var(--color-text-muted)' }}
  >
    LABEL
  </div>
  <div
    style={{ 
      borderLeftWidth: '2px',
      borderColor: 'var(--color-accent-start)',
      paddingLeft: '12px',
      color: 'var(--color-text-secondary)'
    }}
  >
    Message content
  </div>
</div>
```

## Anti-Slop Checklist

When adding new components, check:

- [ ] No generic blue (#3B82F6) - use gradient accent
- [ ] No rounded pills - use 4-8px radius max
- [ ] No background bubbles - use left borders
- [ ] Text hierarchy via opacity (100%→70%→45%→30%)
- [ ] Monospace for technical elements
- [ ] Tight letter-spacing (-0.01em or -0.02em)
- [ ] Minimal shadows (or none)
- [ ] Every color has purpose (no decoration)
- [ ] Dense, IDE-appropriate spacing

## Component Inventory

### ✅ Implemented
- Header with brand mark + keyboard hint
- Chat pane (terminal style)
- Editor pane (minimal tabs)
- Preview pane (clean empty state)
- Deploy panel (command bar)

### 🔲 Future Enhancements
- Command palette modal (⌘K)
- Keyboard shortcuts overlay
- Settings panel
- File tree sidebar
- Status bar (line/col, deploy status)
- Split editor view
- Theme toggle

## File Structure
```
src/
├── index.css           # Design system (CSS variables)
├── App.tsx            # Main layout + header
├── components/
│   ├── ChatPane.tsx   # Terminal-style chat
│   ├── EditorPane.tsx # Monaco editor + tabs
│   ├── PreviewPane.tsx # iframe preview
│   └── DeployPanel.tsx # Command bar
└── main.tsx          # Entry point (imports index.css)
```

## Dev Server
```bash
npm run dev        # Frontend only (port 5173)
npm run server     # Backend only (port 3001)
npm run dev:all    # Both concurrently
```

## Design Philosophy

**Minimal Cursor-like**
- Dark, warm, professional
- Code-first (developer tool)
- Keyboard-driven hints
- No marketing aesthetics
- Terminal-native feel
- One gradient accent
- Intentional typography

**NOT:**
- Generic SaaS landing
- Marketing hero sections
- Rounded pill buttons
- Chat bubbles
- Decorative gradients
- Rainbow palettes
- AI slop patterns
