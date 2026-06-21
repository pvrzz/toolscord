/*
===========================
Discord Markdown Editor
by: github.com/pvrzz
===========================
*/

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const toolbar = document.getElementById("toolbar");
const quickList = document.getElementById("quickList");
const toast = document.getElementById("toast");

const TOOLS = [
  { id: "bold", fa: "fa-solid fa-bold", lbl: "Bold", wrap: ["**", "**"], ph: "bold text" },
  { id: "italic", fa: "fa-solid fa-italic", lbl: "Italic", wrap: ["*", "*"], ph: "italic text" },
  { id: "underline", fa: "fa-solid fa-underline", lbl: "Underline", wrap: ["__", "__"], ph: "underline" },
  { id: "strike", fa: "fa-solid fa-strikethrough", lbl: "Strike", wrap: ["~~", "~~"], ph: "strikethrough" },
  { id: "spoiler", fa: "fa-solid fa-eye-slash", lbl: "Spoiler", wrap: ["||", "||"], ph: "spoiler" },
  { sep: true },
  { id: "code", fa: "fa-solid fa-code", lbl: "Code", wrap: ["`", "`"], ph: "code" },
  { id: "codeblock", fa: "fa-solid fa-file-code", lbl: "Block", block: "codeblock", ph: "code block" },
  { sep: true },
  { id: "h1", ico: "H1", lbl: "", line: "# ", ph: "Big header" },
  { id: "h2", ico: "H2", lbl: "", line: "## ", ph: "Medium header" },
  { id: "h3", ico: "H3", lbl: "", line: "### ", ph: "Small header" },
  { id: "subtext", fa: "fa-solid fa-subscript", lbl: "Subtext", line: "-# ", ph: "subtext" },
  { sep: true },
  { id: "quote", fa: "fa-solid fa-quote-right", lbl: "Quote", line: "> ", ph: "quote" },
  { id: "blockquote", fa: "fa-solid fa-quote-left", lbl: "Block Quote", line: ">>> ", ph: "multi-line quote" },
  { id: "bullet", fa: "fa-solid fa-list-ul", lbl: "List", line: "- ", ph: "list item" },
  { id: "numbered", fa: "fa-solid fa-list-ol", lbl: "Numbered", line: "1. ", ph: "list item" },
  { sep: true },
  { id: "link", fa: "fa-solid fa-link", lbl: "Link", action: "link" },
];

const QUICK = [
  { id: "bold", label: "Bold", key: "Ctrl+B" },
  { id: "italic", label: "Italic", key: "Ctrl+I" },
  { id: "underline", label: "Underline", key: "Ctrl+U" },
  { id: "strike", label: "Strikethrough" },
  { id: "spoiler", label: "Spoiler" },
  { id: "code", label: "Inline code" },
  { id: "codeblock", label: "Code block" },
  { id: "link", label: "Masked link" },
];

function getTool(id) { return TOOLS.find(t => t.id === id); }

function buildToolbar() {
  TOOLS.forEach(t => {
    if (t.sep) {
      const s = document.createElement("div");
      s.className = "tool-sep";
      toolbar.appendChild(s);
      return;
    }
    const b = document.createElement("button");
    b.className = "tool-btn";
    b.title = t.lbl || t.id;
    let html = t.fa ? `<i class="${t.fa}"></i>` : `<span class="ico">${t.ico}</span>`;
    if (t.lbl) html += `<span class="lbl">${t.lbl}</span>`;
    b.innerHTML = html;
    b.addEventListener("click", () => applyTool(t));
    toolbar.appendChild(b);
  });
}

function buildQuickList() {
  QUICK.forEach(q => {
    const b = document.createElement("button");
    b.className = "quick-item";
    b.innerHTML = `<span>${q.label}</span>${q.key ? `<span class="qi-key">${q.key}</span>` : ""}`;
    b.addEventListener("click", () => applyTool(getTool(q.id)));
    quickList.appendChild(b);
  });
}

function applyTool(t) {
  if (!t) return;
  editor.focus();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const val = editor.value;
  const selected = val.slice(start, end);

  if (t.action === "link") return insertLink(start, end, selected, val);
  if (t.block === "codeblock") return insertCodeBlock(start, end, selected, val);
  if (t.wrap) return wrapSelection(t, start, end, selected, val);
  if (t.line) return prefixLines(t, start, end, selected, val);
}

function wrapSelection(t, start, end, selected, val) {
  const [open, close] = t.wrap;
  const text = selected || t.ph;
  const replacement = open + text + close;
  editor.value = val.slice(0, start) + replacement + val.slice(end);
  if (selected) {
    setSel(start + open.length, start + open.length + text.length);
  } else {
    setSel(start + open.length, start + open.length + text.length);
  }
  render();
}

function insertCodeBlock(start, end, selected, val) {
  const text = selected || "code here";
  const replacement = "```\n" + text + "\n```";
  editor.value = val.slice(0, start) + replacement + val.slice(end);
  setSel(start + 4, start + 4 + text.length);
  render();
}

function insertLink(start, end, selected, val) {
  const label = selected || "link text";
  const url = "https://";
  const replacement = "[" + label + "](" + url + ")";
  editor.value = val.slice(0, start) + replacement + val.slice(end);
  const urlStart = start + 1 + label.length + 2;
  setSel(urlStart, urlStart + url.length);
  render();
}

function prefixLines(t, start, end, selected, val) {
  const lineStart = val.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = val.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = val.length;
  const block = val.slice(lineStart, lineEnd);
  const lines = block.length ? block.split("\n") : [""];

  let counter = 1;
  const out = lines.map(line => {
    if (t.id === "numbered") return (counter++) + ". " + line;
    return t.line + line;
  }).join("\n");

  let finalOut = out;
  if (block.length === 0) {
    finalOut = t.id === "numbered" ? "1. " + t.ph : t.line + t.ph;
  }

  editor.value = val.slice(0, lineStart) + finalOut + val.slice(lineEnd);
  if (block.length === 0) {
    const prefixLen = (t.id === "numbered" ? 3 : t.line.length);
    setSel(lineStart + prefixLen, lineStart + prefixLen + t.ph.length);
  } else {
    setSel(lineStart, lineStart + finalOut.length);
  }
  render();
}

