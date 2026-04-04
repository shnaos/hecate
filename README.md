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

## Unlink setup for first run

This repository includes one standalone sponsor-test script:

- `scripts/unlink-smoke.mjs`

The script runs outside the popup and performs:

1. Unlink client setup
2. sender registration
3. one private transfer
4. final status polling

### 1) Get prerequisites (manual, outside this repo)

1. Create or access your Unlink account and obtain:
   - API key
   - mnemonic for the sender Unlink account
2. Use a Base Sepolia-compatible Unlink engine URL from the sponsor/docs.
3. Ensure the sender account has private token balance to transfer.
   - If needed, use Unlink funding/deposit/faucet steps outside this repo.

### 2) Prepare environment

Copy `.env.example` and fill values:

```bash
cp .env.example .env
```

Required env vars:

- `UNLINK_ENGINE_URL`
- `UNLINK_API_KEY`
- `UNLINK_MNEMONIC`
- `UNLINK_RECIPIENT` (must be an `unlink1...` address)
- `UNLINK_TOKEN` (ERC-20 token address)
- `UNLINK_AMOUNT` (smallest unit for that token)

Optional env vars:

- `UNLINK_POLL_INTERVAL_MS` (default `4000`)
- `UNLINK_POLL_TIMEOUT_MS` (default `180000`)

### 3) Obtain a valid `unlink1...` recipient

Use one of these:

1. Recipient from another Unlink user.
2. A second mnemonic you control, then derive its Unlink address:

```bash
UNLINK_MNEMONIC="<recipient-mnemonic>" \
node --input-type=module -e "import { unlinkAccount } from '@unlink-xyz/sdk'; const keys = await unlinkAccount.fromMnemonic({ mnemonic: process.env.UNLINK_MNEMONIC }).getAccountKeys(); console.log(keys.address);"
```

### 4) Run the script

```bash
npm install
set -a; source .env; set +a
node scripts/unlink-smoke.mjs
```

### 5) Expected success output

```text
[unlink-smoke] Starting Unlink smoke test
[unlink-smoke] Config loaded
[unlink-smoke] Client created
[unlink-smoke] Sender address: unlink1...
[unlink-smoke] Ensuring sender registration
[unlink-smoke] Sender registration ready
[unlink-smoke] Submitting private transfer
[unlink-smoke] Transfer submitted: txId=... status=...
[unlink-smoke] Polling final transaction status
[unlink-smoke] Final status: txId=... status=...
[unlink-smoke] DONE
```

### 6) Most common first errors

- `Missing required env var: UNLINK_ENGINE_URL`
- `UNLINK_RECIPIENT must be an Unlink private address (unlink1...), got: ...`
- `Invalid mnemonic`
- `createUser failed: invalid or expired API key`

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
