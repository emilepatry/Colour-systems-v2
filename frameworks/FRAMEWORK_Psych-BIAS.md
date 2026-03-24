# Psych & BIAS Framework
*Purpose: Psych scoring formula (NPV = Motivation - Friction), BIAS framework stages, and System 1/System 2 analysis.*

A framework for quantifying user motivation/friction and designing for how the brain actually works.

---

## What is the Psych Framework?

The Psych Framework quantifies user experience by treating motivation and friction as measurable variables. Think of Psych as a user's "health points" in a video game.

### The Core Formula

```
Psych = Motivation × Ability
```

**Net Perceived Value (NPV):**
```
NPV = Motivation - Friction
```

Every interaction either adds or subtracts from the user's Psych level based on this equation.

| Psych Level | Result |
|-------------|--------|
| 💙 High Psych | User continues |
| ☠️ Low Psych | User drops off |

---

## Psych Variation Benchmarks

Use these as rough guides—focus on relative impact, not exact numbers.

### Negative Variations (Decreases Psych)

| Element | Impact |
|---------|--------|
| Confusion/Uncertainty | -2 to -5 |
| Form fields | -1 per field (more for sensitive info) |
| Loading/Waiting | -3 to -10 (depending on duration) |
| Price shock | -5 to -15 |
| Trust concerns | -5 to -10 |

### Positive Variations (Increases Psych)

| Element | Impact |
|---------|--------|
| Clear value proposition | +3 to +5 |
| Social proof | +2 to +4 |
| Price relief (better than expected) | +5 to +10 |
| Progress indicators | +1 to +3 |
| Personalization | +2 to +5 |

> 💡 **Focus on insights, not numbers.** Psych is a mental model to help you think like your users. The exact numbers matter less than understanding relative impact.

---

## What is the BIAS Framework?

BIAS is a systematic approach to designing experiences that work with how the brain naturally processes information.

### The BIAS Process

| Stage | Question | Focus |
|-------|----------|-------|
| **B**lock | What do users filter out? | Attention |
| **I**nterpret | How do users understand? | Comprehension |
| **A**ct | What drives action? | Behavior |
| **S**tore | What do users remember? | Memory |

---

## System 1 vs System 2 Thinking

### The Two Modes

| System 1: Automatic | System 2: Deliberate |
|---------------------|---------------------|
| Driven by instinct and prior learning | Driven by logic and deliberation |
| Fast, intuitive, emotional | Slow, analytical, rational |
| Handles ~95% of daily decisions | Energy-intensive, used sparingly |
| Pattern recognition and shortcuts | Complex problem-solving |

**Key insight:** Even when we believe we're making rational decisions, our biases (System 1) drive many of our choices. Design for System 1—make experiences feel effortless.

---

## Block: What Users Filter Out

Our brains automatically filter information to conserve energy.

### What Gets Blocked

**High-Effort Content**
- Too many choices (Hick's Law: decision time increases with options)
- Large blocks of text
- Complex navigation

**Unrelated Information**
- Content outside current task focus (Selective Attention)
- Irrelevant features or options

**Redundant Patterns**
- Content resembling ads (Banner Blindness)
- Screen edges: logos, footers (Edge Blindness)

### What Captures Attention

- **Priming** — Recent exposure increases awareness
- **Belief confirmation** — Content matching existing beliefs
- **Pattern breaks** — Novel or surprising elements
- **Personalization** — Customized experiences

---

## Interpret: How Users Understand

Context and framing dramatically affect comprehension.

### Key Interpretation Principles

| Principle | Application |
|-----------|-------------|
| **Familiarity** | Use existing mental models and known patterns |
| **Cognitive Load** | Minimize mental effort; focus on essentials |
| **Benefits First** | Lead with user value, not features |
| **Anchoring** | First information sets expectations |
| **Loss Aversion** | People hate losing more than they like winning |
| **Labor Illusion** | Show work being done to build perceived value |

---

## Act: Reducing Friction & Adding Nudges

### Friction Reduction Strategies

| Strategy | How it works |
|----------|--------------|
| **Remove options** | Apply Hick's Law; eliminate unnecessary choices |
| **Valid defaults** | Pre-fill sensible options (~5% change defaults) |
| **Split steps** | Multi-step forms can be 271% more effective |
| **Progressive disclosure** | Reveal features gradually |

### Effective Nudges

| Nudge | Application |
|-------|-------------|
| **Social proof** | Reviews, ratings, expert endorsements |
| **Curiosity gap** | Tease upcoming content |
| **Authentic scarcity** | Time-limited offers (never fake) |

---

## Store: Creating Lasting Impressions

Every interaction leaves a memory that affects future behavior.

### What Creates Positive Storage

- **Clear feedback** — Confirm actions taken, show progress
- **Reassurance** — Build confidence, reduce anxiety
- **Feeling of caring** — Show empathy, prioritize user needs
- **Delighters** — Exceed expectations, create memorable moments

### The Storage Loop

```
Positive Experience → Positive Storage → Less Blocking → 
Better Interpretation → Easier Action → More Positive Experiences
```

---

## Design Principles Integration

### Reveal the Invisible
Make progress visible by surfacing signals patients can't easily see (trends, labs, wellness scores). This builds Psych by showing that effort leads to results.

### Action Over Information
Never present data without a clear implication. Insight only matters if it leads to a meaningful next step. Information without action depletes Psych.

---

## Practical Application: Psych Analysis

### How to Conduct a Psych Analysis

1. **Screenshot key screens** in the user flow
2. **Add speech bubbles** for what users might think
3. **Assign Psych variations** to each element (+/-)
4. **Calculate cumulative Psych** through the flow
5. **Identify danger zones** where Psych drops below 0

### Red Flags to Watch For

- Cumulative Psych below 0
- Sharp drops (-10 or more in one step)
- Multiple friction points in sequence
- No positive reinforcement
- Misaligned user expectations

---

## Common Psych Patterns

### Onboarding Flow
```
Initial excitement: +5
Each form field: -1
Value proposition: +3
Account creation: -5
First success: +10
```

### Purchase Flow
```
Product discovery: +3
Price reveal: -5 to -10
Trust signals: +2 to +4
Payment form: -3 to -5
Order confirmation: +5
```

---

## Quick Reference Checklists

### Block Checklist
- [ ] Minimize choices (Hick's Law)
- [ ] Remove ad-like elements
- [ ] Keep critical info center-screen
- [ ] Use priming for important actions
- [ ] Add personalization where valuable

### Interpret Checklist
- [ ] Use familiar patterns
- [ ] Reduce cognitive load
- [ ] Lead with benefits
- [ ] Create clear anchors
- [ ] Ensure discoverability

### Act Checklist
- [ ] Remove unnecessary options
- [ ] Set powerful defaults
- [ ] Split complex tasks
- [ ] Add social proof
- [ ] Use progressive disclosure

### Store Checklist
- [ ] Provide clear feedback
- [ ] Offer reassurance
- [ ] Show you care
- [ ] Add delighters
- [ ] End on high note

---

## Key Insight: Not All Friction is Bad

Sometimes adding steps *increases* conversion:
- **Atlassian** added fields to signup → 3.5% absolute lift (51.5% → 55.0%)
- **Good friction** builds trust or value
- **Bad friction** creates unnecessary obstacles

Ask: Does this friction serve the user's goals or only the business's?