function setSel(a, b) {
  editor.selectionStart = a;
  editor.selectionEnd = b;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function fmtTime(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m} ${ap}`;
}
function fmtTimeSec(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m}:${s} ${ap}`;
}
function fmtShortDate(d) {
  return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`;
}
function fmtLongDate(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function relativeTime(d) {
  const now = Date.now();
  let diff = d.getTime() - now;
  const future = diff >= 0;
  diff = Math.abs(diff);
  const sec = Math.round(diff / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60], ["second", 1],
  ];
  for (const [name, s] of units) {
    if (sec >= s || name === "second") {
      const n = Math.max(1, Math.floor(sec / s));
      const plural = n === 1 ? "" : "s";
      return future ? `in ${n} ${name}${plural}` : `${n} ${name}${plural} ago`;
    }
  }
  return "now";
}

function renderTimestamp(unix, style) {
  const d = new Date(unix * 1000);
  switch (style) {
    case "t": return fmtTime(d);
    case "T": return fmtTimeSec(d);
    case "d": return fmtShortDate(d);
    case "D": return fmtLongDate(d);
    case "f": return `${fmtLongDate(d)} ${fmtTime(d)}`;
    case "F": return `${DAYS[d.getDay()]}, ${fmtLongDate(d)} ${fmtTime(d)}`;
    case "R": return relativeTime(d);
    default: return `${fmtLongDate(d)} ${fmtTime(d)}`;
  }
}

function renderInline(text) {
  let out = "";
  let i = 0;
  const n = text.length;

  while (i < n) {
    const rest = text.slice(i);

    let m;
    if ((m = rest.match(/^<t:(\d+)(?::([tTdDfFR]))?>/))) {
      const unix = parseInt(m[1], 10);
      const style = m[2] || "f";
      out += `<span class="md-timestamp">${escapeHtml(renderTimestamp(unix, style))}</span>`;
      i += m[0].length; continue;
    }
    if ((m = rest.match(/^<(@!?\d+|@&\d+|#\d+)>/))) {
      const raw = m[1];
      let label = raw;
      if (raw.startsWith("@&")) label = "@role";
      else if (raw.startsWith("@")) label = "@user";
      else if (raw.startsWith("#")) label = "#channel";
      out += `<span class="md-mention">${label}</span>`;
      i += m[0].length; continue;
    }
    if (rest.startsWith("```")) {
      const close = text.indexOf("```", i + 3);
      if (close !== -1) {
        let inner = text.slice(i + 3, close);
        inner = inner.replace(/^[a-zA-Z0-9+\-]*\n/, "");
        inner = inner.replace(/^\n/, "");
        out += `<div class="md-codeblock">${escapeHtml(inner)}</div>`;
        i = close + 3; continue;
      }
    }
    if (rest[0] === "`") {
      const close = text.indexOf("`", i + 1);
      if (close !== -1) {
        out += `<span class="md-inline-code">${escapeHtml(text.slice(i + 1, close))}</span>`;
        i = close + 1; continue;
      }
    }
    if (rest.startsWith("**")) {
      const close = text.indexOf("**", i + 2);
      if (close !== -1) {
        out += `<strong>${renderInline(text.slice(i + 2, close))}</strong>`;
        i = close + 2; continue;
      }
    }
    if (rest.startsWith("__")) {
      const close = text.indexOf("__", i + 2);
      if (close !== -1) {
        out += `<u>${renderInline(text.slice(i + 2, close))}</u>`;
        i = close + 2; continue;
      }
    }
    if (rest.startsWith("~~")) {
      const close = text.indexOf("~~", i + 2);
      if (close !== -1) {
        out += `<s>${renderInline(text.slice(i + 2, close))}</s>`;
        i = close + 2; continue;
      }
    }
    if (rest.startsWith("||")) {
      const close = text.indexOf("||", i + 2);
      if (close !== -1) {
        out += `<span class="md-spoiler">${renderInline(text.slice(i + 2, close))}</span>`;
        i = close + 2; continue;
      }
    }
    if (rest[0] === "*") {
      const close = text.indexOf("*", i + 1);
      if (close !== -1 && close > i + 1) {
        out += `<em>${renderInline(text.slice(i + 1, close))}</em>`;
        i = close + 1; continue;
      }
    }
    if (rest[0] === "_") {
      const close = text.indexOf("_", i + 1);
      if (close !== -1 && close > i + 1) {
        out += `<em>${renderInline(text.slice(i + 1, close))}</em>`;
        i = close + 1; continue;
      }
    }
    if ((m = rest.match(/^\[([^\]]+)\]\(\s*(https?:\/\/[^\s)]+)\s*\)/))) {
      out += `<a class="md-link" href="${escapeHtml(m[2])}" target="_blank" rel="noopener">${renderInline(m[1])}</a>`;
      i += m[0].length; continue;
    }

    out += escapeHtml(text[i]);
    i++;
  }
  return out;
}

function autoGrow() {
  editor.style.height = "auto";
  editor.style.height = Math.min(editor.scrollHeight, window.innerHeight * 0.5) + "px";
}

function render() {
  const raw = editor.value;
  preview.innerHTML = renderBlocks(raw);
  attachSpoilers();
  autoGrow();
  saveState();
}

