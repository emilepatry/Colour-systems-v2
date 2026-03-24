Audit a Figma design file for developer readiness. Walk through a structured checklist, inspect the file via Figma MCP tools, and generate a comprehensive report with prioritized issues. Don't fix issues — document them.

## Gather Context

**If a Figma URL is provided**, extract `fileKey` and `nodeId` from it and use the Figma MCP tools to inspect the file:

1. `get_metadata` — get the structural overview (pages, layers, naming, hierarchy) starting from the root page (`0:1`) or the provided node
2. `get_variable_defs` — inspect variable/token definitions for naming consistency and coverage
3. `get_screenshot` — capture visual snapshots of key pages/sections for audit evidence
4. `get_design_context` — inspect specific nodes flagged during the audit for deeper detail

URL parsing rules:
- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` → convert `-` to `:` in nodeId
- `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use branchKey as fileKey
- `figma.com/make/:makeFileKey/:makeFileName` → use makeFileKey

**If no URL is provided**, treat this as a manual self-audit. Walk through every checklist item below and generate the report as a reference the designer can use to review their own file.

**CRITICAL**: This is an audit, not a fix. Document issues thoroughly with clear explanations of impact. The output is a report, not a redesigned file.

---

## Checklist

Work through each section systematically. For each item, assess pass / partial / fail / not applicable.

### 1. File Organization & Hygiene

- **Layer and frame naming**: Every frame, layer, and component has a descriptive name (not "Frame 143" or "Group 27"). Names hint at code structure where possible (e.g. "FeatureCard/Header").
- **Page structure**: File is organized into logical pages/sections with clear labels (e.g. Foundations, Components, Designs – Mobile, Designs – Desktop, Dev Notes). Desktop, tablet, and mobile layouts are separated or clearly delineated.
- **Obsolete content purged**: No stale frames, hidden layers, or old versions cluttering the main pages. Exploratory work is moved to an "Archive" page if retained at all.
- **Final designs marked**: Frames or sections ready for development are explicitly indicated — via Figma's "Ready for development" status, page naming ("Final Designs" vs "WIP"), or equivalent labeling. A developer opening the file can immediately distinguish final from in-progress work.

### 2. Design Foundations

- **Color styles & usage**: All colors are defined as Figma color styles with semantic names (e.g. Primary/Brand, Text/Secondary, Error/Red). A reference guide lists each swatch, its name, and its intended usage context so developers can map to code variables.
- **Typography scale**: Text styles are defined for every typographic level (Heading 1, Body, Caption, etc.) with font family, size, line-height, weight, and usage documented. No text in mockups uses manual overrides — everything references a defined text style.
- **Spacing & layout rules**: Spacing scale (e.g. 4px, 8px, 16px increments), grid system (columns, gutters), standard component padding/margin values, and responsive breakpoints are documented.
- **Design tokens / variables**: If the team uses design tokens, Figma variables or styles use the same names as the codebase (or a mapping is documented). Token naming is consistent and semantic.

### 3. Components & Variants

- **Componentized reusable elements**: Every UI element that appears multiple times (buttons, headers, form fields, icons) is a Figma Component, not a detached copy. Components follow a logical naming hierarchy (e.g. Button/Primary/Default).
- **Variant coverage**: Related states and sizes are grouped using Figma Variants rather than duplicated. For example, a Button component has variant properties for type, size, and state (Default, Hover, Disabled, Active). Variant names are clear and unambiguous.
- **Consistent component structure**: Components have predictable padding, alignment, and constraints. Auto Layout is used where elements should flex with content. No arbitrary structural inconsistencies between instances of the same component. Nesting depth is reasonable.
- **Usage notes**: Components include documentation — either in Figma's component description field, a dedicated Components page, or via annotations — explaining when and how to use each one (e.g. "Primary Button: one per page max, used for key actions").

### 4. Screen & State Coverage

- **Device variations**: Designs exist for each target platform/screen size (e.g. Mobile 375px, Tablet 768px, Desktop 1440px) or responsive behavior is clearly documented. Layouts are separated or labeled by device.
- **Flow sequencing**: Screens are arranged in logical user-flow order (left-to-right or top-to-bottom) so developers can follow the journey. Flows are grouped and labeled (e.g. "Signup Flow", "Checkout Flow").
- **Empty, error, and loading states**: Each key screen includes states for: empty (nothing to display), error (validation failures, server errors), loading (spinners, skeletons), and success confirmations. No missing states that would force developers to guess.
- **Edge cases and long content**: Designs address what happens with long text, overflowing content, missing images, or unusual data. Truncation vs wrapping behavior is specified. Placeholder/fallback treatments are shown.
- **Consistent style application**: All text uses defined text styles (no arbitrary font sizes). All colors come from color styles (no random hex codes). Spacing follows the documented scale. Repeated elements are component instances, not detached shapes.
- **No placeholder leftovers**: Lorem ipsum, "TBD" labels, and placeholder content are replaced with realistic copy or explicitly flagged with notes like "Copy to be provided by [owner]". All open questions are surfaced in dev notes.

