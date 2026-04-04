import { ensureEthersLoaded } from "./ethersLoader.js";

const ACCOUNT_ZERO_PATH = "m/44'/60'/0'/0/0";

function normalizeMnemonic(mnemonic) {
  return mnemonic.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function createMnemonic() {
  const ethers = await ensureEthersLoaded();
  const wallet = ethers.Wallet.createRandom();
  return normalizeMnemonic(wallet.mnemonic.phrase);
}

export async function isValidMnemonicPhrase(mnemonic) {
  const ethers = await ensureEthersLoaded();
  const normalized = normalizeMnemonic(mnemonic);
  return ethers.Mnemonic.isValidMnemonic(normalized);
}

export async function deriveAccountZeroFromMnemonic(mnemonic) {
  const ethers = await ensureEthersLoaded();
  const normalized = normalizeMnemonic(mnemonic);
  const node = ethers.HDNodeWallet.fromPhrase(normalized, "", ACCOUNT_ZERO_PATH);
  return {
    mnemonic: normalized,
    path: ACCOUNT_ZERO_PATH,
    privateKeyHex: node.privateKey,
    address: node.address,
  };
}

export async function deriveAddressFromPrivateKey(privateKeyHex) {
  const ethers = await ensureEthersLoaded();
  const wallet = new ethers.Wallet(privateKeyHex);
  return wallet.address;
}
