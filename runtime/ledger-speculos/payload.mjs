import { keccak256, toUtf8Bytes } from "ethers";

function normalizeLower(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export function buildApprovalPayload(input) {
  const route = normalizeLower(input?.route || "private");
  const recipient = normalizeText(input?.recipientAddress);
  const amount = normalizeText(input?.amount);
  const token = normalizeLower(input?.token);
  const network = normalizeLower(input?.network || "base-sepolia");
  const nonce = normalizeText(input?.nonce || "1");

  if (route !== "private") {
    throw new Error(`Approval payload requires private route, got: ${route}`);
  }
  if (!recipient.startsWith("unlink1")) {
    throw new Error("Approval payload requires a valid unlink1... recipient");
  }
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error(`Approval payload requires finite amount > 0, got: ${amount}`);
  }
  if (!token.startsWith("0x")) {
    throw new Error(`Approval payload requires token 0x address, got: ${token}`);
  }

  return `HECATE_APPROVAL_V1|route=${route}|recipient=${recipient}|amount=${amount}|token=${token}|network=${network}|nonce=${nonce}`;
}

export function hashApprovalPayload(payload) {
  return keccak256(toUtf8Bytes(payload));
}

