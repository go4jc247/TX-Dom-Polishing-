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
- **Current version:** v14.7.5 (MP_VERSION in multiplayer.js, CACHE_NAME in sw.js, aboutVersion, GAME_VERSION in game.js)
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

- **PREVIEWS ALWAYS STAY IN VIEW (owner's standing rule).** Any picker, editor or settings window
  that has a preview (dominoes, layout, colours, sliders) keeps the preview FIXED at the top (or the
  side when sideways); only the controls under it scroll. The owner must always see the effect of
  what they are changing. Never put the preview inside the scrolling area.

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
   STATUS (v14.7.5): stages 1, 2 (TN51), 3 (T42 only), 4 and 5 DONE, plus landscape (v14.3.0):
   no top bar, right side panel (scores restyled from #topbar + trick history one trick per row via
   thTranspose; v14.3.1: the upright grid turned 90 degrees, tiles stand upright rotZ 0), small
   Menu top-left. TN51 table is always a true hexagon built out from the centre (never stretched).
   Remaining: Moon still uses its hand-tuned MOON_SETTINGS layout (letterboxed).
   v14.3.8: _cameraSide() (window.orientation 90 = camera left, -90 = right) zeroes the
   non-camera safe inset; --insL/--insR CSS vars + body.camLeft/camRight. Camera-left strip holds
   compact Menu + trump marker (top) and #landscapeClock (bottom). Test hooks: window._fakeInsets,
   window._fakeCamSide. Trick history: Team 2's first trick snaps to the bottom (S.thTeamGap).
   (v14.7.0 fixed the old 'T42 landscape centre crowded' issue - see below.)
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
       CONFIRMED on the phone: inner now 844, home and game reach the bottom.
     - v14.5.2: in-game top content moved up under the clock after 14.5.1 (cause unknown);
       readout showed all correct on relaunch (insT 63, scroll 0, table 0..844) - a launch glitch.
     - v14.5.3: test markers/readout removed. _recheckInsets() re-reads the safe area at 400/1200/3000ms,
       on pageshow and when the app returns to the front, and re-lays out if the top inset changed.
     - cover-test.html is still in the repo (owner's test page) - delete only when the owner says so.
   v14.5.4/5: tally marks drawn at device pixel ratio, ORIGINAL 2px strokes/colours (owner: not thicker),
     filling the full height of the Marks box; Team 1 left-aligned / Team 2 right-aligned
     (drawTallyMarks(canvas,count,color,align)); TN51 upright
     trump marker fixed in the table's top-left corner under the score bar (owner's pick).
   v14.5.6: owner prefers the ORIGINAL muted look - bright colours are harder to read for him. Tags
     use v13's muted team colours (#2b749d blue, #9e5e42 brick, measured from v13), score/marks boxes
     rgba(0,0,0,0.45). Don't brighten UI colours without asking.
   v14.6.0: DEVELOPER MODE REMOVED (owner approved "remove it ... all traces"): Dev Mode switch, dev tab
     bar, TN51/T42/Moon layout-slider windows, Boneyard/Pip Details/Pip Colors/Z-Index/Shuffle/Export
     All/Domino Style panels, device presets (built-in + saved), custom-hand tester (+ its Replay
     link), ghost preview dominoes. Saved values those panels wrote still LOAD at startup
     (orientation.js keeps the loaders), so layouts/shuffle/pip details are unchanged. dev-tools.js
     now only holds the Game Log / Advanced AI Log (kept; not dev-mode features).
     NEW assets/js/domino-picker.js: "Dominoes" button on the home screen above New Game opens a
     picker: 6 presets (Classic, Tournament, Midnight, Vintage, Casino, Neon) + Custom (face: Ivory,
     White, Cream, Wood, Navy, Black; dots: one colour or a colour per number 1-7; Surprise me).
     Saved as localStorage 'tn51_domino_look'; old 'tn51_pip_colors' migrates to Custom. Writes
     DOMINO_STYLE (FACE/BACK/EDGE/PIP_COLORS + new FACE_GRAIN, PIP_GLOW read by drawFace).
     window.openDominoPicker() - the owner will decide later where else it lives (settings menu).
   v14.6.1: picker preview (.dpStage) fixed above the scrolling .dpBody (left column sideways).
     Owner: textures (e.g. wood) could look more natural later - fine for now.
   v14.6.2: Custom dots have 3 modes (custom.mode): 'one' = All the same, 'each' = Mix & match
     (colours may repeat), 'unique' = All different (no two numbers share a colour; picking a colour
     another number owns swaps them; swatches show the owning number; makeUnique() on switching).
   v14.6.3: owner's ChatGPT textures in assets/images/textures/{ivory,white,cream,wood,navy,black}.jpg
     (512px, 120 KB total, in sw.js cache). DOMINO_STYLE.FACE_TEXTURE (an Image) is drawn on the face
     by drawFace with a per-tile crop offset (tile values seed it) + soft top/bottom shading; FACE_GRAIN
     is only a fallback before the wood image loads. FACES face colours = texture averages. Classic
     uses ivory, which is now yellower than the old #f5ecdd - asked owner if that's OK.
   v14.6.4: look.pattern = 'same' | 'flip' (some tiles 180) | 'random' (default; any angle, seeded per
     tile) -> DOMINO_STYLE.TEX_DIR; drawFace rotates the texture and draws a diagonal-sized crop so it
     always covers the tile. Wood (lengthwise:true) never turns sideways: random -> flip. "Pattern
     direction" row sits under the style cards (applies to presets and Custom). New tile faces from
     the owner: Marble (black, white veins) and Flowers (cream with pressed flowers).
   v14.6.5: "Original" preset (first card, default when nothing saved) = the pre-picker look: ORIGINAL is
     a snapshot of DOMINO_STYLE (built-in + old 'tn51_domino_style' saved colours) + old 'tn51_pip_colors',
     taken before the picker applies anything and stored once in 'tn51_domino_original'. Flat face, no
     texture/glow. Not offered as a Custom tile colour (FACES.original.original = true).
   v14.7.0: TEXAS 42 LAYOUT REBUILT on the TN51 approach (computeT42AutoLayout + _t42Cluster/_t42BestPlay).
     Upright: body.stackTop like TN51 (menu top-right, 4-row trick history, score bar, trump in the
     table's top-left corner via _trumpSpot - applyT42Settings now calls _applyTrumpSpot). Sideways:
     right panel, table up to the BONES tab (22px), P3 row fully on screen (no CUT, no reveal shift
     needed). Tags hug their own row/column; P2/P4 tags drop below/above the play when level doesn't fit;
     played tiles packed round LEAD; sizes = biggest with no box touching (8px gaps). Opponent cap grows
     with screen size (tablets). Sideways the hand keeps >= 0.19H and slides right of centre to clear
     the bottom-left status line; 568x320 falls back (tiny overlap). _openCenterRect handles T42 so
     round-end/lay-down boxes sit in the open middle sideways. Tested 375x667, 390x844, 430x932,
     820x1180 and their sideways sizes + 568x320. TN51 untouched; the two modes still share helpers.
   v14.7.1: "Original" was wrong on the owner's phone - it copied colours/dot effects he had saved in the
     old developer panels. Owner wants the TRUE built-in default. game.js now keeps
     window._DOMINO_STYLE_DEFAULT (deep copy right after DOMINO_STYLE, before any saved setting).
     Original restores every DOMINO_STYLE key from it except the Game Settings switches
     (FANCY_LINE_ENABLED, PIPFX_ENABLED); other styles restore from BASE (as loaded at startup, incl.
     saved tweaks). withLook() snapshots/restores all keys. Old 'tn51_domino_original' key is deleted.
     Verified pixel-identical to v14.5.6 defaults even with old tweaks saved.
   v14.7.2: OWNER: T42 upright was already right in v13 - "use the OG for comparison (only dominoes and
     markers)". Upright T42 is now the v13 CROSS: play line half-way between P3's row and your hand;
     P2/P4 columns centred on it at the screen edges; P2/P4 tags + play spots ON the line (tag centred
     between column and play spot); P3 play above LEAD, yours below; P3/You tags half-way between play
     spot and their dominoes; played tiles SAME size as opponents' (size = largest where the row across
     column|tag|play|LEAD|play|tag|column fits). New top (history/scores) and trump corner kept.
     Lesson: when the owner says an older version was right, measure it and match it - don't redesign.
     Sideways T42 still uses the v14.7.0 engine.
   v14.7.3: upright trick history (TN51 + T42): tiles fill the box width and touch (pitch = tile size,
     no 1.06/1.3 spacing); box height = rows x tile height. BONES drawer (upright) was broken: the
     --th-* CSS vars were only set on #trickHistoryBg, so #boneyard2Container used 5%/16%/90%
     defaults, and renderBoneyard2 used hard-coded v13 fractions. _setTrickBoxPortrait now sets the
     vars on the drawer too; the grid fills the drawer width ((max_pip+1) columns, touching, 1px edge)
     and grows downward on a solid backing (z-index 150, above the score bar).
   v14.7.4: owner: "get rid of that ticker" - #statusBar is display:none everywhere (CSS). setStatus()
     still runs (it drives the turn-tag glow via _updateTurnTag). T42 sideways no longer nudges the
     hand for it (statusRight = 0 when hidden). The centre pop-ups carry the important messages.
   v14.7.5: separate MARKS pill REMOVED (owner asked: score + marks in each team's own box). index.html:
     #tallyCanvas1/2 now sit in .pillMarks inside #team1Pill/#team2Pill; #topRow is a 2-column grid.
     Upright: name+score left, marks beside them; sideways: name+score on top, marks underneath (taller).
     Both teams' marks draw from the left. updateScoreDisplay's 'marksPill' lookups are null-safe.
   NEXT (owner's ideas, NOT started - he said "not right now"):
     - menu (hamburger) to the TOP LEFT (owner is left-handed); a BONES button in the top-right slot
       instead of the thin side tab on the history box
     - visual cues instead of text: e.g. your playable dominoes bounce/light up when it's your turn
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
