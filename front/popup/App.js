const React = window.React;
const h = React.createElement;

function probeRails({ walletState, recipient, amount, preferredRail }) {
  const normalizedRecipient = recipient.trim();
  const parsedAmount = Number(amount);
  const hasValidDraft =
    walletState === "unlocked" &&
    normalizedRecipient.length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  if (!hasValidDraft) {
    return {
      publicAvailable: false,
      privateAvailable: false,
      recommendedRail: "none",
      status: "Draft required before probing",
    };
  }

  const publicAvailable = true;
  const privateAvailable =
    normalizedRecipient.startsWith("0x") && parsedAmount <= 5;
  const recommendedRail =
    privateAvailable && publicAvailable
      ? preferredRail === "public"
        ? "public"
        : "private"
      : privateAvailable
        ? "private"
        : publicAvailable
          ? "public"
          : "none";

  return {
    publicAvailable,
    privateAvailable,
    recommendedRail,
    status: privateAvailable
      ? "Public and private paths detected"
      : "Public path detected",
  };
}

function deriveDecision(probeResult) {
  if (!probeResult) {
    return {
      selectedRoute: "Not selected yet",
      why: "Run route probing to check which path is available for this draft.",
      fallback: "No fallback is shown until probing is complete.",
    };
  }

  if (probeResult.recommendedRail === "private") {
    return {
      selectedRoute: "Private",
      why: "A private path is available for this draft, and Hecate prefers it here.",
      fallback: probeResult.publicAvailable
        ? "Public route available if the private path cannot be used."
        : "No public fallback detected for this draft.",
    };
  }

  if (probeResult.recommendedRail === "public") {
    return {
      selectedRoute: "Public",
      why: probeResult.privateAvailable
        ? "A public path is selected for now, even though a private path also appears available."
        : "A public path is available, but a private path was not detected for this draft.",
      fallback: probeResult.privateAvailable
        ? "Private route also available if you want a more private option."
        : "No private fallback detected for this draft.",
    };
  }

  return {
    selectedRoute: "No route selected",
    why: "This draft is not ready for route selection yet.",
    fallback: "No fallback is available until the draft can be probed.",
  };
}

function createPrivateSendResult({ recipient, amount }) {
  return {
    status: "sent",
    route: "Private",
    recipient,
    amount,
    transferId: `demo-private-${Date.now().toString(36)}`,
    summary: "Private transfer demo completed successfully.",
  };
}

