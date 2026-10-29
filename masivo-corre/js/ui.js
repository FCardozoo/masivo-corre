// Interfaz: texto pixelado (con brillo), botones clicables/táctiles, panel, HUD e indicador de progreso.
const UI = {
  buttons: [],
  reset() { this.buttons = []; },

  text(ctx, s, x, y, px, color, align = 'center', glow) {
    ctx.font = CONFIG.font(px); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 18; }
    ctx.fillText(s, x, y); ctx.shadowBlur = 0;
  },

  outlined(ctx, s, x, y, px, fill, stroke, glow) {
    ctx.font = CONFIG.font(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke; ctx.lineWidth = px / 3; if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 22; }
    ctx.strokeText(s, x, y); ctx.shadowBlur = 0; ctx.fillStyle = fill; ctx.fillText(s, x, y);
  },

  button(ctx, label, cx, cy, w, h, cb, t) {
    const x = cx - w / 2, y = cy - h / 2, pulse = (Math.sin(t * 6) + 1) / 2;
    ctx.fillStyle = '#4a2c00'; ctx.fillRect(x + 4, y + 5, w, h);
    ctx.fillStyle = `rgb(255,${200 + (pulse * 30 | 0)},40)`; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#4a2c00'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x + 6, y + 6, w - 12, 6);
    this.text(ctx, label, cx, cy + 2, 16, '#3a1d00');
    this.buttons.push({ x, y, w, h, cb });
  },

  click(px, py) {
    const b = this.buttons.find(b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
    if (b) { Sfx.play('click'); b.cb(); return true; }
    return false;
  },

  panel(ctx, cx, cy, w, h) {
    const x = cx - w / 2, y = cy - h / 2;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
    ctx.fillStyle = '#0d1140'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = '#d52b1e'; ctx.lineWidth = 2; ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  },

  heart(ctx, x, y, s, full) {
    const P = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
    P.forEach((row, r) => [...row].forEach((c, i) => {
      if (c === '1') { ctx.fillStyle = full ? (r === 1 && i === 1 ? '#ff8a80' : '#e53935') : '#3a3a3a'; ctx.fillRect(x + i * s, y + r * s, s, s); }
    }));
  },

  fmt(sec) { const m = Math.floor(sec / 60); return String(m).padStart(2, '0') + ':' + (sec % 60).toFixed(1).padStart(4, '0'); },

  // d = { hp, max, coins, time, lvl, total }
  hud(ctx, d) {
    ctx.save(); ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    for (let i = 0; i < d.max; i++) this.heart(ctx, 12 + i * 34, 12, 4, i < d.hp);
    Assets.draw(ctx, 'coin', 12, 44, 22, 20); this.text(ctx, 'x ' + d.coins, 42, 55, 12, '#fff', 'left');
    this.text(ctx, this.fmt(d.time), 12, 80, 12, '#fff', 'left');
    ctx.restore(); this.progress(ctx, d.lvl, d.total);
  },

  // Indicador de progreso: nodos por nivel (verde = superado, amarillo = actual) y cuántos faltan
  progress(ctx, lvl, total) {
    const gap = 52, x0 = CONFIG.W - 22 - (total - 1) * gap, y = 26;
    ctx.lineCap = 'butt'; ctx.lineWidth = 5; ctx.strokeStyle = '#455a64'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (total - 1) * gap, y); ctx.stroke();
    ctx.strokeStyle = '#66bb6a'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + lvl * gap, y); ctx.stroke();
    for (let i = 0; i < total; i++) {
      const cx = x0 + i * gap, cur = i === lvl;
      ctx.fillStyle = i < lvl ? '#66bb6a' : cur ? '#ffd54f' : '#546e7a';
      ctx.beginPath(); ctx.arc(cx, y, cur ? 13 : 10, 0, 7); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.stroke();
      this.text(ctx, String(i + 1), cx + 1, y + 1, cur ? 12 : 8, '#000');
    }
    this.text(ctx, lvl === total - 1 ? '¡ÚLTIMO NIVEL!' : `FALTAN ${total - 1 - lvl}`, CONFIG.W - 14, 54, 12, '#fff', 'right', '#000');
  }
};
