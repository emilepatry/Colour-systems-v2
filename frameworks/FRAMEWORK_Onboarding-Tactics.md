# Onboarding — Tactics, Heuristics & Patient Lens

*Purpose: Decision heuristics, actionable checklists, Fullscript patient-specific onboarding mapping, metrics, and source references. Use when evaluating a specific onboarding flow or designing for the patient context.*

For core principles, psychology concepts, and frameworks, see `FRAMEWORK_Onboarding-Principles.md`.

**Sources:** Growth.Design case studies (Grammarly, Headspace); *Intercom on Onboarding* (2nd Edition, 2019) by Des Traynor, Samuel Hulick, et al.

---

## Contents

- [Decision Heuristics](#8-decision-heuristics)
- [Tactics Checklist](#9-tactics-checklist-actionable)
- [Patient Onboarding Lens](#10-patient-onboarding-lens-fullscript)
- [Metrics and Evidence](#11-metrics-and-evidence)
- [Key Quotes](#12-key-quotes)
- [Connections to Other Frameworks](#13-connections-to-other-frameworks)
- [Sources and Further Reading](#14-sources-and-further-reading)

---

## 8. Decision Heuristics

When evaluating an onboarding flow concept, score it against these checks:

### User-Centeredness
- [ ] Does the flow focus on the user's definition of success, not the business's metrics? (Ch1 — 3.0 vs 2.0)
- [ ] Does it address functional, personal, AND social goals? (Ch1)
- [ ] Is the narrative built around the user's story (frustration → hope → better self), not a feature tour? (Ch3)
- [ ] Does the first screen show the user they're in the right place for their specific job? (Ch1, Ch4)

### Value Delivery
- [ ] Can users experience (or tangibly see) the product's value before being asked for significant effort? (Ch5 — AIAD)
- [ ] Does each step explain *why* the user should complete it, not just *what* to do? (Ch7)
- [ ] Is the path to the "aha moment" as short as possible? Have non-essential steps been removed? (Ch5)
- [ ] Are templates, defaults, or sample content used to reduce cognitive load at demanding steps? (Ch5, Ch7)

### Flow Architecture
- [ ] Does the flow avoid linear blocking sequences? Can users skip and return? (Ch8)
- [ ] Are high-anxiety / high-visibility steps placed later, after value has been demonstrated? (Ch7)
- [ ] Does the flow support users with different permissions/roles/contexts taking different paths? (Ch8)
- [ ] Are all 6 elements present: welcome, identity, problem, value prop, mechanics, CTA? (Ch4)
- [ ] Is the onboarding modular (reusable levels/steps) rather than monolithic? (Ch9)

### Communication & Content
- [ ] Is the content designed first, then the product/UI — not the other way around? (Ch4)
- [ ] Is messaging triggered by *activity state*, not days-since-signup? (Ch1)
- [ ] Do the three competencies (UI patterns + contextual content + contextual communication) work together as a system? (Ch2)
- [ ] Is the voice warm and user-focused, not product-focused or robotic? (Ch4)

### Forces & Friction
- [ ] Does the flow strengthen Pull (make benefits vivid, use social proof and hard claims)? (Ch7)
- [ ] Does it address Inertia (provide guidance, defaults, examples for cognitively demanding tasks)? (Ch7)
- [ ] Does it calm Anxiety (let users preview actions, delay visible/risky steps)? (Ch7)
- [ ] Is there an early warning system for users who stall? (Ch1)

### Lifecycle Awareness
- [ ] Does the flow map to a C.A.R.E. phase (Convert, Activate, Retain, Expand)? (Ch2)
- [ ] Is retention strategy proactive (ongoing value) rather than purely reactive (re-engagement emails)? (Ch2)
- [ ] Is onboarding treated as an ongoing system, not a one-time shipped feature? (Ch2)
- [ ] Does the flow progressively reveal complexity rather than front-loading all features? (Ch10)
- [ ] Is education triggered by user intent/actions, not by schedule? (Ch10)
- [ ] Is there a plan for onboarding existing users to new features, not just new users? (Ch10)
- [ ] Is there a reactivation strategy for dormant users? (Ch10)
- [ ] Do target users meet all three criteria: Need + Desire + Capability? (Ch11)
- [ ] Does onboarding evolve as the product evolves? (Ch11)

### Prioritization
- [ ] Is the onboarding work focused on high-impact efforts, not "easy but does nothing" tweaks? (Ch11)
- [ ] Has the team decided whether to optimize or redesign? (Ch11)

---

## 9. Tactics Checklist (actionable)

**Survey design**

- [ ] Set clear expectations for how the survey benefits the user.
- [ ] Start with needs and goals; use demographics only when they affect needs or follow-up.
- [ ] Use value-focused questions; avoid company-centric framing.
- [ ] Use progressive disclosure; reveal questions as needed from context/answers.
- [ ] Match effort asked to value delivered; avoid unnecessary complexity.
- [ ] Ensure every input leads to a visible tailored experience.
- [ ] Make personalization obvious; don't assume users will infer it.

**Experience design**

- [ ] Use loading/wait time to add value (content, progress), not only spinners.
- [ ] Include a step that frames the customer's job and reassures they're in the right place.
- [ ] Offer a way to capture "why they hired your product" for research.
- [ ] Craft distinct paths per job; avoid catch-all screens after job selection.
- [ ] When showing plans/options, highlight the one that best matches their goals (salience).

**Organizational**

- [ ] Review handoffs between teams; reduce gaps and redundancy (Conway's Law).

**Permissions and "should do" actions**

- [ ] Give value before asking for info or permissions (reciprocity).
- [ ] Use temptation bundling for permissions (e.g. notifications + desirable outcome).

---

## 10. Patient Onboarding Lens (Fullscript)

Mapping onboarding principles to Fullscript's patient context.

### Fullscript-specific constraints

- **Post-purchase, not pre-purchase.** Primary intervention is after first order. Pre-purchase steps have historically reduced conversion; avoid adding friction before first order.
- **Longitudinal onboarding.** Onboarding spans from first contact through second practitioner visit/plan — design a system of touchpoints, not a single linear flow.
- **One enrichment action.** Aim for one clear enrichment action per patient; avoid overloading the first run.
- **Modular micro-flows.** Use small, composable modules assembled by context (plan, platform, practitioner). Deduplicate: if onboarding captures a data point, downstream surveys skip that question.

### AIAD applies post-purchase too
Patients who purchased supplements have taken **action** but haven't **decided** to become engaged app users. First app open must prove value (order status, plan visibility, quick win) before asking for effort (enrichment, permissions, profile data).

### The practitioner IS the onboarding champion
The principle of "identify and empower an onboarding leader" maps directly to the practitioner. They're the person with social capital and credibility to motivate patient engagement.

### Three-layer goals for patients
| Goal type | Patient example |
|-----------|----------------|
| **Functional** | Take the right supplements at the right time |
| **Personal** | Feel in control of my health; feel less anxious about my wellness |
| **Social** | Follow my practitioner's guidance; show up prepared for appointments |

### Push/Pull/Inertia/Anxiety for patients
| Force | Patient context |
|-------|----------------|
| **Push** | Health concern, practitioner recommendation, desire to feel better |
| **Pull** | Visible plan, order tracking, progress signals, practitioner connection |
| **Inertia** | "I already take supplements my own way"; complexity of changing routine |
| **Anxiety** | "Will I take them wrong?"; "Is this too expensive?"; "Will I be judged for missing doses?" |

### Escape hatches are critical
Patients who aren't ready for enrichment steps need clear skip paths. Blocking onboarding on optional data collection risks losing engagement entirely.

### Activity-based, not time-based messaging
"7 days since first app open" means nothing. What matters: Has the patient viewed their plan? Opened their first delivery notification? Set a reminder? Refilled?

### Content-first for the welcome flow
Build the emotional narrative first: *frustrated/uncertain patient → supported by practitioner → taking control of health → feeling better.* Then design screens around that narrative.

### Continuous onboarding maps to longitudinal care
For patients, the first app open is the *start* of onboarding, not the end. Ongoing onboarding moments include: second order, lab results received, plan refresh, practitioner visit follow-up, and seasonal wellness check-ins.

### Progressive feature revelation for patients
Don't surface wellness tracking, health goals, or advanced features on day one. Wait until the patient has established basic habits before introducing deeper engagement features.

### Need + Desire + Capability for patient segments

| Patient state | Need | Desire | Capability | Onboardable? |
|--------------|------|--------|------------|-------------|
| **State A** (plan + purchased) | Yes — practitioner prescribed | Yes — already invested financially | Yes — has account, app access | **Yes** — full onboarding |
| **State B** (plan, no purchase) | Partial — has a recommendation | Unclear — hasn't committed | Yes — has account | **Maybe** — needs desire-building |
| **State C** (no plan) | No — no active health context | Unknown | Yes — has account | **No** — needs a practitioner relationship first |

---

## 11. Metrics and Evidence

- **Grammarly:** Carefully crafted onboarding survey + contextual paywall → upgrade rates increased **10%+**.
- **Tours:** 3-step tours ~**72%** completion; 7-step tours ~**16%** — simplicity wins.
- **First use:** ~**25%** of users abandon after a single use; first impression and time-to-value are critical.
- **Time-to-value and early retention** are the metrics that best predict whether users stick.

---

## 12. Key Quotes

> "People don't buy products; they buy better versions of themselves."
> — Samuel Hulick (Ch4)

> "In the first 15 seconds of every new experience, people are lazy, vain and selfish."
> — Scott Belsky, CPO Adobe (Ch5)

> "Signing up for a new product is an expression of hope."
> — Samuel Hulick (Ch3)

> "Onboarding is the online equivalent of white glove service — holding your customer's hand as you guide them from feature to feature, flow to flow, listening to their intentions."
> — Des Traynor (Introduction)

> "The worse onboarding performs, the more often it will be the ONLY part of a product that a given user sees."
> — Samuel Hulick (Foreword)

> "That's like waiting until you see divorce papers before checking how your spouse is doing."
> — Des Traynor, on reactive vs proactive retention (Ch1)

> "Onboarding is the bridge between the user's stage of desire for value and the value they actually get — that's what makes software successful."
> — Des Traynor (Conclusion)

> "The number one mistake every business makes with onboarding is thinking from the inside out."
> — Des Traynor (Conclusion)

---

## 13. Connections to Other Frameworks

| Concept | Related framework | Connection |
|---------|-------------------|------------|
| Successful moments / aha moment | FRAMEWORK_Psych-BIAS.md | Successful moments are high-Psych moments. Each one adds to NPV. |
| Push/Pull/Inertia/Anxiety | FRAMEWORK_Behavior-MAP.md | Push + Pull ≈ Motivation; Inertia + Anxiety ≈ inverse of Ability. B = M × A × P. |
| Three-layer goals | FRAMEWORK_Psych-BIAS.md | Personal and social goals drive System 1; functional goals are System 2. |
| AIAD / low-intent users | FRAMEWORK_Psych-BIAS.md | Low-intent = low starting Psych. Every friction point hits harder. |
| Content-first narrative | FRAMEWORK_6P-Story.md | Narrative structure parallels 6P Story structure. |
| Escape hatches / skip patterns | FRAMEWORK_Journey-Mapping.md | Blocking steps are "pits." Skip options convert pits into neutral transitions. |
| Proactive retention | FRAMEWORK_Journey-Mapping.md | Proactive retention = designing peaks throughout the lifecycle. |
| Progressive feature revelation | FRAMEWORK_Psych-BIAS.md | Revealing features at the right moment avoids System 2 overload. |

---

## 14. Sources and Further Reading

### Books
- *Intercom on Onboarding*, 2nd Edition (2019). ISBN: 978-1-7323863-2-7.

### Case studies
- [Growth.Design – Grammarly](https://growth.design/case-studies)
- [Headspace User Onboarding](https://growth.design/case-studies/headspace-user-onboarding/)

### Psychology
- [NNG – Reciprocity Principle](https://www.nngroup.com/articles/reciprocity-principle/)
- [Growth.Design – Psychology / Framing](https://growth.design/psychology#framing)
- [Growth.Design – Aha Moment](https://growth.design/psychology#aha-moment)

### JTBD
- [jtbd.info](https://jtbd.info/2-what-is-jobs-to-be-done-jtbd-796b82081cca)
- [HBR – Know Your Customers' Jobs to Be Done](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)
- Clay Christensen, Jobs-to-be-Done theory

### Behavior
- [Behavior Model](https://www.behaviormodel.org/)
- [UI Patterns – Trigger](https://ui-patterns.com/patterns/Trigger)

### Personalization
- [McKinsey – The value of getting personalization right (or wrong)](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right-or-wrong-is-multiplying)

### Loading UX
- [Stop using a loading spinner](https://uxdesign.cc/stop-using-a-loading-spinner-theres-something-better-d186194f771e)

### Aha moment / TTV
- [Appcues – Aha moment guide](https://www.appcues.com/blog/aha-moment-guide)
- [Appcues – Time to value](https://www.appcues.com/blog/time-to-value)

### Other
- [Conway's Law – Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_law)
- Samuel Hulick, [UserOnboard](https://www.useronboard.com/)
- Scott Belsky, "The First 15 Seconds" principle

### Primary reference documents
- Grammarly Onboarding Survey Cheat Sheet (PDF)
- Headspace User Onboarding Checklist (PDF)
