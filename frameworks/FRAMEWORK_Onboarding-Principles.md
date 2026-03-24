# Onboarding — Principles & Frameworks

*Purpose: Core arguments, 35 unified principles, psychology concepts, and frameworks for designing onboarding. Use when establishing onboarding philosophy or auditing whether a flow is user-centered.*

A source-of-truth for user onboarding grounded in psychology, UX research, case studies, and proven frameworks. For named models, surveys, and case studies, see [FRAMEWORK_Onboarding-Models.md](FRAMEWORK_Onboarding-Models.md). For tactical checklists, decision heuristics, and the Fullscript patient lens, see [FRAMEWORK_Onboarding-Tactics.md](FRAMEWORK_Onboarding-Tactics.md).

**Sources:** Growth.Design case studies (Grammarly, Headspace); *Intercom on Onboarding* (2nd Edition, 2019) by Des Traynor, Samuel Hulick, et al.

---

## Contents

- [Core Arguments](#1-core-arguments)
- [Unified Principles](#2-unified-principles) (35 principles)
- [Psychology and UX Concepts](#3-psychology-and-ux-concepts-reference)

---

## 1. Core Arguments

Five thesis-level claims from *Intercom on Onboarding*:

1. **Onboarding is about user success, not business metrics.** The best onboarding pays less attention to getting users to complete steps the business cares about and more to getting them to experience "successful moments." Completion of a progress bar ≠ activated user. (Ch1)

2. **Content should come first, product second.** Writing the narrative before building anything ensures the experience is designed around the user's story rather than bolted on afterwards. Content is not a bandage for a broken product. (Ch4)

3. **Onboarding is a continuous lifecycle mission, not a finite project.** It spans Convert → Activate → Retain → Expand. Treating it as a one-time shipped feature owned by a single team is the wrong approach. (Ch2)

4. **The user's story — not your feature list — should drive onboarding design.** Signing up is an "expression of hope." The story begins with the user's frustrating situation and ends with a better version of themselves. Your product appears late in that story. (Ch3)

5. **Four forces govern every adoption decision.** Push (pain with current state), Pull (promise of new product), Inertia (resistance to change), and Anxiety (fear of mistakes) must all be addressed. (Ch7)

---

## 2. Unified Principles

35 principles synthesized across all sources. Principles 1–10 originate from Grammarly/Headspace case studies; where Intercom reinforces them, the additional source is noted. Principles 11–35 are from *Intercom on Onboarding*.

| # | Principle | Definition | Anti-pattern | Source |
|---|-----------|-----------|--------------|--------|
| 1 | **Give value before asking** | When users give (answers, permissions), they expect to get. Show you listen and deliver on their needs as early as possible. | Asking for 6 favors in a row before delivering any value | Grammarly/Headspace (Reciprocity); reinforced by Intercom Ch5 (AIAD — users haven't decided to commit, so prove value first) |
| 2 | **Optimize for the aha moment and time-to-value** | Get users to the moment they first realize your product's value as fast as possible. Longer wait = higher churn. | Generic product tours that delay the moment of realized value | Grammarly/Headspace; reinforced by Intercom Ch5 and Ch7 |
| 3 | **Personalize from real input; make personalization obvious** | Tailor questions and next steps from context or prior answers. Don't assume users will infer personalization — make it clear. | Asking questions but never visibly acting on the answers | Grammarly/Headspace |
| 4 | **Use loading and waiting time to add value** | Replace dead spinners with useful content, reassurance, or progress so wait time feels productive. | Empty loading screens with only a spinner | Headspace (Labor illusion) |
| 5 | **Frame around jobs-to-be-done and show you're the right place** | Establish why they're here and that you can help with their specific job. Add an onboarding step that reassures they're in the right product. | One-size-fits-all welcome with no job framing | Grammarly/Headspace; reinforced by Intercom Ch1, Ch3, Ch5 |
| 6 | **Match ask effort to value delivered; avoid empty promises** | Questions set expectations. If you ask, deliver a tailored experience or risk losing trust. | Lengthy surveys that don't visibly change the experience | Grammarly/Headspace; reinforced by Intercom Ch5 |
| 7 | **Design across team boundaries** | Onboarding gaps often mirror org structure (Conway's Law). Align handoffs so the experience is consistent, not fragmented. | Different teams owning different steps with no coordination → fragmented experience | Grammarly/Headspace (Conway's Law); reinforced by Intercom Ch2, Ch9 |
| 8 | **Consider Psych (motivation × ability)** | In low-motivation or low-ability contexts, asking for info or money rarely works. Give value first to improve context. | Asking for credit card or extensive profile data from low-intent users | Grammarly/Headspace; see FRAMEWORK_Psych-BIAS.md |
| 9 | **Build ownership and perceived effort where appropriate** | Endowment (feeling something is "theirs") and labor illusion (visible effort to customize) increase perceived value. | Instant generic results with no visible customization effort | Grammarly/Headspace |
| 10 | **Use temptation bundling for "should do" actions** | Pair unattractive actions (e.g. enable notifications) with attractive rewards (e.g. "Don't miss your surprise bag") so motivation aligns with the new behavior. | Permission requests with no explanation of the user benefit | Grammarly/Headspace |
| 11 | **Focus on successful moments, not step completion** | Design for the moments where users experience real value, not for filling progress bars or database fields. | Forcing users through configuration steps that serve the business but don't help the user | Intercom Ch1 |
| 12 | **Understand functional, personal, AND social goals** | Users have three layers of goals: functional (do the task), personal (feel in control), social (impress others). Address all three. | Asking only about functional needs; ignoring emotional and social motivations | Intercom Ch1 |
| 13 | **Let users declare intent upfront** | If users have different jobs-to-be-done, let them self-select early so the rest of the flow can be tailored. | One-size-fits-all flow after a generic welcome | Intercom Ch1 |
| 14 | **Message by activity, not by time** | "7 days since signup" is meaningless. What matters is what the user has or hasn't done. Base communication on usage state. | Drip campaigns triggered by days-since-signup regardless of engagement | Intercom Ch1 |
| 15 | **Build early warning systems** | Know what failure/churn looks like and start the conversation before it's too late — don't wait for cancellation. | "How can we get you back?" emails sent after the user has already checked out | Intercom Ch1 |
| 16 | **Proactive retention beats reactive retention** | Continually ship value, offer training, create best practice content, invite to community — before users disengage. | Discounts and pleading emails only after users stop engaging | Intercom Ch2 |
| 17 | **Start with the user's story, not your features** | Onboarding begins at the user's frustrating situation, not at your signup screen. Your product enters the story late. | Welcome tours that start with "Here are our features" | Intercom Ch3 |
| 18 | **Interview recently-switched users** | Interview people who just crossed from signup to engaged. They're proven customers who still remember the emotional journey. | Relying only on analytics or NPS text boxes for onboarding insights | Intercom Ch3 |
| 19 | **Build the narrative before writing copy** | Define situation → motivation → actions → outcomes → proof points before any screen content is written. | Writing UI copy screen-by-screen without an overarching narrative structure | Intercom Ch4 |
| 20 | **Content first, product second** | Think about the content (what users need to hear) before building the UI. Content isn't a bandage for bad product design. | Designing screens first, then asking a copywriter to "fill in the words" | Intercom Ch4 |
| 21 | **AIAD: Users act before deciding** | For digital products, signup comes before the purchase decision. First use must prove value while asking minimal effort. | Treating signups as committed customers; front-loading configuration before value | Intercom Ch5 |
| 22 | **Show, don't tell; do, don't show** | Best: let users experience value directly. Next best: make value tangible and specific. Worst: describe value abstractly. | "We help you be more productive" vs. showing estimated earnings (Airbnb) | Intercom Ch5 |
| 23 | **Find the minimum viable flow** | Remove all non-essential steps between signup and value. Templates and presumptuous defaults eliminate effort. | Requiring account creation before letting users experience the product | Intercom Ch5 |
| 24 | **Place high-anxiety steps later** | Highly visible actions (sending emails, posting publicly) create anxiety. Introduce them only after users have experienced value and built confidence. | Requiring users to send a live message or make a visible commitment during first use | Intercom Ch7 |
| 25 | **Explain the benefit of EACH task** | Every onboarding step should say *why* — what the user gains — not just *what* to do. Use hard claims and social proof to strengthen pull. | "Enter your API key" with no explanation of what it enables | Intercom Ch7 |
| 26 | **Design for non-linear paths and groups** | Assume that at each step, the task may be someone else's job. Let people skip, delegate, and return. Linear blocking sequences fail for groups. | A 5-step linear flow where step 3 requires permissions the current user doesn't have | Intercom Ch8 |
| 27 | **Provide escape hatches at every blocking step** | Let users skip to steps they *can* complete. The conversion lost on one skipped step is recovered by overall progress and product comprehension. | Blocking the entire flow because one step requires a credit card the user doesn't have | Intercom Ch8 |
| 28 | **Identify and empower an onboarding champion** | Find the person willing to push adoption through obstacles and arm them with resources (ROI docs, guided tours, talking points). | Assuming every user is equally motivated and equally empowered to complete setup | Intercom Ch3, Ch8 |
| 29 | **Build a design system for onboarding** | Treat onboarding as a modular system with reusable levels, steps, components, and guidelines. Empower all teams to contribute while maintaining cohesion. | One-off patterns per product launch with no shared framework | Intercom Ch9 |
| 30 | **Progressively reveal complexity** | Like video games, only show immediate surroundings. Reveal features based on evidence the user is ready — not on day one. | Front-loading all features and information at signup | Intercom Ch10 |
| 31 | **Trigger education by intent, not schedule** | Show advanced information when users demonstrate interest. Less hand-holding = deeper retention of learning. | Calendar-based educational drip campaigns that ignore what the user has or hasn't done | Intercom Ch10 |
| 32 | **Feed the grazers, guide the hunters** | Some users self-serve ("hunters"); others need to be "fed" information ("grazers"). Set up prompts for reluctant users while staying out of the way of power users. | Designing onboarding only for self-motivated users; no fallback prompts for users who don't take initiative | Intercom Ch10 |
| 33 | **Help users form habits across platforms** | Promote multi-platform adoption (mobile, browser extension, desktop) to increase product dependency. | Ignoring mobile/extension adoption as part of onboarding | Intercom Ch10 |
| 34 | **Onboard existing users to new features** | "Get it used" not "get it launched." Use just-in-time information when users are in position to use the feature. | Launching a feature with no contextual onboarding; relying solely on a changelog | Intercom Ch10 |
| 35 | **Need + Desire + Capability** | You can only onboard users who have all three. No two of three are enough. Identify which criterion is missing and address it. | Trying to onboard everyone regardless of whether they need, want, or can use the product | Intercom Ch11 |

---

## 3. Psychology and UX Concepts (reference)

| Concept | Definition | Onboarding implication |
|--------|------------|-------------------------|
| **Reciprocity** | When people receive something, they feel a need to give back. | Give value before asking for info or permissions. |
| **Endowment effect** | People value something more when they feel it's theirs. | Use JTBD and inputs to create a sense of ownership. |
| **Labor illusion** | People trust and value results more after a visible, crafted delay. | Show effort to customize to elevate perceived value. |
| **Jobs-to-be-done (JTBD)** | Someone wants to change a situation into a preferred one. | Frame onboarding around their job; ask why they "hired" your product. |
| **Aha moment** | When users first realize the value of the product. | Shorten time to this moment; keep onboarding simple. |
| **Temptation bundling** | Pair "should do" with "want to do." | Bundle permission asks with desirable outcomes. |
| **Conway's Law** | Organization structure is reflected in the product. | Design and align handoffs across teams. |
| **Zeigarnik effect** | Unfinished tasks stay top of mind. | Use progress and "one more step" to motivate completion. |
| **Hick's Law** | More choices → longer decisions and more cognitive load. | Limit options; use progressive disclosure. |
| **Goal gradient effect** | People accelerate as they get closer to a goal. | Show progress to encourage completion. |
| **Peak–End Rule** | Memory is weighted by peak and end moments. | Design strong peaks and a clear, positive end. See FRAMEWORK_Journey-Mapping.md. |

