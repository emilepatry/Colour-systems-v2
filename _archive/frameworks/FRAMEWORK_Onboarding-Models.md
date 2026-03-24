# Onboarding — Models & Case Studies

*Purpose: Named frameworks, decision models, survey heuristics, and UI pattern references for designing and evaluating onboarding flows. Use when choosing a structural approach or auditing specific touchpoints.*

Companion to [FRAMEWORK_Onboarding-Principles.md](FRAMEWORK_Onboarding-Principles.md), which covers core arguments, the 35 unified principles, and psychology concepts. For tactical checklists and the Fullscript patient lens, see [FRAMEWORK_Onboarding-Tactics.md](FRAMEWORK_Onboarding-Tactics.md).

**Sources:** *Intercom on Onboarding* (2nd Edition, 2019); Growth.Design case studies (Grammarly, Headspace).

---

## Contents

- [Frameworks and Models](#1-frameworks-and-models)
- [Surveys and Questions](#2-surveys-and-questions-grammarly)
- [Nailing the Customer's Job](#3-nailing-the-customers-job-headspace)
- [UI Design Patterns Reference](#4-ui-design-patterns-reference-intercom-ch6)

---

## 1. Frameworks and Models

### 1a. Onboarding Evolution (Intercom Ch1)

| Generation | Approach | Limitation |
|-----------|----------|------------|
| **1.0 — Interface** | Tooltips pointing out UI elements | Focuses on product, not user goals |
| **2.0 — Progress bars** | Gamified checklists (LinkedIn-style) | Measures business metrics, not user success |
| **3.0 — User success** | Understand user goals, guide to successful moments | Requires ongoing investment in user research |

### 1b. C.A.R.E. Lifecycle (Intercom Ch2)

| Phase | Goal | Key question |
|-------|------|--------------|
| **Convert** | Show value so trialists pay | Does the first experience prove the product's value? |
| **Activate** | Get paying customers to take actions that deliver value | Are customers taking the actions that lead to real outcomes? |
| **Retain** | Keep active customers on board (proactive > reactive) | Are we reaching users before they disengage, not after? |
| **Expand** | Upsell/cross-sell to active customers | Are we surfacing additional value at the right moment? |

### 1c. Three Competencies of Onboarding (Intercom Ch2)

All three must work together as a unified system:

1. **UI design patterns** — Empty states, tours, tooltips, modals, inline hints
2. **Contextual educational content** — Demos, videos, help docs, instructional copy — delivered *in context*
3. **Contextual communication** — In-app messages, emails, nudges — timed by *activity*, not calendar days

**Anti-pattern:** These three are owned by different teams with no coordination → fragmented experience.

### 1d. AIDA → AIAD Shift (Intercom Ch5)

Traditional buying: Attention → Interest → **Decision** → **Action**
Digital products: Attention → Interest → **Action** (signup) → **Decision** (to stay/pay)

**Implication:** Most users signing up have *not* decided to commit. First use must prove value while asking very little in return.

### 1e. Push / Pull / Inertia / Anxiety Forces (Intercom Ch7)

| Force | Direction | Onboarding response |
|-------|-----------|-------------------|
| **Push** | Away from current state | Signal your unique value over alternatives |
| **Pull** | Toward new product | Explain the benefit of each task; use hard claims and social proof |
| **Inertia** | Resistance to change | Provide templates, intelligent defaults, skip options |
| **Anxiety** | Fear of mistakes | Place high-visibility steps later; let users preview actions |

### 1f. 6 Elements of Effective Onboarding (Intercom Ch4)

Every onboarding flow should include all six:

1. **Welcome message** — Warmly greet users; make them feel valued
2. **Product/company identity** — Set the frame for how to think about the experience
3. **Problem(s) to be solved** — Reflect the user's situation so they see themselves in it
4. **Explicit value proposal** — Promise what users will get; set clear expectations
5. **Mechanics of using the product** — Walk through how to use it
6. **Call to action** — Prompt users to *do* something, not just read about features

### 1g. Narrative Structure (Intercom Ch4)

| Element | Question it answers |
|---------|-------------------|
| **Situation and context** | What's going on in the user's life right now? |
| **Motivation** | Why are they looking for a solution? |
| **Actions taken** | What do they do with the product? |
| **Desired outcomes** | What does success look like *in their life*? |
| **Proof points** | How will they know it's working? |

### 1h. Modular Onboarding Framework (Intercom Ch9)

A set of discrete, reusable **levels** that any product team can create, swap in, or retire:

| Element | Purpose |
|---------|---------|
| Clear objective + success metric | Each level has a measurable goal |
| Step 1: Introduce concept and value | Help users understand *why* it matters |
| Step 2: Demonstrate in context | Show how it works with minimal effort |
| Step 3: Do the simplest thing | Learning by doing, not just watching |
| Step 4: Know where to go next | Bridge to deeper product areas |

Levels are grouped by **increasing complexity**: basics → use-case-specific setup → optimization/automation.

### 1i. Two Funnels Model (Intercom Ch11)

| Funnel | Focus | Can be growth-hacked? |
|--------|-------|----------------------|
| **First funnel** | Attract and acquire (awareness → signup) | Yes — but only gets users *in the door* |
| **Second funnel** | Retain and grow (signup → success → loyalty) | No — requires great onboarding and sustained value |

**Three criteria for onboardable customers** — all three are required:

| Criterion | Without it... |
|-----------|--------------|
| **Need** | They want it and can do it, but have no real reason |
| **Desire** | They need it and can do it, but don't want to |
| **Capability** | They need it and want it, but can't authorize/purchase/use it |

---

## 2. Surveys and Questions (Grammarly)

### 13 DO's and DON'Ts (onboarding surveys)

**DO:**

- **Set clear expectations.** Tell users how the survey will benefit them.
- **Start with needs.** Prioritize questions that address the user's needs before demographics.
- **Personalize thoughtfully.** Tailor questions from context or previous answers.
- **Use progressive disclosure.** Reveal additional, contextual questions only as needed.
- **Value-focused questions.** Frame every question to highlight value to the user.
- **Match effort to output.** Align the effort you ask with the value they'll receive.
- **Consistency.** Ensure every user input leads to a clearly tailored experience.
- **Personalize paywalls.** If you use a paywall, personalize it from prior answers.

**DON'T:**

- **Neglect clarity.** Poorly communicated personalization can be worse than none.
- **Make empty promises.** Questions set expectations—deliver on them or lose trust.
- **Overload with irrelevant questions.** Ask only what's necessary; avoid repetition.
- **Neglect personas.** Make the experience valuable for all personas.
- **Assume understanding.** Make personalization and feedback obvious.

### 5 learnings (Grammarly)

1. Start with simple questions (spark effect).
2. Highlight how the questions will benefit users (framing).
3. Show you care by asking about goals early (reciprocity).
4. Personalize later questions using previous answers (progressive disclosure).
5. Avoid onboarding gaps caused by team gaps (Conway's Law).

---

## 3. Nailing the Customer's Job (Headspace)

### 5 key steps

1. **Talk to customers.** Understand desires, pains, and barriers to define jobs-to-be-done.
2. **Add an onboarding step.** Add a step that reassures users they're in the right place for their job.
3. **Automate research.** Add an option for people to say why they hired your product.
4. **Craft different paths.** After they choose a "job," provide distinct, personalized journeys.
5. **Analyze and iterate.** Track early retention to see where onboarding fails.

### 6 insights

- **Loading time = opportunities.** Use wait time to add value, not only spinners.
- **Framing customers' jobs.** Establish the right frame so people understand your product and their job.
- **Labor illusion.** Show visible effort to customize to increase perceived value.
- **Endowment effect.** Knowing JTBD helps craft offers and experiences that feel "theirs."
- **Reciprocity.** Give value before asking for information or permissions.
- **Consider user Psych.** In suboptimal context (low motivation/ability), give value first; see FRAMEWORK_Psych-BIAS.md and FRAMEWORK_Behavior-MAP.md.

---

## 4. UI Design Patterns Reference (Intercom Ch6)

| Pattern | Best for | Caution |
|---------|----------|---------|
| **Welcome message** | First greeting; warm tone; reason to engage | Keep brief; don't overload with info |
| **Modal** | Focusing attention (video, key decision) | Can feel noisy if overused |
| **Empty state** | Guiding first action; showing sample content | Don't leave a void — always provide a prompt |
| **Inline hints/tips** | Subtle "nice to know" guidance | Use to enhance, not as primary instruction |
| **Tooltips** | Explaining UI elements on hover | Sparingly — never a substitute for well-designed UI |
| **Interactive tours** | Connecting the dots in complex products | Always offer "take later" option |

All patterns become one-size-fits-all tactics when implemented without user context. The power comes from triggering them based on *who the user is*, *where they are*, and *what they've done*.
