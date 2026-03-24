Systematically QA test the live prototype like a real patient would use it — click everything, fill every form, check every state. Produce a structured report with health score, screenshots, and repro steps. Don't fix — document.

**First**: Use the frontend-design skill for design principles and anti-patterns.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/qa-only/SKILL.md` for the full workflow (phases 1–6, health score rubric, report format). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Browse binary**: Use `B=".cursor/skills/gstack/browse/dist/browse"` — the SKILL.md references `.claude/skills/gstack/` which is the wrong path for this project. Substitute `.cursor/skills/gstack/` wherever the SKILL.md says `.claude/skills/gstack/`.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.

## Key Sections to Prioritize

The SKILL.md is ~450 lines. These are the highest-value sections — do not skip them:

1. **Workflow Phases 1–6** — Follow the full Orient → Explore → Document → Wrap Up flow. Use `snapshot -i` for SPA navigation.
2. **Health Score Rubric** — Compute per-category scores (Console 15%, Links 10%, Visual 10%, Functional 20%, UX 15%, Performance 10%, Content 5%, Accessibility 15%) and take the weighted average.
3. **Two Evidence Tiers** — Interactive bugs need before/after screenshots + `snapshot -D`. Static bugs need a single annotated screenshot.
4. **General SPA guidance** (under Framework-Specific Guidance) — Use `snapshot -i` for navigation, check for stale state, test browser back/forward, check history handling.
5. **Important Rules** — Especially: "Repro is everything", "Check console after every interaction", "Test like a user", "Show screenshots to the user."

## Tomasso Context

Apply these project-specific overrides when running the QA:

- **Target URL**: The Vite prototype at `http://localhost:5173` (run `cd prototype && npm run dev` if not already running)
- **Tech stack**: React 18 + Vite 5, Tailwind CSS v4 + shadcn/ui + Radix UI, Framer Motion + Lottie, Lucide React icons. This is a SPA — use `snapshot -i` for navigation, not `links`.
- **User context**: You are a patient opening the Fullscript mobile app for the first time after purchasing a practitioner's supplement plan on web. Emotional state: uncertain, possibly anxious, low digital literacy assumed.
- **Test persona**: Use the most vulnerable archetype from `active project/brief/principles-and-archetypes.md` — the anxious, low-digital-literacy patient who just bought a plan and doesn't know what to do next.
- **Accessibility**: Target WCAG 2.1 AAA. All touch targets >= 44px. Focus-visible outlines, semantic roles, ARIA labels required.
- **Content check**: All copy should be at Grade 6 reading level. Flag jargon, medical terminology without context, or anything that would confuse an anxious patient.
- **Emotional check**: Error states should use compassion over correction. No guilt, shame, or compliance language. Flag any failure state that blames the user.
- **Mobile-first**: The primary viewport is mobile (375px). Test at 375x812 first, then tablet (768px), then desktop (1440px).
- **Auth**: The prototype has no authentication — skip auth steps.
- **No dark mode**: Light mode only. Skip dark mode testing.

## When to Use This vs Existing Commands

- Use `/gstack-qa-report` for end-to-end functional QA with evidence and health scoring
- Use `/audit` for a technical quality scan (a11y, performance, theming — less interaction-focused)
- Use `/gstack-design-review` for a visual design audit with letter grades (not functional testing)

## Report Location

Write the report to `active project/feedback/qa-report-{YYYY-MM-DD}.md`

**NEVER**:
- Fix bugs — document them with screenshots and repro steps only
- Test as a developer — test as a patient
- Skip mobile viewport testing (375px is the primary viewport)
- Include passwords or credentials in repro steps
- Read source code — evaluate the rendered prototype only
