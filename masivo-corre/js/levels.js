// 4 niveles. gaps = baches (caer = muerte). plats = techos de colectivo. movers = plataformas móviles.
// es = velocidad de enemigos. Las monedas sobre baches y plataformas se generan solas al final.
const LEVELS = [
  { length: 3000, es: 55, sky: ['#1e88e5', '#bfe8ff'], river: '#2fa4c4', tip: 'Salta los baches y pisa a los enemigos',
    gaps: [{x:650,w:100},{x:1250,w:110},{x:1900,w:120},{x:2450,w:130}],
    plats: [{x:850,y:285,w:110},{x:1550,y:280,w:120}], movers: [],
    mushrooms: [{x:880,y:255}],
    enemies: [{x:850,range:200},{x:1400,range:200},{x:2100,range:220}] },

  { length: 3600, es: 80, sky: ['#ff8f3c', '#ffe6a8'], river: '#3aa7b8', tip: 'Nuevo: ¡rebota en los resortes!', springs: [{x:1340}],
    gaps: [{x:600,w:110},{x:1100,w:120},{x:1600,w:130},{x:2100,w:130},{x:2650,w:140},{x:3100,w:130}],
    plats: [{x:780,y:285,w:120},{x:1850,y:270,w:130},{x:1300,y:150,w:150}], movers: [],
    mushrooms: [{x:1880,y:240}],
    enemies: [{x:760,range:200},{x:1250,range:260},{x:1780,range:240},{x:2260,range:300},{x:2820,range:200}] },

  { length: 4000, es: 105, sky: ['#6a2c91', '#ff8a5c'], river: '#b3507d', tip: 'Cuidado: tapas que se abren y saltarines',
    gaps: [{x:600,w:120},{x:1150,w:230},{x:1800,w:130},{x:2300,w:240},{x:2900,w:140,blink:1},{x:3400,w:140,blink:1}],
    plats: [{x:1950,y:275,w:110},{x:3000,y:270,w:120}],
    movers: [{cx:1265,y:305,w:90,amp:55,sp:1.6},{cx:2420,y:305,w:90,amp:55,sp:1.8}],
    mushrooms: [{x:3030,y:240}],
    enemies: [{x:760,range:250},{x:1450,range:250,hop:1},{x:1980,range:220},{x:2580,range:240,hop:1},{x:3080,range:240},{x:3560,range:250,hop:1}] },

  { length: 4600, es: 140, sky: ['#0b1030', '#4a3f9a'], river: '#233a82', night: 1, tip: '¡Esquiva las llantas que ruedan!', tires: 2.4, springs: [{x:2020}],
    gaps: [{x:550,w:120},{x:1000,w:240},{x:1650,w:140,blink:1},{x:2150,w:140,blink:1},{x:2600,w:250},{x:3250,w:140,blink:1},{x:3700,w:140,blink:1},{x:4050,w:240}],
    plats: [{x:800,y:280,w:100},{x:1800,y:270,w:100},{x:1960,y:150,w:140},{x:3400,y:275,w:110}],
    movers: [{cx:1120,y:305,w:80,amp:70,sp:2.2},{cx:2725,y:305,w:80,amp:70,sp:2.4},{cx:4170,y:305,w:80,amp:70,sp:2.6}],
    mushrooms: [{x:1830,y:240}],
    enemies: [{x:300,range:200},{x:720,range:200},{x:1300,range:260,hop:1},{x:1840,range:250},{x:2330,range:200,hop:1},{x:2900,range:280,hop:1},{x:3430,range:200},{x:3870,range:110,hop:1},{x:4330,range:100}] }
];

// Genera monedas automáticamente: un arco sobre cada bache y 3 sobre cada plataforma
LEVELS.forEach(L => {
  L.coins = [];
  L.gaps.forEach(g => [[.2,310],[.5,285],[.8,310]].forEach(([f, y]) => L.coins.push({ x: g.x + g.w * f, y })));
  L.plats.forEach(s => [.2,.5,.8].forEach(f => L.coins.push({ x: s.x + s.w * f, y: s.y - 26 })));
});
