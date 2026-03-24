CEO/founder-style plan review. Re-examine the problem from first principles, challenge assumptions, and evaluate scope. Not a rubber stamp — a rigorous interrogation of whether this plan achieves the right outcome at the right ambition level.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/plan-ceo-review/SKILL.md` for the full workflow (Step 0 nuclear scope challenge, system audit, 10 review sections, review log). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.
- **Skip** the Review Readiness Dashboard and Review Log — they depend on gstack infrastructure that isn't available.

## Key Sections to Prioritize

The SKILL.md is ~620 lines. These are the highest-value sections — do not skip them:

1. **9 Prime Directives** — Zero silent failures, every error has a name, data flows have shadow paths, interactions have edge cases, diagrams are mandatory, etc. These set the review posture.
2. **PRE-REVIEW SYSTEM AUDIT** — Read the git log, diff, CLAUDE.md, and TODOS.md before reviewing anything.
3. **Step 0: Nuclear Scope Challenge (0A–0F)** — Premise challenge, existing code leverage, dream state mapping, mode-specific analysis, temporal interrogation, mode selection. This is the highest-leverage output.
4. **10 Review Sections** — Architecture, Error/Rescue Map, Security/Threat Model, Data Flow Edge Cases, Code Quality, Test Review, Performance, Observability, Deployment, Long-Term Trajectory. Each ends with a STOP-and-ask-per-issue pattern.
5. **Error & Rescue Map template** (Section 2) — The detailed table for mapping every exception. Especially important for patient-facing flows where silent failures erode trust.
6. **Interaction Edge Cases table** (Section 4) — Double-click, navigate-away, stale state, back button. Essential for anxious patients who may interact unpredictably.

## Tomasso Context

Apply these project-specific lenses when reviewing plans:

### Strategic Context
- **Product**: Fullscript patient mobile app — post-purchase supplement experience
- **Team**: Patient Experience team at Fullscript
- **Users**: Patients on supplement plans, often anxious, low digital literacy, uncertain about what to do next
- **Core JTBD**: Turn a supplement plan into a supported, ongoing care experience
- **KPIs**: Supplement CVR (conversion rate), refill rate, re-test rate, K-factor (referral). See `active project/brief/scope-metrics-questions.md`.
- **Active project**: Patient Home Screen Redesign with 7 workstreams (WS1–WS7). See `active project/brief/workstreams-and-input.md`.
- **Journeys initiative**: Strategic framework in `resources/journeys/`. 6 experience stages, Mar–Jun 2026 timeline.

### Review Through These Lenses
1. **Patient impact**: Does this plan actually help patients feel Reassured, Cared For, In Control, and Guided? Or does it optimize for metrics at the expense of patient experience?
2. **Therapeutic alliance**: Does every feature strengthen the practitioner-patient relationship? Plans that weaken this bond are fundamentally flawed.
3. **Archetype coverage**: Will this work for all 7 patient archetypes (0 + A–F)? Plans that only serve the engaged, tech-savvy archetype miss the most vulnerable patients.
4. **Scope vs. timeline**: The Journeys roadmap runs Mar–Jun 2026. Is this plan appropriately scoped for the timeline? See `resources/journeys/JOURNEYS_Roadmap.md`.
5. **Design principles alignment**: Check against the 7 design principles in `active project/brief/principles-and-archetypes.md`. "Calm Over Clever" and "Compassion Over Correction" are non-negotiable.

### Scope Mode Guidance
- **SCOPE EXPANSION**: What would make this a 10x better patient experience? What features would make patients tell their friends about Fullscript?
- **HOLD SCOPE**: Is every failure mode mapped? Does every state (empty, error, loading, success) have a compassionate design?
- **SCOPE REDUCTION**: What is the minimum that still moves the key KPIs? What can ship in 2 weeks?

## When to Use This vs Existing Commands

- Use `/gstack-ceo-review` for strategic plan review (scope, ambition, patient impact)
- Use `/gstack-eng-review` for technical plan review (architecture, code quality, test coverage)
- Use `/gstack-design-review` for visual design audit of the live prototype

**NEVER**:
- Approve a plan that uses guilt, shame, or compliance language
- Skip the scope challenge (Step 0) — it's the highest-leverage output
- Evaluate plans without reading the active project brief first
- Optimize for metrics at the expense of patient emotional experience
