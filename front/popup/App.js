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
        "Choose Create or Import to start the demo wallet state.",
      detail:
        "This state is local to the popup and keeps the MVP demo explicit.",
    },
    locked: {
      badge: "Locked wallet",
      title: "Wallet is ready but locked",
      copy: "Wallet context exists, but actions stay blocked until you unlock.",
      detail: "Unlock to continue through review, probe, and final approval.",
    },
    unlocked: {
      badge: "Unlocked wallet",
      title: "Wallet is ready for the demo flow",
      copy: "Wallet context is active and ready for the demo flow.",
      detail: "State remains local to this popup and user approval still gates execution.",
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
          ? "Decision is visible. Final approval can now be opened."
          : "Unlock wallet, draft transfer, then run route probe.",
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
      h("div", { className: "brand-header", key: "brand-header" }, [
        h("div", { className: "brand-identity", key: "identity" }, [
          h("p", { className: "brand-mark", key: "mark" }, "H"),
          h("div", { className: "brand-meta", key: "meta" }, [
            h("p", { className: "brand-name", key: "name" }, "Hecate"),
            h(
              "p",
              { className: "brand-subtitle", key: "subtitle" },
              "Privacy-first wallet demo",
            ),
          ]),
        ]),
        h("p", { className: "brand-badge", key: "badge" }, "Hackathon MVP"),
      ]),
      h("p", { className: "eyebrow", key: "eyebrow" }, "Live demo flow"),
      h(
        "h1",
        { key: "headline" },
        "Private sends should be understandable before they happen.",
      ),
      h(
        "p",
        { className: "tagline", key: "tagline" },
        "Review the draft, explain the selected route, then execute only after final approval.",
      ),
    ]),
    h("section", { className: "panel status-panel", key: "status" }, [
      h("p", { className: "panel-label", key: "label" }, "MVP status"),
      h("p", { className: "status-intro", key: "intro" }, [
        "Use this checklist while narrating the demo. ",
        nextStepReady
          ? "Review and explanation are ready, so approval can follow."
          : "Start by unlocking the wallet, drafting the transfer, and probing routes.",
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
                }),
              ),
          },
          "Probe routes",
        ),
        h(
          "p",
          { className: "review-probe-note", key: "probe-note" },
          reviewReady
            ? "Probe uses local MVP rules from this draft. It does not execute a transfer."
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
    h("section", { className: "panel flow-panel", key: "flow" }, [
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
    h("section", { className: "panel", key: "demo-summary" }, [
      h("p", { className: "panel-label", key: "label" }, "Demo summary"),
      h("ul", { className: "status-list", key: "list" }, [
        h("li", { key: "wallet" }, "Wallet setup and unlock appear first, so demo readiness is obvious."),
        h("li", { key: "status" }, "Status, review, probing, decision, approval, and result read as one narrative."),
        h(
          "li",
          { key: "decision" },
          "Current execution is local MVP behavior only; no live sponsor integration is claimed.",
        ),
      ]),
    ]),
  ]);
}
