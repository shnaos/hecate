const React = window.React;
const h = React.createElement;

export function PopupShell() {
  const [walletState, setWalletState] = React.useState("empty");
  const [walletOrigin, setWalletOrigin] = React.useState(null);

  const walletCopyByState = {
    empty: {
      badge: "No wallet yet",
      title: "Start wallet setup",
      copy:
        "Choose how this MVP wallet should enter setup. This step stays local to the popup for now.",
      detail:
        "Create starts a fresh wallet path. Import represents bringing an existing wallet into Hecate.",
    },
    locked: {
      badge: "Locked wallet",
      title: "Wallet ready but protected",
      copy:
        "Your wallet is present in the popup, but it stays locked until you explicitly unlock it.",
      detail:
        "Unlock is the next MVP step before status, review, and route decisions can become meaningful.",
    },
    unlocked: {
      badge: "Unlocked wallet",
      title: "Wallet ready for the next MVP steps",
      copy:
        "The wallet is accessible in this popup and ready for future status and review flow work.",
      detail:
        "This is still a local MVP state. No transfer, probing, or execution logic is active yet.",
    },
  };

  const walletCopy = walletCopyByState[walletState];
  const walletOriginLabel =
    walletOrigin === "create"
      ? "Created in Hecate"
      : walletOrigin === "import"
        ? "Imported into Hecate"
        : "Not set";

  return h("main", { className: "popup" }, [
    h("section", { className: "hero", key: "hero" }, [
      h("p", { className: "eyebrow", key: "eyebrow" }, "Hecate MVP"),
      h(
        "h1",
        { key: "headline" },
        "Private sends should be understandable before they happen.",
      ),
      h(
        "p",
        { className: "tagline", key: "tagline" },
        "A privacy-first wallet concept that reviews intent, explains the route, and only executes after an explicit user decision.",
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
    h("section", { className: "panel", key: "flow" }, [
      h(
        "p",
        { className: "panel-label", key: "label" },
        "Review -> Explain -> Execute",
      ),
      h("div", { className: "flow-grid", key: "grid" }, [
        h("article", { className: "flow-step", key: "review" }, [
          h("p", { className: "step-number", key: "number" }, "01"),
          h("h2", { key: "title" }, "Review"),
          h(
            "p",
            { key: "copy" },
            "Show the send request in plain language before any action is taken.",
          ),
        ]),
        h("article", { className: "flow-step", key: "explain" }, [
          h("p", { className: "step-number", key: "number" }, "02"),
          h("h2", { key: "title" }, "Explain"),
          h(
            "p",
            { key: "copy" },
            "Make the selected rail and privacy tradeoff visible to the user.",
          ),
        ]),
        h("article", { className: "flow-step", key: "execute" }, [
          h("p", { className: "step-number", key: "number" }, "03"),
          h("h2", { key: "title" }, "Execute"),
          h(
            "p",
            { key: "copy" },
            "Run one private transfer flow only after the user confirms the choice.",
          ),
        ]),
      ]),
    ]),
    h("section", { className: "panel", key: "next" }, [
      h("p", { className: "panel-label", key: "label" }, "Coming next"),
      h("ul", { className: "status-list", key: "list" }, [
        h("li", { key: "wallet" }, "Wallet create, import, and unlock now feel real in the popup"),
        h("li", { key: "status" }, "Status and review screens come next"),
        h(
          "li",
          { key: "decision" },
          "Rail probing with an explicit route decision.",
        ),
      ]),
    ]),
  ]);
}
