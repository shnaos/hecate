# hecate

Hecate is a privacy-first smart wallet MVP built as a minimal Chrome extension.

It helps users understand an action before signing it, selects the most appropriate execution path, and executes it through a clear review flow.

## Core idea

**review -> explain -> execute**

## MVP Demo

- open extension
- create or unlock wallet
- enter transfer intent
- probe available rails
- display explicit route decision
- execute one private transfer
- show final result

## What makes it different

Most wallets ask users to sign opaque transaction data.

Hecate adds a decision layer before execution:
- detect available route
- explain the selected route
- prefer privacy when available
- execute only after clear review

## Included

- Chrome extension
- wallet create/import/unlock
- status screen
- review screen
- rail probing
- decision explanation
- one private send flow
- final result

## Excluded

- mobile
- Firefox
- cross-chain
- bridge logic
- advanced settings
- full platform abstractions

## Success criteria

The MVP succeeds if a user can:
- open the extension
- unlock a wallet
- submit an intent
- understand the selected route
- execute a private transfer
- see the final result

## Vision

A wallet should not ask for blind trust.

It should explain first.