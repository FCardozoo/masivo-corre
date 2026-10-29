// Personajes: el sprite (torso) viene de tu imagen; las piernas se dibujan animadas con código.
// Ciclo de caminata, rebote del torso, inclinación, estiramiento al saltar y aplastamiento al aterrizar.
const Characters = {
  looks: {
    player: { leg: '#c68642', short: '#d52b1e', shoe: '#ffffff', lw: 10 },
    enemy:  { leg: '#2f4f86', short: '#243b66', shoe: '#4e342e', lw: 8 }
  },
  // kind: 'player' | 'enemy'. a = { x, y, w, h, face, vx, vy, onGround, phase, big, squash }
  draw(ctx, kind, a, cam, t, scale = 1) {
    const C = CONFIG, s = C.size[kind], lk = this.looks[kind], len = s.h - s.sprH, k = (a.big ? s.big : 1) * scale;
    const moving = a.onGround && Math.abs(a.vx || 0) > 1, air = !a.onGround, L2 = len / 2;
    const bob = moving ? Math.abs(Math.sin(a.phase)) * 3 : Math.sin(t * 3 + a.x) * 1.2;
    let sy = 1 + Math.min(Math.abs(a.vy || 0) / 3000, 0.15), sx = 2 - sy;       // estirar en el aire
    if (a.squash > 0) { sy = 1 - 1.5 * a.squash; sx = 2 - sy; }                    // aplastar al aterrizar
    ctx.save(); ctx.translate(a.x - cam + a.w / 2, a.y + a.h);
    ctx.scale((a.face || 1) * k * sx, k * sy);
    ctx.rotate((a.vx || 0) / C.SPEED * 0.07 + (kind === 'enemy' && moving ? Math.sin(a.phase) * 0.06 : 0));
    ctx.strokeStyle = lk.leg; ctx.lineWidth = lk.lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [0, 1].forEach(i => {
      const hx = i ? 8 : -8, ph = a.phase + i * Math.PI;
      const ang = air ? (i ? -0.5 : 0.6) : (moving ? Math.sin(ph) * 0.75 : 0);
      const lift = air ? 0.9 : (moving ? Math.max(0, Math.cos(ph)) * 0.9 : 0);
      const kx = hx + Math.sin(ang) * L2, ky = -len + Math.cos(ang) * L2, a2 = ang - lift;
      const fx = kx + Math.sin(a2) * L2, fy = ky + Math.cos(a2) * L2;
      ctx.beginPath(); ctx.moveTo(hx, -len + 2); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.fillStyle = lk.shoe; ctx.fillRect(fx - 4, fy - 4, 13, 6);
    });
    Assets.draw(ctx, kind, -s.sprW / 2, -len - s.sprH - bob + 2, s.sprW, s.sprH);
    ctx.fillStyle = lk.short; ctx.fillRect(-15, -len - 3, 30, 12);                 // short / cintura
    ctx.restore();
  }
};
