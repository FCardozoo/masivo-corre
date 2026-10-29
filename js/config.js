// Configuración general. Para cambiar sprites: reemplaza los PNG en assets/img/ (mismo nombre) o edita las rutas.
const CONFIG = {
  W: 800, H: 450, GROUND: 380,
  GRAV: 1800, JUMP: 660, SPEED: 240, MAX_HP: 4,
  title: 'MASIVO CORRE',
  // Tipografía arcade pixelada (Google Fonts "Press Start 2P"; si no hay internet usa monospace)
  font: px => `${px}px "Press Start 2P", "Courier New", monospace`,
  music: 'assets/audio/AUD-20261029-WA0073.mp3', // opcional: si no existe, se genera una guarania lenta
  assets: {
    player:   'assets/img/player.png',
    enemy:    'assets/img/enemy.png',
    coin:     'assets/img/coin.png',
    mushroom: 'assets/img/mushroom.png'
  },
  // Tamaños: h total = sprite (torso) + piernas dibujadas. El protagonista es más grande que el villano.
  size: {
    player: { w: 44, h: 68, sprW: 52, sprH: 45, big: 1.3 },
    enemy:  { w: 40, h: 52, sprW: 43, sprH: 34 },
    coin: { w: 30, h: 27 }, mushroom: { w: 42, h: 28 }
  },
  colors: { player: '#2e7dff', enemy: '#8b1a1a', coin: '#ffd600', mushroom: '#e53935' },
  credits: ['Hecho con amor por:', 'Franco Cardozo', 'Ronald Alfonso', 'Romina Sarabia']
};
