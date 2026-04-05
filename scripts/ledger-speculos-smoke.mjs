#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  Signature,
  verifyMessage,
  getAddress as toChecksumAddress,
} from "ethers";
import {
  buildApprovalPayload,
  hashApprovalPayload,
} from "../runtime/ledger-speculos/payload.mjs";

const require = createRequire(import.meta.url);
const SpeculosTransport = require("@ledgerhq/hw-transport-node-speculos").default;
const Eth = require("@ledgerhq/hw-app-eth").default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const artifactPath = path.join(repoRoot, "artifacts", "ledger-proof.json");

function readEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function readIntEnv(name, fallback) {
  const raw = readEnv(name, "");
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

function normalizeHex(hexString) {
  const raw = typeof hexString === "string" ? hexString.trim() : "";
  const prefixed = raw.startsWith("0x") ? raw : `0x${raw}`;
  return prefixed.toLowerCase();
}

function normalizeAddress(address) {
  return toChecksumAddress(address).toLowerCase();
}

function normalizeV(rawV) {
  const raw = typeof rawV === "number" ? rawV : Number.parseInt(String(rawV), 16);
  if (!Number.isFinite(raw)) {
    throw new Error(`Invalid Ledger v value: ${String(rawV)}`);
  }
  return raw >= 27 ? raw : raw + 27;
}

function startAutoApproveLoop(transport, enabled, intervalMs) {
  if (!enabled) {
    return {
      stop: () => {},
    };
  }

  let isStopped = false;
  let isBusy = false;
  const sequence = ["Rr", "Rr", "Rr", "Rr", "LRlr"];
  let index = 0;
  const timer = setInterval(async () => {
    if (isStopped || isBusy) {
      return;
    }
    isBusy = true;
    try {
      await transport.button(sequence[index % sequence.length]);
      index += 1;
    } catch {
      // Ignore button errors; the signer call remains authoritative.
    } finally {
      isBusy = false;
    }
  }, intervalMs);

  return {
    stop: () => {
      isStopped = true;
      clearInterval(timer);
    },
  };
}

async function writeArtifact(artifact) {
  await fs.mkdir(path.dirname(artifactPath), { recursive: true });
  await fs.writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
}

async function main() {
  const runTimestamp = new Date().toISOString();
  const runId = `ledger-speculos-${Date.now()}`;

  const host = readEnv("LEDGER_SPECULOS_HOST", "127.0.0.1");
  const apduPort = readIntEnv("LEDGER_SPECULOS_APDU_PORT", 40000);
  const buttonPort = readIntEnv("LEDGER_SPECULOS_BUTTON_PORT", 5001);
  const derivationPath = readEnv("LEDGER_DERIVATION_PATH", "44'/60'/0'/0/0");
  const expectedAddressRaw = readEnv(
    "LEDGER_EXPECTED_ADDRESS",
    "0x0000000000000000000000000000000000000000",
  );
  const autoApprove = readEnv("LEDGER_SPECULOS_AUTO_APPROVE", "1") !== "0";
  const autoApproveIntervalMs = readIntEnv(
    "LEDGER_SPECULOS_AUTO_APPROVE_INTERVAL_MS",
    300,
  );

  const payload = buildApprovalPayload({
    route: "private",
    recipientAddress: readEnv(
      "LEDGER_APPROVAL_RECIPIENT",
      "unlink1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
    ),
    amount: readEnv("LEDGER_APPROVAL_AMOUNT", "1"),
    token: readEnv(
      "LEDGER_APPROVAL_TOKEN",
      "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7",
    ),
    network: readEnv("LEDGER_APPROVAL_NETWORK", "base-sepolia"),
    nonce: readEnv("LEDGER_APPROVAL_NONCE", "1"),
  });
  const payloadHash = hashApprovalPayload(payload);

  let transport;
  let ledgerAddress = null;
  let signatureHex = null;
  let recoveredAddress = null;
  let expectedAddress = normalizeAddress(expectedAddressRaw);
  let addressesMatch = false;
  let failureReason = null;

  try {
    console.log("[ledger-speculos-smoke] Connecting to Speculos transport");
    transport = await SpeculosTransport.open({
      host,
      apduPort,
      buttonPort,
    });
    const eth = new Eth(transport);

    const account = await eth.getAddress(derivationPath, false, true);
    ledgerAddress = normalizeAddress(account.address);
    const payloadHex = Buffer.from(payload, "utf8").toString("hex");
    console.log("[ledger-speculos-smoke] Requesting Ledger signature");

    const autoApproveLoop = startAutoApproveLoop(
      transport,
      autoApprove,
      autoApproveIntervalMs,
    );
    let signed;
    try {
      signed = await eth.signPersonalMessage(derivationPath, payloadHex);
    } finally {
      autoApproveLoop.stop();
    }

    const signature = Signature.from({
      r: normalizeHex(signed.r),
      s: normalizeHex(signed.s),
      v: normalizeV(signed.v),
    });
    signatureHex = signature.serialized;
    recoveredAddress = normalizeAddress(verifyMessage(payload, signatureHex));
    addressesMatch = recoveredAddress === expectedAddress;

    const artifact = {
      runId,
      timestamp: runTimestamp,
      status: addressesMatch ? "ok" : "address-mismatch",
      speculos: {
        host,
        apduPort,
        buttonPort,
      },
      derivationPath,
      payload,
      payloadHash,
      signature: signatureHex,
      recoveredAddress,
      expectedAddress,
      ledgerAddress,
      addressesMatch,
      metadata: {
        flow: "hecate-send-approval",
        route: "private",
      },
    };
    await writeArtifact(artifact);

    console.log(`[ledger-speculos-smoke] Proof written: ${artifactPath}`);
    console.log(
      `[ledger-speculos-smoke] recovered=${recoveredAddress} expected=${expectedAddress} match=${addressesMatch}`,
    );

    if (!addressesMatch) {
      throw new Error("Recovered address does not match expected Ledger address");
    }
  } catch (error) {
    failureReason = error instanceof Error ? error.message : String(error);
    const artifact = {
      runId,
      timestamp: runTimestamp,
      status: "error",
      error: failureReason,
      speculos: {
        host,
        apduPort,
        buttonPort,
      },
      derivationPath,
      payload,
      payloadHash,
      signature: signatureHex,
      recoveredAddress,
      expectedAddress,
      ledgerAddress,
      addressesMatch,
      metadata: {
        flow: "hecate-send-approval",
        route: "private",
      },
    };
    await writeArtifact(artifact);
    throw error;
  } finally {
    if (transport) {
      try {
        await transport.close();
      } catch {
        // Ignore close errors in smoke script.
      }
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[ledger-speculos-smoke] ERROR: ${message}`);
  process.exitCode = 1;
});
