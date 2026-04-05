const PRIVATE_SEND_MESSAGE_TYPE = "HECATE_UNLINK_PRIVATE_SEND";

function hasRuntimeMessaging() {
  return (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    typeof chrome.runtime.sendMessage === "function"
  );
}

export async function runPrivateSendViaBackground({
  mnemonic,
  recipientAddress,
  amount,
}) {
  if (!hasRuntimeMessaging()) {
    throw new Error("Chrome extension runtime messaging is unavailable");
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: PRIVATE_SEND_MESSAGE_TYPE,
        payload: {
          mnemonic,
          recipientAddress,
          amount,
        },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response || typeof response !== "object") {
          reject(new Error("No response from Unlink runtime"));
          return;
        }

        if (response.ok && response.result) {
          resolve(response.result);
          return;
        }

        const message =
          response.error && typeof response.error.message === "string"
            ? response.error.message
            : "Private send failed";
        const error = new Error(message);
        if (response.error && typeof response.error.code === "string") {
          error.code = response.error.code;
        }
        if (
          response.error &&
          typeof response.error.debug === "object" &&
          response.error.debug
        ) {
          error.debug = response.error.debug;
        }
        reject(error);
      },
    );
  });
}
