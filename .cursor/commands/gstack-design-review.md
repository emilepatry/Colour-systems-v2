Run a comprehensive, scored design audit of the live prototype with letter grades (A–F) across 10 categories, AI slop detection, annotated screenshots, and a structured report. Don't fix — document and grade.

**First**: Use the frontend-design skill for design principles and anti-patterns.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/plan-design-review/SKILL.md` for the full workflow (phases 1–6, checklist, scoring, report format). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Browse binary**: Use `B=".cursor/skills/gstack/browse/dist/browse"` — the SKILL.md references `.claude/skills/gstack/` which is the wrong path for this project. Substitute `.cursor/skills/gstack/` wherever the SKILL.md says `.claude/skills/gstack/`.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.

## Key Sections to Prioritize

The SKILL.md is ~600 lines. These are the highest-value sections — do not skip them:

1. **Phase 1: First Impression** — Use the structured format: "The site communicates...", "I notice...", "The first 3 things my eye goes to are...", "If I had to describe this in one word..."
2. **Phase 3: Design Audit Checklist** — The full 10-category, ~80-item checklist. This IS the review. Apply every item.
3. **Phase 6: Compile Report** — Use the scoring system (A–F per category with weights) and the exact report template.
4. **Important Rules** — Especially: "Think like a designer, not a QA engineer", "Screenshots are evidence", "Depth over breadth", "Show screenshots to the user."
5. **Design Critique Format** — Use structured feedback: "I notice... / I wonder... / What if... / I think... because..."

## Tomasso Context

Apply these project-specific overrides when running the gstack design review:

- **Target URL**: The Vite prototype at `http://localhost:5173` (run `cd prototype && npm run dev` if not already running)
- **Design system baseline**: Do NOT infer the design system from the rendered site. The canonical design system is Heron — load it from `resources/ui guidelines/UI_Colours.md`, `resources/ui guidelines/UI_Typography-Fundamentals.md`, `resources/ui guidelines/UI_Typography-Layout.md`, `resources/ui guidelines/UI_Typography-Heron.md`, and `resources/components/UI_Heron-Components.md`. Deviations from Heron are HIGH severity.
- **Design tokens**: Token definitions live in `prototype/src/styles/tokens.css` and `prototype/src/styles/global.css`. Cross-reference rendered values against these.
- **Typography**: Besley (serif headings) + Mulish (sans body). Hierarchy through size/spacing, never bold. Flag any bold-for-hierarchy as a design system violation.
- **Palette**: Cream (#F0EFEC) global bg, white cards, soft semantic accents (teal, blue, muted orange). Flag high-saturation or neon colors.
- **Accessibility**: Target WCAG 2.1 AAA (not AA). Minimum touch targets 44px. Content at Grade 6 reading level.
- **Theme**: Light mode only. Skip all dark mode checks.
- **Anti-patterns**: In addition to the gstack AI slop checklist, flag these Heron-specific violations: gradients on buttons/inputs/toggles, all-caps headings or body text, bold for hierarchy, fear/guilt/shame language, dense text blocks, custom gradients or shadows outside the token set.
- **Emotional bar**: The interface must feel Reassuring, Warm, and Guiding. Grade emotional resonance against these pillars, not generic UX heuristics.
- **Patient archetypes**: Reference `active project/brief/principles-and-archetypes.md` for the 7 patient archetypes (0 + A–F). Consider whether the design works for the most anxious, lowest-digital-literacy archetype.

## When to Use This vs Existing Commands

- Use `/gstack-design-review` for a systematic, scored audit with letter grades and screenshot evidence across 10 categories
- Use `/critique` for a quick design director gut reaction (faster, less structured)
- Use `/audit` for a technical quality audit focused on a11y, performance, theming, responsive, and anti-patterns (no grading, different dimensions)
- Use `/gstack-qa-fix` if you want to find design issues AND fix them in code

## Report Location

Write the report to `active project/feedback/design-audit-{YYYY-MM-DD}.md`

**NEVER**:
- Infer the design system from the rendered site — always use the Heron spec from `resources/`
- Skip the AI slop check — it's the most important single check
- Grade against WCAG AA when the project targets AAA
- Check dark mode (the project is light-mode only)
- Fix anything — this is report-only. Use `/gstack-qa-fix` for fixes.
