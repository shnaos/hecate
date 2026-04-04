#!/usr/bin/env node

import { createUnlink, unlinkAccount } from "@unlink-xyz/sdk";

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function readPositiveIntEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw || raw.trim().length === 0) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

function redacted(value, visible = 4) {
  if (value.length <= visible) {
    return "*".repeat(value.length);
  }
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

async function main() {
  console.log("[unlink-smoke] Starting Unlink smoke test");

  const engineUrl = readRequiredEnv("UNLINK_ENGINE_URL");
  const apiKey = readRequiredEnv("UNLINK_API_KEY");
  const mnemonic = readRequiredEnv("UNLINK_MNEMONIC");
  const recipientAddress = readRequiredEnv("UNLINK_RECIPIENT");
  const token = readRequiredEnv("UNLINK_TOKEN");
  const amount = readRequiredEnv("UNLINK_AMOUNT");
  const pollIntervalMs = readPositiveIntEnv("UNLINK_POLL_INTERVAL_MS", 4000);
  const pollTimeoutMs = readPositiveIntEnv("UNLINK_POLL_TIMEOUT_MS", 180000);

  if (!recipientAddress.startsWith("unlink1")) {
    throw new Error(
      `UNLINK_RECIPIENT must be an Unlink private address (unlink1...), got: ${recipientAddress}`,
    );
  }

  console.log("[unlink-smoke] Config loaded");
  console.log(
    `[unlink-smoke] engine=${engineUrl} token=${token} amount=${amount} recipient=${redacted(recipientAddress, 8)}`,
  );
  console.log(
    `[unlink-smoke] apiKey=${redacted(apiKey)} mnemonic=${redacted(mnemonic, 8)} pollIntervalMs=${pollIntervalMs} pollTimeoutMs=${pollTimeoutMs}`,
  );

  const unlink = createUnlink({
    engineUrl,
    apiKey,
    account: unlinkAccount.fromMnemonic({
      mnemonic,
    }),
  });

  console.log("[unlink-smoke] Client created");

  const senderAddress = await unlink.getAddress();
  console.log(`[unlink-smoke] Sender address: ${senderAddress}`);

  console.log("[unlink-smoke] Ensuring sender registration");
  await unlink.ensureRegistered();
  console.log("[unlink-smoke] Sender registration ready");

  console.log("[unlink-smoke] Submitting private transfer");
  const submitted = await unlink.transfer({
    token,
    amount,
    recipientAddress,
  });

  console.log(
    `[unlink-smoke] Transfer submitted: txId=${submitted.txId} status=${submitted.status}`,
  );
  console.log("[unlink-smoke] Polling final transaction status");

  const finalStatus = await unlink.pollTransactionStatus(submitted.txId, {
    intervalMs: pollIntervalMs,
    timeoutMs: pollTimeoutMs,
  });

  console.log(
    `[unlink-smoke] Final status: txId=${finalStatus.txId} status=${finalStatus.status}`,
  );
  console.log("[unlink-smoke] DONE");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[unlink-smoke] ERROR: ${message}`);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});

