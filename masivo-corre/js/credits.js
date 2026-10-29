// Créditos finales estilo Hollywood: fondo negro, letras grandes con brillo neón subiendo de abajo hacia arriba.
const Credits = {
  y: 0, done: false, gap: 120, speed: 60,
  start() { this.y = CONFIG.H + 60; this.done = false; },
  nameY(i) { return this.y + 110 + (i - 1) * this.gap; },
  update(dt) {
    this.y -= this.speed * dt;
    if (this.nameY(CONFIG.credits.length - 1) < -60) this.done = true;
  },
  draw(ctx, t) {
    const W = CONFIG.W, H = CONFIG.H;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    CONFIG.credits.forEach((s, i) => {
      const y = i === 0 ? this.y : this.nameY(i);
      if (y < -60 || y > H + 60) return;
      const color = i === 0 ? '#ffb300' : `hsl(${(t * 60 + i * 90) % 360},100%,65%)`;
      for (const blur of [32, 10]) { // doble pasada = brillo más intenso
        ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.fillStyle = color;
        ctx.font = CONFIG.font(i === 0 ? 32 : 48); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, W / 2, y);
      }
      ctx.shadowBlur = 0;
    });
    if (this.done) UI.text(ctx, 'GRACIAS POR JUGAR', W / 2, H / 2 - 20, 32, '#fff', 'center', '#00e5ff');
  }
};
