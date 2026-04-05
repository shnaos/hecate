import { createUnlink, unlinkAccount } from "@unlink-xyz/sdk";
import { Buffer as BufferPolyfill } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = BufferPolyfill;
}

const UNLINK_CONFIG = {
  engineUrl: __HECATE_UNLINK_ENGINE_URL__,
  apiKey: __HECATE_UNLINK_API_KEY__,
  token: __HECATE_UNLINK_TOKEN__,
  pollIntervalMs: __HECATE_UNLINK_POLL_INTERVAL_MS__,
  pollTimeoutMs: __HECATE_UNLINK_POLL_TIMEOUT_MS__,
};

function assertConfigured() {
  if (!UNLINK_CONFIG.engineUrl) {
    throw new Error("Unlink runtime is missing UNLINK_ENGINE_URL");
  }
  if (!UNLINK_CONFIG.apiKey) {
    throw new Error("Unlink runtime is missing UNLINK_API_KEY");
  }
  if (!UNLINK_CONFIG.token) {
    throw new Error("Unlink runtime is missing UNLINK_TOKEN");
  }
}

function validateTransferInput({ mnemonic, recipientAddress, amount }) {
  const normalizedMnemonic = typeof mnemonic === "string" ? mnemonic.trim() : "";
  const normalizedRecipient =
    typeof recipientAddress === "string" ? recipientAddress.trim() : "";
  const normalizedAmount = typeof amount === "string" ? amount.trim() : "";

  if (!normalizedMnemonic) {
    throw new Error("Missing mnemonic for Unlink execution");
  }
  if (!normalizedRecipient.toLowerCase().startsWith("unlink1")) {
    throw new Error("Recipient must be a valid unlink1... private address");
  }

  const parsedAmount = Number(normalizedAmount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error("Amount must be a finite number greater than 0");
  }

  return {
    mnemonic: normalizedMnemonic,
    recipientAddress: normalizedRecipient,
    amount: normalizedAmount,
  };
}

export async function executeUnlinkPrivateTransfer(input) {
  assertConfigured();
  const transferInput = validateTransferInput(input);

  const unlink = createUnlink({
    engineUrl: UNLINK_CONFIG.engineUrl,
    apiKey: UNLINK_CONFIG.apiKey,
    account: unlinkAccount.fromMnemonic({
      mnemonic: transferInput.mnemonic,
    }),
  });

  const senderAddress = await unlink.getAddress();
  console.info("[hecate/unlink] Sender unlink address:", senderAddress);

  await unlink.ensureRegistered();

  try {
    const submitted = await unlink.transfer({
      token: UNLINK_CONFIG.token,
      amount: transferInput.amount,
      recipientAddress: transferInput.recipientAddress,
    });

    const finalStatus = await unlink.pollTransactionStatus(submitted.txId, {
      intervalMs: UNLINK_CONFIG.pollIntervalMs,
      timeoutMs: UNLINK_CONFIG.pollTimeoutMs,
    });

    return {
      txId: finalStatus.txId,
      status: finalStatus.status,
      route: "Private",
      senderAddress,
      recipientAddress: transferInput.recipientAddress,
      amount: transferInput.amount,
    };
  } catch (error) {
    if (error && typeof error === "object") {
      error.hecateDebug = {
        senderAddress,
        recipientAddress: transferInput.recipientAddress,
        amount: transferInput.amount,
      };
    }
    throw error;
  }
}
