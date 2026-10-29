// Efectos de sonido generados con Web Audio (sin archivos). Uso: Sfx.play('coin')
// Nombres: coin, eat, hurt, jump, stomp, spring, fall, clear, over, click
const Sfx = {
  ac: null, master: null, on: true,
  init() {
    if (!this.ac) {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      this.ac = new A(); this.master = this.ac.createGain(); this.master.gain.value = 0.35; this.master.connect(this.ac.destination);
    }
    if (this.ac.state === 'suspended') this.ac.resume();
  },
  tone(f, t, d, type = 'square', v = 0.2, f2) {
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + 0.02);
  },
  play(n) {
    if (!this.on || !this.ac) return;
    const t = this.ac.currentTime, T = (...a) => this.tone(...a);
    const S = {
      coin:   () => { T(988, t, .07); T(1319, t + .07, .3); },                                   // moneda (tereré)
      eat:    () => [523, 659, 784, 1047, 1319].forEach((f, i) => T(f, t + i * .07, .12, 'triangle', .25)), // chipa: +1 vida
      hurt:   () => { T(440, t, .45, 'sawtooth', .3, 70); T(110, t + .05, .3, 'square', .25, 50); },    // pierde un corazón
      jump:   () => T(280, t, .14, 'square', .12, 640),
      stomp:  () => T(220, t, .1, 'square', .2, 70),
      spring: () => T(180, t, .3, 'sine', .35, 900),
      fall:   () => T(900, t, .6, 'sine', .3, 90),
      clear:  () => [523, 659, 784, 1047].forEach((f, i) => T(f, t + i * .12, i === 3 ? .5 : .14, 'square', .2)),
      over:   () => [392, 330, 262, 196].forEach((f, i) => T(f, t + i * .22, .3, 'sawtooth', .25)),
      click:  () => T(660, t, .06, 'square', .15)
    };
    if (S[n]) S[n]();
  }
};
