// ============================================================
// TX-Dom-Dev — orientation.js
// Orientation & Persistence IIFE extracted from game.js v13.5.0
// ============================================================

// ============================================================
// SECTION 2: Orientation & Persistence
// ============================================================

(function(){
  // ==================== ORIENTATION-AWARE PERSISTENCE ====================
  function getOrientation(){ return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'; }
  let currentOrientation = getOrientation();

  function storageKey(base){ return base + '_' + currentOrientation; }


  function saveToStorage(key, data){ try{ localStorage.setItem(key, JSON.stringify(data)); }catch(e){} }
  function loadFromStorage(key){ try{ const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; }catch(e){ return null; } }

  // Orientation-aware keys
  function getT42Key(){ return 'tn51_t42_layout_' + currentOrientation; }
  function getTn51Key(){ return 'tn51_tn51_layout_' + currentOrientation; }
  function getBy2Key(){ return 'tn51_boneyard_' + currentOrientation; }

  // Helper to collect current boneyard state
  function collectBy2State(){
    return {
      xOffset: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--th-left')) || 4.5,
      yOffset: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--th-top')) || 14,
      width: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--th-width')) || 90,
      height: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--th-height')) || 22,
      gap: BY2_GAP, playedOpacity: BY2_PLAYED_OPACITY,
      innerSize: BY2_INNER_SIZE, innerRadius: BY2_INNER_RADIUS, innerColor: BY2_INNER_COLOR,
      outerSize: BY2_OUTER_SIZE, outerRadius: BY2_OUTER_RADIUS, outerColor: BY2_OUTER_COLOR
    };
  }

  // Helper to apply boneyard state
  function applyBy2State(data){
    if(!data) return;
    if(data.xOffset !== undefined) document.documentElement.style.setProperty('--th-left', data.xOffset + '%');
    if(data.yOffset !== undefined) document.documentElement.style.setProperty('--th-top', data.yOffset + '%');
    if(data.width !== undefined) document.documentElement.style.setProperty('--th-width', data.width + '%');
    if(data.height !== undefined) document.documentElement.style.setProperty('--th-height', data.height + '%');
    if(data.gap !== undefined) window.BY2_GAP = data.gap;
    if(data.playedOpacity !== undefined) window.BY2_PLAYED_OPACITY = data.playedOpacity;
    if(data.innerSize !== undefined) window.BY2_INNER_SIZE = data.innerSize;
    if(data.innerRadius !== undefined) window.BY2_INNER_RADIUS = data.innerRadius;
    if(data.innerColor !== undefined) window.BY2_INNER_COLOR = data.innerColor;
    if(data.outerSize !== undefined) window.BY2_OUTER_SIZE = data.outerSize;
    if(data.outerRadius !== undefined) window.BY2_OUTER_RADIUS = data.outerRadius;
    if(data.outerColor !== undefined) window.BY2_OUTER_COLOR = data.outerColor;
    if(typeof boneyard2Visible !== 'undefined' && boneyard2Visible) renderBoneyard2();
  }

  // Load persisted settings for current orientation on startup
  // Try orientation-specific key first, fall back to legacy key
  const _savedT42 = loadFromStorage(getT42Key()) || loadFromStorage('tn51_t42_layout');
  if(_savedT42) Object.assign(T42_SETTINGS, _savedT42);
  const _savedTn51 = loadFromStorage(getTn51Key()) || loadFromStorage('tn51_tn51_layout');
  if(_savedTn51) Object.assign(TN51_SETTINGS, _savedTn51);

  // Load dynamic pip settings
  const _savedFancyLine = loadFromStorage('tn51_fancy_line');
  if(_savedFancyLine !== null) {
    DOMINO_STYLE.FANCY_LINE_ENABLED = _savedFancyLine;
    const flChk = document.getElementById('chkFancyLine');
    if(flChk) { flChk.checked = _savedFancyLine; }
    const flKnob = document.getElementById('fancyLineKnob');
    if(flKnob) { flKnob.style.left = _savedFancyLine ? '22px' : '2px'; flKnob.parentElement.querySelector('span').style.background = _savedFancyLine ? '#22c55e' : 'rgba(255,255,255,0.2)'; }
  }
  const _savedPipFx = loadFromStorage('tn51_pip_fx');
  if(_savedPipFx !== null) {
    DOMINO_STYLE.PIPFX_ENABLED = _savedPipFx;
    const pfChk = document.getElementById('chkPipFx');
    if(pfChk) { pfChk.checked = _savedPipFx; }
    const pfKnob = document.getElementById('pipFxKnob');
    if(pfKnob) { pfKnob.style.left = _savedPipFx ? '22px' : '2px'; pfKnob.parentElement.querySelector('span').style.background = _savedPipFx ? '#22c55e' : 'rgba(255,255,255,0.2)'; }
  }

  // Load flip trump state (default ON)
  const _savedFlipTrump = loadFromStorage('tn51_flip_trump');
  window.FLIP_TRUMP_ENABLED = _savedFlipTrump !== null ? _savedFlipTrump : true;
  if(_savedFlipTrump !== null) {
    const ftChk = document.getElementById('chkFlipTrump');
    if(ftChk) { ftChk.checked = _savedFlipTrump; }
    const ftKnob = document.getElementById('flipTrumpKnob');
    if(ftKnob) { ftKnob.style.left = _savedFlipTrump ? '22px' : '2px'; ftKnob.parentElement.querySelector('span').style.background = _savedFlipTrump ? '#22c55e' : 'rgba(255,255,255,0.2)'; }
  }

  // Helper: redraw all sprites including trick history
  function _redrawAllVisibleSprites(){
    try{
      for(const seat of sprites){
        if(!seat) continue;
        for(const d of seat){
          if(d && d.sprite && typeof d.sprite.redrawCanvases === "function") d.sprite.redrawCanvases();
        }
      }
      if(typeof playedThisTrick !== 'undefined'){
        for(const pt of playedThisTrick){
          if(pt && pt.sprite && typeof pt.sprite.redrawCanvases === "function") pt.sprite.redrawCanvases();
        }
      }
      var sl = document.getElementById('spriteLayer');
      if(sl){ for(var i = 0; i < sl.children.length; i++){ var c = sl.children[i]; if(c && typeof c.redrawCanvases === "function") c.redrawCanvases(); } }
    }catch(e){}
  }

  document.getElementById('chkFancyLine').addEventListener('change', function(){
    DOMINO_STYLE.FANCY_LINE_ENABLED = this.checked;
    saveToStorage('tn51_fancy_line', this.checked);
    const knob = document.getElementById('fancyLineKnob');
    knob.style.left = this.checked ? '22px' : '2px';
    knob.parentElement.querySelector('span').style.background = this.checked ? '#22c55e' : 'rgba(255,255,255,0.2)';
    _redrawAllVisibleSprites();
  });

  document.getElementById('chkPipFx').addEventListener('change', function(){
    DOMINO_STYLE.PIPFX_ENABLED = this.checked;
    saveToStorage('tn51_pip_fx', this.checked);
    const knob = document.getElementById('pipFxKnob');
    knob.style.left = this.checked ? '22px' : '2px';
    knob.parentElement.querySelector('span').style.background = this.checked ? '#22c55e' : 'rgba(255,255,255,0.2)';
    _redrawAllVisibleSprites();
  });

  // Flip Trump toggle (default ON)
  window.FLIP_TRUMP_ENABLED = true;
  document.getElementById('chkFlipTrump').addEventListener('change', function(){
    window.FLIP_TRUMP_ENABLED = this.checked;
    saveToStorage('tn51_flip_trump', this.checked);
    const knob = document.getElementById('flipTrumpKnob');
    knob.style.left = this.checked ? '22px' : '2px';
    knob.parentElement.querySelector('span').style.background = this.checked ? '#22c55e' : 'rgba(255,255,255,0.2)';
  });


  // ==================== SAVED TILE LOOK (v14.6.0: the old Domino Style panel was removed;
  // its saved values still load. Colours are now chosen in the Dominoes picker.) ====================
  (function(){
    const DS_STORAGE = 'tn51_domino_style';
    // Load saved domino style on startup
    try{
      var saved = localStorage.getItem(DS_STORAGE);
      if(saved){
        var d = JSON.parse(saved);
        if(d.FACE){ Object.assign(DOMINO_STYLE.FACE, d.FACE); }
        if(d.BACK){ Object.assign(DOMINO_STYLE.BACK, d.BACK); }
        if(d.EDGE){ Object.assign(DOMINO_STYLE.EDGE, d.EDGE); }
        if(d.BORDER_COLOR !== undefined) DOMINO_STYLE.BORDER_COLOR = d.BORDER_COLOR;
        if(d.BORDER_WIDTH !== undefined) DOMINO_STYLE.BORDER_WIDTH = d.BORDER_WIDTH;
        if(d.BEVEL_OPACITY !== undefined) DOMINO_STYLE.BEVEL_OPACITY = d.BEVEL_OPACITY;
        if(d.BEVEL_WIDTH !== undefined) DOMINO_STYLE.BEVEL_WIDTH = d.BEVEL_WIDTH;
        if(d.EDGE_THICKNESS !== undefined) DOMINO_STYLE.EDGE_THICKNESS = d.EDGE_THICKNESS;
        if(d.INVALID_OPACITY !== undefined) DOMINO_STYLE.INVALID_OPACITY = d.INVALID_OPACITY;
        if(d.sizeOffset){
          window._dsSizeOffset = d.sizeOffset;
          var w = Math.round(56 * (1 + d.sizeOffset/100));
          var h = Math.round(112 * (1 + d.sizeOffset/100));
          document.documentElement.style.setProperty('--tileW', w + 'px');
          document.documentElement.style.setProperty('--tileH', h + 'px');
        }
        if(d.spacingOffset){ window._dsSpacingOffset = d.spacingOffset; }
      }
    }catch(e){}

  })();

  // ==================== SAVED SHUFFLE SETTINGS (panel removed v14.6.0) ====================
  (function(){
    const SHUFFLE_STORAGE_KEY = 'tn51_shuffle_settings';

    // Load saved settings
    try {
      const saved = localStorage.getItem(SHUFFLE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(SHUFFLE_SETTINGS, parsed);
      }
    } catch(e){}

  })();

  // ==================== SAVED PIP DETAILS (panel removed v14.6.0) ====================
  (function(){
    const savedPipFx = loadFromStorage('tn51_pipfx_details');
    if(savedPipFx){
      Object.keys(savedPipFx).forEach(function(k){ if(k in DOMINO_STYLE) DOMINO_STYLE[k] = savedPipFx[k]; });
    }
  })();

  // Load saved boneyard settings (orientation-aware with legacy fallback)
  const _savedBy2 = loadFromStorage(getBy2Key()) || loadFromStorage('tn51_boneyard');
  if(_savedBy2) applyBy2State(_savedBy2);

  // ==================== ORIENTATION CHANGE HANDLER ====================
  function onOrientationChange(){
    const newOrient = getOrientation();
    if(newOrient === currentOrientation) return;
    // Save current orientation's settings before switching
    saveToStorage('tn51_t42_layout_' + currentOrientation, Object.assign({}, T42_SETTINGS));
    saveToStorage('tn51_tn51_layout_' + currentOrientation, Object.assign({}, TN51_SETTINGS));
    saveToStorage('tn51_boneyard_' + currentOrientation, collectBy2State());
    // Switch orientation
    currentOrientation = newOrient;
    // Load new orientation's settings
    const t42Data = loadFromStorage(getT42Key());
    if(t42Data) Object.assign(T42_SETTINGS, t42Data);
    const tn51Data = loadFromStorage(getTn51Key());
    if(tn51Data) Object.assign(TN51_SETTINGS, tn51Data);
    const by2Data = loadFromStorage(getBy2Key());
    if(by2Data) applyBy2State(by2Data);
    // Re-apply to the game
    if(GAME_MODE === 'MOON') applyMoonSettings();
    if(GAME_MODE === 'T42') applyT42Settings();
    if(GAME_MODE === 'TN51') applyTn51Settings();
    // Refresh layout if visible
    if(typeof refreshLayout === 'function') refreshLayout();
    if(typeof boneyard2Visible !== 'undefined' && boneyard2Visible && typeof renderBoneyard2 === 'function') renderBoneyard2();
  }

  // Listen for orientation changes
  window.addEventListener('resize', function(){
    // Debounce — orientation change triggers multiple resize events
    clearTimeout(window._orientDebounce);
    window._orientDebounce = setTimeout(onOrientationChange, 200);
  });


  // Apply persisted TN51 settings if in TN51 mode
  if(GAME_MODE === 'TN51' && _savedTn51) applyTn51Settings();
  // Apply persisted T42 settings (already handled by initGameMode calling applyT42Settings)
})();


// V12.3: Move fixed-position game UI elements inside tableMain
(function(){
  var table = document.getElementById('tableMain');
  if(!table) return;

  // Move topbar (score panel) inside tableMain — it's currently before gameWrapper
  var topbar = document.getElementById('topbar');
  if(topbar && topbar.parentElement !== table){
    table.insertBefore(topbar, table.firstChild);
  }

  // Elements to move inside tableMain (they use position:fixed but should be relative to game area)
  var idsToMove = ['statusBar', 'settingsBtn', 'settingsMenu',
                   'trumpDisplay', 'playerNameDisplay'];

  idsToMove.forEach(function(id){
    var el = document.getElementById(id);
    if(el && el.parentElement !== table){
      table.appendChild(el);
    }
  });

  // Also move elements by class
  ['settingsBtn', 'settingsMenu'].forEach(function(cls){
    var els = document.querySelectorAll('.' + cls);
    els.forEach(function(el){
      if(el.parentElement !== table) table.appendChild(el);
    });
  });

  // Also move score panel inside tableMain
  var scorePanel = document.getElementById('scorePanel');
  if(!scorePanel){
    // Score panel might be a different element — find the team score containers
    var team1 = document.getElementById('team1Panel');
    var team2 = document.getElementById('team2Panel');
    var marks = document.getElementById('marksPanel');
    [team1, team2, marks].forEach(function(el){
      if(el && el.parentElement !== table) table.appendChild(el);
    });
  } else {
    if(scorePanel.parentElement !== table) table.appendChild(scorePanel);
  }

  // Move chat icon and MP indicator too
  var chatIcon = document.getElementById('mpChatIcon');
  var mpIndicator = document.getElementById('mpIndicator');
  var yourTurnBanner = document.getElementById('yourTurnBanner');
  [chatIcon, mpIndicator, yourTurnBanner].forEach(function(el){
    if(el && el.parentElement !== table) table.appendChild(el);
  });

  // Change position:fixed to position:absolute for game UI elements
  // (they're now children of tableMain which is position:relative)
  var style = document.createElement('style');
  style.textContent = '#topbar{position:absolute!important;}\n#statusBar{position:absolute!important;}'
    + '.settingsBtn{position:absolute!important;}'
    + '.settingsMenu{position:absolute!important;}'
    + '#trumpDisplay{position:absolute!important;}'
    + '#playerNameDisplay{position:absolute!important;}'
    + '#scorePanel{position:absolute!important;}'
    + '.team1Panel,.team2Panel,#team1Panel,#team2Panel{position:absolute!important;}'
    + '#marksPanel{position:absolute!important;}'
    + '#mpChatIcon{position:absolute!important;}'
    + '#mpIndicator,#mpIndicatorDock{position:absolute!important;}'
    + '#yourTurnBanner{position:absolute!important;}'
    + '.modalBackdrop{position:absolute!important;}';
  document.head.appendChild(style);
})();

/******************************************************************************
 * V10_122c: GLOBAL ERROR HANDLERS FOR iOS STABILITY
 * Prevents silent crashes from unhandled promise rejections and errors
 ******************************************************************************/
window.addEventListener('unhandledrejection', function(event) {
  console.error('[CRITICAL] Unhandled promise rejection:', event.reason);
  mpLogEntry('ERROR', 'unhandled-rejection', 'Promise rejection: ' + (event.reason ? event.reason.message : 'unknown'));
  
  // If sync is in progress and crashes, release the lock
  if(_syncInProgress){
    console.warn('[CRITICAL] Releasing stuck sync lock due to unhandled rejection');
    _syncInProgress = false;
    hideSyncingOverlay();
    mpSuppressSend = false;
    isAnimating = false;
  }
  
  // Prevent default to avoid console spam
  event.preventDefault();
});

window.addEventListener('error', function(event) {
  console.error('[CRITICAL] Unhandled error:', event.error);
  mpLogEntry('ERROR', 'unhandled-error', 'Error: ' + (event.error ? event.error.message : event.message));
  
  // If sync is in progress and crashes, release the lock
  if(_syncInProgress){
    console.warn('[CRITICAL] Releasing stuck sync lock due to unhandled error');
    _syncInProgress = false;
    hideSyncingOverlay();
    mpSuppressSend = false;
    isAnimating = false;
  }
});

/******************************************************************************
 * V10_122c: GLOBAL SYNCING OVERLAY FAILSAFE
 * Ensures overlay never stays visible for more than 15 seconds
 ******************************************************************************/
setInterval(() => {
  const overlay = document.getElementById('syncingOverlay');
  if(overlay && overlay.style.display !== 'none'){
    // Check how long overlay has been visible
    if(!overlay._shownAt){
      overlay._shownAt = Date.now();
    } else {
      const duration = Date.now() - overlay._shownAt;
      if(duration > 15000){
        console.error('[CRITICAL] Syncing overlay stuck for', Math.round(duration/1000), 's — force hiding');
        mpLogEntry('ERROR', 'overlay-stuck', 'Overlay visible for ' + Math.round(duration/1000) + 's');
        hideSyncingOverlay();
        _syncInProgress = false;
        mpSuppressSend = false;
        isAnimating = false;
        setStatus('Sync timeout - please refresh manually');
        overlay._shownAt = null;
      }
    }
  } else {
    if(overlay) overlay._shownAt = null;
  }
}, 1000);

