# shadcn/ui + Tailwind CSS v4 Validation

## Scope

This file validates a specific CSS variable mapping against the current shadcn/ui theming docs and Tailwind CSS v4 theming docs.

Questions answered:

1. Which of the 32 variables are still current in shadcn/ui?
2. Are any shadcn/ui theme variables missing from the list?
3. Does the `@theme inline { --color-*: var(--*); }` bridge still work in Tailwind CSS v4?
4. Has shadcn/ui changed its color format expectation from raw HSL channels to OKLCH or full color values?

---

## Result

Your 32-variable mapping is still current for shadcn/ui's documented theme token system.

All of these variables remain part of the current theming model:

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--destructive-foreground`
- `--border`
- `--input`
- `--ring`
- `--chart-1`
- `--chart-2`
- `--chart-3`
- `--chart-4`
- `--chart-5`
- `--sidebar`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-primary-foreground`
- `--sidebar-accent`
- `--sidebar-accent-foreground`
- `--sidebar-border`
- `--sidebar-ring`

---

## 1) Validation of the 32 shadcn/ui variables

### Core surface and text tokens

These are still current:

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`

These continue to define the main app/page surface, text, card surface, and popover surface roles in shadcn/ui.

### Intent and emphasis tokens

These are still current:

- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--destructive-foreground`

The `--name` / `--name-foreground` pairing convention is still used.

### Structural UI tokens

These are still current:

- `--border`
- `--input`
- `--ring`

These continue to map to standard border, input border, and focus-ring behavior.

### Chart tokens

These are still current:

- `--chart-1`
- `--chart-2`
- `--chart-3`
- `--chart-4`
- `--chart-5`

The chart token set remains part of shadcn/ui's documented theming system.

### Sidebar tokens

These are still current:

- `--sidebar`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-primary-foreground`
- `--sidebar-accent`
- `--sidebar-accent-foreground`
- `--sidebar-border`
- `--sidebar-ring`

These remain part of the sidebar component theme model.

---

## 2) Missing shadcn/ui theme variables

### Missing color variables

Based on the current docs, you are not missing any default shadcn/ui color theme variables from the standard documented set.

That means:

- No default `--success`
- No default `--warning`
- No default `--info`

Those are not part of the current baseline theme contract.

### Non-color theme variable worth noting

There is one important non-color theme token commonly present in shadcn/ui themes:

- `--radius`

This is not a color token, but it is part of the standard theme setup and often appears alongside the color variables.

Depending on how broad you define “theme variables,” you may want to acknowledge it in your system documentation even though it is outside your color-token mapping.

---

## 3) Tailwind CSS v4 bridge validation

Yes, the `@theme inline` bridge pattern still works in Tailwind CSS v4.

The relevant pattern is:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}
```

This remains the correct Tailwind v4-era pattern for exposing CSS variables as theme-backed utility values.

That bridge is what allows utilities such as these to resolve correctly:

- `bg-background`
- `text-foreground`
- `bg-primary`
- `text-primary-foreground`
- `border-border`
- `border-input`
- `ring-ring`

### Practical conclusion

Your Layer 2 → shadcn variable mapping plus Tailwind bridge is still conceptually valid.

The architecture of:

1. semantic CSS variables like `--primary`
2. Tailwind theme bridge variables like `--color-primary`
3. utility usage like `bg-primary`

is still aligned with Tailwind CSS v4.

---

## 4) shadcn/ui color format expectation

shadcn/ui has changed materially from the older “raw HSL channels only” convention.

### Older expectation

Older shadcn setups commonly stored values like:

```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
```

and then consumed them like:

```css
background-color: hsl(var(--background));
color: hsl(var(--foreground));
```

That older model assumed the variables contained only channel values, not complete color functions.

### Current expectation

Current shadcn/ui docs and generated themes now use full color values directly, including OKLCH.

That means tokens are now commonly written like:

```css
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
```

This indicates two important shifts:

1. shadcn/ui now accepts full CSS color values in the variables
2. OKLCH is accepted and used in current examples

### Practical implication for your project

Your system can safely emit OKLCH values directly into shadcn/ui token variables.

You do not need to constrain your export format to raw HSL channels.

That makes your proposed mapping strategy materially more future-facing and consistent with the current shadcn direction.

---

## Overall judgment on your mapping plan

Your mapping is structurally aligned with the current shadcn/ui + Tailwind CSS v4 ecosystem.

### What looks correct

- The 32 variable names are still current.
- The `--name` / `--name-foreground` pairing model is still valid.
- The chart and sidebar token families are still part of the documented theme system.
- Tailwind v4 still supports the `@theme inline` bridge model.
- OKLCH is now acceptable and consistent with current shadcn usage.

### What to keep in mind

- shadcn/ui still does not ship standard status tokens like `--success` or `--warning`.
- If your foundation layer includes success/warning/info roles, those are your system extensions, not current shadcn defaults.
- `--radius` exists as a standard non-color token and may belong in any complete “theme contract” documentation.

---

## Recommended answer to your four validation questions

### 1. Which of these variables are still current in shadcn/ui's theming system?

All 32 variables you listed are still current.

### 2. Are there any shadcn/ui theme variables that you're missing?

No additional default color theme variables appear to be missing from your list.

If you are documenting all theme variables rather than only colors, add `--radius` as a non-color token.

### 3. Does the `@theme inline { --color-*: var(--*); }` pattern still work in Tailwind CSS v4?

Yes. That pattern is still valid for bridging semantic CSS variables into Tailwind utility classes.

### 4. Has shadcn/ui changed its color format expectation?

Yes. Current shadcn/ui accepts full color values and uses OKLCH in current theme examples. It is no longer limited to raw HSL channel values without an `hsl()` wrapper.

---

## Sources used in the original validation

- shadcn/ui theming docs
- shadcn/ui sidebar theming references
- Tailwind CSS v4 theme documentation

This file is a clean synthesis of those findings for download and reuse.
