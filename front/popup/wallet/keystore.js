import {
  hasStoredKeystore,
  readKeystoreRecord,
  writeKeystoreRecord,
  clearKeystoreRecord,
} from "./storage.js";
import {
  randomBytes,
  deriveKeyFromPassword,
  encryptBytes,
  decryptBytes,
} from "./cryptoWeb.js";

const KEYSTORE_VERSION = 1;
const HEADER = new Uint8Array([0x48, 0x45, 0x43, 0x41]); // "HECA"
const DEFAULT_ITERATIONS = 200_000;

export class InvalidPasswordError extends Error {
  constructor(message = "Invalid password") {
    super(message);
    this.name = "InvalidPasswordError";
    this.code = "INVALID_PASSWORD";
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length !== 64 || /[^a-fA-F0-9]/.test(normalized)) {
    throw new Error("Seed must be a 32-byte hex string");
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function buildPayload(seedBytes) {
  const payload = new Uint8Array(HEADER.length + seedBytes.length);
  payload.set(HEADER, 0);
  payload.set(seedBytes, HEADER.length);
  return payload;
}

export async function createEncryptedKeystore({
  password,
  seedHex,
  seedType = "mnemonic",
  mnemonic = null,
}) {
  if (await hasStoredKeystore()) {
    throw new Error("Keystore already exists");
  }

  const seedBytes = hexToBytes(seedHex);
  const salt = randomBytes(16);
  const key = await deriveKeyFromPassword(password, {
    salt,
    iterations: DEFAULT_ITERATIONS,
  });

  const { iv, ciphertext } = await encryptBytes(key, buildPayload(seedBytes));

  const record = {
    version: KEYSTORE_VERSION,
    saltBase64: bytesToBase64(salt),
    ivBase64: bytesToBase64(iv),
    iterations: DEFAULT_ITERATIONS,
    ciphertextBase64: bytesToBase64(ciphertext),
    seedType,
  };

  if (mnemonic) {
    const mnemonicBytes = new TextEncoder().encode(mnemonic);
    const encryptedMnemonic = await encryptBytes(key, mnemonicBytes);
    record.mnemonicIvBase64 = bytesToBase64(encryptedMnemonic.iv);
    record.mnemonicCiphertextBase64 = bytesToBase64(encryptedMnemonic.ciphertext);
  }

  await writeKeystoreRecord(record);
}

export async function unlockEncryptedKeystore(password) {
  const record = await readKeystoreRecord();
  if (!record) {
    throw new Error("No keystore found");
  }

  if (record.version !== KEYSTORE_VERSION) {
    throw new Error(`Unsupported keystore version: ${record.version}`);
  }

  const salt = base64ToBytes(record.saltBase64);
  const iv = base64ToBytes(record.ivBase64);
  const ciphertext = base64ToBytes(record.ciphertextBase64);

  const key = await deriveKeyFromPassword(password, {
    salt,
    iterations: Number(record.iterations) || DEFAULT_ITERATIONS,
  });

  let plaintext;
  try {
    plaintext = await decryptBytes(key, iv, ciphertext);
  } catch {
    throw new InvalidPasswordError();
  }

  const header = plaintext.slice(0, HEADER.length);
  const headerMatches = header.every((value, index) => value === HEADER[index]);
  if (!headerMatches || plaintext.length !== HEADER.length + 32) {
    throw new InvalidPasswordError();
  }

  const seedBytes = plaintext.slice(HEADER.length);
  const seedHex = `0x${bytesToHex(seedBytes)}`;
  let mnemonic = null;

  if (record.mnemonicIvBase64 && record.mnemonicCiphertextBase64) {
    try {
      const mnemonicIv = base64ToBytes(record.mnemonicIvBase64);
      const mnemonicCiphertext = base64ToBytes(record.mnemonicCiphertextBase64);
      const mnemonicBytes = await decryptBytes(key, mnemonicIv, mnemonicCiphertext);
      mnemonic = new TextDecoder().decode(mnemonicBytes);
    } catch {
      mnemonic = null;
    }
  }

  return {
    seedHex,
    seedType: record.seedType || "mnemonic",
    mnemonic,
  };
}

export async function clearEncryptedKeystore() {
  await clearKeystoreRecord();
}
