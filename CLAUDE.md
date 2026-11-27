# CLAUDE.md — Project Rules for TX-Dom-Dev
# Texas 42 Dominoes — Claude Code Dev Build
# Owner: go4jc247 | Repo: https://github.com/go4jc247/TX-Dom-Dev

---

## ⚠️ THESE RULES ARE MANDATORY. NO EXCEPTIONS. EVER. ⚠️

This file is automatically loaded by Claude Code at the start of every session.
These are not suggestions. They are hard rules for this project.

---

## SCOPE — Where Claude Is Allowed to Work

- ✅ Working directory: `/Users/jp/TX-Dom-Dev/` ONLY
- ✅ GitHub: `go4jc247/TX-Dom-Dev` repository ONLY
- ❌ NEVER access, read, modify, or touch any files outside of `/Users/jp/TX-Dom-Dev/`
- ❌ NEVER touch any other GitHub repository, organization, settings, tokens, or account data outside of TX-Dom-Dev
- ❌ NEVER access iCloud files directly — originals in iCloud are reference only, never modify them

---

## RULES

### Rule 1 — Never Delete Files Without Confirmation
- NEVER delete any file without explicitly asking the user first and receiving a clear "yes delete it" response
- This includes temporary files, old versions, and anything that looks unused

### Rule 2 — Always Increment the Version Number
- EVERY delivered file must have an incremented version number — no exceptions
- Minor fix/tweak → bump patch: v13.0.1, v13.0.2, etc.
- Significant change → bump minor: v13.1.0, v13.2.0, etc.
- Major upgrade → bump major: v14.0.0, v15.0.0, etc.
- Update ALL THREE locations every version change:
  1. `MP_VERSION` constant in index.html
  2. `CACHE_NAME` in sw.js
  3. The `id="aboutVersion"` default text in index.html (backup, since it's dynamic)

### Rule 3 — Never Overwrite Original iCloud Files
- Our ONLY working directory is `/Users/jp/TX-Dom-Dev/`
- The iCloud folder `/Users/jp/Library/Mobile Documents/com~apple~CloudDocs/Texas dominoes /` is READ-ONLY reference
- NEVER write, move, rename, or delete anything in iCloud

### Rule 4 — No Major Feature Removal Without Explicit Approval
- NEVER remove a feature, function, or significant block of code without the user saying clearly "yes delete it" or "remove it"
- Dead code cleanup requires item-by-item confirmation unless user gives blanket approval for a specific list

### Rule 5 — Always Commit to Main Before gh-pages
- Workflow is always: make changes → commit to `main` → then merge to `gh-pages`
- NEVER commit directly to `gh-pages`
- NEVER skip `main`

### Rule 6 — Warn Before Anything That Could Break the Game
- If a change has any risk of breaking gameplay, UI, multiplayer, or audio — STOP and warn the user before proceeding
- Describe the risk clearly and wait for confirmation

### Rule 7 — Never Touch Anything Outside the TX-Dom-Dev Repository
- GitHub access is limited to: `go4jc247/TX-Dom-Dev` only
- NEVER access other repos, GitHub settings, billing, tokens, SSH keys, or any other account data
- NEVER create new repositories without explicit instruction

### Rule 8 — Never Access Files Outside the Project Directory
- File system access is limited to `/Users/jp/TX-Dom-Dev/` only
- Do not read, list, or interact with any other directory on the machine
- If a file is needed from elsewhere, ask the user to provide it

### Rule 9 — Never Restructure the Project Without Approval
- NEVER move, rename, or reorganize files or folders without asking first
- File renames or folder structure changes can break GitHub Pages paths and service worker caching

### Rule 10 — Always Summarize Changes at Delivery
- At the end of every version delivery, provide a brief changelog:
  - What version was delivered
  - What changed (bullet points)
  - What was NOT changed (so user knows scope)

---

## PROJECT CONTEXT

- **Game:** Texas 42 / TN51 Dominoes — HTML5 web game (multi-file, modular)
- **Base file:** Started from `Texas Dominoes V12.10.27c 2.html` (clean, no Easter egg)
- **Current version:** v14.5.1 (MP_VERSION in multiplayer.js, CACHE_NAME in sw.js, aboutVersion, GAME_VERSION in game.js)
- **Repo / live URL now:** go4jc247/TX-Dom-Polishing- → https://go4jc247.github.io/TX-Dom-Polishing/ (Pages from main)
- **Live URL:** https://go4jc247.github.io/TX-Dom-Dev/
- **PWA:** Installable as standalone app (manifest.webmanifest - a real file since v14.4.8 - + sw.js)
- **Dev branch:** main
- **Live branch:** gh-pages (merge from main, never commit directly)
- **Relay server:** wss://tn51-tx42-relay.onrender.com
- **User uses voice-to-text** — expect typos, decipher intent, ask if unclear
- **Version display** is dynamic — `MP_VERSION` drives About panel AND splash screen automatically

---

## VERSIONING LOCATIONS (update all 3 every release)
1. `const MP_VERSION = 'vX.X.X';` — in `assets/js/multiplayer.js` (line ~13)
2. `const CACHE_NAME = 'tx-dom-vX.X.X';` — in `sw.js` (line 7)
3. `<div ... id="aboutVersion">vX.X.X</div>` — in `index.html` (~line 1981)

---

## MODEL PREFERENCE

- **Default model: Sonnet** — use for all standard tasks
- **Recommend switching to Opus** when the task involves:
  - Complex multiplayer sync logic or race condition debugging
  - Fixing or building out the Monte Carlo simulation
  - Major architectural decisions (restructuring JS, separating files)
  - Subtle game logic bugs that require deep reasoning
  - Any task where Sonnet has already tried and failed
- When recommending Opus, say clearly: **"⚠️ This task may need Opus — consider switching with /model"**

---

## WORKFLOW PREFERENCE

- **Bug fixes: Just do it.** Don't ask permission for fixes — fix it, commit, and report what changed. If it breaks, we roll back.
- **Always commit before and after changes** so every version is recoverable via git history.
- **Keep the user focused.** User has ADHD — reel them back to the current task when they drift. State clearly what the next step is.
- **Answer questions, then act.** If the user asks a question, answer it first. If they give an action, do the action. Don't conflate the two.

---

## TOKEN-EFFICIENCY RULES

### Every session:
1. **Read CLAUDE.md first** — don't re-discover what's already documented
2. **Search, don't load** — use Grep/Glob to find specific lines; only Read the ranges you need. Never read a 12,000-line file to find one function.
3. **Delegate exploration to subagents** — use Explore agents for broad searches, keep the main context lean
4. **Plan before executing** — use plan mode for multi-step work so there are fewer fix-it cycles
5. **Small commits, small tasks** — one focused chunk per conversation when possible
6. **Update CLAUDE.md at session end** — if project state changed (version, file structure, new conventions), update this file so the next session starts clean

### Optional (suggest when relevant):
- If a task only touches one file, mention that Sonnet can handle it to save tokens
- If exploring an unfamiliar area, suggest launching an Explore agent instead of reading everything inline

---

## FILE ARCHITECTURE (after module split)

### Script loading order in index.html:
```
<script src="./assets/js/sfx.js" defer></script>         ← SFX needed at init
<script src="./assets/js/game.js" defer></script>         ← core game engine
<script src="./assets/js/multiplayer.js" defer></script>  ← MP protocol/WebSocket
<script src="./assets/js/ai-engine.js" defer></script>    ← AI bidding + play
<script src="./assets/js/mp-social.js" defer></script>    ← chat, rematch, no-table-talk
<script src="./assets/js/orientation.js" defer></script>  ← orientation IIFE, style panels
<script src="./assets/js/popup-config.js" defer></script> ← popup position config IIFE
```

### Loaded at startup since v14.0.2 (they were "lazy" but nothing ever loaded them):
- `replay.js`, `dev-tools.js`, `monte-carlo.js` (defer tags after popup-config.js)

### Still lazy-loaded (on demand via `_lazyLoad()`):
- `observer.js` — observer/spectator mode

### File sizes (as of v13.5.1):
| File | Lines | Description |
|------|-------|-------------|
| game.js | ~12,287 | Core engine, UI, scoring, game flow, settings handlers |
| multiplayer.js | ~5,064 | WebSocket, MP protocol, room mgmt, bidding sync, reconnection |
| orientation.js | ~2,407 | Orientation IIFE, domino style panel, shuffle settings, presets |
| dev-tools.js | ~2,085 | Dev mode features (lazy-loaded) |
| ai-engine.js | ~1,623 | AI bidding evaluation + tile play logic |
| observer.js | ~724 | Observer/spectator mode (lazy-loaded) |
| monte-carlo.js | ~648 | Monte Carlo simulation (lazy-loaded) |
| replay.js | ~586 | Save/load/replay system (lazy-loaded) |
| sfx.js | ~509 | Sound effects (Web Audio API) |
| mp-social.js | ~447 | Chat, rematch voting, no-table-talk |
| popup-config.js | ~320 | Popup positioning config IIFE |
| **Total** | **~26,700** | |

### Cross-file variable rules:
- MP globals (`MULTIPLAYER_MODE`, `mpSeat`, `mpIsHost`, `mpPlayers`, `mpSocket`, etc.) are **declared in game.js** so they exist before multiplayer.js loads
- `_staleRefreshCount` declared in game.js, used by both game.js and multiplayer.js
- `getLocalSeat()` lives in game.js (serves all modes)
- `SFX` object lives in sfx.js, must load before game.js
- Lazy-loaded files override stub functions defined in game.js when they load

### Lazy Load Pattern:
```javascript
function _lazyLoad(src, cb) {
  if (document.querySelector('script[src="' + src + '"]')) { if(cb) cb(); return; }
  var s = document.createElement('script');
  s.src = src; s.onload = cb;
  document.head.appendChild(s);
}
```

---

## BACKLOG (future tasks, not urgent)

### TO-DO LIST (TX-Dom-Polishing-, agreed Nov 26, 2026)
1. Nello: rule options for how Nello is played; fix dominoes that stay invisible after a re-shuffle
2. Moon: check it works as 1 vs 1 vs 1
3. TN51: check it works as 3 vs 3 (2 teams of 3)
4. Monte Carlo upgrade, renamed to "Hand Analyzer" (agreed name; optional small subtitle
   "runs thousands of simulated hands"): allow running it right after the deal, at any stage.
   - Before bidding/trump: let the player propose a bid and a trump, then simulate
   - If the proposed bid is below the current minimum/high bid, warn "not a winning bid"
     but still let the simulation run
   - Today it only runs when you won the bid and are leading trick 1
   - Keep it an advanced option, not for everyday play
4b. Layout rebuild (proposed Nov 26, 2026). Measure the screen and calculate positions instead of
   reading hand-placed coordinate tables. Keep animateSprite: the engine only supplies target poses,
   so each domino stays one continuous sprite (hand -> played -> trick history).
   STATUS (v14.5.1): stages 1, 2 (TN51), 3 (T42 only), 4 and 5 DONE, plus landscape (v14.3.0):
   no top bar, right side panel (scores restyled from #topbar + trick history one trick per row via
   thTranspose; v14.3.1: the upright grid turned 90 degrees, tiles stand upright rotZ 0), small
   Menu top-left. TN51 table is always a true hexagon built out from the centre (never stretched).
   Remaining: Moon still uses its hand-tuned MOON_SETTINGS layout (letterboxed).
   v14.3.8: _cameraSide() (window.orientation 90 = camera left, -90 = right) zeroes the
   non-camera safe inset; --insL/--insR CSS vars + body.camLeft/camRight. Camera-left strip holds
   compact Menu + trump marker (top) and #landscapeClock (bottom). Test hooks: window._fakeInsets,
   window._fakeCamSide. Trick history: Team 2's first trick snaps to the bottom (S.thTeamGap).
   Known: T42 landscape centre still crowded (played spots overlap LEAD/tags) - needs the TN51 declutter.
   v14.4.0 (TN51 only unless noted):
   - Portrait: body.stackTop = menu icon top-right (status beside it), trick history+bones at the
     top, score bar below it (--scoreTop), then the table. T42/Moon portrait unchanged.
   - Menu is a 34px three-line icon everywhere (no "Menu" text); top-left on the home screen.
   - Home: html.onHome makes the page navy; #startScreenBackdrop/#gameWrapper use inset/100% not
     100vh (iPhone PWA showed green strips). Sideways home = logo left, buttons right.
   - LEAD square centred with its real size (_centerLeadPip). Trump marker has a TRUMP label and
     is placed by the engine (_trumpSpot) next to the play; falls back to under the menu.
   - Landscape: played tiles cluster around LEAD (opts.leadMid: LEAD halfway between You and P4
     tags); hand grows upward while the cluster still fits at >= 1.15x sOpp.
   - Reveals: _p4RevealShift slides P4's row/tag fully on screen at hand end or P4 lay-down;
     _fitOverlayToOpen puts round-end/game-end/lay-down boxes in the open middle (landscape).
   - Boneyard drawer (landscape) grid turned 90 degrees (one column per suit).
   - Rotation: body.rotating hides the table ~0.4s; _instantLayout makes animateSprite snap.
     Bid labels survive re-layout. Game Settings fits without scrolling (3 columns sideways).
   - Popup audit: tn51/t42 layout-slider windows and boneyard-2 settings still scroll; the slider
     windows are obsolete (engines override them) - removal needs owner approval (Rule 4).
   v14.4.1-14.4.5 (iOS 27 home-screen app findings, proven on the owner's iPhone):
     - viewport-fit=cover upright makes iOS cut the page ~47pt short at the bottom (bar under the
       hand) and blurs content near the top. Test page cover-test.html (v13 + cover only) proved it.
       So index.html sets viewport-fit=cover ONLY when sideways (#metaViewport script in <head>).
     - #statusTint: fixed 8px coloured strip at top:0 (portrait) makes iOS 27 paint the status bar
       solid in that colour with no blur (modernwebweekly "So what's up with the iOS 27 blur").
       Table green in game, #0a3e8a on the home screen. theme-color/status-bar-style do nothing.
     - v14.4.6: --topC = the one top colour (top pixel line, status bar via #statusTint, page bg);
       portrait #tableMain gets a top layer fading from --topC to transparent over 96px.
     - v14.4.7: iOS does not re-read the status colour when only #statusTint's colour changes; on
       home <-> game the strip node is replaced (0/120/400/1000ms) so iOS picks up the new colour.
     - Do NOT push content down or stretch the page (14.4.1 / 14.4.3 attempts, both reverted).
     - v14.4.8: real manifest.webmanifest (orientation "any" - the old inline blob manifest said
       portrait and iOS ignored it). viewport-fit=cover on the home screen + sideways (window._inGame,
       window._applyViewport); home #startScreenBackdrop is 100dvh tall and has no status strip,
       like go4jc247/bible-bridge-2. The owner must delete and re-add the home-screen icon.
     - v14.4.9: NEVER switch viewport-fit while the app runs: doing it entering a game made iOS draw
       the page one status-bar height below where taps land. viewport-fit=cover is now static.
     - v14.5.0: +16px below the clock upright (--sbTop and _getSafeInsets). TEMPORARY home-screen
       edge test (#edgeTestPage yellow = page bottom, #edgeTestDvh red = 100dvh, #edgeTestInfo
       numbers) to diagnose the in-game bottom bar - remove once fixed.
     - v14.5.1 (from the owner's readout: screen 844, inner/dvh 797, lvh 844, safe t47 b34):
       position:fixed is clipped at 797 but normal page content draws to 844 (Bible Bridge scrolls
       in normal flow). html/body/#viewportWrapper/#startScreenBackdrop/#gameSelectScreen are now
       position:absolute + height:100lvh. Green line (#edgeTestLvh) marks the 100lvh bottom.
   Engines: computeTn51AutoLayout() / computeT42AutoLayout() in game.js, run at the top of
   applyTn51Settings / applyT42Settings. body.fluidLayout = full-screen wrapper. The old TN51/T42
   layout sliders are overridden by the engines.
   - Stage 1: quick fixes. Rotation leaves gaps (refreshLayout uses original deal slots, should
     recenter); popups never taller than the screen, scrolling body, buttons pinned at bottom
   - Stage 2: new layout engine, TN51 FIRST (owner's call: hex table, 60-degree seats are the
     hardest and what breaks). No beta switch (owner: nobody else uses it yet); replace the
     old tables directly and rely on git history to roll back
   - Stage 3: T42 and Moon, then landscape
   - Stage 4: slim top bar (Team 1 | marks | Team 2) + Menu button replacing the gear
   - Stage 5: lay-down / show hands using the tiles on the table (lift + glow yours, flip others)
5. On hold: multiplayer and observer testing (brother may take multiplayer later)
6. Later / optional: tutorial redo, physics shuffle as an optional extra, Pure 42 mode,
   3D table as a separate interface


### Audio Quality Upgrade
- Current audio files in `assets/audio/` are heavily compressed (were embedded as base64)
- User has original high-quality source files
- When ready: replace compressed files with originals, no HTML changes needed
- Status: **On hold**

### Further Module Extraction
- game.js is still ~12,287 lines — potential further splits:
  - Scoring/moon-mode logic
  - UI/animation code
  - Pass & Play mode
- Would require careful dependency analysis
- Status: **On hold — evaluate when needed**

---

## PENDING WORK

- **Multiplayer extraction not yet committed** — extracted ~5,070 lines to multiplayer.js, tested clean home screen load, need full gameplay test before commit
- **Full UI regression test needed** — click through all settings, game modes, bidding, gameplay after the module split
