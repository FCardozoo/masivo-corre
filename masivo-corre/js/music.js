// Música de fondo: guarania lenta (La menor, 6/8, arpegios tipo guitarra + melodía).
// Si existe el archivo CONFIG.music (assets/audio/guarania.mp3) se usa ese; si no, se genera con Web Audio.
// Tecla M = silenciar / activar.
const Music = {
  on: true, started: false, fileOk: true, audio: null, ac: null, master: null, bar: 0, next: 0, S: 0.36,
  CH: [ // acordes por compás: b = bajo, a = bajo alterno, t = notas del arpegio (MIDI)
    { b: 45, a: 52, t: [60, 64] }, { b: 50, a: 57, t: [65, 69] }, { b: 52, a: 47, t: [56, 62] }, { b: 45, a: 52, t: [60, 64] },
    { b: 41, a: 48, t: [57, 65] }, { b: 50, a: 57, t: [65, 69] }, { b: 52, a: 47, t: [56, 62] }, { b: 45, a: 52, t: [60, 64] }
  ],
  MEL: [ // melodía: [nota MIDI, duración en corcheas], 6 por compás
    [[69,3],[72,2],[71,1]], [[74,3],[72,2],[69,1]], [[71,3],[68,2],[71,1]], [[69,6]],
    [[72,3],[69,2],[72,1]], [[74,3],[72,2],[69,1]], [[68,3],[71,2],[74,1]], [[72,3],[69,3]]
  ],
  start() {
    if (this.started) return; this.started = true;
    this.audio = new Audio(CONFIG.music); this.audio.loop = true; this.audio.volume = 0.1;
    this.audio.onerror = () => { this.fileOk = false; this.synth(); };
    this.audio.play().catch(() => { this.fileOk = false; this.synth(); });
  },
  toggle() {
    this.on = !this.on;
    Sfx.on = this.on;
    if (this.audio && this.fileOk) this.audio.muted = !this.on;
    if (this.master) this.master.gain.value = this.on ? 0.22 : 0;
  },
  synth() {
    if (this.ac) return;
    const ac = this.ac = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ac.createGain(); this.master.gain.value = this.on ? 0.22 : 0; this.master.connect(ac.destination);
    this.next = ac.currentTime + 0.2;
    setInterval(() => {
      while (this.next < ac.currentTime + 1) { this.playBar(this.bar, this.next); this.next += 6 * this.S; this.bar = (this.bar + 1) % 8; }
    }, 250);
  },
  hz: m => 440 * Math.pow(2, (m - 69) / 12),
  pluck(m, t, dur, vol) {
    const ac = this.ac, o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.value = this.hz(m); f.type = 'lowpass'; f.frequency.value = 1800;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(f); f.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  },
  lead(m, t, dur, vol) {
    const ac = this.ac, o = ac.createOscillator(), l = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = this.hz(m); l.frequency.value = 5; lg.gain.value = 3; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.08); g.gain.setValueAtTime(vol, t + dur - 0.1);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur + 0.15);
    o.connect(g); g.connect(this.master); o.start(t); l.start(t); o.stop(t + dur + 0.2); l.stop(t + dur + 0.2);
  },
  playBar(i, t) {
    const c = this.CH[i], S = this.S;
    [c.b, c.t[0], c.t[1], c.a, c.t[0], c.t[1]].forEach((m, k) => this.pluck(m, t + k * S, k === 0 ? 1.6 : 1.1, k === 0 ? 0.5 : 0.3));
    let k = 0; this.MEL[i].forEach(([m, n]) => { this.lead(m, t + k * S, n * S * 0.95, 0.22); k += n; });
  }
};
