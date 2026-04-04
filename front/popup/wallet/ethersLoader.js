let ethersReadyPromise;

function getEthersScriptUrl() {
  return new URL("../../../vendor/ethers.umd.min.js", import.meta.url).href;
}

export async function ensureEthersLoaded() {
  if (window.ethers) {
    return window.ethers;
  }

  if (ethersReadyPromise) {
    return ethersReadyPromise;
  }

  ethersReadyPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-hecate-wallet-lib="ethers"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(window.ethers), {
        once: true,
      });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load ethers runtime")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = getEthersScriptUrl();
    script.async = true;
    script.dataset.hecateWalletLib = "ethers";
    script.onload = () => {
      if (!window.ethers) {
        reject(new Error("Ethers runtime loaded but window.ethers is missing"));
        return;
      }
      resolve(window.ethers);
    };
    script.onerror = () => reject(new Error("Failed to load ethers runtime"));
    document.head.appendChild(script);
  });

  return ethersReadyPromise;
}
