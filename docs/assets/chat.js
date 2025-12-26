\
(() => {
  const DEFAULT_ENDPOINT = "https://YOUR-WORKER-SUBDOMAIN.workers.dev/api/chat";

  function getEndpoint() {
    const configured = (window.DOCS_AI_CHAT && window.DOCS_AI_CHAT.endpoint) || "";
    return configured || DEFAULT_ENDPOINT;
  }

  function currentPageContext() {
    const title = document.title || "";
    const article = document.querySelector("main article") || document.querySelector("article") || document.body;
    const text = (article && article.innerText) ? article.innerText : "";
    const trimmed = text.slice(0, 6000);
    return `TITLE: ${title}\n\nCONTENT:\n${trimmed}`;
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  function mount() {
    const root = document.getElementById("doccoach-root");
    if (!root) return;

    let open = false;
    let includePage = true;
    let mode = "coach";
    const messages = [
      { role: "assistant", content: "Hi — I’m DocCoach. Ask me about technical writing, or toggle “Include this page” for feedback grounded in what you’re reading." },
    ];

    const panel = el("div", { class: "doccoach-panel", style: "display:none" });
    const header = el("div", { class: "doccoach-header" }, [
      el("div", {}, [
        el("div", { class: "doccoach-title", text: "DocCoach" }),
        el("div", { class: "doccoach-sub", text: "Technical writing coach (Workers AI)" }),
      ]),
      el("button", { class: "doccoach-close", "aria-label": "Close", onclick: () => setOpen(false), text: "×" }),
    ]);

    const body = el("div", { class: "doccoach-body" });

    const input = el("input", { class: "doccoach-input", placeholder: "Ask something…", type: "text" });
    const send = el("button", { class: "doccoach-send", text: "Send" });

    const toggle = el("label", { class: "doccoach-toggle" }, [
      el("input", { type: "checkbox", checked: "checked", onchange: (e) => { includePage = e.target.checked; } }),
      el("span", { text: "Include this page" }),
    ]);

    const modeSelect = el("select", {
      onchange: (e) => { mode = e.target.value; }
    }, [
      el("option", { value: "coach", text: "Coach" }),
      el("option", { value: "review", text: "Doc Review" }),
      el("option", { value: "rewrite", text: "Rewrite" }),
    ]);

    modeSelect.style.borderRadius = "10px";
    modeSelect.style.padding = "8px";
    modeSelect.style.border = "1px solid rgba(0,0,0,.18)";
    modeSelect.style.fontSize = "12px";

    const note = el("div", { class: "doccoach-note" });

    const footer = el("div", { class: "doccoach-footer" }, [
      el("div", { class: "doccoach-row" }, [toggle, modeSelect]),
      el("div", { class: "doccoach-row" }, [input, send]),
      note,
    ]);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);

    const btn = el("button", { class: "doccoach-btn", text: "DocCoach", onclick: () => setOpen(!open) });

    root.appendChild(panel);
    root.appendChild(btn);

    function render() {
      body.innerHTML = "";
      messages.forEach((m) => {
        const cls = m.role === "user" ? "doccoach-msg doccoach-user" : "doccoach-msg doccoach-assistant";
        body.appendChild(el("div", { class: cls, text: m.content }));
      });
      body.scrollTop = body.scrollHeight;
    }

    function setOpen(v) {
      open = v;
      panel.style.display = open ? "flex" : "none";
      btn.textContent = open ? "Close" : "DocCoach";
      if (open) input.focus();
    }

    async function sendMsg() {
      const endpoint = getEndpoint();
      if (endpoint.includes("YOUR-WORKER-SUBDOMAIN")) {
        note.textContent = "Setup needed: update docs/assets/chat.js with your Worker endpoint URL.";
        return;
      }

      const text = (input.value || "").trim();
      if (!text) return;

      input.value = "";
      note.textContent = "Thinking…";
      messages.push({ role: "user", content: text });
      render();

      const payload = {
        mode,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        pageContext: includePage ? currentPageContext() : "",
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail = data.detail || data.error || `HTTP ${res.status}`;
          throw new Error(detail);
        }

        const answer = data.text || "(No response)";
        messages.push({ role: "assistant", content: answer });
        note.textContent = "";
        render();
      } catch (err) {
        note.textContent = "Error: " + (err && err.message ? err.message : String(err));
      }
    }

    send.addEventListener("click", sendMsg);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMsg();
    });

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
