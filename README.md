<div align="center">

# 🛠️ Toolscord

### The all-in-one Discord toolbox — styled like Discord itself.

Format messages, build rich embeds, fire webhooks, decode IDs, calculate permissions, and more — all in one fast, no-login, fully client-side web app.

[![Made with HTML/CSS/JS](https://img.shields.io/badge/Made%20with-HTML%20%C2%B7%20CSS%20%C2%B7%20JS-5865F2?style=for-the-badge)](#)
[![No Build Step](https://img.shields.io/badge/Build%20Step-None-57F287?style=for-the-badge)](#)
[![Deploy](https://img.shields.io/badge/Hosted%20on-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](#)

</div>

---

## ✨ Why Toolscord?

Most Discord tools are scattered across multiple, complicated websites. Toolscord puts them all in one website, and it's wrapped in a UI that looks and feels just like Discord.
Better yet, Toolscord can be used with **No accounts, no tracking, and no backend.** Everything runs inside of your browser.

---

## 🧰 Tool List (as of Jun 20, 2026)

| Channel | What it does |
| --- | --- |
| **`#editor`** | Visual **markdown editor** — click toolbar buttons instead of memorizing `**` `__` `||`. Live Discord-accurate preview, click-to-reveal spoilers, a working emoji picker, and keyboard shortcuts. |
| **`#embed`** | **Rich embed builder** with a live preview *and* copy-paste JSON. Import existing JSON, **send straight to a channel via webhook**, or **load an embed back** from a webhook + message link to edit it. |
| **`#timestamps`** | **Dynamic timestamp generator** (`<t:…>`) — pick a date & time, choose a style, and it renders in every viewer's local timezone. |
| **`#snowflake`** | **ID / snowflake decoder** — paste any Discord ID and get its exact creation date, relative time, and the raw worker/process/increment bits. |
| **`#permissions`** | **Permissions calculator** — tick the permissions you want, get the bitfield integer and a ready-to-use **bot invite link**. |
| **`#colors`** | **Color converter** — hex ↔ RGB ↔ the decimal integer Discord embeds and roles use, plus brand-color presets. |
| **`#cheatsheet`** | Every Discord markdown rule at a glance, with rendered examples. |

---

## 🚀 Highlights

- 🎨 **Pixel-faithful Discord UI** — dark theme, blurple accents, server rail, channels, composer bubble, and member panel.
- ⚡ **100% client-side** — open the HTML and it just works. No npm, no server, no database.
- 👀 **Live previews everywhere** — markdown and embeds render exactly how Discord shows them.
- 😀 **Working emoji picker** — searchable, inserts at your cursor.
- 📨 **Webhook sender & loader** — post embeds to a channel and pull existing ones back in for editing.
- 🔒 **Privacy-first** — your webhook URL never leaves the browser, is never stored, and is never logged.
- 💾 **Auto-save** — your draft message survives refreshes via `localStorage`.

---

## 🏃 Getting Started

Toolscord is just three static files — there's nothing to install.

### Method 1: Run it locally using Python
```bash
# Option 1: literally just open it
open index.html        # macOS
start index.html       # Windows

# Option 2: serve it (optional, for a clean URL)
python -m http.server 5500
# then visit http://localhost:5500
```

### Method 2: Deploy it
Drop the folder onto any static host:

- **Cloudflare Pages** — connect the repo, set the build command to *none* and the output directory to `/`.
- **GitHub Pages** — push and enable Pages on the root.
- **Netlify / Vercel** — drag-and-drop the folder.

---

## 📁 Project Structure

```
toolscord/
├── index.html   # markup for every tool / channel
├── styles.css   # the entire Discord-style theme
└── app.js       # markdown parser, embed builder, webhook, decoders & more
```

---

## 🔐 A Note on Security

Toolscord is built to live in a **public repo**:

- ❌ No API keys, tokens, or webhook URLs are rekeased.
- ✅ The webhook URL is entered at runtime, kept in a password field, and **never persisted**.
- ✅ The only network calls are to Discord (when *you* send/load) and to public CDNs for fonts/icons.

---

## 🧱 Built With

- **Vanilla HTML / CSS / JavaScript** — no frameworks
- [**Font Awesome**](https://fontawesome.com/) — icons (via Cloudflare's cdnjs)
- [**Inter**](https://fonts.google.com/specimen/Inter) — typeface (via Google Fonts)

---

<div align="center">

Made with 💜 by [**github.com/pvrzz**](https://github.com/pvrzz)

*Not affiliated with Discord. "Discord" is a trademark of Discord Inc.*

</div>
