// Escenario: cielo, río, skyline, playa, palmeras, colectivo "Masivo", estación Petropar, calle y baches.
const Scenery = {
  hash(n) { const x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); },

  // th = datos del nivel: { sky:[arriba, abajo], river, night }
  back(ctx, cam, t, th) {
    const W = CONFIG.W, G = CONFIG.GROUND, hz = 215, night = th.night;
    const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
    if (night) { ctx.fillStyle = '#fff'; for (let i = 0; i < 60; i++) ctx.fillRect(this.hash(i) * W, this.hash(i + 99) * 170, 2, 2); }
    ctx.fillStyle = night ? '#fff6c9' : '#fff4b0'; ctx.beginPath(); ctx.arc(650, 70, 26, 0, 7); ctx.fill();
    ctx.fillStyle = night ? 'rgba(150,160,230,.3)' : 'rgba(255,255,255,.9)';        // nubes
    for (let i = 0; i < 6; i++) {
      const x = (((i * 270 - cam * .08 - t * 8) % 1620) + 1620) % 1620 - 220, y = 28 + this.hash(i) * 70;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + k * 26, y + (k % 2) * 7, 20 + (k % 3) * 6, 0, 7); ctx.fill(); }
    }
    ctx.fillStyle = night ? '#232a63' : '#7f9bbd';                                 // skyline lejano
    for (let i = 0; i < 40; i++) {
      const bx = (((i * 38 - cam * .15) % 1520) + 1520) % 1520 - 60, bh = 18 + this.hash(i + 3) * 50 * (i % 7 === 0 ? 1.8 : 1);
      ctx.fillRect(bx, hz - bh, 26, bh);
    }
    ctx.fillStyle = th.river; ctx.fillRect(0, hz, W, 58);                           // río
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 16; i++) ctx.fillRect((((i * 97 - cam * .25 + t * 18) % 900) + 900) % 900 - 50, hz + 8 + (i % 5) * 10, 28, 2);
    ctx.fillStyle = night ? '#6a5a55' : '#e6c58a'; ctx.fillRect(0, hz + 58, W, 38);   // playa
    ctx.fillStyle = night ? '#1d5a3a' : '#59ad45'; ctx.fillRect(0, hz + 96, W, G - hz - 96); // césped
    for (let i = 0; i < 5; i++) this.palm(ctx, (((i * 340 - cam * .4) % 1700) + 1700) % 1700 - 80, hz + 100);
    const f = .6, step = 470, first = Math.floor(cam * f / step) - 1;               // colectivos, árboles, Petropar
    for (let i = first; i < first + 4; i++) {
      const x = i * step - cam * f + 40, k = ((i % 3) + 3) % 3;
      if (k === 0) { this.petropar(ctx, x, G); this.tree(ctx, x + 330, G); }
      else if (k === 1) { this.bus(ctx, x, G); this.tree(ctx, x + 235, G); }
      else { this.tree(ctx, x, G); this.bus(ctx, x + 120, G); this.tree(ctx, x + 345, G); }
    }
  },

  palm(ctx, x, y) {
    ctx.strokeStyle = '#8d6236'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 70); ctx.stroke();
    ctx.strokeStyle = '#2e8b3a'; ctx.lineWidth = 4;
    for (let j = 0; j < 6; j++) {
      const a = j * Math.PI / 3, tx = x + 6, ty = y - 70;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * 22, ty + Math.sin(a) * 14 - 16, tx + Math.cos(a) * 40, ty + Math.sin(a) * 22 + 6); ctx.stroke();
    }
  },

  tree(ctx, x, y) {
    ctx.fillStyle = '#6d4c41'; ctx.fillRect(x + 14, y - 50, 8, 50);
    [[18, 74, 30, '#2e7d32'], [2, 60, 22, '#388e3c'], [36, 62, 22, '#43a047']].forEach(([dx, dy, r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + dx, y - dy, r, 0, 7); ctx.fill(); });
  },

  // Colectivo amarillo "Corredor-2" (vista lateral, mira a la derecha)
  bus(ctx, x, y) {
    ctx.fillStyle = '#f5c400'; ctx.fillRect(x, y - 70, 190, 58);
    ctx.fillStyle = '#ffd83a'; ctx.fillRect(x, y - 74, 186, 6);
    ctx.fillStyle = '#c99a00'; ctx.fillRect(x, y - 18, 190, 8);
    ctx.fillStyle = '#111'; ctx.fillRect(x + 176, y - 16, 16, 8);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#2b323a'; ctx.fillRect(x + 12 + i * 30, y - 62, 24, 26);
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + 14 + i * 30, y - 60, 8, 10);
    }
    ctx.fillStyle = '#2b323a'; ctx.fillRect(x + 160, y - 64, 26, 34);                    // parabrisas
    ctx.fillStyle = '#111'; ctx.fillRect(x + 160, y - 72, 26, 7);                         // cartel de destino
    ctx.fillStyle = '#ff3b30'; ctx.fillRect(x + 163, y - 70, 20, 2);
    ctx.fillStyle = '#f29a9a'; ctx.fillRect(x + 46, y - 32, 90, 11);                      // etiqueta CORREDOR-2
    ctx.fillStyle = '#b3001b'; ctx.font = CONFIG.font(8); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('CORREDOR-2', x + 50, y - 26); ctx.fillText('201', x + 8, y - 28);
    ctx.fillStyle = '#ffb74d'; ctx.fillRect(x + 184, y - 28, 5, 8);                       // faro
    [40, 142].forEach(o => {
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(x + o, y - 11, 16, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(x + o, y - 10, 13, 0, 7); ctx.fill();
      ctx.fillStyle = '#9e9e9e'; ctx.beginPath(); ctx.arc(x + o, y - 10, 6, 0, 7); ctx.fill();
    });
  },

  // Estación Petropar: techo blanco con franja azul, columnas azules con banda roja, cartel con chevrones
  petropar(ctx, x, y) {
    ctx.fillStyle = '#1f3fbf'; ctx.fillRect(x, y - 132, 300, 8);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x, y - 124, 300, 16);
    ctx.fillStyle = '#cfd4da'; ctx.fillRect(x + 6, y - 108, 288, 5);
    [30, 140, 250].forEach(o => {
      ctx.fillStyle = '#1a3aa8'; ctx.fillRect(x + o, y - 103, 14, 103);
      ctx.fillStyle = '#d52b1e'; ctx.fillRect(x + o - 2, y - 60, 18, 14);
    });
    [85, 195].forEach(o => { ctx.fillStyle = '#1a3aa8'; ctx.fillRect(x + o, y - 40, 14, 40); ctx.fillStyle = '#d52b1e'; ctx.fillRect(x + o, y - 46, 14, 8); });
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 6, y - 168, 150, 40);                       // cartel
    ctx.fillStyle = '#d52b1e'; ctx.fillRect(x - 6, y - 168, 50, 4);
    ctx.fillStyle = '#1f3fbf'; ctx.fillRect(x + 44, y - 168, 100, 4);
    ctx.fillStyle = '#1f3fbf'; ctx.font = CONFIG.font(12); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Petropar', x, y - 144);
    [['#d52b1e', 0], ['#2e9c3f', 15]].forEach(([c, d]) => {                              // chevrones
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + 108 + d, y - 160); ctx.lineTo(x + 117 + d, y - 160); ctx.lineTo(x + 126 + d, y - 146);
      ctx.lineTo(x + 117 + d, y - 132); ctx.lineTo(x + 108 + d, y - 132); ctx.lineTo(x + 116 + d, y - 146); ctx.fill();
    });
  },

  road(ctx, cam) {
    const W = CONFIG.W, G = CONFIG.GROUND, H = CONFIG.H;
    ctx.fillStyle = '#3d4348'; ctx.fillRect(0, G, W, H - G);
    ctx.fillStyle = '#c9ced2'; ctx.fillRect(0, G, W, 6);
    ctx.fillStyle = '#4d555c'; for (let i = 0; i < 50; i++) ctx.fillRect((((i * 53 - cam) % W) + W) % W, G + 10 + this.hash(i) * 55, 2, 2);
    ctx.fillStyle = '#fdd835'; for (let x = -(cam % 80); x < W; x += 80) ctx.fillRect(x, G + 44, 40, 4);
  },

  // Bache con profundidad. estado: 'open' (hueco), 'closed' (tapa), 'warn' (tapa a punto de abrirse)
  pothole(ctx, sx, w, t, estado) {
    const G = CONFIG.GROUND, H = CONFIG.H, h = H - G;
    if (estado !== 'open') {
      const sh = estado === 'warn' ? Math.sin(t * 60) * 1.5 : 0;
      ctx.fillStyle = estado === 'warn' && Math.floor(t * 8) % 2 ? '#ff7043' : '#8a9096'; ctx.fillRect(sx - 2, G + sh, w + 4, 9);
      ctx.fillStyle = '#212121'; for (let x = sx; x < sx + w - 10; x += 20) ctx.fillRect(x, G + 2 + sh, 10, 5);
      return;
    }
    ctx.fillStyle = '#120d09'; ctx.fillRect(sx, G, w, h);
    const wall = ctx.createLinearGradient(0, G, 0, H); wall.addColorStop(0, '#8a6644'); wall.addColorStop(1, '#2a1c12');
    ctx.fillStyle = wall; ctx.beginPath(); ctx.moveTo(sx, G); ctx.lineTo(sx + w, G); ctx.lineTo(sx + w * .86, H); ctx.lineTo(sx + w * .14, H); ctx.closePath(); ctx.fill();
    const deep = ctx.createRadialGradient(sx + w / 2, H, 4, sx + w / 2, H, w * .65);
    deep.addColorStop(0, 'rgba(0,0,0,.95)'); deep.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = deep; ctx.fillRect(sx, G, w, h);
    ctx.fillStyle = 'rgba(70,120,150,.85)'; ctx.beginPath(); ctx.ellipse(sx + w / 2, H - 8, w * .3, 5, 0, 0, 7); ctx.fill();   // charco
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1; ctx.beginPath();
    ctx.ellipse(sx + w / 2, H - 8, w * .1 + (Math.sin(t * 3) + 1) * w * .06, 3, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = '#262b2f'; ctx.fillRect(sx, G, w, 9);                                                                        // corte del asfalto
    for (let k = 0; k < 6; k++) {                                                                                                // bordes rotos
      const px = sx - 4 + k * (w + 8) / 5, jh = 5 + this.hash(sx * .1 + k) * 9;
      ctx.beginPath(); ctx.moveTo(px - 6, G); ctx.lineTo(px, G + jh); ctx.lineTo(px + 6, G); ctx.fill();
    }
    ctx.fillStyle = '#ff6d00'; ctx.beginPath(); ctx.moveTo(sx - 28, G); ctx.lineTo(sx - 12, G); ctx.lineTo(sx - 20, G - 22); ctx.fill();   // cono
    ctx.fillStyle = '#fff'; ctx.fillRect(sx - 23, G - 12, 7, 3);
  }
};
