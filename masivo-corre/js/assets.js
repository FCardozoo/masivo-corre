// Carga las imágenes. Si una no existe, dibuja un placeholder de color (el juego no se rompe).
const Assets = {
  images: {},
  load(done) {
    const names = Object.keys(CONFIG.assets);
    let left = names.length;
    const fin = () => { if (--left === 0) done(); };
    names.forEach(k => {
      const img = new Image();
      img.onload = () => { this.images[k] = img; fin(); };
      img.onerror = fin;
      img.src = CONFIG.assets[k];
    });
  },
  // Devuelve true si dibujó la imagen real, false si usó placeholder
  draw(ctx, key, x, y, w, h, flip) {
    const img = this.images[key];
    if (!img) {
      ctx.fillStyle = CONFIG.colors[key];
      if (key === 'coin') { ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, 7); ctx.fill(); }
      else ctx.fillRect(x, y, w, h);
      return false;
    }
    ctx.save();
    if (flip) { ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); }
    else ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    return true;
  }
};
