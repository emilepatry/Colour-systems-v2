Engineering plan review. Evaluate architecture, data flow, component structure, edge cases, test coverage, and accessibility implementation. Walk through issues with recommendations, one at a time.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/plan-eng-review/SKILL.md` for the full workflow (Step 0 scope challenge, 4 review sections, test plan artifact). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.
- **Skip** the Test Plan Artifact persistence to `~/.gstack/projects/` — that path depends on gstack-slug.
- **Skip** the Review Readiness Dashboard and Review Log — they depend on gstack infrastructure that isn't available.

## Key Sections to Prioritize

The SKILL.md is ~310 lines. These are the highest-value sections — do not skip them:

1. **Step 0: Scope Challenge** — Existing code check, minimum set of changes, complexity check (>8 files = smell), TODOS cross-reference. Offers SCOPE REDUCTION, BIG CHANGE, or SMALL CHANGE mode.
2. **Section 1: Architecture review** — System design, dependency graph, data flow, scaling, security. Includes ASCII diagram requirement.
3. **Section 2: Code quality review** — DRY violations, error handling, edge cases, over/under-engineering, existing ASCII diagram maintenance.
4. **Section 3: Test review** — Diagram every new UX flow, data flow, codepath, and branching condition. Map each to a test type. Critical for a patient-facing health app.
5. **STOP-and-ask pattern** — Each section ends with STOP. Ask about each issue individually with a recommendation and WHY. One issue per question, never batch.

## Tomasso Context

Apply these project-specific lenses when reviewing plans:

### Tech Stack
- React 18 + Vite 5
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Framer Motion + Lottie for animation
- Lucide React icons
- Design tokens in `prototype/src/styles/tokens.css` and `prototype/src/styles/global.css`
- Component specs in `resources/components/UI_Heron-Components.md`

### Architecture Concerns
- **Component structure**: Are components following Heron patterns? Do they use the right tokens? Are they accessible by default?
- **State management**: Is state managed appropriately for a patient-facing health app? Consider that patients may be anxious and every loading/error state matters.
- **Responsive design**: Mobile-first (375px primary). Does the plan account for all breakpoints (375, 768, 1024, 1440)?
- **Animation**: All motion must respect `prefers-reduced-motion`. Framer Motion transitions should be subtle slide/fade, not dramatic. Duration 50–700ms range.
- **Token compliance**: All colors, spacing, typography must use Heron tokens. Flag any hard-coded values.

### Accessibility (Non-Negotiable)
- WCAG 2.1 AAA target (not AA)
- Touch targets >= 44px
- Focus-visible outlines on all interactive elements
- Semantic HTML (buttons not divs, proper heading hierarchy h1→h2→h3)
- Color never as sole indicator
- `prefers-reduced-motion` support for all animations
- Screen reader announcements for dynamic content

### Content & Copy
- Grade 6 reading level
- Compassion over correction in error states
- No exclamation points in error messages
- No manufactured urgency
- Active voice preferred

### Engineering Preferences
- DRY — flag repetition aggressively
- Explicit over clever
- Minimal diff — achieve the goal with fewest files touched
- Handle edge cases thoughtfully (empty state, overflow, long text, missing data)
- ASCII diagrams for complex data flows or component hierarchies

## When to Use This vs Existing Commands

- Use `/gstack-eng-review` for technical plan review (architecture, code, tests)
- Use `/gstack-ceo-review` for strategic plan review (scope, ambition, patient impact)
- Use `/gstack-review` for pre-merge PR review of actual code changes

**NEVER**:
- Skip the scope challenge (Step 0)
- Accept plans with WCAG AA when the project targets AAA
- Accept hard-coded colors, spacing, or typography values
- Approve plans without considering all 4 viewport breakpoints
