End-to-end ship workflow: pre-flight checks, merge base branch, version bump, CHANGELOG, commit in bisectable chunks, push, and create PR. Fully automated — runs straight through unless it hits a blocker.

**Then**: Read and follow the gstack skill at `.cursor/skills/gstack/ship/SKILL.md` for the full workflow (steps 0–8). When reading the SKILL.md:

- **Skip** the "Preamble", "AskUserQuestion Format", and "Contributor Mode" sections — they are Claude Code infrastructure, not applicable in Cursor.
- **Skip** all `gstack-slug`, `gstack-config`, and `gstack-update-check` commands — they are gstack infrastructure and will not resolve.
- **Skip** the Review Readiness Dashboard — it depends on gstack infrastructure that isn't available.

## Key Sections to Prioritize

1. **Step 0: Detect base branch** — Use the `gh pr view` / `gh repo view` / fallback-to-main logic.
2. **Step 1: Pre-flight** — Check branch, `git status`, `git diff --stat`, `git log --oneline`.
3. **Step 3.5: Pre-landing review** — The lightweight diff review before committing. Do not skip.
4. **Step 5: CHANGELOG** — Write in user-facing language (see Tomasso Context below).
5. **Step 6: Commit** — Bisectable chunks. Each commit should be independently revertable.
6. **Step 8: Create PR** — Use `gh pr create` with a structured body.

## Tomasso Context

Apply these project-specific overrides:

- **No test suite**: This project has no automated tests. Skip Step 3 (Run tests) entirely. Proceed directly from Step 2 (Merge base) to Step 3.5 (Pre-landing review).
- **No eval suites**: Skip Step 3.25 (Eval suites) entirely.
- **Version file**: If a `VERSION` file exists, use it. If not, skip version bumping.
- **CHANGELOG**: If `CHANGELOG.md` exists, update it. Write entries in plain language from the patient/designer perspective, not implementation details. Example: "New supplement card layout with larger touch targets" not "Refactored Card component to use flex-basis".
- **Commit strategy**: When staging changes, keep `resources/` modifications separate from `prototype/` changes. Resources are canonical design knowledge; prototype is implementation.
- **PR description**: Include which design brief workstreams (WS1–WS7 from `active project/brief/workstreams-and-input.md`) are affected.
- **Branch convention**: Feature branches should describe what they change in the design or prototype.

## What Stops the Workflow

- On the base branch (abort)
- Merge conflicts that can't be auto-resolved
- Pre-landing review finds issues needing user judgment
- Files in `resources/` were modified (flag for explicit confirmation — these are canonical and should rarely change)

## What Never Stops the Workflow

- Uncommitted changes (always included)
- CHANGELOG content (auto-generated)
- Commit message approval (auto-committed)

**NEVER**:
- Modify files in `resources/` without explicit confirmation
- Write implementation-detail CHANGELOG entries (write for designers, not developers)
- Skip the pre-landing review step
