const React = window.React;
const h = React.createElement;

export function PopupShell() {
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
        h("li", { key: "wallet" }, "Wallet create, import, and unlock"),
        h("li", { key: "status" }, "Readiness and review screens"),
        h(
          "li",
          { key: "decision" },
          "Rail probing with an explicit route decision.",
        ),
      ]),
    ]),
    h(
      "section",
      {
        className: "panel cta-panel",
        "aria-label": "Call to action placeholder",
        key: "cta",
      },
      [
        h("p", { className: "panel-label", key: "label" }, "CTA Placeholder"),
        h("div", { className: "cta-box", key: "box" }, [
          h("p", { className: "cta-title", key: "title" }, "Open wallet setup"),
          h(
            "p",
            { className: "cta-copy", key: "copy" },
            "This button becomes active once wallet state is implemented in the next MVP steps.",
          ),
          h(
            "button",
            {
              type: "button",
              className: "cta-button",
              disabled: true,
              key: "button",
            },
            "Coming Soon",
          ),
        ]),
      ],
    ),
  ]);
}
