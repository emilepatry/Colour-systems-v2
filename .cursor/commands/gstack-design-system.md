Create or refine a design system by understanding the product, optionally researching competitors, and proposing a complete coherent system (typography, color, spacing, motion). Generates a DESIGN.md and font/color preview page.

**First**: Use the frontend-design skill for design principles and anti-patterns.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/design-consultation/SKILL.md` for the full workflow (phases 0–6). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.

## Key Sections to Prioritize

1. **Phase 1: Product Context** — Pre-fill from the existing Heron spec and project brief. Don't ask questions the resources already answer.
2. **Phase 3: Complete Proposal** — Typography, color, spacing, motion, component patterns. Compare against what Heron specifies vs. what the prototype actually renders.
3. **Phase 5: Font & Color Preview Page** — Generate a living reference page in the prototype.
4. **Phase 6: Write DESIGN.md** — Capture the actual state of the design system, not the aspirational spec.

## Tomasso Context

This project already has a comprehensive design system (Heron). Use this command to:

1. **Audit divergence**: Compare the prototype's rendered design system against the Heron spec. Generate a DESIGN.md that captures what the prototype actually uses vs. what the spec says it should use.
2. **Extend Heron**: If the prototype needs patterns not covered by the Heron spec (e.g., new card types, journey-specific components), propose extensions that feel native to the existing system.
3. **Preview page**: Generate a font + color preview page in the prototype that serves as a living reference.

**Existing design resources** (read these before proposing anything):
- `resources/ui guidelines/UI_Colours.md` — Color tokens and usage
- `resources/ui guidelines/UI_Typography-Fundamentals.md` — Typography principles
- `resources/ui guidelines/UI_Typography-Layout.md` — Layout typography
- `resources/ui guidelines/UI_Typography-Heron.md` — Heron-specific typography
- `resources/components/UI_Heron-Components.md` — Component specs
- `prototype/src/styles/tokens.css` — Current token implementation
- `prototype/src/styles/global.css` — Global styles

**Brand personality**: Reassuring, Warm, Guiding. The Knowledgeable Partner voice. Emotional goals: Reassured, Cared For, In Control, Guided.

**Constraints**:
- Light mode only (dark mode is a future consideration)
- WCAG 2.1 AAA accessibility
- Grade 6 reading level for all content
- No high-saturation, neon, or gradient buttons

## When to Use This vs Existing Commands

- Use `/gstack-design-system` to generate a DESIGN.md or audit token divergence
- Use `/gstack-design-review` to audit the live prototype's visual quality
- Use `/colorize` to work specifically on color palette refinement
- Use `/extract` to pull reusable patterns from existing designs

**NEVER**:
- Propose styles that contradict Heron without explicit justification
- Replace the existing token system — extend it
- Modify files in `resources/` — those are canonical and read-only
