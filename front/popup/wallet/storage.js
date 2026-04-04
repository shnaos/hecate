export const KEYSTORE_STORAGE_KEY = "hecate:keystore:v1";
export const WALLET_META_STORAGE_KEY = "hecate:wallet-meta:v1";

function hasChromeStorage() {
  return (
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local &&
    typeof chrome.storage.local.get === "function"
  );
}

async function readRawValue(key) {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (items) => {
        resolve(items && typeof items[key] !== "undefined" ? items[key] : null);
      });
    });
  }

  return window.localStorage.getItem(key);
}

async function writeRawValue(key, value) {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }

  window.localStorage.setItem(key, value);
}

async function removeRawValue(key) {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => resolve());
    });
  }

  window.localStorage.removeItem(key);
}

export async function hasStoredKeystore() {
  const raw = await readRawValue(KEYSTORE_STORAGE_KEY);
  return raw !== null;
}

export async function readKeystoreRecord() {
  const raw = await readRawValue(KEYSTORE_STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return raw;
}

export async function writeKeystoreRecord(record) {
  await writeRawValue(KEYSTORE_STORAGE_KEY, JSON.stringify(record));
}

export async function clearKeystoreRecord() {
  await removeRawValue(KEYSTORE_STORAGE_KEY);
}

export async function readWalletMeta() {
  const raw = await readRawValue(WALLET_META_STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return raw;
}

export async function writeWalletMeta(meta) {
  await writeRawValue(WALLET_META_STORAGE_KEY, JSON.stringify(meta));
}

export async function clearWalletMeta() {
  await removeRawValue(WALLET_META_STORAGE_KEY);
}