export function PopupShell() {
  const [activeScreen, setActiveScreen] = React.useState("home");
  const [preferredRail, setPreferredRail] = React.useState("private");
  const [walletState, setWalletState] = React.useState("empty");
  const [walletOrigin, setWalletOrigin] = React.useState(null);
  const [unlockPassword, setUnlockPassword] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [probeResult, setProbeResult] = React.useState(null);
  const [sendState, setSendState] = React.useState("idle");
  const [sendResult, setSendResult] = React.useState(null);

  const reviewReady = walletState === "unlocked";
  const parsedAmount = Number(amount);
  const hasDraft =
    recipient.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;
  const decision = deriveDecision(probeResult);
  const canSendPrivate = decision.selectedRoute === "Private";
  const preferredRailLabel = preferredRail === "private" ? "Private" : "Public";
  const walletOriginLabel =
    walletOrigin === "create"
      ? "Created"
      : walletOrigin === "import"
        ? "Imported"
        : "Not configured";
  const accountLabel = walletOrigin === "import" ? "Imported Account" : "Main Account";
  const recipientPreview = recipient.trim() || "Recipient will appear here";
  const amountPreview = amount.trim() || "Amount will appear here";

  React.useEffect(() => {
    setProbeResult(null);
  }, [walletState, recipient, amount]);

  React.useEffect(() => {
    setSendState("idle");
    setSendResult(null);
  }, [walletState, recipient, amount, probeResult]);

  React.useEffect(() => {
    if (walletState !== "unlocked") {
      setActiveScreen("home");
    }
  }, [walletState]);

  const renderRailSelector = (scope) =>
    h("div", { className: "route-toggle", key: `${scope}-rail-selector` }, [
      h(
        "button",
        {
          type: "button",
          className: `route-toggle-option ${preferredRail === "public" ? "route-toggle-option-active" : ""}`,
          key: `${scope}-public`,
          onClick: () => setPreferredRail("public"),
        },
        "Public",
      ),
      h(
        "button",
        {
          type: "button",
          className: `route-toggle-option ${preferredRail === "private" ? "route-toggle-option-active" : ""}`,
          key: `${scope}-private`,
          onClick: () => setPreferredRail("private"),
        },
        "Private",
      ),
    ]);

  if (walletState === "empty") {
    return h("main", { className: "popup popup-dark auth-screen" }, [
      h("section", { className: "auth-hero", key: "auth-hero" }, [
        h("div", { className: "owl-logo", key: "logo" }, "🦉"),
        h("p", { className: "auth-title-mark", key: "mark" }, "HECATE"),
      ]),
      h("section", { className: "auth-card", key: "auth-card" }, [
        h("h1", { className: "auth-title", key: "title" }, "Create or import wallet"),
        h(
          "p",
          { className: "auth-subtitle", key: "subtitle" },
          "Set up wallet access before opening the home dashboard.",
        ),
        h("div", { className: "auth-actions", key: "actions" }, [
          h(
            "button",
            {
              type: "button",
              className: "primary-button",
              key: "create",
              onClick: () => {
                setWalletOrigin("create");
                setWalletState("locked");
              },
            },
            "Create wallet",
          ),
          h(
            "button",
            {
              type: "button",
              className: "secondary-button",
              key: "import",
              onClick: () => {
                setWalletOrigin("import");
                setWalletState("locked");
              },
            },
            "Import wallet",
          ),
        ]),
      ]),
    ]);
  }

  if (walletState === "locked") {
    return h("main", { className: "popup popup-dark auth-screen" }, [
      h("section", { className: "auth-hero", key: "auth-hero" }, [
        h("div", { className: "owl-logo", key: "logo" }, "🦉"),
        h("p", { className: "auth-title-mark", key: "mark" }, "HECATE"),
      ]),
      h("section", { className: "auth-card", key: "unlock-card" }, [
        h("h1", { className: "auth-title", key: "title" }, "Unlock Wallet"),
        h("p", { className: "auth-subtitle", key: "subtitle" }, [
          "Wallet source: ",
          walletOriginLabel,
        ]),
        h("label", { className: "auth-field", key: "password-field" }, [
          h("span", { className: "auth-label", key: "label" }, "Password"),
          h("input", {
            className: "auth-input",
            type: "password",
            placeholder: "Enter password",
            value: unlockPassword,
            onChange: (event) => setUnlockPassword(event.target.value),
            key: "input",
          }),
        ]),
        h("div", { className: "auth-actions", key: "actions" }, [
          h(
            "button",
            {
              type: "button",
              className: "primary-button",
              disabled: unlockPassword.trim().length === 0,
              key: "unlock",
              onClick: () => {
                setWalletState("unlocked");
                setUnlockPassword("");
                setActiveScreen("home");
              },
            },
            "Unlock",
          ),
          h(
            "button",
            {
              type: "button",
              className: "secondary-button",
              key: "reset",
              onClick: () => {
                setWalletState("empty");
                setWalletOrigin(null);
                setUnlockPassword("");
              },
            },
            "Reset wallet",
          ),
        ]),
      ]),
    ]);
  }

  return h("main", { className: "popup popup-dark" }, [
    activeScreen === "home"
      ? h(React.Fragment, { key: "home" }, [
          h("section", { className: "wallet-topbar", key: "topbar" }, [
            h("div", { className: "wallet-topbar-left", key: "left" }, [
              h("p", { className: "wallet-topbar-brand", key: "brand" }, "Hecate"),
              h("p", { className: "wallet-topbar-account", key: "account" }, accountLabel),
            ]),
            h(
              "p",
              { className: "wallet-topbar-chip", key: "chip" },
              `${preferredRailLabel} mode`,
            ),
          ]),
          h("section", { className: "balance-card", key: "balance" }, [
            h("p", { className: "balance-label", key: "label" }, "Total balance"),
            h("p", { className: "balance-value", key: "value" }, "469,75 $US"),
            h("p", { className: "balance-change", key: "change" }, "+0.00% (+$0.00)"),
          ]),
          h("section", { className: "panel panel-dark route-panel", key: "route" }, [
            h("p", { className: "panel-label panel-label-dark", key: "label" }, "Public / Private"),
            renderRailSelector("home"),
            h(
              "p",
              { className: "panel-note-dark", key: "note" },
              "Demo route control only. Final route still depends on probing result.",
            ),
          ]),
          h("section", { className: "actions-grid", key: "actions" }, [
            h(
              "button",
              {
                type: "button",
                className: "action-tile action-tile-primary",
                key: "send",
                onClick: () => setActiveScreen("send"),
              },
              [
                h("p", { className: "action-icon", key: "icon" }, "▷"),
                h("p", { className: "action-label", key: "label" }, "Send"),
              ],
            ),
            h("button", { type: "button", className: "action-tile", key: "swap", disabled: true }, [
              h("p", { className: "action-icon", key: "icon" }, "↔"),
              h("p", { className: "action-label", key: "label" }, "Swap"),
            ]),
            h("button", { type: "button", className: "action-tile", key: "receive", disabled: true }, [
              h("p", { className: "action-icon", key: "icon" }, "↙"),
              h("p", { className: "action-label", key: "label" }, "Receive"),
            ]),
            h("button", { type: "button", className: "action-tile", key: "tx", disabled: true }, [
              h("p", { className: "action-icon", key: "icon" }, "▤"),
              h("p", { className: "action-label", key: "label" }, "Transactions"),
            ]),
          ]),
        ])
      : h(React.Fragment, { key: "send" }, [
          h("section", { className: "wallet-topbar send-topbar", key: "send-topbar" }, [
            h("div", { className: "wallet-topbar-left", key: "left" }, [
              h(
                "button",
                {
                  type: "button",
                  className: "icon-button",
                  key: "back",
                  onClick: () => setActiveScreen("home"),
                },
                "Back",
              ),
              h("p", { className: "wallet-topbar-account", key: "account" }, "0x4ebc...0c0e"),
            ]),
            h("p", { className: "wallet-topbar-brand", key: "title" }, "Send"),
          ]),
          h("section", { className: "panel panel-dark route-panel", key: "send-route" }, [
            h("p", { className: "panel-label panel-label-dark", key: "label" }, "Route mode"),
            renderRailSelector("send"),
          ]),
          h("section", { className: "panel review-panel panel-dark", key: "review" }, [
      h("div", { className: "review-header", key: "header" }, [
        h("p", { className: "panel-label", key: "label" }, "Review transfer"),
        h(
          "p",
          {
            className: `status-chip ${reviewReady ? "status-chip-ready" : "status-chip-pending"}`,
            key: "chip",
          },
          reviewReady ? "Ready to draft" : "Unlock to draft",
        ),
      ]),
      h(
        "p",
        { className: "review-intro", key: "intro" },
        reviewReady
          ? "Draft recipient and amount, then probe routes to produce a clear decision."
          : "Unlock the wallet before drafting a transfer.",
      ),
      h("div", { className: "review-form", key: "form" }, [
        h("label", { className: "review-field", key: "recipient-field" }, [
          h("span", { className: "review-field-label", key: "label" }, "Recipient"),
          h("input", {
            className: "review-input",
            type: "text",
            placeholder: "0x... or demo recipient",
            value: recipient,
            disabled: !reviewReady,
            onChange: (event) => setRecipient(event.target.value),
            key: "input",
          }),
        ]),
        h("label", { className: "review-field", key: "amount-field" }, [
          h("span", { className: "review-field-label", key: "label" }, "Amount"),
          h("input", {
            className: "review-input",
            type: "text",
            inputMode: "decimal",
            placeholder: "0.00",
            value: amount,
            disabled: !reviewReady,
            onChange: (event) => setAmount(event.target.value),
            key: "input",
          }),
        ]),
      ]),
      h("div", { className: "review-actions", key: "review-actions" }, [
        h(
          "button",
          {
            type: "button",
            className: "primary-button",
            disabled: !reviewReady || !hasDraft,
            key: "probe",
            onClick: () =>
              setProbeResult(
                probeRails({
                  walletState,
                  recipient,
                  amount,
                  preferredRail,
                }),
              ),
          },
          "Probe routes",
        ),
        h(
          "p",
          { className: "review-probe-note", key: "probe-note" },
          reviewReady
            ? `Probe uses local MVP rules from this draft and honors your ${preferredRailLabel.toLowerCase()} preference when both paths are available. It does not execute a transfer.`
            : "Unlock the wallet and enter a draft before route probing becomes available.",
        ),
      ]),
      h("div", { className: "review-block", key: "block" }, [
        h("p", { className: "review-block-title", key: "title" }, "Decision summary"),
        h("dl", { className: "review-summary", key: "summary" }, [
          h(React.Fragment, { key: "recipient" }, [
            h("dt", { key: "label" }, "Recipient"),
            h("dd", { key: "value" }, recipientPreview),
          ]),
          h(React.Fragment, { key: "amount" }, [
            h("dt", { key: "label" }, "Amount"),
            h("dd", { key: "value" }, amountPreview),
          ]),
          h(React.Fragment, { key: "route" }, [
            h("dt", { key: "label" }, "Public path"),
            h(
              "dd",
              { key: "value" },
              probeResult
                ? probeResult.publicAvailable
                  ? "Available"
                  : "Unavailable"
                : "Run probe to check availability.",
            ),
          ]),
          h(React.Fragment, { key: "private" }, [
            h("dt", { key: "label" }, "Private path"),
            h(
              "dd",
              { key: "value" },
              probeResult
                ? probeResult.privateAvailable
                  ? "Available"
                  : "Unavailable"
                : "Run probe to check availability.",
            ),
          ]),
          h(React.Fragment, { key: "recommended" }, [
            h("dt", { key: "label" }, "Selected route"),
            h(
              "dd",
              { key: "value" },
              decision.selectedRoute,
            ),
          ]),
          h(React.Fragment, { key: "why" }, [
            h("dt", { key: "label" }, "Why"),
            h(
              "dd",
              { key: "value" },
              decision.why,
            ),
          ]),
          h(React.Fragment, { key: "fallback" }, [
            h("dt", { key: "label" }, "Fallback"),
            h(
              "dd",
              { key: "value" },
              decision.fallback,
            ),
          ]),
        ]),
        h(
          "p",
          { className: "review-note", key: "note" },
          probeResult
            ? "Decision is ready. Final approval is still required before execution."
            : "Run route probe to populate this decision summary.",
        ),
      ]),
      h("div", { className: "send-panel", key: "send-panel" }, [
        h("div", { className: "review-header", key: "header" }, [
          h("p", { className: "panel-label", key: "label" }, "Approve and send"),
          h(
            "p",
            {
              className: `status-chip ${
                sendResult || canSendPrivate ? "status-chip-ready" : "status-chip-pending"
              }`,
              key: "chip",
            },
            sendResult
              ? "Complete"
              : canSendPrivate
                ? "Ready to confirm"
                : "Private route required",
          ),
        ]),
        h(
          "p",
          { className: "review-intro", key: "intro" },
          canSendPrivate
            ? "Private route selected. Open final approval to keep user control before execution."
            : "This demo executes only when the selected route is Private.",
        ),
        sendState === "confirm"
          ? h("div", { className: "approval-box", key: "confirm-box" }, [
              h("div", { className: "approval-header", key: "header" }, [
                h(
                  "p",
                  { className: "confirm-title", key: "title" },
                  "Final approval boundary",
                ),
                h(
                  "p",
                  { className: "approval-chip", key: "chip" },
                  "You stay in control",
                ),
              ]),
              h(
                "p",
                { className: "confirm-copy", key: "copy" },
                "This is the final approval step before execution. Nothing runs until you approve.",
              ),
              h(
                "p",
                { className: "approval-note", key: "note" },
                "This MVP approval boundary is local and explicit. No Unlink, Chainlink, or Ledger integration is active in this build.",
              ),
              h("dl", { className: "confirm-summary", key: "summary" }, [
                h(React.Fragment, { key: "route" }, [
                  h("dt", { key: "label" }, "Route"),
                  h("dd", { key: "value" }, decision.selectedRoute),
                ]),
                h(React.Fragment, { key: "recipient" }, [
                  h("dt", { key: "label" }, "Recipient"),
                  h("dd", { key: "value" }, recipientPreview),
                ]),
                h(React.Fragment, { key: "amount" }, [
                  h("dt", { key: "label" }, "Amount"),
                  h("dd", { key: "value" }, amountPreview),
                ]),
              ]),
              h("div", { className: "review-actions", key: "actions" }, [
                h(
                  "button",
                  {
                    type: "button",
                    className: "primary-button",
                    key: "confirm-send",
                    onClick: () => {
                      setSendState("sending");
                      window.setTimeout(() => {
                        setSendResult(
                          createPrivateSendResult({
                            recipient: recipientPreview,
                            amount: amountPreview,
                          }),
                        );
                        setSendState("sent");
                      }, 700);
                    },
                  },
                  "Approve and run private send",
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "secondary-button",
                    key: "cancel-send",
                    onClick: () => setSendState("idle"),
                  },
                  "Cancel",
                ),
              ]),
            ])
          : null,
        sendState === "sending"
          ? h("div", { className: "result-box", key: "sending" }, [
              h("p", { className: "result-title", key: "title" }, "Private transfer in progress"),
              h(
                "p",
                { className: "result-copy", key: "copy" },
                "Executing the local demo private send inside the popup.",
              ),
            ])
          : null,
        sendResult
          ? h("div", { className: "result-box", key: "result" }, [
              h("p", { className: "result-title", key: "title" }, "Private transfer result"),
              h("p", { className: "result-copy", key: "copy" }, sendResult.summary),
              h("dl", { className: "confirm-summary", key: "summary" }, [
                h(React.Fragment, { key: "route" }, [
                  h("dt", { key: "label" }, "Route used"),
                  h("dd", { key: "value" }, sendResult.route),
                ]),
                h(React.Fragment, { key: "recipient" }, [
                  h("dt", { key: "label" }, "Recipient"),
                  h("dd", { key: "value" }, sendResult.recipient),
                ]),
                h(React.Fragment, { key: "amount" }, [
                  h("dt", { key: "label" }, "Amount"),
                  h("dd", { key: "value" }, sendResult.amount),
                ]),
                h(React.Fragment, { key: "id" }, [
                  h("dt", { key: "label" }, "Transfer id"),
                  h("dd", { key: "value" }, sendResult.transferId),
                ]),
              ]),
            ])
          : null,
        sendState === "idle" && !sendResult
          ? h("div", { className: "review-actions", key: "send-actions" }, [
              h(
                "button",
                {
                  type: "button",
                  className: "primary-button",
                  disabled: !canSendPrivate,
                  key: "open-confirm",
                  onClick: () => setSendState("confirm"),
                },
                "Open final approval",
              ),
              h(
                "p",
                { className: "review-probe-note", key: "send-note" },
                canSendPrivate
                  ? "Narration: review decision, open approval, then approve and run."
                  : "Route must be Private before final approval can open.",
              ),
            ])
          : null,
      ]),
    ]),
    h("section", { className: "panel flow-panel panel-dark", key: "flow" }, [
      h(
        "p",
        { className: "panel-label", key: "label" },
        "Happy path",
      ),
      h(
        "p",
        { className: "flow-intro", key: "intro" },
        "Live script: unlock wallet, draft transfer, probe routes, approve, then show result.",
      ),
      h("div", { className: "flow-grid", key: "grid" }, [
        h("article", { className: "flow-step", key: "review" }, [
          h("p", { className: "step-number", key: "number" }, "01"),
          h("h2", { key: "title" }, "Review"),
          h(
            "p",
            { key: "copy" },
            "Set recipient and amount for a single transfer draft.",
          ),
        ]),
        h("article", { className: "flow-step", key: "explain" }, [
          h("p", { className: "step-number", key: "number" }, "02"),
          h("h2", { key: "title" }, "Explain"),
          h(
            "p",
            { key: "copy" },
            "Run probing and show selected route, reason, and fallback.",
          ),
        ]),
        h("article", { className: "flow-step", key: "execute" }, [
          h("p", { className: "step-number", key: "number" }, "03"),
          h("h2", { key: "title" }, "Execute"),
          h(
            "p",
            { key: "copy" },
            "Open final approval, keep user control, then run and show result.",
          ),
        ]),
      ]),
    ]),
        ]),
  ]);
}
