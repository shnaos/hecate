# Product Vision

## Summary

Hecate is a privacy-first wallet designed to help users understand and control execution before they sign.

Its purpose is not only to execute transactions, but to make execution intelligible, selective, and safer for the end user.

The MVP focuses on a minimal Chrome extension experience.

Core idea:

**review -> explain -> execute**

## Product Intent

Most wallets expose opaque transaction flows and ask users to trust the interface.

Hecate aims to reverse that model.

Before execution, Hecate should:
- inspect the user intent
- determine whether a public or private path is available
- explain the selected path in simple language
- let the user approve execution through a secure signing step

## High-Level User Promise

Hecate is a wallet that:
- prefers privacy when possible
- remains understandable for non-expert users
- exposes a simple explanation before execution
- preserves user control over the final action

## Execution Model

Hecate is envisioned as a wallet with two execution modes:

### 1. Public mode
Used when a private route is unavailable, unnecessary, or less appropriate for the current action.

### 2. Private mode
Used when a privacy-preserving route is available and valid.

The wallet should be able to evaluate both paths and select the most appropriate one for the user intent.

## Decision Layer

A core part of the product is the decision layer before execution.

This layer should:
- inspect available rails
- analyze the request context
- score or qualify the available path
- produce a simple user-facing explanation
- support a final execution decision

The goal is not to expose technical complexity to the end user.

The goal is to transform route selection into a simple and understandable explanation.

Examples:
- private route available and preferred
- private route unavailable, public route selected
- execution blocked pending user confirmation
- execution requires stronger signing assurance

## Privacy Model

Privacy is the default preference, not an absolute rule.

Hecate does not force private execution in all cases.
Instead, it attempts to:
- prefer privacy when available
- remain honest when privacy is not available
- avoid misleading the user
- make the selected path explicit before execution

## External Roles in the Product Vision

The broader product vision may involve specialized external roles:

### Private execution layer
A dedicated privacy-preserving route may power private execution.

### Decision / orchestration layer
An external workflow or orchestration layer may assist with:
- analysis
- scoring
- offchain qualification
- privacy-preserving data handling
- understandable explanation generation

### Secure signing layer
A final secure signing step may be handled through a hardware-backed signer such as Ledger.

This keeps final approval under explicit user control.

## MVP Interpretation

The MVP does not need to implement the full long-term system.

The MVP only needs to prove the product thesis through a small but credible demo.

The MVP should demonstrate:
- a wallet UI
- a user intent
- route probing
- an explicit decision
- one private execution flow
- a visible final result

## UX Principles

The user experience should be:
- simple
- explicit
- privacy-first
- non-opaque
- non-threatening
- understandable by a non-technical user

The wallet should not behave like an opaque black box.

The wallet should explain first, then execute.

## Non-Goals

The MVP is not trying to deliver:
- a complete production wallet
- multi-platform support
- a full cross-chain execution engine
- a generalized orchestration platform
- a full autonomous AI wallet
- a broad compliance platform

## Product Standard for the MVP

The MVP is successful if a user can:
- open the extension
- create or unlock a wallet
- submit an intent
- understand whether a public or private route is selected
- understand the explanation shown before execution
- approve the action
- see a clear final result

## Long-Term Direction

Long term, Hecate may evolve into a wallet that combines:
- public and private execution
- explainable route selection
- privacy-preserving orchestration
- secure final signing
- stronger user protection against blind confirmation

But the MVP must stay focused on the smallest version that proves this direction.
