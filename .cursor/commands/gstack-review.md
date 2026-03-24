Pre-merge PR review. Analyze the current branch's diff against the base branch for structural issues, design system violations, documentation staleness, and accessibility regressions that tests don't catch.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/review/SKILL.md` for the full workflow (steps 0–5.6). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** Step 2.5 (Greptile review comments) — Greptile integration is not set up for this project.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.
- **Skip** the Review Readiness Dashboard — it depends on gstack infrastructure that isn't available.

## Key Sections to Prioritize

1. **Step 0: Detect base branch** — Use the `gh pr view` / `gh repo view` / fallback-to-main logic.
2. **Step 3: Get the diff** — `git fetch origin <base> --quiet` then `git diff origin/<base>`.
3. **Step 4: Two-pass review** — Pass 1 (CRITICAL) and Pass 2 (INFORMATIONAL). Apply the standard checklist PLUS the Tomasso-specific checks below.
4. **Step 5: Fix-first review** — Auto-fix obvious issues (dead code, stale comments), ask about judgment calls.
5. **Step 5.5: TODOS cross-reference** — Check if any TODOS are addressed by this branch.

## Tomasso Context

In addition to the standard review checklist, check for these project-specific concerns:

### Heron Design System Compliance
- All colors use design tokens from `prototype/src/styles/tokens.css` — flag hard-coded hex values
- Typography follows Besley (headings) + Mulish (body) — flag other fonts
- Hierarchy uses size/spacing, not bold — flag `font-weight: bold` or `font-bold` for hierarchy
- No gradients on buttons, inputs, or toggles
- No all-caps headings or body text
- No high-saturation or neon colors

### Resources Directory Integrity
- Files in `resources/` should **never** be modified without explicit permission
- If the diff touches `resources/`, flag as CRITICAL and require justification
- Cross-reference: do changes in `prototype/` still align with specs in `resources/`?

### Accessibility (WCAG 2.1 AAA)
- Touch targets >= 44px on all interactive elements
- Color contrast meets AAA standards (7:1 for normal text, 4.5:1 for large text)
- Focus-visible outlines on all interactive elements
- Semantic HTML (buttons not divs, proper heading hierarchy)
- ARIA labels on custom interactive components

### Content Quality
- Copy at Grade 6 reading level — flag jargon, complex sentences, medical terminology without context
- Error states use compassion over correction — no guilt, shame, compliance language
- No exclamation points in error messages, no manufactured urgency

### Design Anti-Patterns
- No AI slop tells (3-column feature grids, icons in colored circles, gradient text, emoji as design elements)
- No custom shadows or gradients outside the token set
- Motion uses `prefers-reduced-motion` media query

## When to Use This vs Existing Commands

- Use `/gstack-review` before merging a PR to catch structural issues
- Use `/gstack-ship` to run the full ship workflow (which includes a lighter pre-landing review)
- Use `/gstack-design-review` for a comprehensive visual audit of the live prototype
- Use `/audit` for a broader technical quality scan

**NEVER**:
- Skip the Heron compliance check — design system violations are the most common issue
- Approve changes to `resources/` without flagging them
- Reduce accessibility standards from AAA to AA
