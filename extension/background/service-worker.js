import { executeUnlinkPrivateTransfer } from "./unlink-exec.bundle.js";

const PRIVATE_SEND_MESSAGE_TYPE = "HECATE_UNLINK_PRIVATE_SEND";

function normalizeError(error) {
  if (error && typeof error === "object") {
    const code =
      typeof error.code === "string"
        ? error.code
        : typeof error.name === "string"
          ? error.name
          : "UNLINK_EXECUTION_ERROR";
    const message =
      typeof error.message === "string"
        ? error.message
        : "Unlink execution failed";
    return { code, message };
  }
  return {
    code: "UNLINK_EXECUTION_ERROR",
    message: "Unlink execution failed",
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== PRIVATE_SEND_MESSAGE_TYPE) {
    return false;
  }

  (async () => {
    try {
      const payload = message.payload || {};
      const result = await executeUnlinkPrivateTransfer(payload);
      sendResponse({
        ok: true,
        result,
      });
    } catch (error) {
      sendResponse({
        ok: false,
        error: normalizeError(error),
      });
    }
  })();

  return true;
});

