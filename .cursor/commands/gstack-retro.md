Engineering retrospective using commit history, work patterns, and code quality metrics. Analyze what shipped, how the work was distributed, and where to improve. Useful for tracking progress on the Patient Home Screen Redesign.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/retro/SKILL.md` for the full workflow (data gathering, analysis, report format). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.

## Key Sections to Prioritize

1. **Step 1: Gather Raw Data** — Run the 7 parallel git commands (commit log with stats, per-commit numstat, timestamps for session detection, file hotspots, PR numbers, per-author hotspots, per-author counts). All commands are independent and can run in parallel.
2. **Step 2: Analyze** — Session detection from commit timestamps, hourly distribution, test-to-production LOC ratio, file hotspot analysis, per-author contributions.
3. **Report format** — Use the structured output format with sections for Overview, Highlights, Work Patterns, Per-Person (or Per-Workstream), and Recommendations.
4. **Compare mode** — When using `compare`, load the prior same-length window and compute deltas for all metrics.

## Tomasso Context

Apply these project-specific lenses:

### Project Framing
- **Active project**: Patient Home Screen Redesign with 7 workstreams (WS1–WS7)
- **Timeline**: Part of the Journeys initiative, Mar–Jun 2026
- **Work types**: This repo contains both design knowledge (resources, briefs, research) and code (prototype). Distinguish between design thinking work and implementation work in the retro.

### Workstream Mapping
When analyzing commits, map changes to workstreams where possible:
- `active project/brief/` changes → Design brief refinement
- `active project/research/` changes → Research & analysis
- `active project/feedback/` changes → Review & QA cycles
- `prototype/src/` changes → Implementation work
- `resources/` changes → Design knowledge base updates
- `.cursor/commands/` or `.cursor/rules/` changes → Tooling & workflow improvements

### Metrics to Highlight
- **Design velocity**: How many design decisions were documented vs. how many were implemented?
- **Review cycles**: How many QA/design review rounds were run? What was the trend in scores?
- **Workstream progress**: Which workstreams (WS1–WS7) saw activity? Which are stalled?
- **Resource growth**: Is the design knowledge base growing? New resources added?

### Tone
- This is a solo/small-team project. Frame the retro as self-reflection, not team performance review.
- Focus on momentum, patterns, and what to prioritize next.
- Connect observations to the active project goals and Journeys timeline.

## Arguments
- `/gstack-retro` — last 7 days (default)
- `/gstack-retro 24h` — last 24 hours
- `/gstack-retro 14d` — last 14 days
- `/gstack-retro 30d` — last 30 days
- `/gstack-retro compare` — compare this period vs prior period

## When to Use This

- Use `/gstack-retro` at the end of the week to reflect on progress
- Use `/gstack-retro compare` to see if velocity is trending up or down
- Use `/gstack-retro 30d` before stakeholder check-ins for a broader view

**NEVER**:
- Frame the retro as a performance review — it's self-reflection
- Skip workstream mapping — connecting commits to WS1–WS7 is the main value
- Ignore the Journeys timeline context (Mar–Jun 2026)
