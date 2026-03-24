Post-ship documentation update. Cross-reference the diff against all project documentation, update what's stale, polish CHANGELOG entries, and clean up TODOS. Runs after `/gstack-ship` but before the PR merges.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/document-release/SKILL.md` for the full workflow (steps 0–9). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.

## Key Sections to Prioritize

1. **Step 1: Pre-flight & Diff Analysis** — Understand what changed via `git diff` and `git log`.
2. **Step 2: Per-file documentation audit** — Check every .md file in the repo. The SKILL.md has a detailed classification system for which docs to update.
3. **Step 5: CHANGELOG voice polish** — Rewrite implementation-focused entries into user-facing language.
4. **Step 6: Cross-doc consistency check** — Ensure version numbers, file paths, and feature descriptions match across all docs.
5. **Step 7: TODOS.md cleanup** — Mark completed items, flag new work.

## Tomasso Context

Apply these project-specific overrides:

### Documentation Files to Audit
- `CLAUDE.md` — Project structure, constraints, key files. Update if new directories, resources, or constraints are added.
- `active project/README.md` — Project navigation. Update if new files are added to `active project/`.
- Brief files in `active project/brief/` — These are design artifacts, not code docs. Only update if scope, principles, or archetypes explicitly change.
- `prototype/README.md` — Prototype setup instructions. Update if dependencies, build steps, or project structure change.
- Resource README files (`resources/baymard recommendations/README.md`, `resources/habit formation/README.md`, `resources/journeys/README.md`) — Cross-reference tables and indexes. Update if new resource files are added.

### Special Rules
- **Resources are canonical**: Files in `resources/` document external knowledge (Baymard guidelines, habit formation research, journey architecture). Do NOT modify their content based on code changes. Only update indexes/READMEs if new resource files are added.
- **CHANGELOG voice**: Write for designers and stakeholders, not developers. "New supplement card layout with larger touch targets" not "Refactored Card component flex-basis". Lead with what changed for the patient experience.
- **CLAUDE.md updates**: When updating the repo structure table, keep it accurate to the actual directory tree. Don't add directories that don't exist.
- **Brief files**: These are living design documents. Only mark sections as "completed" or "shipped" if the work is genuinely done per the criteria in the brief.

### Files to Never Modify
- Research files in `resources/` (except README indexes)
- `.cursorrules` (managed separately)
- `.cursor/rules/*.mdc` (managed separately)
- `.cursor/skills/frontend-design/` (managed separately)

**NEVER**:
- Overwrite or regenerate CHANGELOG entries — polish wording only
- Modify research content in `resources/` based on implementation changes
- Update brief files without verifying the work matches the brief's acceptance criteria
- Bump VERSION without asking
