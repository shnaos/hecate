import {
  hasStoredKeystore,
  readWalletMeta,
  writeWalletMeta,
  clearWalletMeta,
} from "./storage.js";
import {
  createEncryptedKeystore,
  unlockEncryptedKeystore,
  clearEncryptedKeystore,
  InvalidPasswordError,
} from "./keystore.js";
import {
  createMnemonic,
  isValidMnemonicPhrase,
  deriveAccountZeroFromMnemonic,
  deriveAddressFromPrivateKey,
} from "./mnemonic.js";

let unlockedSession = null;

function shortHexToBytes(hexValue) {
  const normalized = hexValue.startsWith("0x") ? hexValue.slice(2) : hexValue;
  if (normalized.length !== 64) {
    throw new Error("Expected a 32-byte hex value");
  }
  return new Uint8Array(
    normalized.match(/.{1,2}/g).map((chunk) => Number.parseInt(chunk, 16)),
  );
}

function normalizePassword(password) {
  return password.trim();
}

function assertPassword(password) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
}

export async function getWalletBootState() {
  const hasKeystore = await hasStoredKeystore();
  const meta = await readWalletMeta();

  if (!hasKeystore) {
    return {
      walletState: "empty",
      walletOrigin: null,
      address: null,
    };
  }

  return {
    walletState: "locked",
    walletOrigin: meta?.walletOrigin || null,
    address: meta?.address || null,
  };
}

export async function createWalletFromNewMnemonic({ password }) {
  const cleanPassword = normalizePassword(password);
  assertPassword(cleanPassword);

  const mnemonic = await createMnemonic();
  const account = await deriveAccountZeroFromMnemonic(mnemonic);

  await createEncryptedKeystore({
    password: cleanPassword,
    seedHex: account.privateKeyHex,
    seedType: "mnemonic",
    mnemonic: account.mnemonic,
  });

  await writeWalletMeta({
    version: 1,
    walletOrigin: "create",
    address: account.address,
    derivationPath: account.path,
    updatedAt: Date.now(),
  });

  unlockedSession = null;

  return {
    mnemonic: account.mnemonic,
    address: account.address,
    walletOrigin: "create",
  };
}

export async function importWalletFromMnemonic({ password, mnemonic }) {
  const cleanPassword = normalizePassword(password);
  assertPassword(cleanPassword);

  const isValidMnemonic = await isValidMnemonicPhrase(mnemonic);
  if (!isValidMnemonic) {
    throw new Error("Invalid recovery phrase");
  }

  const account = await deriveAccountZeroFromMnemonic(mnemonic);

  await createEncryptedKeystore({
    password: cleanPassword,
    seedHex: account.privateKeyHex,
    seedType: "mnemonic",
    mnemonic: account.mnemonic,
  });

  await writeWalletMeta({
    version: 1,
    walletOrigin: "import",
    address: account.address,
    derivationPath: account.path,
    updatedAt: Date.now(),
  });

  unlockedSession = null;

  return {
    address: account.address,
    walletOrigin: "import",
  };
}

export async function unlockWallet({ password }) {
  const cleanPassword = normalizePassword(password);
  if (cleanPassword.length === 0) {
    throw new Error("Password is required");
  }

  let unlocked;
  try {
    unlocked = await unlockEncryptedKeystore(cleanPassword);
  } catch (error) {
    if (error instanceof InvalidPasswordError) {
      throw error;
    }
    throw error;
  }

  let realAddress = await deriveAddressFromPrivateKey(unlocked.seedHex);
  if (unlocked.mnemonic) {
    const account = await deriveAccountZeroFromMnemonic(unlocked.mnemonic);
    if (account.privateKeyHex.toLowerCase() !== unlocked.seedHex.toLowerCase()) {
      throw new Error("Mnemonic and keystore seed mismatch");
    }
    realAddress = account.address;
  }

  const existingMeta = (await readWalletMeta()) || {};
  const walletOrigin = existingMeta.walletOrigin || "import";

  await writeWalletMeta({
    ...existingMeta,
    version: 1,
    walletOrigin,
    address: realAddress,
    updatedAt: Date.now(),
  });

  const seedBytes = shortHexToBytes(unlocked.seedHex);
  unlockedSession = {
    seedBytes,
    address: realAddress,
    walletOrigin,
    unlockedAt: Date.now(),
  };

  return {
    address: realAddress,
    walletOrigin,
  };
}

export function lockWallet() {
  if (unlockedSession && unlockedSession.seedBytes) {
    unlockedSession.seedBytes.fill(0);
  }
  unlockedSession = null;
}

export async function resetWallet() {
  lockWallet();
  await clearEncryptedKeystore();
  await clearWalletMeta();
}

export function getWalletSession() {
  return unlockedSession;
}