### 5. Interactions & Motion

- **Interactive states**: Every interactive element has designs for its relevant states: Default, Hover, Active/Pressed, Disabled, Focus (for web). These are shown as separate frames or as component Variants.
- **Prototyped key flows**: Critical user flows are linked into clickable prototypes so developers can experience the intended navigation, modal behavior, and transitions.
- **Animation and motion specs**: Any animations or transitions are documented with: trigger, duration (ms), easing curve (e.g. ease-out, cubic-bezier), and what animates (opacity, position, scale). Complex sequences are broken into steps or illustrated with a timeline/GIF.
- **Gesture and mobile interactions**: Gesture-based interactions (swipe, long-press, drag) are called out in writing. Platform-specific patterns are noted (e.g. "uses native iOS swipe-back gesture", "Android back button closes modal").

### 6. Responsive Behavior

- **Breakpoints specified**: Breakpoints are listed explicitly (e.g. "Mobile < 640px, Tablet 640–1023px, Desktop 1024px+"). Layout changes at each breakpoint are described (e.g. "sidebar collapses on tablet", "nav becomes hamburger on mobile").
- **Responsive examples**: Critical screens are shown at multiple sizes, especially where content reflows significantly. At minimum, mobile and desktop extremes are represented.
- **Platform specifics**: Differences between web and native mobile are documented. Platform-specific components or interaction patterns are labeled (e.g. "iOS-only", "Android Material variant").

### 7. Accessibility & Edge Cases

- **Color contrast**: Text and UI elements meet WCAG contrast standards. Any unusual color choices (e.g. light gray text) include contrast ratio notes or fallback documentation.
- **Keyboard and focus states**: Focus states are designed for interactive elements (especially web). Logical focus order is indicated if non-obvious. Skip-link or focus-trap requirements for modals are noted.
- **Error handling and messaging**: Error display format is specified (inline vs toast vs banner). Message styling is documented (color, icon, position). Default error copy is provided or noted as "from backend".
- **Assumptions and dependencies**: Design assumptions are documented (e.g. "Assumes user is logged in", "Dropdown options come from API"). Data source expectations are explicit. Assumptions that don't hold in production are flagged.

### 8. Assets & Exports

- **Exportables marked**: Icons, illustrations, and images have export settings pre-configured in Figma (SVG for icons, PNG/JPEG at appropriate resolutions for images). Developers can export directly without guesswork.
- **Asset organization**: Frequently used assets are gathered in a dedicated page or frame (e.g. "Assets" or "Icons") with logical grouping and labels. Third-party asset sources are noted (e.g. "Icons from Lucide React").
- **Consistent asset naming**: Asset/layer names follow a convention that translates to file names (e.g. `icon/checkmark` exports as `icon_checkmark.svg`). Naming matches the development team's convention (snake_case, kebab-case, etc.) where possible.
- **Fonts and licenses**: Custom font files or web font links are documented. Licensing requirements are communicated so the team can legally use them.

### 9. Developer Notes & Context

- **Handoff overview page**: A dedicated page or section provides high-level project context: scope (which screens/features are included), version/release info, and out-of-scope items.
- **Assumptions and open questions**: Design assumptions and unresolved questions are listed explicitly (e.g. "Date format to be confirmed", "API for filtering TBD — discuss with backend"). These are surfaced before handoff, not discovered during implementation.
- **Platform differences**: If the project spans iOS, Android, and web, design differences between platforms are documented (e.g. "Modal is full-screen on iOS, centered popup on web").
- **Linked requirements**: PRD, user stories, API docs, or other relevant documents are linked from within the Figma file (on a cover page, sticky note, or text block).
- **Embedded guidance**: Complex designs include annotation components or sticky-note comments explaining tricky logic, scroll behavior, conditional rendering, or uncommon decisions. Dev Mode annotations are used where available.
- **Asset delivery notes**: The file clarifies where assets come from — Figma exports, a CMS, a CDN, or placeholders to be replaced. Nothing is ambiguous.
- **Contact for questions**: The file identifies who to reach out to for design questions (e.g. "@designer on Slack").

