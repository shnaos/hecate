# Hecate

Hecate is a privacy-first smart wallet MVP built as a minimal Chrome extension.

It helps users understand an action before signing it, evaluate public and private execution paths, and execute through a clear review flow.

Hecate is designed to make wallet execution more intelligible for end users by combining route probing, explicit decision output, and visible user approval before execution.

## Core idea

**review -> explain -> execute**

## MVP Demo

The MVP demo is intentionally narrow:

- open the Chrome extension
- create, import, or unlock a wallet
- enter a transfer intent
- probe available execution rails
- display an explicit route decision
- explain the selected route in simple language
- confirm the action through a final approval step
- execute one private transfer
- show the final result

## What makes it different

Most wallets ask users to sign opaque transaction flows.

Hecate adds a decision layer before execution:

- inspect the user intent
- evaluate public and private routes
- prefer privacy when available
- explain the selected route clearly
- preserve explicit user control before final execution

## Included in this MVP

- Chrome extension
- React popup UI
- wallet create/import/unlock
- status screen
- review screen
- rail probing
- explicit decision output
- one private send flow
- final approval boundary
- visible final result

## Excluded from this MVP

- mobile
- Firefox
- bridge logic
- cross-chain execution
- advanced settings
- full platform abstractions
- broad AI agent behavior
- generalized orchestration platform features

## Success criteria

The MVP succeeds if a user can:

- open the extension
- create, import, or unlock a wallet
- submit an intent
- understand whether a public or private route is selected
- understand the explanation shown before execution
- confirm the action through a clear approval step
- execute a private transfer
- see a clear final result

## Product direction

Hecate is built around a simple product thesis:

A wallet should not ask for blind trust.

It should explain first.

## Sponsor alignment

Hecate may align with sponsor tracks where that strengthens the MVP narrative, especially around:

- privacy-preserving execution
- secure final approval
- lightweight orchestration or decision support

But the product leads.
The sponsors support.

### Current sponsor status (honest demo state)

- Unlink: feasibility spikes were completed, but the current popup architecture hit a real SDK-loading blocker for a small change path, so Unlink is not integrated in this build.
- Chainlink: not integrated in this MVP build.
- Ledger: not integrated in this MVP build.
- Current private send and approval behavior are local demo flows for presentation clarity.

## Development approach

This repository is built as a greenfield hackathon MVP.

The implementation is intentionally incremental:
- small reviewable diffs
- one task at a time
- one coherent branch per step
- minimal architecture
- demo-first delivery

## Current focus

The current focus is to ship the smallest coherent version of Hecate that proves:

- a wallet can inspect intent before execution
- a wallet can prefer privacy when available
- a wallet can explain the decision clearly
- a wallet can preserve explicit user approval
- a private route can be demonstrated end-to-end
