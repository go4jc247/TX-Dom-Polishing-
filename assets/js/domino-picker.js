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

  // Face colours offered in Custom (and used by the presets)
  var FACES = {
    ivory: { name:'Ivory', face:'#f5ecdd', hi:'#ffffff', back:'#e8decd', edge:'#d7d7d7', line:'dark' },
    white: { name:'White', face:'#fbfbf8', hi:'#ffffff', back:'#ecebe6', edge:'#d0d0d0', line:'dark' },
    cream: { name:'Cream', face:'#efe2c4', hi:'#f8eed6', back:'#e2d3b0', edge:'#cdbb94', line:'dark' },
    wood:  { name:'Wood',  face:'#c08a58', hi:'#d29d6a', back:'#a8743f', edge:'#8a5a2e', line:'dark', grain:true },
    navy:  { name:'Navy',  face:'#1d2b4a', hi:'#2a3c63', back:'#16223b', edge:'#0f1729', line:'light' },
    black: { name:'Black', face:'#1b1c20', hi:'#2b2d33', back:'#141518', edge:'#0c0c0e', line:'light' }
  };

  var PRESETS = [
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
    var look = { preset:'classic', custom:{ face:'ivory', mode:'each', one:'#141416', each:CLASSIC_DOTS.slice() } };
    // Carry over colours chosen in the old Pip Colors panel, if any
    try{
      var old = JSON.parse(localStorage.getItem('tn51_pip_colors') || 'null');
      if(old){
        for(var k in old){ var i=parseInt(k,10); if(i>=0 && i<=7) look.custom.each[i] = toHex(old[k]); }
        look.preset = 'custom';
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
    var keep = JSON.stringify({ F:DOMINO_STYLE.FACE, B:DOMINO_STYLE.BACK, E:DOMINO_STYLE.EDGE, P:DOMINO_STYLE.PIP_COLORS,
      fl:DOMINO_STYLE.FANCY_LINE_COLOR, cl:DOMINO_STYLE.CENTER_LINE_COLOR, bo:DOMINO_STYLE.BEVEL_OPACITY,
      g:DOMINO_STYLE.FACE_GRAIN, gl:DOMINO_STYLE.PIP_GLOW });
    applyToStyle(look); fn();
    var k = JSON.parse(keep);
    Object.assign(DOMINO_STYLE.FACE,k.F); Object.assign(DOMINO_STYLE.BACK,k.B); Object.assign(DOMINO_STYLE.EDGE,k.E);
    Object.assign(DOMINO_STYLE.PIP_COLORS,k.P);
    DOMINO_STYLE.FANCY_LINE_COLOR=k.fl; DOMINO_STYLE.CENTER_LINE_COLOR=k.cl; DOMINO_STYLE.BEVEL_OPACITY=k.bo;
    DOMINO_STYLE.FACE_GRAIN=k.g; DOMINO_STYLE.PIP_GLOW=k.gl;
  }

  // ---------- state ----------
  var current = load() || defaultLook();
  if(!current.custom) current.custom = defaultLook().custom;
  applyToStyle(current);

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
      var b = el('button','dpFace');
      b.dataset.face = k;
      b.innerHTML = '<span class="dpFaceDot" style="background:'+FACES[k].face+'"></span>'+FACES[k].name;
      b.onclick = function(){ draft.custom.face = k; draft.preset='custom'; render(true); };
      faces.appendChild(b);
    });

    root.querySelectorAll('.dpSeg button').forEach(function(b){
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
      var keys = Object.keys(FACES);
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
      var look = id==='custom' ? { preset:'custom', custom:draft.custom } : { preset:id };
      var c = card.querySelectorAll('canvas');
      withLook(look, function(){ drawTile(c[0],[5,3],30,60); drawTile(c[1],[6,2],30,60); });
    });

    // custom section
    var cu = draft.custom, isCustom = draft.preset==='custom';
    root.querySelector('.dpCustom').classList.toggle('open', isCustom);
    root.querySelectorAll('.dpFace').forEach(function(b){ b.classList.toggle('on', b.dataset.face===cu.face); });
    root.querySelectorAll('.dpSeg button').forEach(function(b){ b.classList.toggle('on', b.dataset.mode===cu.mode); });
    var nums = root.querySelector('.dpNums');
    nums.style.display = cu.mode==='one' ? 'none' : '';
    root.querySelector('.dpSegHint').textContent =
      cu.mode==='one' ? 'Every dot is the same colour.' :
      cu.mode==='each' ? 'Pick a colour for each number. Colours can repeat.' :
      'Every number gets its own colour. No two are alike.';
    withLook({ preset:'custom', custom:cu }, function(){
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
