const React = window.React;
const h = React.createElement;

function probeRails({ walletState, recipient, amount }) {
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
  const recommendedRail = privateAvailable
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
  const [walletState, setWalletState] = React.useState("empty");
  const [walletOrigin, setWalletOrigin] = React.useState(null);
  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [probeResult, setProbeResult] = React.useState(null);
  const [sendState, setSendState] = React.useState("idle");
  const [sendResult, setSendResult] = React.useState(null);
  const walletReady = walletState !== "empty";
  const reviewReady = walletState === "unlocked";
  const parsedAmount = Number(amount);
  const hasDraft =
    recipient.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  const walletCopyByState = {
    empty: {
      badge: "No wallet yet",
      title: "Set up your wallet",
      copy:
        "Choose how this MVP wallet should begin. Wallet setup stays local to the popup for now.",
      detail:
        "Create starts a new wallet path. Import represents bringing an existing wallet into Hecate.",
    },
    locked: {
      badge: "Locked wallet",
      title: "Wallet is ready but locked",
      copy:
        "Your wallet is available in the popup, but it stays locked until you unlock it.",
      detail:
        "Unlock first so the review, probing, and approval flow can begin.",
    },
    unlocked: {
      badge: "Unlocked wallet",
      title: "Wallet is ready for the demo flow",
      copy:
        "The wallet is active in this popup and ready for review, probing, and approval.",
      detail:
        "This is still a local MVP wallet state. The demo flow stays explicit and user-controlled.",
    },
  };

  const walletCopy = walletCopyByState[walletState];
  const walletOriginLabel =
    walletOrigin === "create"
      ? "Created in Hecate"
      : walletOrigin === "import"
        ? "Imported into Hecate"
        : "Not set";
  const recipientPreview = recipient.trim() || "Recipient will appear here";
  const amountPreview = amount.trim() || "Amount will appear here";
  const routeProbeState = probeResult
    ? probeResult.status
    : reviewReady && hasDraft
      ? "Ready to probe"
      : "Not ready yet";
  const routeProbeTone = probeResult
    ? "ready"
    : reviewReady && hasDraft
      ? "ready"
      : "pending";
  const nextStepReady = reviewReady && probeResult !== null;
  const decision = deriveDecision(probeResult);
  const canSendPrivate = decision.selectedRoute === "Private";
  const statusItems = [
    {
      label: "Extension",
      state: "Ready",
      tone: "ready",
      detail: "The popup is loaded in Chrome and ready for the demo.",
    },
    {
      label: "Wallet",
      state: walletReady ? walletCopy.badge : "Setup required",
      tone: walletReady ? "ready" : "pending",
      detail: walletReady
        ? `Current mode: ${walletCopy.badge.toLowerCase()}.`
        : "Create or import a wallet before the demo can continue.",
    },
    {
      label: "Route probing",
      state: routeProbeState,
      tone: routeProbeTone,
      detail: probeResult
        ? `Public: ${probeResult.publicAvailable ? "yes" : "no"}. Private: ${probeResult.privateAvailable ? "yes" : "no"}.`
        : "Probe the current draft to check public and private availability.",
    },
    {
      label: "Happy path",
      state: sendResult
        ? "Private send demo complete"
        : nextStepReady
          ? "Decision output ready"
          : "Blocked on probing",
      tone: sendResult || nextStepReady ? "ready" : "pending",
      detail: sendResult
        ? "The private send result is visible and the happy path is complete."
        : nextStepReady
          ? "The route decision is visible and the approval step can follow."
          : "Unlock the wallet, draft the transfer, and run probing first.",
    },
  ];

  React.useEffect(() => {
    setProbeResult(null);
  }, [walletState, recipient, amount]);

  React.useEffect(() => {
    setSendState("idle");
    setSendResult(null);
  }, [walletState, recipient, amount, probeResult]);

  return h("main", { className: "popup" }, [
    h("section", { className: "hero", key: "hero" }, [
      h("p", { className: "eyebrow", key: "eyebrow" }, "Privacy-first wallet MVP"),
      h(
        "h1",
        { key: "headline" },
        "Private sends should be understandable before they happen.",
      ),
      h(
        "p",
        { className: "tagline", key: "tagline" },
        "Review the draft, explain the route, and execute only after a clear user approval.",
      ),
    ]),
    h("section", { className: "panel status-panel", key: "status" }, [
      h("p", { className: "panel-label", key: "label" }, "MVP status"),
      h("p", { className: "status-intro", key: "intro" }, [
        "A quick check of the current demo state. ",
        nextStepReady
          ? "The flow now moves cleanly from review into explanation."
          : "A wallet or probing step is still needed before the happy path is ready.",
      ]),
      h(
        "div",
        { className: "status-grid", key: "grid" },
        statusItems.map((item) =>
          h("article", { className: "status-card", key: item.label }, [
            h("div", { className: "status-card-header", key: "header" }, [
              h("p", { className: "status-card-label", key: "label" }, item.label),
              h(
                "p",
                {
                  className: `status-chip status-chip-${item.tone}`,
                  key: "chip",
                },
                item.state,
              ),
            ]),
            h("p", { className: "status-card-detail", key: "detail" }, item.detail),
          ]),
        ),
      ),
    ]),
    h("section", { className: "panel wallet-panel", key: "wallet" }, [
      h("div", { className: "wallet-header", key: "header" }, [
        h("p", { className: "panel-label", key: "label" }, "Wallet state"),
        h("p", { className: "state-badge", key: "badge" }, walletCopy.badge),
      ]),
      h("div", { className: "wallet-card", key: "card" }, [
        h("p", { className: "wallet-title", key: "title" }, walletCopy.title),
        h("p", { className: "wallet-copy", key: "copy" }, walletCopy.copy),
        h("dl", { className: "wallet-meta", key: "meta" }, [
          h(React.Fragment, { key: "source" }, [
            h("dt", { key: "source-label" }, "Wallet source"),
            h("dd", { key: "source-value" }, walletOriginLabel),
          ]),
          h(React.Fragment, { key: "readiness" }, [
            h("dt", { key: "readiness-label" }, "MVP readiness"),
            h(
              "dd",
              { key: "readiness-value" },
              walletState === "unlocked"
                ? "Ready for status and review work"
                : "Setup still in progress",
            ),
          ]),
        ]),
        h("p", { className: "wallet-detail", key: "detail" }, walletCopy.detail),
      ]),
      h("div", { className: "wallet-actions", key: "actions" }, [
        walletState === "empty"
          ? h(
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
            )
          : null,
        walletState === "empty"
          ? h(
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
            )
          : null,
        walletState === "locked"
          ? h(
              "button",
              {
                type: "button",
                className: "primary-button",
                key: "unlock",
                onClick: () => setWalletState("unlocked"),
              },
              "Unlock wallet",
            )
          : null,
        walletState === "unlocked"
          ? h(
              "button",
              {
                type: "button",
                className: "primary-button",
                key: "lock",
                onClick: () => setWalletState("locked"),
              },
              "Lock wallet",
            )
          : null,
        walletState !== "empty"
          ? h(
              "button",
              {
                type: "button",
                className: "secondary-button",
                key: "reset",
                onClick: () => {
                  setWalletOrigin(null);
                  setWalletState("empty");
                },
              },
              "Reset wallet",
            )
          : null,
      ]),
    ]),
    h("section", { className: "panel review-panel", key: "review" }, [
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
          ? "Draft one transfer here, then probe routes so Hecate can explain the selected path."
          : "Unlock the wallet before drafting a transfer.",
      ),
      h("div", { className: "review-form", key: "form" }, [
        h("label", { className: "review-field", key: "recipient-field" }, [
          h("span", { className: "review-field-label", key: "label" }, "Recipient"),
          h("input", {
            className: "review-input",
            type: "text",
            placeholder: "0x..., ENS, or demo recipient",
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
                }),
              ),
          },
          "Probe routes",
        ),
        h(
          "p",
          { className: "review-probe-note", key: "probe-note" },
          reviewReady
            ? "This MVP probe uses simple local rules from the current draft. It does not execute anything."
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
            ? "The route decision is ready. The action still requires final approval before the demo send can run."
            : "Probe routes to fill in the decision summary.",
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
            ? "A private route is selected for this draft. Open the approval step to continue."
            : "Private send is only available when the selected route is Private.",
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
                "This is the final user approval step before the private transfer can run. The action only proceeds if you approve it here.",
              ),
              h(
                "p",
                { className: "approval-note", key: "note" },
                "This MVP keeps the approval step honest. A future wallet or Ledger-backed signer can live here later, but no hardware approval is connected now.",
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
                "The demo private transfer is being prepared inside the popup.",
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
                  ? "Review the decision above, open approval, then trigger the demo private send."
                  : "Probe the draft until the selected route is Private before the approval boundary can open.",
              ),
            ])
          : null,
      ]),
    ]),
    h("section", { className: "panel flow-panel", key: "flow" }, [
      h(
        "p",
        { className: "panel-label", key: "label" },
        "Happy path",
      ),
      h(
        "p",
        { className: "flow-intro", key: "intro" },
        "The demo is easiest to follow in this order: unlock, review, probe, approve, then show the result.",
      ),
      h("div", { className: "flow-grid", key: "grid" }, [
        h("article", { className: "flow-step", key: "review" }, [
          h("p", { className: "step-number", key: "number" }, "01"),
          h("h2", { key: "title" }, "Review"),
          h(
            "p",
            { key: "copy" },
            "Draft the transfer before any action can run.",
          ),
        ]),
        h("article", { className: "flow-step", key: "explain" }, [
          h("p", { className: "step-number", key: "number" }, "02"),
          h("h2", { key: "title" }, "Explain"),
          h(
            "p",
            { key: "copy" },
            "Probe routes and show the selected path in plain language.",
          ),
        ]),
        h("article", { className: "flow-step", key: "execute" }, [
          h("p", { className: "step-number", key: "number" }, "03"),
          h("h2", { key: "title" }, "Execute"),
          h(
            "p",
            { key: "copy" },
            "Open final approval, then run the demo private send.",
          ),
        ]),
      ]),
    ]),
    h("section", { className: "panel", key: "demo-summary" }, [
      h("p", { className: "panel-label", key: "label" }, "Demo summary"),
      h("ul", { className: "status-list", key: "list" }, [
        h("li", { key: "wallet" }, "Wallet setup and unlock are visible at the top of the flow."),
        h("li", { key: "status" }, "Status, review, probing, decision, approval, and result now read as one path."),
        h(
          "li",
          { key: "decision" },
          "All current send behavior remains local and explicit for the MVP demo.",
        ),
      ]),
    ]),
  ]);
}
