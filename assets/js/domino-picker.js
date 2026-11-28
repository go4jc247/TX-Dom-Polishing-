// ============================================================
// TX-Dom-Polishing — domino-picker.js (v14.6.0)
// "Dominoes" picker: choose how the tiles look. Six ready-made styles plus Custom
// (face colour, one dot colour or a colour for each number). Replaces the old
// developer-mode Domino Style / Pip Colors panels. Saved in localStorage and
// applied to every tile (hand, table, trick history, boneyard).
// ============================================================
(function(){
  var KEY = 'tn51_domino_look';

  var CLASSIC_DOTS = ['#141416','#36b258','#f0c73d','#e74c3c','#00b2ff','#9b59b6','#a76e34','#3b82f6'];

  // v14.7.1: "Original" = the game's TRUE built-in default look (owner: "look back to what the
  // original default was"). It no longer picks up colours or dot effects saved in the old
  // developer panels. window._DOMINO_STYLE_DEFAULT is copied in game.js before any saved setting
  // is applied. The Game Settings switches (fancy centre line, dot shine) are left as the player set them.
  var DEF = window._DOMINO_STYLE_DEFAULT || null;
  var TOGGLES = { FANCY_LINE_ENABLED: 1, PIPFX_ENABLED: 1 };
  // Everything else that shapes a tile, as loaded at startup (built-in + saved tweaks): the other
  // styles keep using this, so visiting Original and coming back changes nothing for them
  var BASE = (typeof DOMINO_STYLE !== 'undefined') ? JSON.parse(JSON.stringify(DOMINO_STYLE)) : null;
  try{ localStorage.removeItem('tn51_domino_original'); }catch(e){}   // old v14.6.5 snapshot
  function restoreFrom(src){
    if(!src || typeof DOMINO_STYLE === 'undefined') return;
    Object.keys(src).forEach(function(k){
      if(TOGGLES[k]) return;
      var v = src[k];
      if(v && typeof v === 'object'){
        if(Array.isArray(v)) for(var i=0;i<v.length;i++) DOMINO_STYLE[k][i] = v[i];
        else Object.assign(DOMINO_STYLE[k], v);
      } else DOMINO_STYLE[k] = v;
    });
  }
  var ORIGINAL = (function(){
    var D = DEF || {};
    return { face: D.FACE ? D.FACE.NORMAL : 'rgba(245,236,221,0.96)', hi: D.FACE ? D.FACE.HIGHLIGHTED : '#fff',
             back: D.BACK ? D.BACK.NORMAL : 'rgba(232,222,205,0.92)', edge: D.EDGE ? D.EDGE.NORMAL : '#d7d7d7',
             dots: D.PIP_COLORS ? [0,1,2,3,4,5,6,7].map(function(i){ return D.PIP_COLORS[i]; }) : null };
  })();

  // Face colours offered in Custom (and used by the presets)
  var FACES = {
    original: { name:'Original', original:true, face:ORIGINAL.face, hi:ORIGINAL.hi, back:ORIGINAL.back, edge:ORIGINAL.edge },
    ivory: { name:'Ivory', face:'#f7dca1', hi:'#fbe9c2', back:'#e8decd', edge:'#d7c9a8', line:'dark', tex:'ivory' },
    white: { name:'White', face:'#f9f8f9', hi:'#ffffff', back:'#ecebe6', edge:'#d0d0d0', line:'dark', tex:'white' },
    cream: { name:'Cream', face:'#fde6a7', hi:'#fff0c8', back:'#e2d3b0', edge:'#d8c48f', line:'dark', tex:'cream' },
    wood:  { name:'Wood',  face:'#da9a5c', hi:'#e6ad74', back:'#a8743f', edge:'#8a5a2e', line:'dark', grain:true, tex:'wood', lengthwise:true },
    navy:  { name:'Navy',  face:'#031a46', hi:'#0c2a63', back:'#16223b', edge:'#0f1729', line:'light', tex:'navy' },
    black: { name:'Black', face:'#0b0b0c', hi:'#232327', back:'#141518', edge:'#0c0c0e', line:'light', tex:'black' },
    marble:{ name:'Marble', face:'#0c0c0c', hi:'#26262a', back:'#141518', edge:'#0c0c0e', line:'light', tex:'marble' },
    flowers:{ name:'Flowers', face:'#ebd1a7', hi:'#f5e2c2', back:'#e2d3b0', edge:'#d3bb92', line:'dark', tex:'flowers' }
  };

  var PRESETS = [
    { id:'original',   name:'Original',   tag:'Your look from before',     face:'original', dots:ORIGINAL.dots },
    { id:'classic',    name:'Classic',    tag:'A colour for every number', face:'ivory', dots:CLASSIC_DOTS },
    { id:'tournament', name:'Tournament', tag:'Crisp white, black dots',   face:'white', dots:fill('#141416') },
    { id:'midnight',   name:'Midnight',   tag:'Black tiles, white dots',   face:'black', dots:fill('#f4f1ea') },
    { id:'vintage',    name:'Vintage',    tag:'Old cream, coffee dots',    face:'cream', dots:fill('#5b3a1e') },
    { id:'casino',     name:'Casino',     tag:'Red, blue and green',       face:'white',
      dots:['#141416','#d62828','#1d4ed8','#15803d','#d62828','#1d4ed8','#15803d','#141416'] },
    { id:'neon',       name:'Neon',       tag:'Glowing dots in the dark',  face:'black', glow:true,
      dots:['#ffffff','#39ff88','#fff23a','#ff4fd8','#25e8ff','#b66bff','#ff9a2e','#4d7cff'] }
  ];

  var SWATCHES = ['#141416','#f4f1ea','#5b3a1e','#d62828','#ff7a1a','#e8b923','#2f9e44','#0ea5a4',
                  '#1d4ed8','#6d28d9','#c026d3','#9ca3af','#39ff88','#25e8ff','#ff4fd8','#c9a227'];

  // v14.6.3: material textures (assets/images/textures/*.jpg), loaded once and shared
  var TEX = {}, texWaiters = [];
  function getTex(k){
    if(!k) return null;
    if(!TEX[k]){
      var im = new Image();
      im.onload = function(){ texWaiters.forEach(function(f){ try{ f(); }catch(e){} }); };
      im.src = './assets/images/textures/' + k + '.jpg';
      TEX[k] = im;
    }
    return TEX[k];
  }
  function onTexLoad(f){ texWaiters.push(f); }

  function same(a,b){ return String(a).toLowerCase()===String(b).toLowerCase(); }
  // Give every number 1-7 its own colour: repeats get the next unused swatch
  function makeUnique(each){
    var used = [];
    for(var n=1;n<=7;n++){
      if(used.some(function(u){ return same(u, each[n]); })){
        each[n] = SWATCHES.filter(function(c){ return !used.some(function(u){ return same(u,c); }) && !each.slice(n+1,8).some(function(u){ return same(u,c); }); })[0];
      }
      used.push(each[n]);
    }
  }
  function fill(c){ var a=[]; for(var i=0;i<8;i++) a.push(c); return a; }
  function load(){ try{ var r=localStorage.getItem(KEY); return r?JSON.parse(r):null; }catch(e){ return null; } }
  function save(look){ try{ localStorage.setItem(KEY, JSON.stringify(look)); }catch(e){} }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  function defaultLook(){
    var look = { preset:'original', custom:{ face:'ivory', mode:'each', one:'#141416', each:CLASSIC_DOTS.slice() } };
    // Carry over colours chosen in the old Pip Colors panel, if any
    try{
      var old = JSON.parse(localStorage.getItem('tn51_pip_colors') || 'null');
      if(old){
        for(var k in old){ var i=parseInt(k,10); if(i>=0 && i<=7) look.custom.each[i] = toHex(old[k]); }
      }
    }catch(e){}
    return look;
  }

  function toHex(c){
    if(!c) return '#000000';
    if(c.charAt(0)==='#') return c;
    var m=c.match(/[\d.]+/g); if(!m||m.length<3) return '#000000';
    return '#'+[0,1,2].map(function(i){ return ('0'+parseInt(m[i],10).toString(16)).slice(-2); }).join('');
  }

  // Turn a saved look into face + dots + extras
  function resolve(look){
    if(look.preset !== 'custom'){
      var p = PRESETS.filter(function(x){ return x.id===look.preset; })[0] || PRESETS[0];
      return { face:FACES[p.face], dots:p.dots, glow:!!p.glow };
    }
    var c = look.custom;
    var dots = c.mode==='one' ? fill(c.one) : c.each;
    return { face:FACES[c.face] || FACES.ivory, dots:dots, glow:false };
  }

  // Write a look into DOMINO_STYLE (what drawFace reads)
  function applyToStyle(look){
    if(typeof DOMINO_STYLE === 'undefined') return;
    var r = resolve(look), f = r.face, light = f.line==='light';
    // start every style from the same footing (Original from the true default, the rest from
    // what was loaded at startup), then lay the style's own colours on top
    restoreFrom(f.original ? DEF : BASE);
    if(f.original){
      DOMINO_STYLE.FACE_GRAIN = false; DOMINO_STYLE.FACE_TEXTURE = null; DOMINO_STYLE.TEX_DIR = 'same';
      DOMINO_STYLE.PIP_GLOW = false;
      return;
    }
    DOMINO_STYLE.FACE.NORMAL = f.face;
    DOMINO_STYLE.FACE.HIGHLIGHTED = f.hi;
    DOMINO_STYLE.BACK.NORMAL = f.back;
    DOMINO_STYLE.BACK.HIGHLIGHTED = f.hi;
    DOMINO_STYLE.EDGE.NORMAL = f.edge;
    DOMINO_STYLE.EDGE.HIGHLIGHTED = f.edge;
    DOMINO_STYLE.FANCY_LINE_COLOR = light ? 'rgba(235,235,235,0.75)' : 'rgba(0,0,0,0.90)';
    DOMINO_STYLE.CENTER_LINE_COLOR = light ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.22)';
    DOMINO_STYLE.BEVEL_OPACITY = light ? 0.12 : 0.40;
    DOMINO_STYLE.FACE_GRAIN = !!f.grain;
    DOMINO_STYLE.FACE_TEXTURE = getTex(f.tex);
    // v14.6.4: which way the pattern sits on each tile. Wood never turns sideways (grain stays
    // along the tile), so for wood 'random' only flips it 180 degrees.
    var pat = look.pattern || 'random';
    DOMINO_STYLE.TEX_DIR = (f.lengthwise && pat === 'random') ? 'flip' : pat;
    DOMINO_STYLE.PIP_GLOW = r.glow;
    for(var i=0;i<8;i++) DOMINO_STYLE.PIP_COLORS[i] = r.dots[i];
  }

  function redrawGame(){
    try{
      var sl = document.getElementById('spriteLayer');
      if(sl) for(var i=0;i<sl.children.length;i++){ var c=sl.children[i]; if(c && typeof c.redrawCanvases==='function') c.redrawCanvases(); }
      document.querySelectorAll('.dominoSprite').forEach(function(el){ if(typeof el.redrawCanvases==='function') el.redrawCanvases(); });
      if(typeof boneyard2Visible!=='undefined' && boneyard2Visible && typeof renderBoneyard2==='function') renderBoneyard2();
    }catch(e){}
  }

  // Draw one tile into a canvas at the screen's pixel density
  function drawTile(cvs, tile, cssW, cssH){
    var dpr = Math.min(3, window.devicePixelRatio || 1);
    cvs.width = Math.round(cssW*dpr); cvs.height = Math.round(cssH*dpr);
    cvs.style.width = cssW+'px'; cvs.style.height = cssH+'px';
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    try{ drawFace(ctx, tile, cssW, cssH, false, true, 0); }catch(e){}
  }

  // Draw a tile in a temporary look (for the preset cards) without touching the game
  function withLook(look, fn){
    // draw in another look, then put every setting back exactly as it was
    var keepTex = DOMINO_STYLE.FACE_TEXTURE;
    DOMINO_STYLE.FACE_TEXTURE = null;
    var keep = JSON.parse(JSON.stringify(DOMINO_STYLE));
    DOMINO_STYLE.FACE_TEXTURE = keepTex;
    applyToStyle(look); fn();
    Object.keys(keep).forEach(function(k){
      var v = keep[k];
      if(v && typeof v === 'object'){
        if(Array.isArray(v)) for(var i=0;i<v.length;i++) DOMINO_STYLE[k][i] = v[i];
        else Object.assign(DOMINO_STYLE[k], v);
      } else DOMINO_STYLE[k] = v;
    });
    DOMINO_STYLE.FACE_TEXTURE = keepTex;
  }

  // ---------- state ----------
  var current = load() || defaultLook();
  if(!current.custom) current.custom = defaultLook().custom;
  applyToStyle(current);
  // When a texture finishes loading, redraw the game tiles and the open picker
  onTexLoad(function(){ redrawGame(); if(root && root.classList.contains('show')) render(false); });
  // Preload every texture so the picker cards show them straight away
  Object.keys(FACES).forEach(function(k){ getTex(FACES[k].tex); });

  // ---------- UI ----------
  var root, draft, selNum = 1;

  function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }

  function build(){
    root = el('div', null);
    root.id = 'dominoPicker';
    root.innerHTML =
      '<div class="dpSheet" role="dialog" aria-label="Choose your dominoes">' +
        '<div class="dpHead"><div class="dpTitle">Your Dominoes</div>' +
        '<button class="dpClose" aria-label="Close">&times;</button></div>' +
        '<div class="dpMain">' +
        '<div class="dpStage"><div class="dpFan"></div><div class="dpStageName"></div></div>' +
        '<div class="dpBody">' +
          '<div class="dpGrid"></div>' +
          '<div class="dpLabel dpPatLabel">Pattern direction</div>' +
          '<div class="dpSeg dpPat"><button data-pat="same">Same way</button><button data-pat="flip">Some flipped</button><button data-pat="random">Random</button></div>' +
          '<div class="dpSegHint dpPatHint"></div>' +
          '<div class="dpCustom">' +
            '<div class="dpLabel">Tile colour</div><div class="dpFaces"></div>' +
            '<div class="dpLabel">Dots</div>' +
            '<div class="dpSeg"><button data-mode="one">All the same</button><button data-mode="each">Mix &amp; match</button><button data-mode="unique">All different</button></div>' +
            '<div class="dpSegHint"></div>' +
            '<div class="dpNums"></div>' +
            '<div class="dpSwatches"></div>' +
            '<button class="dpSurprise">&#127922; Surprise me</button>' +
          '</div>' +
        '</div>' +
        '</div>' +
        '<div class="dpFoot"><button class="dpCancel">Cancel</button><button class="dpDone">Use these</button></div>' +
      '</div>';
    document.body.appendChild(root);

    root.addEventListener('click', function(e){ if(e.target===root) close(false); });
    root.querySelector('.dpClose').onclick = function(){ close(false); };
    root.querySelector('.dpCancel').onclick = function(){ close(false); };
    root.querySelector('.dpDone').onclick = function(){ close(true); };

    // Preset cards + Custom card
    var grid = root.querySelector('.dpGrid');
    PRESETS.concat([{ id:'custom', name:'Custom', tag:'Mix your own' }]).forEach(function(p){
      var card = el('button','dpCard');
      card.dataset.id = p.id;
      card.innerHTML = '<div class="dpMini"><canvas></canvas><canvas></canvas></div>' +
        '<div class="dpCardName">'+p.name+'</div><div class="dpCardTag">'+p.tag+'</div><div class="dpCheck">&#10003;</div>';
      card.onclick = function(){ draft.preset = p.id; render(true); };
      grid.appendChild(card);
    });

    // Face chips
    var faces = root.querySelector('.dpFaces');
    Object.keys(FACES).forEach(function(k){
      if(FACES[k].original) return;   // Original is a full style, not a Custom tile colour
      var b = el('button','dpFace');
      b.dataset.face = k;
      b.innerHTML = '<span class="dpFaceDot" style="background:'+FACES[k].face+'"></span>'+FACES[k].name;
      b.onclick = function(){ draft.custom.face = k; draft.preset='custom'; render(true); };
      faces.appendChild(b);
    });

    root.querySelectorAll('.dpPat button').forEach(function(b){
      b.onclick = function(){ draft.pattern = b.dataset.pat; render(true); };
    });

    root.querySelectorAll('.dpSeg:not(.dpPat) button').forEach(function(b){
      b.onclick = function(){
        if(draft.custom.mode !== b.dataset.mode && b.dataset.mode==='one'){
          draft.custom.one = draft.custom.each[selNum] || draft.custom.one;
        }
        draft.custom.mode = b.dataset.mode;
        if(b.dataset.mode==='unique') makeUnique(draft.custom.each);
        draft.preset='custom'; render(true);
      };
    });

    // Numbers 1-7 (tap one, then a colour)
    var nums = root.querySelector('.dpNums');
    for(var n=1;n<=7;n++){
      (function(n){
        var b = el('button','dpNum'); b.dataset.n = n;
        b.innerHTML = '<canvas></canvas><span>'+n+'</span>';
        b.onclick = function(){ selNum = n; render(false); };
        nums.appendChild(b);
      })(n);
    }

    var sw = root.querySelector('.dpSwatches');
    SWATCHES.forEach(function(c){
      var b = el('button','dpSwatch'); b.dataset.c = c; b.style.background = c;
      b.setAttribute('aria-label','Colour '+c);
      b.onclick = function(){
        var cu = draft.custom;
        if(cu.mode==='one') cu.one = c;
        else {
          if(cu.mode==='unique'){
            // A colour can belong to only one number: if another number has it, they swap
            for(var k=1;k<=7;k++){ if(k!==selNum && same(cu.each[k], c)){ cu.each[k] = cu.each[selNum]; } }
          }
          cu.each[selNum] = c; if(selNum<7) selNum++;
        }
        draft.preset='custom'; render(true);
      };
      sw.appendChild(b);
    });

    root.querySelector('.dpSurprise').onclick = function(){
      var keys = Object.keys(FACES).filter(function(k){ return !FACES[k].original; });
      var face = keys[Math.floor(Math.random()*keys.length)];
      var dark = FACES[face].line==='light';
      var pool = SWATCHES.filter(function(c){ return dark ? c!=='#141416' && c!=='#5b3a1e' : c!=='#f4f1ea'; });
      draft.custom.face = face;
      if(draft.custom.mode==='one') draft.custom.mode = 'unique';
      var bag = pool.slice().sort(function(){ return Math.random()-0.5; });
      for(var i=1;i<=7;i++) draft.custom.each[i] = draft.custom.mode==='unique' ? bag[i-1] : pool[Math.floor(Math.random()*pool.length)];
      draft.preset='custom'; render(true);
    };
  }

  var FAN = [[6,4],[5,5],[3,1],[2,7]];
  function render(bump){
    // live preview (uses the draft look)
    var fan = root.querySelector('.dpFan');
    if(!fan.children.length){
      FAN.forEach(function(){ fan.appendChild(el('canvas')); });
    }
    withLook(draft, function(){
      var cvs = fan.children;
      for(var i=0;i<cvs.length;i++) drawTile(cvs[i], FAN[i], 58, 116);
    });
    if(bump){ fan.classList.remove('dpBump'); void fan.offsetWidth; fan.classList.add('dpBump'); }
    var name = draft.preset==='custom' ? 'Custom' : PRESETS.filter(function(p){ return p.id===draft.preset; })[0].name;
    root.querySelector('.dpStageName').textContent = name;

    // cards
    root.querySelectorAll('.dpCard').forEach(function(card){
      var id = card.dataset.id;
      card.classList.toggle('on', id===draft.preset);
      var look = id==='custom' ? { preset:'custom', custom:draft.custom, pattern:draft.pattern } : { preset:id, pattern:draft.pattern };
      var c = card.querySelectorAll('canvas');
      withLook(look, function(){ drawTile(c[0],[5,3],30,60); drawTile(c[1],[6,2],30,60); });
    });

    // custom section
    var cu = draft.custom, isCustom = draft.preset==='custom';
    root.querySelector('.dpCustom').classList.toggle('open', isCustom);
    root.querySelectorAll('.dpFace').forEach(function(b){ b.classList.toggle('on', b.dataset.face===cu.face); });
    root.querySelectorAll('.dpSeg:not(.dpPat) button').forEach(function(b){ b.classList.toggle('on', b.dataset.mode===cu.mode); });
    var pat = draft.pattern || 'random';
    root.querySelectorAll('.dpPat button').forEach(function(b){ b.classList.toggle('on', b.dataset.pat===pat); });
    var faceNow = draft.preset==='custom' ? FACES[cu.face] : FACES[(PRESETS.filter(function(p){ return p.id===draft.preset; })[0]||PRESETS[0]).face];
    root.querySelector('.dpPatHint').textContent =
      pat==='same' ? 'The pattern sits the same way on every domino.' :
      pat==='flip' ? 'Some dominoes have the pattern turned upside down.' :
      (faceNow && faceNow.lengthwise ? 'Each domino turns the pattern its own way. Wood grain only flips, so it stays along the tile.'
                                     : 'Each domino turns the pattern its own way.');
    var nums = root.querySelector('.dpNums');
    nums.style.display = cu.mode==='one' ? 'none' : '';
    root.querySelector('.dpCustom .dpSegHint').textContent =
      cu.mode==='one' ? 'Every dot is the same colour.' :
      cu.mode==='each' ? 'Pick a colour for each number. Colours can repeat.' :
      'Every number gets its own colour. No two are alike.';
    withLook({ preset:'custom', custom:cu, pattern:draft.pattern }, function(){
      nums.querySelectorAll('.dpNum').forEach(function(b){
        var n = +b.dataset.n;
        b.classList.toggle('on', n===selNum);
        drawTile(b.querySelector('canvas'), [n,n], 26, 52);
      });
    });
    var active = cu.mode==='one' ? cu.one : cu.each[selNum];
    root.querySelectorAll('.dpSwatch').forEach(function(b){
      b.classList.toggle('on', same(b.dataset.c, active));
      // All different: show which number already owns each colour
      var owner = 0;
      if(cu.mode==='unique') for(var k=1;k<=7;k++) if(k!==selNum && same(cu.each[k], b.dataset.c)) owner = k;
      b.textContent = owner ? owner : '';
      b.classList.toggle('taken', !!owner);
    });
  }

  function open(){
    if(!root) build();
    draft = clone(current);
    selNum = 1;
    render(false);
    root.classList.add('show');
    root.querySelector('.dpBody').scrollTop = 0;
  }

  function close(keep){
    if(keep){
      current = clone(draft);
      save(current);
      applyToStyle(current);
      redrawGame();
    }
    root.classList.remove('show');
  }

  window.openDominoPicker = open;
  window.applyDominoLook = function(){ applyToStyle(current); redrawGame(); };

  // Home screen button (above New Game)
  function addHomeButton(){
    var wrap = document.getElementById('startMainBtns');
    if(!wrap || document.getElementById('btnDominoPicker')) return;
    var b = document.createElement('button');
    b.id = 'btnDominoPicker';
    b.className = 'glossBtn startScreenBtn';
    b.innerHTML = '<span class="dpBtnTile"><i></i><i></i></span>Dominoes';
    b.onclick = open;
    wrap.insertBefore(b, wrap.firstChild);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addHomeButton);
  else addHomeButton();
})();