function renderBlocks(raw) {
  const lines = raw.split("\n");
  let html = "";
  let i = 0;
  let listType = null;
  let listBuffer = [];

  function flushList() {
    if (!listBuffer.length) return;
    const tag = listType === "ol" ? "ol" : "ul";
    html += `<${tag} class="md-list">` + listBuffer.map(li => `<li class="md-li">${renderInline(li)}</li>`).join("") + `</${tag}>`;
    listBuffer = [];
    listType = null;
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.trimStart().startsWith("```")) {
      flushList();
      const block = [];
      let opener = line;
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        block.push(lines[i]); i++;
      }
      i++;
      let lang = opener.trim().replace(/^```/, "");
      let body = block.join("\n");
      html += `<div class="md-codeblock">${escapeHtml(body)}</div>`;
      continue;
    }

    if (line.startsWith(">>> ")) {
      flushList();
      const rest = [line.slice(4)];
      i++;
      while (i < lines.length) { rest.push(lines[i]); i++; }
      html += `<blockquote class="md-blockquote">${renderInline(rest.join("\n"))}</blockquote>`;
      continue;
    }

    let m;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flushList();
      const level = m[1].length;
      html += `<h${level} class="md-h">${renderInline(m[2])}</h${level}>`;
      i++; continue;
    }
    if ((m = line.match(/^-#\s+(.*)$/))) {
      flushList();
      html += `<div class="md-subtext">${renderInline(m[1])}</div>`;
      i++; continue;
    }
    if ((m = line.match(/^>\s+(.*)$/))) {
      flushList();
      const quoted = [m[1]];
      i++;
      while (i < lines.length && (m = lines[i].match(/^>\s?(.*)$/))) {
        quoted.push(m[1]); i++;
      }
      html += `<blockquote class="md-blockquote">${renderInline(quoted.join("\n"))}</blockquote>`;
      continue;
    }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(m[1]);
      i++; continue;
    }
    if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(m[1]);
      i++; continue;
    }

    flushList();
    if (line === "") {
      html += "\n";
    } else {
      html += renderInline(line) + (i < lines.length - 1 ? "\n" : "");
    }
    i++;
  }
  flushList();
  return html;
}

function attachSpoilers() {
  preview.querySelectorAll(".md-spoiler").forEach(s => {
    s.addEventListener("click", () => s.classList.toggle("revealed"));
  });
}

function setupTabs() {
  const channels = document.querySelectorAll(".channel[data-tab]");
  const panels = document.querySelectorAll(".tab-panel");
  const topbarName = document.getElementById("topbarName");
  const topbarDesc = document.getElementById("topbarDesc");
  const formattingGroup = document.getElementById("formattingGroup");
  const descs = {
    editor: "Format your message visually — no symbols to memorize.",
    embed: "Build rich embeds and copy webhook / bot ready JSON.",
    timestamps: "Build dynamic timestamps that render in everyone's local time.",
    snowflake: "Decode any Discord ID into its creation date.",
    permissions: "Calculate permission bitfields and bot invite links.",
    colors: "Convert hex, RGB and the decimal colors Discord uses.",
    cheatsheet: "Every Discord markdown rule at a glance.",
  };
  channels.forEach(ch => {
    ch.addEventListener("click", () => {
      const tab = ch.dataset.tab;
      channels.forEach(c => c.classList.toggle("active", c === ch));
      panels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
      topbarName.textContent = tab;
      topbarDesc.textContent = descs[tab];
      formattingGroup.style.display = tab === "editor" ? "" : "none";
      const showEditorBtns = tab === "editor" ? "" : "none";
      document.getElementById("copyBtn").style.display = showEditorBtns;
      document.getElementById("clearBtn").style.display = showEditorBtns;
      closeNav();
    });
  });
}

function openNav() {
  document.querySelector(".sidebar").classList.add("open");
  document.getElementById("navBackdrop").classList.add("show");
}
function closeNav() {
  document.querySelector(".sidebar").classList.remove("open");
  document.getElementById("navBackdrop").classList.remove("show");
}
function setupNav() {
  document.getElementById("navToggle").addEventListener("click", openNav);
  document.getElementById("navBackdrop").addEventListener("click", closeNav);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
}

function setupToolbarScroll() {
  const bar = document.getElementById("toolbar");
  const left = document.getElementById("tbLeft");
  const right = document.getElementById("tbRight");
  const update = () => {
    const max = bar.scrollWidth - bar.clientWidth - 1;
    left.classList.toggle("disabled", bar.scrollLeft <= 0);
    right.classList.toggle("disabled", bar.scrollLeft >= max);
  };
  left.addEventListener("click", () => bar.scrollBy({ left: -160, behavior: "smooth" }));
  right.addEventListener("click", () => bar.scrollBy({ left: 160, behavior: "smooth" }));
  bar.addEventListener("scroll", update);
  window.addEventListener("resize", update);
  update();
}

const TS_STYLES = [
  { code: "t", name: "Short Time" },
  { code: "T", name: "Long Time" },
  { code: "d", name: "Short Date" },
  { code: "D", name: "Long Date" },
  { code: "f", name: "Short Date/Time" },
  { code: "F", name: "Long Date/Time" },
  { code: "R", name: "Relative" },
];

let tsState = { unix: Math.floor(Date.now() / 1000), style: "F" };

function setupTimestamps() {
  const dateEl = document.getElementById("tsDate");
  const timeEl = document.getElementById("tsTime");
  const stylesEl = document.getElementById("tsStyles");
  const nowBtn = document.getElementById("tsNow");
  const codeEl = document.getElementById("tsCode");
  const previewEl = document.getElementById("tsPreview");
  const unixEl = document.getElementById("tsUnix");
  const copyBtn = document.getElementById("tsCopy");

  function syncInputsFromState() {
    const d = new Date(tsState.unix * 1000);
    dateEl.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    timeEl.value = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
  }

  function readStateFromInputs() {
    const [y, mo, da] = dateEl.value.split("-").map(Number);
    const tparts = timeEl.value.split(":").map(Number);
    const h = tparts[0] || 0, mi = tparts[1] || 0, se = tparts[2] || 0;
    if (!y) return;
    const d = new Date(y, mo - 1, da, h, mi, se);
    tsState.unix = Math.floor(d.getTime() / 1000);
  }

  function renderStyles() {
    stylesEl.innerHTML = "";
    TS_STYLES.forEach(s => {
      const b = document.createElement("button");
      b.className = "ts-style" + (s.code === tsState.style ? " active" : "");
      b.innerHTML = `<span class="ts-style-name">${s.name}</span>
        <span class="ts-style-code">:${s.code}</span>
        <span class="ts-style-ex">${escapeHtml(renderTimestamp(tsState.unix, s.code))}</span>`;
      b.addEventListener("click", () => { tsState.style = s.code; update(); });
      stylesEl.appendChild(b);
    });
  }

  function update() {
    const code = `<t:${tsState.unix}:${tsState.style}>`;
    codeEl.textContent = code;
    previewEl.textContent = renderTimestamp(tsState.unix, tsState.style);
    unixEl.textContent = tsState.unix;
    renderStyles();
  }

  dateEl.addEventListener("input", () => { readStateFromInputs(); update(); });
  timeEl.addEventListener("input", () => { readStateFromInputs(); update(); });
  nowBtn.addEventListener("click", () => { tsState.unix = Math.floor(Date.now()/1000); syncInputsFromState(); update(); });
  copyBtn.addEventListener("click", () => copyText(`<t:${tsState.unix}:${tsState.style}>`));

  syncInputsFromState();
  update();
}

const CHEAT = [
  { title: "Text Styles", rows: [
    ["**bold**", "<strong>bold</strong>"],
    ["*italic*", "<em>italic</em>"],
    ["__underline__", "<u>underline</u>"],
    ["~~strikethrough~~", "<s>strikethrough</s>"],
    ["***bold italic***", "<strong><em>bold italic</em></strong>"],
    ["||spoiler||", '<span class="md-spoiler revealed">spoiler</span>'],
  ]},
  { title: "Headers", rows: [
    ["# Big header", '<span style="font-size:1.4em;font-weight:700">Big header</span>'],
    ["## Medium header", '<span style="font-size:1.2em;font-weight:700">Medium header</span>'],
    ["### Small header", '<span style="font-weight:700">Small header</span>'],
    ["-# Subtext", '<span style="font-size:.8em;color:var(--text-muted)">Subtext</span>'],
  ]},
  { title: "Code", rows: [
    ["`inline code`", '<span class="md-inline-code">inline code</span>'],
    ["```\\ncode block\\n```", '<span class="md-inline-code">code block</span>'],
    ["```js\\ncode\\n```", '<span class="md-inline-code">syntax highlight</span>'],
  ]},
  { title: "Quotes & Lists", rows: [
    ["> quote", '<span style="border-left:3px solid #4e5058;padding-left:6px">quote</span>'],
    [">>> block quote", '<span style="border-left:3px solid #4e5058;padding-left:6px">multi-line</span>'],
    ["- bullet item", "• bullet item"],
    ["1. numbered item", "1. numbered item"],
  ]},
  { title: "Links & Mentions", rows: [
    ["[text](https://url)", '<a class="md-link">text</a>'],
    ["<@123>", '<span class="md-mention">@user</span>'],
    ["<@&123>", '<span class="md-mention">@role</span>'],
    ["<#123>", '<span class="md-mention">#channel</span>'],
  ]},
  { title: "Timestamps", rows: [
    ["<t:UNIX:t>", "5:13 PM"],
    ["<t:UNIX:D>", "June 20, 2026"],
    ["<t:UNIX:F>", "Saturday, June 20, 2026 5:13 PM"],
    ["<t:UNIX:R>", "in 2 hours"],
  ]},
];

function buildCheatsheet() {
  const wrap = document.getElementById("cheatWrap");
  CHEAT.forEach(card => {
    const c = document.createElement("div");
    c.className = "cheat-card";
    c.innerHTML = `<h3>${card.title}</h3>` + card.rows.map(([syn, res]) =>
      `<div class="cheat-row"><span class="cheat-syntax">${escapeHtml(syn.replace(/\\n/g, "↵"))}</span><span class="cheat-result">${res}</span></div>`
    ).join("");
    wrap.appendChild(c);
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard")).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
    showToast("Copied to clipboard");
  });
}

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function saveState() {
  try { localStorage.setItem("dme:editor", editor.value); } catch (e) {}
}
function loadState() {
  try {
    const v = localStorage.getItem("dme:editor");
    if (v !== null) editor.value = v;
  } catch (e) {}
}

editor.addEventListener("input", render);
editor.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey) {
    const map = { b: "bold", i: "italic", u: "underline" };
    const id = map[e.key.toLowerCase()];
    if (id) { e.preventDefault(); applyTool(getTool(id)); }
  }
  if (e.key === "Tab") {
    e.preventDefault();
    const s = editor.selectionStart;
    editor.value = editor.value.slice(0, s) + "  " + editor.value.slice(editor.selectionEnd);
    setSel(s + 2, s + 2);
    render();
  }
});

document.getElementById("copyBtn").addEventListener("click", () => copyText(editor.value));
document.getElementById("copyComposer").addEventListener("click", () => copyText(editor.value));
document.getElementById("clearBtn").addEventListener("click", () => { editor.value = ""; render(); editor.focus(); });

const DEFAULT_TEXT = `# Welcome to Toolscord
Format Discord messages **without memorizing symbols**.

- Click the **toolbar buttons** to format selected text
- Try a ||hidden spoiler|| or some \`inline code\`
- Build embeds, timestamps & more in the other channels

> "No more guessing which symbol does what."
-# Made with Toolscord`;

function embedGet(sel) {
  const el = document.querySelector(`[data-embed="${sel}"]`);
  return el ? el.value.trim() : "";
}

function setEmbedColor(hex) {
  let h = (hex || "").trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return;
  const out = "#" + h.toUpperCase();
  document.getElementById("embedColor").value = out.toLowerCase();
  document.getElementById("embedColorHex").value = out;
  document.getElementById("embedColorDec").value = parseInt(h, 16);
}

function collectFields() {
  return [...document.querySelectorAll("#fieldsList .field-item")].map(it => ({
    name: it.querySelector(".f-name").value,
    value: it.querySelector(".f-value").value,
    inline: it.querySelector(".f-inline").checked,
  })).filter(f => f.name.trim() || f.value.trim());
}

function addField(name = "", value = "", inline = false) {
  const list = document.getElementById("fieldsList");
  const item = document.createElement("div");
  item.className = "field-item";
  item.innerHTML = `
    <div class="ef-row">
      <div class="ef-field grow"><label>Name</label><input class="f-name" placeholder="Field name" /></div>
      <div class="ef-field" style="flex:0 0 auto"><label>&nbsp;</label><label class="ef-check" style="margin-top:0"><input type="checkbox" class="f-inline" /> inline</label></div>
    </div>
    <div class="ef-row"><div class="ef-field"><label>Value</label><textarea class="f-value" rows="2" placeholder="Field value (markdown ok)"></textarea></div></div>
    <div class="field-foot"><button class="field-remove">Remove field</button></div>`;
  item.querySelector(".f-name").value = name;
  item.querySelector(".f-value").value = value;
  item.querySelector(".f-inline").checked = !!inline;
  item.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", renderEmbed));
  item.querySelector(".f-inline").addEventListener("change", renderEmbed);
  item.querySelector(".field-remove").addEventListener("click", () => { item.remove(); renderEmbed(); });
  list.appendChild(item);
}

function buildEmbedObject() {
  const embed = {};
  const title = embedGet("title"); if (title) embed.title = title;
  const url = embedGet("url"); if (url) embed.url = url;
  const desc = embedGet("description"); if (desc) embed.description = desc;
  const dec = parseInt(document.getElementById("embedColorDec").value, 10);
  if (!isNaN(dec)) embed.color = dec;
  const an = embedGet("author.name");
  if (an || embedGet("author.icon_url") || embedGet("author.url")) {
    embed.author = { name: an };
    const au = embedGet("author.url"); if (au) embed.author.url = au;
    const ai = embedGet("author.icon_url"); if (ai) embed.author.icon_url = ai;
  }
  const thumb = embedGet("thumbnail.url"); if (thumb) embed.thumbnail = { url: thumb };
  const img = embedGet("image.url"); if (img) embed.image = { url: img };
  const fields = collectFields();
  if (fields.length) embed.fields = fields.map(f => { const o = { name: f.name, value: f.value }; if (f.inline) o.inline = true; return o; });
  const ft = embedGet("footer.text"), fi = embedGet("footer.icon_url");
  if (ft || fi) { embed.footer = {}; if (ft) embed.footer.text = ft; if (fi) embed.footer.icon_url = fi; }
  if (document.getElementById("embedTimestamp").checked) embed.timestamp = new Date().toISOString();
  return embed;
}

function isEmptyEmbed(e) {
  return Object.keys(e).filter(k => k !== "color").length === 0;
}

function formatEmbedTimestamp(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${fmtShortDate(d)} ${fmtTime(d)}`;
}

function renderEmbedPreview(e) {
  if (isEmptyEmbed(e)) return `<div class="embed-empty">Your embed preview will appear here…</div>`;
  const colorHex = e.color != null ? "#" + (e.color & 0xffffff).toString(16).padStart(6, "0") : "var(--blurple)";
  let c = `<div class="embed-content">`;
  if (e.author) {
    c += `<div class="embed-author">`;
    if (e.author.icon_url) c += `<img src="${escapeHtml(e.author.icon_url)}" onerror="this.style.display='none'" />`;
    c += `<span>${escapeHtml(e.author.name || "")}</span></div>`;
  }
  if (e.title) {
    const t = renderInline(e.title);
    c += `<div class="embed-title">${e.url ? `<a href="${escapeHtml(e.url)}" target="_blank" rel="noopener">${t}</a>` : t}</div>`;
  }
  if (e.description) c += `<div class="embed-desc">${renderInline(e.description)}</div>`;
  if (e.fields && e.fields.length) {
    c += `<div class="embed-fields">`;
    e.fields.forEach(f => {
      c += `<div class="embed-field${f.inline ? " inline" : ""}"><div class="efield-name">${renderInline(f.name || "")}</div><div class="efield-value">${renderInline(f.value || "")}</div></div>`;
    });
    c += `</div>`;
  }
  if (e.image && e.image.url) c += `<div class="embed-image"><img src="${escapeHtml(e.image.url)}" onerror="this.style.display='none'" /></div>`;
  const footText = e.footer && e.footer.text;
  const ts = e.timestamp ? formatEmbedTimestamp(e.timestamp) : "";
  if (footText || ts) {
    c += `<div class="embed-footer">`;
    if (e.footer && e.footer.icon_url) c += `<img src="${escapeHtml(e.footer.icon_url)}" onerror="this.style.display='none'" />`;
    c += `<span>`;
    if (footText) c += escapeHtml(footText);
    if (footText && ts) c += ` <span class="dot">•</span> `;
    if (ts) c += escapeHtml(ts);
    c += `</span></div>`;
  }
  c += `</div>`;
  const thumb = e.thumbnail && e.thumbnail.url
    ? `<div class="embed-thumb"><img src="${escapeHtml(e.thumbnail.url)}" onerror="this.parentElement.style.display='none'" /></div>` : "";
  return `<div class="embed" style="border-left-color:${colorHex}">${c}${thumb}</div>`;
}

function renderEmbed() {
  const embed = buildEmbedObject();
  const out = document.getElementById("embedPreview");
  out.innerHTML = renderEmbedPreview(embed);
  out.querySelectorAll(".md-spoiler").forEach(s => s.addEventListener("click", () => s.classList.toggle("revealed")));
  document.getElementById("embedJson").value = JSON.stringify({ embeds: [embed] }, null, 2);
}

function setEmbedInput(path, val) {
  const el = document.querySelector(`[data-embed="${path}"]`);
  if (el) el.value = val == null ? "" : val;
}

function populateEmbedForm(e) {
  e = e || {};
  setEmbedInput("title", e.title);
  setEmbedInput("url", e.url);
  setEmbedInput("description", e.description);
  setEmbedInput("author.name", e.author && e.author.name);
  setEmbedInput("author.url", e.author && e.author.url);
  setEmbedInput("author.icon_url", e.author && e.author.icon_url);
  setEmbedInput("thumbnail.url", e.thumbnail && e.thumbnail.url);
  setEmbedInput("image.url", e.image && e.image.url);
  setEmbedInput("footer.text", e.footer && e.footer.text);
  setEmbedInput("footer.icon_url", e.footer && e.footer.icon_url);
  document.getElementById("embedTimestamp").checked = !!e.timestamp;
  if (typeof e.color === "number") setEmbedColor("#" + (e.color & 0xffffff).toString(16).padStart(6, "0"));
  document.getElementById("fieldsList").innerHTML = "";
  (e.fields || []).forEach(f => addField(f.name, f.value, f.inline));
  renderEmbed();
}

function importEmbedJson() {
  try {
    const data = JSON.parse(document.getElementById("embedJson").value);
    let embed = data;
    if (Array.isArray(data.embeds)) embed = data.embeds[0] || {};
    else if (data.embed) embed = data.embed;
    populateEmbedForm(embed);
    showToast("Imported JSON");
  } catch (err) {
    showToast("Invalid JSON");
  }
}

function setupEmbed() {
  document.querySelectorAll("[data-embed]").forEach(el => el.addEventListener("input", renderEmbed));
  document.getElementById("embedColor").addEventListener("input", e => { setEmbedColor(e.target.value); renderEmbed(); });
  document.getElementById("embedColorHex").addEventListener("input", e => { setEmbedColor(e.target.value); renderEmbed(); });
  document.getElementById("embedTimestamp").addEventListener("change", renderEmbed);
  document.getElementById("addField").addEventListener("click", () => { addField(); renderEmbed(); });
  document.getElementById("copyJson").addEventListener("click", () => copyText(document.getElementById("embedJson").value));
  document.getElementById("importJson").addEventListener("click", importEmbedJson);
  populateEmbedForm({
    author: { name: "Toolscord" },
    title: "Welcome to the Embed Builder",
    url: "https://github.com/pvrzz",
    description: "Edit the fields on the left and watch this **embed** update live.\nThe JSON below is ready to drop into a webhook or bot.",
    color: 5793266,
    fields: [
      { name: "Markdown", value: "Works in **descriptions** & fields", inline: true },
      { name: "Output", value: "Copy-paste JSON", inline: true },
    ],
    footer: { text: "Toolscord" },
    timestamp: new Date().toISOString(),
  });
}

const DISCORD_EPOCH = 1420070400000n;

function decodeSnowflake() {
  const raw = document.getElementById("sfInput").value.trim();
  const ids = ["sfDate", "sfRel", "sfUnixMs", "sfTag", "sfWorker", "sfProcess", "sfIncrement"];
  const set = (id, v) => document.getElementById(id).textContent = v;
  if (raw === "") { ids.forEach(id => set(id, "—")); return; }
  if (!/^\d{1,25}$/.test(raw)) { ids.forEach(id => set(id, "invalid id")); return; }
  const sf = BigInt(raw);
  const ms = (sf >> 22n) + DISCORD_EPOCH;
  const d = new Date(Number(ms));
  set("sfDate", `${DAYS[d.getDay()]}, ${fmtLongDate(d)} ${fmtTimeSec(d)}`);
  set("sfRel", relativeTime(d));
  set("sfUnixMs", ms.toString());
  set("sfTag", `<t:${Math.floor(Number(ms) / 1000)}:F>`);
  set("sfWorker", ((sf >> 17n) & 0x1fn).toString());
  set("sfProcess", ((sf >> 12n) & 0x1fn).toString());
  set("sfIncrement", (sf & 0xfffn).toString());
}

function setupSnowflake() {
  const input = document.getElementById("sfInput");
  input.addEventListener("input", decodeSnowflake);
  input.value = "175928847299117063";
  decodeSnowflake();
}

const PERMISSIONS = [
  ["Create Invite", 0], ["Kick Members", 1], ["Ban Members", 2], ["Administrator", 3],
  ["Manage Channels", 4], ["Manage Server", 5], ["Add Reactions", 6], ["View Audit Log", 7],
  ["Priority Speaker", 8], ["Video / Go Live", 9], ["View Channels", 10], ["Send Messages", 11],
  ["Send TTS Messages", 12], ["Manage Messages", 13], ["Embed Links", 14], ["Attach Files", 15],
  ["Read Message History", 16], ["Mention @everyone", 17], ["Use External Emoji", 18],
  ["View Server Insights", 19], ["Connect", 20], ["Speak", 21], ["Mute Members", 22],
  ["Deafen Members", 23], ["Move Members", 24], ["Use Voice Activity", 25], ["Change Nickname", 26],
  ["Manage Nicknames", 27], ["Manage Roles", 28], ["Manage Webhooks", 29],
  ["Manage Emojis & Stickers", 30], ["Use Application Commands", 31], ["Request to Speak", 32],
  ["Manage Events", 33], ["Manage Threads", 34], ["Create Public Threads", 35],
  ["Create Private Threads", 36], ["Use External Stickers", 37], ["Send Messages in Threads", 38],
  ["Use Embedded Activities", 39], ["Timeout Members", 40], ["Send Voice Messages", 46],
];

function updatePerms() {
  let val = 0n;
  document.querySelectorAll("#permGrid input:checked").forEach(i => { val |= (1n << BigInt(i.dataset.bit)); });
  document.getElementById("permValue").textContent = val.toString();
  const cid = document.getElementById("permClientId").value.trim() || "YOUR_CLIENT_ID";
  document.getElementById("permInvite").value =
    `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(cid)}&scope=bot+applications.commands&permissions=${val.toString()}`;
}

function setupPermissions() {
  const grid = document.getElementById("permGrid");
  PERMISSIONS.forEach(([name, bit]) => {
    const lab = document.createElement("label");
    lab.className = "perm-item";
    lab.innerHTML = `<input type="checkbox" data-bit="${bit}" /><span>${name}</span>`;
    const cb = lab.querySelector("input");
    cb.addEventListener("change", () => { lab.classList.toggle("on", cb.checked); updatePerms(); });
    grid.appendChild(lab);
  });
  document.getElementById("permClientId").addEventListener("input", updatePerms);
  document.getElementById("permCopy").addEventListener("click", () => copyText(document.getElementById("permValue").textContent));
  document.getElementById("permInviteCopy").addEventListener("click", () => copyText(document.getElementById("permInvite").value));
  document.getElementById("permClear").addEventListener("click", () => {
    grid.querySelectorAll("input").forEach(i => { i.checked = false; i.closest(".perm-item").classList.remove("on"); });
    updatePerms();
  });
  updatePerms();
}

const COLOR_PRESETS = [
  ["Blurple", "#5865F2"], ["Green", "#57F287"], ["Yellow", "#FEE75C"], ["Fuchsia", "#EB459E"],
  ["Red", "#ED4245"], ["White", "#FFFFFF"], ["Black", "#000000"], ["Greyple", "#99AAB5"],
  ["Dark", "#2C2F33"], ["Aqua", "#1ABC9C"], ["Blue", "#3498DB"], ["Purple", "#9B59B6"],
  ["Orange", "#E67E22"], ["Gold", "#F1C40F"],
];

function clampByte(n) { return Math.max(0, Math.min(255, n | 0)); }

function applyColor(value, from) {
  let r, g, b;
  if (from === "hex") {
    let h = (value || "").trim().replace(/^#/, "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) { document.getElementById("colHex").value = value; return; }
    r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16);
  } else if (from === "dec") {
    let n = parseInt(value, 10); if (isNaN(n)) return;
    n = Math.max(0, Math.min(16777215, n));
    r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
  } else {
    r = clampByte(+document.getElementById("colR").value);
    g = clampByte(+document.getElementById("colG").value);
    b = clampByte(+document.getElementById("colB").value);
  }
  const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  const dec = (r << 16) + (g << 8) + b;
  document.getElementById("colInput").value = hex.toLowerCase();
  document.getElementById("colHex").value = hex;
  document.getElementById("colDec").value = dec;
  document.getElementById("colR").value = r;
  document.getElementById("colG").value = g;
  document.getElementById("colB").value = b;
  document.getElementById("colSwatch").style.background = hex;
}

function setupColors() {
  const presets = document.getElementById("colPresets");
  COLOR_PRESETS.forEach(([name, hex]) => {
    const b = document.createElement("button");
    b.className = "color-preset";
    b.innerHTML = `<span class="pswatch" style="background:${hex}"></span>${name}`;
    b.addEventListener("click", () => applyColor(hex, "hex"));
    presets.appendChild(b);
  });
  document.getElementById("colInput").addEventListener("input", e => applyColor(e.target.value, "hex"));
  document.getElementById("colHex").addEventListener("input", e => applyColor(e.target.value, "hex"));
  document.getElementById("colDec").addEventListener("input", e => applyColor(e.target.value, "dec"));
  ["colR", "colG", "colB"].forEach(id => document.getElementById(id).addEventListener("input", () => applyColor(null, "rgb")));
  applyColor("#5865F2", "hex");
}

const EMOJIS = [
  ["😀", "grinning smile happy"], ["😃", "smile happy"], ["😄", "laugh happy"], ["😁", "grin"],
  ["😆", "laughing lol"], ["😅", "sweat nervous laugh"], ["🤣", "rofl rolling laughing"], ["😂", "joy tears laughing"],
  ["🙂", "slight smile"], ["🙃", "upside down silly"], ["😉", "wink"], ["😊", "blush happy"],
  ["😇", "innocent angel halo"], ["🥰", "love hearts"], ["😍", "heart eyes love"], ["🤩", "star struck wow"],
  ["😘", "kiss blow"], ["😋", "yum tasty"], ["😛", "tongue"], ["😜", "wink tongue"],
  ["🤪", "zany crazy"], ["🤨", "raised eyebrow suspicious"], ["🧐", "monocle thinking"], ["🤓", "nerd glasses"],
  ["😎", "cool sunglasses"], ["🥳", "party celebrate"], ["😏", "smirk"], ["😒", "unamused meh"],
  ["😞", "disappointed sad"], ["😔", "pensive sad"], ["😟", "worried"], ["😢", "cry sad tear"],
  ["😭", "sob crying"], ["😤", "triumph steam angry"], ["😠", "angry mad"], ["😡", "rage furious"],
  ["🤬", "cursing swearing"], ["🤯", "mind blown"], ["😳", "flushed shocked"], ["🥵", "hot heat"],
  ["🥶", "cold freezing"], ["😱", "scream shocked"], ["😨", "fearful scared"], ["😰", "anxious sweat"],
  ["😴", "sleeping zzz"], ["🤤", "drool"], ["😪", "sleepy"], ["😵", "dizzy"],
  ["🤐", "zipper mouth quiet"], ["🥴", "woozy drunk"], ["🤢", "nauseated sick"], ["🤮", "vomit sick"],
  ["🤧", "sneeze sick"], ["😷", "mask sick"], ["🤒", "thermometer sick"], ["🤕", "bandage hurt"],
  ["🤑", "money mouth rich"], ["🤠", "cowboy"], ["😈", "devil smiling imp"], ["👿", "imp angry devil"],
  ["💀", "skull dead"], ["☠️", "skull crossbones"], ["👻", "ghost boo"], ["👽", "alien"],
  ["🤖", "robot bot"], ["💩", "poop"], ["🤡", "clown"], ["👹", "ogre monster"],
  ["👍", "thumbs up like yes"], ["👎", "thumbs down dislike no"], ["👌", "ok perfect"], ["✌️", "peace victory"],
  ["🤞", "fingers crossed luck"], ["🤟", "love you hand"], ["🤘", "rock horns"], ["🤙", "call me shaka"],
  ["👈", "point left"], ["👉", "point right"], ["👆", "point up"], ["👇", "point down"],
  ["☝️", "point up index"], ["✋", "raised hand stop"], ["🤚", "back hand"], ["🖐️", "hand fingers"],
  ["🖖", "vulcan spock"], ["👋", "wave hello hi bye"], ["🤝", "handshake deal"], ["👏", "clap applause"],
  ["🙌", "raised hands praise"], ["🙏", "pray thanks please"], ["✊", "fist"], ["👊", "punch fist bump"],
  ["💪", "muscle strong flex"], ["🦾", "robot arm"], ["✍️", "writing"], ["🤳", "selfie"],
  ["❤️", "red heart love"], ["🧡", "orange heart"], ["💛", "yellow heart"], ["💚", "green heart"],
  ["💙", "blue heart"], ["💜", "purple heart"], ["🖤", "black heart"], ["🤍", "white heart"],
  ["🤎", "brown heart"], ["💔", "broken heart"], ["❣️", "heart exclamation"], ["💕", "two hearts"],
  ["💖", "sparkling heart"], ["💗", "growing heart"], ["💘", "heart arrow cupid"], ["💝", "heart gift"],
  ["💯", "hundred 100 perfect"], ["🔥", "fire lit hot"], ["✨", "sparkles shine"], ["⭐", "star"],
  ["🌟", "glowing star"], ["💫", "dizzy star"], ["⚡", "lightning bolt zap"], ["💥", "boom explosion"],
  ["💢", "anger symbol"], ["💦", "sweat droplets water"], ["💨", "dash wind fast"], ["🎉", "tada party celebrate"],
  ["🎊", "confetti party"], ["🎈", "balloon"], ["🎁", "gift present"], ["🏆", "trophy win"],
  ["🥇", "first place gold medal"], ["🎯", "target bullseye dart"], ["🎮", "game controller"], ["🕹️", "joystick game"],
  ["✅", "check mark yes done"], ["☑️", "checkbox checked"], ["✔️", "check"], ["❌", "cross no wrong"],
  ["❎", "cross mark"], ["➕", "plus add"], ["➖", "minus"], ["❓", "question"],
  ["❗", "exclamation"], ["⚠️", "warning caution"], ["🚫", "no prohibited"], ["💤", "zzz sleep"],
  ["👀", "eyes looking"], ["🗣️", "speaking head"], ["💬", "speech bubble chat"], ["💭", "thought bubble"],
  ["🤔", "thinking hmm"], ["🫡", "salute"], ["🫠", "melting"], ["🫶", "heart hands love"],
];

let emojiOpen = false;

function renderEmojiGrid(filter) {
  const grid = document.getElementById("emojiGrid");
  const q = (filter || "").trim().toLowerCase();
  const list = q ? EMOJIS.filter(([, n]) => n.includes(q)) : EMOJIS;
  grid.innerHTML = list.map(([e, n]) =>
    `<button class="emoji-cell" title="${n.split(" ")[0]}" data-emoji="${e}">${e}</button>`
  ).join("") || `<div class="emoji-none">No emoji found</div>`;
  grid.querySelectorAll(".emoji-cell").forEach(btn =>
    btn.addEventListener("click", () => insertEmoji(btn.dataset.emoji))
  );
}

function insertEmoji(emoji) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const val = editor.value;
  editor.value = val.slice(0, start) + emoji + val.slice(end);
  const pos = start + emoji.length;
  editor.focus();
  setSel(pos, pos);
  render();
}

function toggleEmoji(force) {
  const popup = document.getElementById("emojiPopup");
  emojiOpen = force === undefined ? !emojiOpen : force;
  popup.hidden = !emojiOpen;
  if (emojiOpen) {
    const search = document.getElementById("emojiSearch");
    search.value = "";
    renderEmojiGrid("");
    search.focus();
  }
}

function setupEmoji() {
  renderEmojiGrid("");
  document.getElementById("emojiBtn").addEventListener("click", e => { e.stopPropagation(); toggleEmoji(); });
  document.getElementById("emojiSearch").addEventListener("input", e => renderEmojiGrid(e.target.value));
  document.getElementById("emojiPopup").addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => { if (emojiOpen) toggleEmoji(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && emojiOpen) toggleEmoji(false); });
}

function setWebhookStatus(msg, kind) {
  const el = document.getElementById("whStatus");
  el.textContent = msg;
  el.className = "webhook-status" + (kind ? " " + kind : "");
}

async function sendWebhook() {
  const url = document.getElementById("whUrl").value.trim();
  const content = document.getElementById("whContent").value;
  const name = document.getElementById("whName").value.trim();
  const avatar = document.getElementById("whAvatar").value.trim();
  const btn = document.getElementById("whSend");

  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url)) {
    setWebhookStatus("Enter a valid Discord webhook URL.", "err");
    return;
  }

  const embed = buildEmbedObject();
  const payload = {};
  if (content.trim()) payload.content = content;
  if (name) payload.username = name;
  if (avatar) payload.avatar_url = avatar;
  if (!isEmptyEmbed(embed)) payload.embeds = [embed];

  if (!payload.content && !payload.embeds) {
    setWebhookStatus("Add some content or embed fields first.", "err");
    return;
  }

  btn.disabled = true;
  setWebhookStatus("Sending…", "");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setWebhookStatus("Sent to Discord ✓", "ok");
      showToast("Message sent");
    } else {
      let detail = res.status;
      try { const j = await res.json(); if (j.message) detail = j.message; } catch (e) {}
      setWebhookStatus("Discord error: " + detail, "err");
    }
  } catch (err) {
    setWebhookStatus("Network error — check the URL.", "err");
  } finally {
    btn.disabled = false;
  }
}

function setLoadStatus(msg, kind) {
  const el = document.getElementById("whLoadStatus");
  el.textContent = msg;
  el.className = "webhook-status" + (kind ? " " + kind : "");
}

async function loadWebhookMessage() {
  const url = document.getElementById("whUrl").value.trim();
  const link = document.getElementById("whMsgLink").value.trim();
  const hint = document.getElementById("whHint");
  const btn = document.getElementById("whLoad");
  const urlValid = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
  const m = link.match(/channels\/\d+\/\d+\/(\d+)/);
  const msgId = m ? m[1] : (/^\d{5,}$/.test(link) ? link : null);

  document.getElementById("whUrl").classList.toggle("needs-fill", !urlValid);
  document.getElementById("whMsgLink").classList.toggle("needs-fill", !msgId);
  if (!urlValid || !msgId) { hint.hidden = false; setLoadStatus("", ""); return; }
  hint.hidden = true;

  btn.disabled = true;
  setLoadStatus("Loading…", "");
  try {
    const res = await fetch(`${url}/messages/${msgId}`);
    if (!res.ok) {
      let detail = res.status;
      try { const j = await res.json(); if (j.message) detail = j.message; } catch (e) {}
      setLoadStatus("Couldn't load: " + detail, "err");
      return;
    }
    const msg = await res.json();
    const hasEmbed = msg.embeds && msg.embeds.length;
    if (hasEmbed) populateEmbedForm(msg.embeds[0]);
    if (typeof msg.content === "string") document.getElementById("whContent").value = msg.content;
    setLoadStatus(hasEmbed ? "Embed loaded ✓" : "Loaded — message has no embed", "ok");
    if (hasEmbed) showToast("Embed loaded");
  } catch (err) {
    setLoadStatus("Network error — check the URL.", "err");
  } finally {
    btn.disabled = false;
  }
}

function setupWebhook() {
  document.getElementById("whSend").addEventListener("click", sendWebhook);
  document.getElementById("whLoad").addEventListener("click", loadWebhookMessage);
  ["whUrl", "whMsgLink"].forEach(id => document.getElementById(id).addEventListener("input", () => {
    document.getElementById(id).classList.remove("needs-fill");
    if (document.getElementById("whUrl").value.trim() && document.getElementById("whMsgLink").value.trim()) {
      document.getElementById("whHint").hidden = true;
    }
  }));
}

buildToolbar();
buildQuickList();
setupTabs();
setupNav();
setupToolbarScroll();
setupTimestamps();
buildCheatsheet();
setupEmbed();
setupEmoji();
setupWebhook();
setupSnowflake();
setupPermissions();
setupColors();
loadState();
if (!editor.value) editor.value = DEFAULT_TEXT;
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