### 10. Final Review

- **Self-QA pass**: The designer has reviewed the file against this checklist before declaring it ready. If any element is unclear enough that the designer would hesitate to build from it, it has been addressed.
- **Stakeholder sign-off**: Designs are approved by PM / stakeholders before being labeled ready for dev. The file represents a stable baseline, not a moving target.
- **Ready-for-dev tagging**: Finalized frames are marked with a "Ready for Dev" status or badge. The file (or a Dev Mode link) is shared with developers with appropriate access permissions.
- **Handoff meeting gameplan**: The file is structured so the handoff meeting can focus on orientation (file structure, where to find components/styles, how to use Inspect/Dev Mode) and higher-level questions, rather than scrambling for missing information.

---

## Generate Audit Report

Structure findings using the following format:

### Readiness Verdict

**Start here.** Overall pass/fail: Can a developer open this file and start building with confidence that nothing is ambiguous or missing? Give a clear yes/no with a one-sentence rationale.

### Executive Summary

- Total issues found (count by severity)
- Top 3–5 most critical gaps
- Overall readiness score: Ready / Almost Ready / Needs Work / Not Ready
- Recommended next steps

### Category Scorecard

Rate each checklist section (pass / partial / fail):

| Category | Rating | Key Issues |
|---|---|---|
| File Organization & Hygiene | — | — |
| Design Foundations | — | — |
| Components & Variants | — | — |
| Screen & State Coverage | — | — |
| Interactions & Motion | — | — |
| Responsive Behavior | — | — |
| Accessibility & Edge Cases | — | — |
| Assets & Exports | — | — |
| Developer Notes & Context | — | — |
| Final Review | — | — |

### Detailed Findings by Severity

For each issue, document:
- **Location**: Where the issue occurs (page, frame, component)
- **Severity**: Critical / High / Medium / Low
- **Category**: Which checklist section it falls under
- **Description**: What the issue is
- **Impact**: How it affects developers or the handoff
- **Recommendation**: How to fix it

#### Critical Issues
Issues that block developers from starting work — missing screens, undefined styles, ambiguous final versions.

#### High-Severity Issues
Issues that will cause significant rework or back-and-forth — missing states, undocumented interactions, inconsistent components.

#### Medium-Severity Issues
Quality gaps that slow developers down — poor naming, missing edge cases, incomplete documentation.

#### Low-Severity Issues
Nice-to-haves — optimization opportunities, minor naming inconsistencies, polish items.

### Positive Findings

Note what the file does well:
- Strong organizational practices to maintain
- Exemplary documentation or component structures
- Patterns worth replicating in future files

### Recommendations by Priority

1. **Immediate** (before handoff): Critical blockers to resolve first
2. **Short-term** (before sprint starts): High-severity gaps to close
3. **Medium-term** (during sprint): Quality improvements to address as developers encounter them
4. **Long-term** (next iteration): Systemic improvements to file structure or process

### Suggested Commands for Follow-Up

Map findings to relevant commands:
- "Use `/extract` to pull reusable patterns into the design system (addresses N component issues)"
- "Use `/harden` to stress-test edge cases in the prototype (addresses N state coverage gaps)"
- "Use `/normalize` to align implemented components with documented tokens"

---

**CRITICAL**: Severity levels should reflect developer impact:
- **Critical** = Blocks development (can't start building without this)
- **High** = Causes rework (developer will build something wrong and have to redo it)
- **Medium** = Slows progress (developer has to ask questions or make assumptions)
- **Low** = Minor friction (developer can work around it but shouldn't have to)

**NEVER**:
- Report issues without explaining developer impact (why does this matter for handoff?)
- Skip the readiness verdict (the whole point is a clear go/no-go signal)
- Mark everything as critical (prioritize ruthlessly — if everything blocks, nothing does)
- Ignore positive findings (reinforcing what works encourages good habits)
- Provide vague recommendations ("clean up naming" — be specific about which names and what to change them to)
- Assume Figma features the team may not have access to (e.g. Dev Mode, "Ready for dev" status)
- Audit visual design quality — this checklist is about handoff completeness, not whether the design is good

Remember: A developer-ready Figma file is one where developers can find everything they need without chasing down the designer — from dimensions and colors to interaction details and context. If a developer can open the file and start coding with confidence that nothing is ambiguous or missing, the file passes.
