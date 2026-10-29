(() => {
  const C = CONFIG, W = C.W, H = C.H, G = C.GROUND, S = C.size;
  const cv = document.getElementById('game'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const keys = {};
  // Estados: cover | play | clear | gameover | results | credits
  let state = 'cover', lvl = 0, L, p, plats, coins, shrooms, enemies, springs, tires, parts = [];
  let coinN = 0, lvlCoins = 0, deaths = 0, totalTime = 0, time = 0, levelTime = 0, resT = 0, cam = 0, tireT = 0, shake = 0, wasAir = false;

  // ---------- Entrada (teclado, mouse/táctil en canvas, botones táctiles) ----------
  let unlocked = false;
  function unlock() { Sfx.init(); if (!unlocked) { unlocked = true; Music.start(); } }
  addEventListener('keydown', e => {
    unlock(); keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.code === 'Enter' && !e.repeat && UI.buttons[0]) { Sfx.play('click'); UI.buttons[0].cb(); }
    if (e.code === 'KeyM') Music.toggle();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  cv.addEventListener('pointerdown', e => {
    unlock(); const r = cv.getBoundingClientRect();
    UI.click((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height);
  });
  document.querySelectorAll('#touch button').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); unlock(); keys[k] = true; b.classList.add('on'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, () => { keys[k] = false; b.classList.remove('on'); }));
  });
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');

  // ---------- Estado ----------
  const makePlayer = () => ({ x: 60, y: 0, w: S.player.w, h: S.player.h, vx: 0, vy: 0, face: 1, inv: 0, big: false, hp: C.MAX_HP, onGround: false, ride: null, phase: 0, squash: 0, sprung: false });
  function setSize() { const k = p.big ? S.player.big : 1; p.w = S.player.w * k; p.h = S.player.h * k; }

  function newGame() { p = makePlayer(); coinN = 0; deaths = 0; totalTime = 0; loadLevel(0); state = 'play'; }
  function restartLevel() { p = makePlayer(); coinN = lvlCoins; loadLevel(lvl); state = 'play'; }
  function nextLevel() { loadLevel(lvl + 1); state = 'play'; }
  function toCover() { state = 'cover'; p = makePlayer(); loadLevel(0); }

  function loadLevel(i) {
    lvl = i; L = LEVELS[i]; setSize(); lvlCoins = coinN;
    p.x = 60; p.y = G - p.h; p.vx = p.vy = 0; p.inv = 0; p.ride = null; p.sprung = false;
    plats = [
      ...L.plats.map(s => ({ ...s, dx: 0 })),
      ...L.movers.map(m => ({ x: m.cx - m.w / 2, x0: m.cx - m.w / 2, y: m.y, w: m.w, amp: m.amp, sp: m.sp, dx: 0 }))
    ];
    coins = L.coins.map(c => ({ ...c }));
    shrooms = L.mushrooms.map(m => ({ ...m, w: S.mushroom.w, h: S.mushroom.h }));
    enemies = L.enemies.map(e => ({ x: e.x, x0: e.x, range: e.range, dir: 1, face: 1, w: S.enemy.w, h: S.enemy.h, y: G - S.enemy.h, vx: 0, vy: 0, hop: !!e.hop, cd: 1 + Math.random(), phase: Math.random() * 6, onGround: true, dead: false }));
    springs = (L.springs || []).map(s => ({ ...s, t: 0 }));
    tires = []; tireT = 2; levelTime = 0; parts = [];
  }

  // ---------- Utilidades ----------
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const gapState = g => { if (!g.blink) return 'open'; const ph = (time + g.x * .01) % 4; return ph < 2.4 ? 'open' : ph > 3.4 ? 'warn' : 'closed'; };
  const inGap = cx => L.gaps.some(g => gapState(g) === 'open' && cx > g.x && cx < g.x + g.w);
  const spawn = (x, y, col, n, spd = 140) => { for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - .5) * spd, vy: -Math.random() * spd, life: .5 + Math.random() * .3, col }); };

  function hurt(src) {
    p.hp--; p.inv = 1.4; p.vy = -320; p.x += (p.x < src.x ? -1 : 1) * 30; shake = .25; Sfx.play('hurt');
    spawn(p.x + p.w / 2, p.y + p.h / 2, '#e53935', 12);
    if (p.hp <= 0) { deaths++; state = 'gameover'; Sfx.play('over'); }
  }
  function respawn() {
    deaths++; Sfx.play('fall'); spawn(p.x + p.w / 2, H - 20, '#7fb7d6', 14, 200);
    p.x = 60; p.y = G - p.h; p.vx = p.vy = 0; p.inv = 1; p.ride = null; p.sprung = false;
  }

  // ---------- Lógica ----------
  function update(dt) {
    time += dt; levelTime += dt; totalTime += dt; shake = Math.max(0, shake - dt);
    plats.forEach(s => { if (s.amp) { const nx = s.x0 + Math.sin(time * s.sp) * s.amp; s.dx = nx - s.x; s.x = nx; } });
    springs.forEach(s => { s.t = Math.max(0, s.t - dt); });
    if (p.ride) p.x += p.ride.dx;

    const dir = ((keys.ArrowRight || keys.KeyD || keys.TR) ? 1 : 0) - ((keys.ArrowLeft || keys.KeyA || keys.TL) ? 1 : 0);
    const jump = keys.Space || keys.ArrowUp || keys.KeyW || keys.TJ;
    p.vx = dir * C.SPEED; if (dir) p.face = dir;
    if (jump && p.onGround) { p.vy = -C.JUMP; p.onGround = false; Sfx.play('jump'); }
    if (!jump && p.vy < -220 && !p.sprung) p.vy = -220; // salto variable

    const prevB = p.y + p.h; wasAir = !p.onGround;
    if (p.onGround && dir) p.phase += dt * 13;
    p.vy += C.GRAV * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    p.x = Math.max(0, Math.min(p.x, L.length - p.w));
    p.inv = Math.max(0, p.inv - dt); p.squash = Math.max(0, p.squash - dt);
    p.onGround = false; p.ride = null;

    const land = y => {
      if (wasAir && p.vy > 350) { p.squash = .12; spawn(p.x + p.w / 2, y, '#d7ccc8', 6, 90); }
      p.y = y - p.h; p.vy = 0; p.onGround = true;
    };
    const b = p.y + p.h, cx = p.x + p.w / 2;
    let sprang = false;
    for (const s of springs) {
      if (p.vy > 0 && p.x + p.w > s.x && p.x < s.x + 36 && prevB <= G - 22 + 8 && b >= G - 22) {
        p.vy = -1000; p.sprung = true; p.y = G - 22 - p.h; s.t = .35; Sfx.play('spring'); sprang = true; break;
      }
    }
    if (p.vy >= 0) p.sprung = false;
    if (!sprang && p.vy >= 0) {
      if (b >= G && prevB <= G + 8 && !inGap(cx)) land(G);
      else for (const s of plats) {
        if (p.x + p.w > s.x && p.x < s.x + s.w && prevB <= s.y + 6 && b >= s.y) { land(s.y); p.ride = s; break; }
      }
    }
    if (p.y > H + 60) { respawn(); return; } // cayó en un bache: reaparece al inicio del nivel

    for (const e of enemies) {
      if (e.dead) continue;
      e.x += e.dir * L.es * dt;
      if (e.x > e.x0 + e.range) { e.x = e.x0 + e.range; e.dir = -1; }
      if (e.x < e.x0) { e.x = e.x0; e.dir = 1; }
      e.face = e.dir; e.vx = e.dir * L.es; e.phase += dt * (6 + L.es / 18);
      if (e.hop) { // saltarines
        e.vy += C.GRAV * dt; e.y += e.vy * dt;
        if (e.y >= G - e.h) { e.y = G - e.h; e.vy = 0; e.cd -= dt; if (e.cd <= 0) { e.vy = -430; e.cd = 1.1 + Math.random(); } }
        e.onGround = e.y >= G - e.h - 1;
      }
      if (hit(p, e)) {
        if (p.vy > 0 && prevB <= e.y + 14) { e.dead = true; p.vy = -380; Sfx.play('stomp'); spawn(e.x + e.w / 2, e.y + e.h / 2, '#ffd54f', 10); }
        else if (p.inv <= 0) hurt(e);
      }
    }
    if (state !== 'play') return;

    if (L.tires) { // llantas rodantes (nivel 4)
      tireT -= dt; if (tireT <= 0) { tires.push({ x: cam + W + 40, rot: 0 }); tireT = L.tires; }
      tires.forEach(t => { t.x -= 190 * dt; t.rot -= dt * 8; });
      tires = tires.filter(t => t.x > cam - 80);
      for (const t of tires) if (p.inv <= 0 && hit(p, { x: t.x - 13, y: G - 26, w: 26, h: 26 })) { hurt(t); break; }
      if (state !== 'play') return;
    }
    coins.forEach(c => {
      if (!c.got && Math.abs(cx - c.x) < p.w / 2 + 15 && p.y < c.y + 14 && p.y + p.h > c.y - 14) {
        c.got = true; coinN++; Sfx.play('coin'); spawn(c.x, c.y, '#ffd600', 6, 100);
      }
    });
    shrooms.forEach(m => {
      if (!m.got && hit(p, m)) {
        m.got = true; Sfx.play('eat'); spawn(m.x + m.w / 2, m.y, '#fff176', 12);
        if (!p.big) { const o = p.h; p.big = true; setSize(); p.y -= p.h - o; }
        p.hp = Math.min(C.MAX_HP, p.hp + 1);
      }
    });
    if (p.x + p.w >= L.length - 90) { Sfx.play('clear'); state = lvl === LEVELS.length - 1 ? 'results' : 'clear'; resT = 0; }
    cam = Math.max(0, Math.min(p.x - 280, L.length - W));
  }

  function updateFx(dt) {
    parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; q.life -= dt; });
    parts = parts.filter(q => q.life > 0);
  }

  // ---------- Dibujo ----------
  function drawWorld() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 6);
    Scenery.back(ctx, cam, time, L); Scenery.road(ctx, cam);
    L.gaps.forEach(g => { const sx = g.x - cam; if (sx < W + 30 && sx + g.w > -30) Scenery.pothole(ctx, sx, g.w, time, gapState(g)); });
    plats.forEach(s => {
      ctx.fillStyle = s.amp ? '#ff8f00' : '#fbc02d'; ctx.fillRect(s.x - cam, s.y, s.w, 14);
      ctx.fillStyle = '#212121'; ctx.fillRect(s.x - cam, s.y + 14, s.w, 3);
    });
    const fx = L.length - 90 - cam; // meta: bandera de Paraguay
    ctx.fillStyle = '#eee'; ctx.fillRect(fx, G - 130, 6, 130);
    ['#d52b1e', '#ffffff', '#0038a8'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(fx + 6, G - 130 + i * 10, 52, 10); });
    springs.forEach(s => { // resortes
      const sx = s.x - cam, hh = s.t > 0 ? 12 : 22;
      ctx.fillStyle = '#b71c1c'; ctx.fillRect(sx, G - 5, 36, 5);
      ctx.strokeStyle = '#fdd835'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx + 6, G - 5);
      for (let i = 1; i <= 4; i++) ctx.lineTo(sx + (i % 2 ? 30 : 6), G - 5 - hh * i / 4); ctx.stroke();
      ctx.fillStyle = '#e53935'; ctx.fillRect(sx - 2, G - hh - 4, 40, 6);
    });
    coins.forEach(c => { if (!c.got) Assets.draw(ctx, 'coin', c.x - cam - S.coin.w / 2, c.y - S.coin.h / 2 + Math.sin(time * 4 + c.x) * 3, S.coin.w, S.coin.h); });
    shrooms.forEach(m => { if (!m.got) Assets.draw(ctx, 'mushroom', m.x - cam, m.y + Math.sin(time * 3 + m.x) * 2, m.w, m.h); });
    tires.forEach(t => { // llantas
      ctx.save(); ctx.translate(t.x - cam, G - 13); ctx.rotate(t.rot);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
      ctx.fillStyle = '#9e9e9e'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(-1, -6, 2, 12); ctx.fillRect(-6, -1, 12, 2);
      ctx.restore();
    });
    enemies.forEach(e => {
      if (e.dead) return;
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(e.x - cam + e.w / 2, G + 3, e.w * .5, 4, 0, 0, 7); ctx.fill();
      Characters.draw(ctx, 'enemy', e, cam, time);
    });
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x - cam + p.w / 2, G + 3, p.w * .55, 4, 0, 0, 7); ctx.fill();
    if (!(p.inv > 0 && Math.floor(p.inv * 10) % 2)) Characters.draw(ctx, 'player', p, cam, time);
    parts.forEach(q => { ctx.globalAlpha = Math.max(0, q.life * 2); ctx.fillStyle = q.col; ctx.fillRect(q.x - cam, q.y, 4, 4); });
    ctx.globalAlpha = 1; ctx.restore();

    UI.hud(ctx, { hp: p.hp, max: C.MAX_HP, coins: coinN, time: totalTime, lvl, total: LEVELS.length });
    if (state === 'play' && levelTime < 2.8) { // título del nivel
      ctx.globalAlpha = Math.min(1, (2.8 - levelTime) * 2);
      UI.outlined(ctx, `NIVEL ${lvl + 1}`, W / 2, 120, 32, '#fff', '#000', '#ffd54f');
      UI.text(ctx, L.tip, W / 2, 160, 12, '#fff', 'center', '#000'); ctx.globalAlpha = 1;
    }
  }

  function drawCover() {
    const th = LEVELS[2], cx = time * 70;
    Scenery.back(ctx, cx, time, th); Scenery.road(ctx, cx);
    Scenery.bus(ctx, (((time * 110) % 1200) - 260), G);
    const hero = { x: 235, y: G - S.player.h, w: S.player.w, h: S.player.h, face: 1, vx: 1, vy: 0, onGround: true, phase: time * 13, squash: 0 };
    const vill = { x: 520, y: G - S.enemy.h, w: S.enemy.w, h: S.enemy.h, face: -1, vx: -1, vy: 0, onGround: true, phase: time * 9, squash: 0 };
    Characters.draw(ctx, 'player', hero, 0, time, 1.5); Characters.draw(ctx, 'enemy', vill, 0, time, 1.5);
    UI.outlined(ctx, C.title, W / 2, 105 + Math.sin(time * 2) * 4, 48, '#ffd54f', '#7a0e0e', '#ff5252');
    UI.text(ctx, 'AVENTURA PARAGUAYA', W / 2, 160, 12, '#fff', 'center', '#000');
    UI.button(ctx, 'JUGAR', W / 2, 245, 220, 52, () => { Music.start(); newGame(); }, time);
    if (Math.floor(time * 2) % 2) UI.text(ctx, 'ENTER O TOCA PARA JUGAR', W / 2, 300, 12, '#fff', 'center', '#000');
    UI.text(ctx, 'M: MÚSICA', 12, H - 14, 8, '#fff', 'left');
  }

  function drawPopups() {
    if (state === 'clear') {
      UI.panel(ctx, W / 2, H / 2, 540, 220);
      UI.text(ctx, '¡NIVEL COMPLETADO!', W / 2, H / 2 - 55, 24, '#69f0ae', 'center', '#00e676');
      UI.text(ctx, `NIVEL ${lvl + 1} DE ${LEVELS.length}`, W / 2, H / 2 - 15, 12, '#fff');
      UI.button(ctx, 'SIGUIENTE NIVEL', W / 2, H / 2 + 50, 320, 54, nextLevel, time);
    } else if (state === 'gameover') {
      UI.panel(ctx, W / 2, H / 2, 520, 220);
      UI.text(ctx, 'GAME OVER', W / 2, H / 2 - 50, 40, '#ff5252', 'center', '#ff1744');
      UI.button(ctx, 'REINTENTAR', W / 2, H / 2 + 40, 280, 54, restartLevel, time);
    } else if (state === 'results') {
      const k = Math.min(1, resT / 1.4), rows = [['TIEMPO', UI.fmt(totalTime * k)], ['MUERTES', String(Math.round(deaths * k))], ['MONEDAS', String(Math.round(coinN * k))]];
      UI.panel(ctx, W / 2, H / 2, 600, 320);
      UI.text(ctx, '¡LO LOGRASTE!', W / 2, H / 2 - 120, 24, '#ffd54f', 'center', '#ffab00');
      rows.forEach(([a, v], i) => { UI.text(ctx, a, W / 2 - 240, H / 2 - 62 + i * 44, 16, '#fff', 'left'); UI.text(ctx, v, W / 2 + 240, H / 2 - 62 + i * 44, 16, '#00e5ff', 'right', '#00b8d4'); });
      UI.button(ctx, 'ACEPTAR', W / 2, H / 2 + 118, 240, 52, () => { Credits.start(); state = 'credits'; }, time);
    }
  }

  function render() {
    UI.reset();
    if (state === 'credits') {
      Credits.draw(ctx, time);
      if (Credits.done) UI.button(ctx, 'VOLVER AL MENÚ', W / 2, H / 2 + 50, 360, 54, toCover, time);
      return;
    }
    if (state === 'cover') drawCover(); else { drawWorld(); drawPopups(); }
  }

  // ---------- Bucle ----------
  let last = performance.now();
  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.033); last = t; time += (state === 'play' ? 0 : dt);
    if (state === 'play') { update(dt); } else if (state === 'credits') Credits.update(dt); else if (state === 'results') resT += dt;
    updateFx(dt);
    render();
    requestAnimationFrame(frame);
  }

  const fontReady = document.fonts ? Promise.race([document.fonts.load('16px "Press Start 2P"'), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
  Assets.load(() => fontReady.then(() => { p = makePlayer(); loadLevel(0); requestAnimationFrame(frame); }));
})();
