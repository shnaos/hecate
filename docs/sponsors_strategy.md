# Sponsor Strategy

## Purpose

This document explains how Hecate can align with sponsor tracks without losing product coherence or over-expanding the MVP.

The sponsor strategy must support the product vision.
It must not replace it.

## Core Rule

Sponsor alignment is useful only if it strengthens the MVP narrative.

It must never become an excuse for:
- feature creep
- architectural bloat
- fake integrations
- weak demo coherence
- sponsor stacking without meaningful usage

## Hecate Core Narrative

Hecate is a privacy-first wallet MVP that:
- reviews user intent before execution
- explains the selected execution path
- prefers privacy when available
- executes only after clear user approval

Core idea:

**review -> explain -> execute**

This core narrative must remain stable across all sponsor mappings.

## Sponsor Mapping Principle

Each sponsor should correspond to a clear role in the product.

A sponsor should not be included unless:
- its role is understandable
- its usage is meaningful
- it strengthens the demo
- it does not overload the MVP

## Sponsor Role Model

### Sponsor 1
Role:
Primary wallet, account, or UX-facing integration layer.

Expected contribution:
- wallet-facing user journey
- connection surface
- visible product integration

Constraint:
Must remain understandable in the final demo.

### Sponsor 2
Role:
Primary privacy-preserving execution path.

Expected contribution:
- private route
- privacy-first execution narrative
- meaningful difference versus public execution

Constraint:
Must be visible in the route selection or execution story.

### Sponsor 3: Chainlink
Role:
Decision support and workflow orchestration layer.

Possible contribution areas:
- analysis before execution
- scoring or qualification of available rails
- privacy-preserving workflow orchestration
- offchain handling of sensitive inputs
- optional AI / LLM-related orchestration if meaningfully integrated
- external signal or API-assisted decision support
- confidential workflow support where relevant

Constraint:
Chainlink must not be reduced to a cosmetic mention.
Its role must be meaningful in the actual flow.

## Chainlink Strategy

Chainlink should be framed as a lightweight orchestration and decision-support layer, not as the entire product.

Good framing:
- user submits an intent
- Hecate evaluates available rails
- a workflow or decision-support layer contributes analysis or qualification
- Hecate presents a simple explanation
- the user approves execution
- execution produces a visible onchain result

Bad framing:
- generic AI chatbot
- decorative AI summary with no effect
- sponsor mention without real integration
- broad infrastructure unrelated to the demo

## AI Strategy

If AI is used, it must stay subordinate to the product flow.

Good use of AI:
- help classify or qualify execution context
- help generate a simpler user-facing explanation
- help structure decision support before execution

Bad use of AI:
- autonomous agent replacing the wallet
- vague “AI-powered” branding with no demonstrable role
- large agent architecture with no MVP value

## Ledger Strategy

Ledger should be framed as the secure final approval or signing layer.

Its value in the narrative:
- the user retains control
- final signature remains explicit
- stronger assurance exists at the point of approval

Ledger should not force the MVP into a large hardware integration scope unless it is realistically implementable.

## Public vs Private Narrative

The MVP should preserve a clean two-rail story:
- public route
- private route

The user should understand:
- which route is selected
- why it is selected
- what happens before final approval

This is the central bridge between sponsors and product.

## MVP Boundaries

Even with multiple sponsors, the MVP should stay limited to:
- Chrome extension
- wallet create/import/unlock
- review screen
- route probing
- explicit decision
- one private send flow
- visible final result

Do not add:
- mobile
- Firefox
- bridge logic
- cross-chain complexity
- broad workflow engines
- multiple parallel sponsor experiments

## Sponsor Decision Standard

A sponsor integration is worth keeping only if:
- it improves the final demo
- it is understandable in one sentence
- it is technically achievable in MVP scope
- it makes the project stronger, not noisier

If a sponsor role cannot be explained simply, it is too broad for the MVP.

## Recommended Narrative for Judges

Hecate is a privacy-first wallet that helps users understand execution before signing.

It can evaluate public and private rails, produce an explicit decision, and preserve user control over the final action.

Where relevant, a lightweight orchestration layer can assist with analysis and explanation before execution, while the final approval remains under secure user control.

## Final Rule

The product leads.
The sponsors support.

Never invert that relationship.