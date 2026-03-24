Run a comprehensive design audit of the live prototype, then fix every issue found directly in the code. Each fix is an atomic commit with before/after screenshots. Combines the rigor of `/gstack-design-review` with actual code changes.

**First**: Use the frontend-design skill for design principles and anti-patterns.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/qa-design-review/SKILL.md` for the full workflow (audit phases, triage, fix loop, final verification, report). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Browse binary**: Use `B=".cursor/skills/gstack/browse/dist/browse"` — the SKILL.md references `.claude/skills/gstack/` which is the wrong path for this project. Substitute `.cursor/skills/gstack/` wherever the SKILL.md says `.claude/skills/gstack/`.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.

## Key Sections to Prioritize

The SKILL.md is ~650 lines. These are the highest-value sections — do not skip them:

1. **Phase 3: Design Audit Checklist** — The full 10-category, ~80-item checklist. Same as plan-design-review.
2. **Phase 7: Triage** — Prioritize findings by impact before fixing. Fix HIGH impact first.
3. **Phase 8: Fix Loop** — For each fix: screenshot before, make the code change, screenshot after, commit atomically, verify the fix didn't break adjacent elements.
4. **Phase 9: Final Audit** — Re-run the checklist after all fixes to verify nothing regressed.
5. **Important Rules** — "Screenshots are evidence", "Atomic commits", "Show screenshots to the user."

## Tomasso Context

Apply these project-specific overrides:

- **Target URL**: The Vite prototype at `http://localhost:5173` (run `cd prototype && npm run dev` if not already running)
- **Source code**: Prototype code lives in `prototype/src/`. Components, styles, and assets are here.
- **Design tokens**: `prototype/src/styles/tokens.css` and `prototype/src/styles/global.css` are the canonical token files. Fixes should use existing tokens, not introduce new values.
- **Design system**: Heron is the canonical design system. Load specs from `resources/ui guidelines/` and `resources/components/UI_Heron-Components.md`. All fixes must comply with Heron — do not introduce styles that deviate from the spec.
- **Typography**: Besley (serif headings) + Mulish (sans body). Hierarchy through size/spacing, never bold.
- **Palette**: Cream (#F0EFEC) global bg, white cards, soft semantic accents (teal, blue, muted orange).
- **Accessibility**: Target WCAG 2.1 AAA. Minimum touch targets 44px. Content at Grade 6 reading level.
- **Theme**: Light mode only. Do not add dark mode styles.
- **Emotional design**: The interface must feel Reassuring, Warm, and Guiding. Failure states use compassion over correction — no guilt, shame, or compliance language.
- **Patient archetypes**: Reference `active project/brief/principles-and-archetypes.md` when fixing copy, states, or flows.
- **Anti-patterns to fix**: Gradients on buttons/inputs/toggles, all-caps headings, bold for hierarchy, high-saturation colors, dense text blocks, custom shadows outside the token set.

## Commit Convention

Each fix should be a separate, atomic commit with a descriptive message:
- `fix: increase touch target to 44px on supplement card CTA`
- `fix: replace bold heading hierarchy with size/spacing per Heron spec`
- `fix: rewrite error state copy for compassion over correction`

## When to Use This vs Existing Commands

- Use `/gstack-qa-fix` for a systematic audit that also fixes issues in code
- Use `/gstack-design-review` for a report-only audit (no code changes)
- Use `/polish` for a final-pass checklist of small visual details (less systematic)
- Use `/normalize` for aligning components with design system tokens (narrower scope)

**NEVER**:
- Introduce styles that deviate from Heron tokens
- Fix issues without before/after screenshot evidence
- Batch multiple unrelated fixes in one commit
- Modify files in `resources/` — that directory is read-only
