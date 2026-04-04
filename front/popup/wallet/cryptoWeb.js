function assertSubtleCrypto() {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("WebCrypto is unavailable in this environment");
  }
}

export function randomBytes(length) {
  const out = new Uint8Array(length);
  window.crypto.getRandomValues(out);
  return out;
}

export async function deriveKeyFromPassword(password, { salt, iterations }) {
  assertSubtleCrypto();
  const enc = new TextEncoder();
  const rawPassword = enc.encode(password);

  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    rawPassword,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBytes(key, plaintextBytes, optionalIv) {
  assertSubtleCrypto();
  const iv = optionalIv || randomBytes(12);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintextBytes,
  );
  return { iv, ciphertext: new Uint8Array(encrypted) };
}

export async function decryptBytes(key, iv, ciphertext) {
  assertSubtleCrypto();
  const plaintext = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new Uint8Array(plaintext);
}
