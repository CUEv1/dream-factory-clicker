/*
Dream Factory Clicker - TODO Roadmap
- Main Orb clicker with floating number animation and custom cursor
- Dream energy counter and UI
- Generator system (Lucid Loom, Nightmare Forge, Starlight Siphon, etc.)
- Generator upgrades (10+ levels each)
- Prestige system (Lucidity Points, 5+ tiers)
- Upgrades/perks (click value, generator output, multipliers, time warp, etc.)
- Save/load system (localStorage)
- Export/import save data
- Animated UI: pulsing, glowing, wobbling buttons
- Progress bar for prestige
- Animated SVGs/CSS for generators
- Tabs/side menu for navigation (Main, Generators, Upgrades, Lucidity, Stats)
- Smooth transitions between screens
- Sound FX and ambient music (toggleable)
- Responsive layout (desktop/mobile)
- Glassmorphism and neon glow effects
- Parallax starfield/clouds background
*/
// Dream Factory Clicker - Initial JS
// Starfield background animation and app root setup

// Starfield animation
const starfield = document.getElementById('starfield');
const STAR_COUNT = 120;
let stars = [];

function createStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 2 + 1;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.position = 'absolute';
  star.style.top = `${Math.random() * 100}%`;
  star.style.left = `${Math.random() * 100}%`;
  star.style.background = 'white';
  star.style.opacity = Math.random() * 0.7 + 0.3;
  star.style.borderRadius = '50%';
  star.style.boxShadow = `0 0 ${size * 8}px #a7c7ff88`;
  starfield.appendChild(star);
  return {el: star, speed: Math.random() * 0.2 + 0.05};
}

function animateStars() {
  for (let s of stars) {
    let top = parseFloat(s.el.style.top);
    top += s.speed;
    if (top > 100) top = 0;
    s.el.style.top = `${top}%`;
  }
  requestAnimationFrame(animateStars);
}

function initStarfield() {
  starfield.innerHTML = '';
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
  }
  animateStars();
}

window.addEventListener('resize', initStarfield);

// --- Dream Orb Clicker Implementation ---
let dreamEnergy = 0;

function renderMainScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="main-orb-screen glass">
      <div id="energy-counter">${dreamEnergy.toLocaleString()} <span class="energy-unit">Dream Energy</span></div>
      <div id="dream-orb-container">
        <div id="dream-orb" tabindex="0" title="Tap to collect dream energy!"></div>
      </div>
    </div>
  `;
  document.getElementById('dream-orb').addEventListener('click', onOrbClick);
}

function onOrbClick(e) {
  dreamEnergy++;
  updateEnergyCounter();
  showFloatingNumber(e);
  // TODO: Play click sound
}

function updateEnergyCounter() {
  document.getElementById('energy-counter').innerHTML = `${dreamEnergy.toLocaleString()} <span class="energy-unit">Dream Energy</span>`;
}

function showFloatingNumber(e) {
  const orb = document.getElementById('dream-orb');
  const num = document.createElement('div');
  num.className = 'floating-number';
  num.textContent = '+1';
  orb.appendChild(num);
  setTimeout(() => {
    num.style.transform = 'translateY(-40px) scale(1.2)';
    num.style.opacity = '0';
  }, 10);
  setTimeout(() => {
    num.remove();
  }, 900);
}

// --- Generator System ---
const GENERATORS = [
  {
    id: 'lucid-loom',
    name: 'Lucid Loom',
    baseCost: 25,
    baseProduction: 0.2,
    description: 'Weaves gentle dreams into energy.',
    color: '#b3aaff',
    icon: '🧵',
  },
  {
    id: 'nightmare-forge',
    name: 'Nightmare Forge',
    baseCost: 120,
    baseProduction: 1.1,
    description: 'Harnesses nightmares for power.',
    color: '#ff7fae',
    icon: '🔥',
  },
  {
    id: 'starlight-siphon',
    name: 'Starlight Siphon',
    baseCost: 600,
    baseProduction: 5,
    description: 'Channels starlight into pure energy.',
    color: '#7fffd4',
    icon: '✨',
  },
];

let generatorState = {};
GENERATORS.forEach(gen => {
  generatorState[gen.id] = { count: 0, level: 1 };
});

function getGeneratorCost(id) {
  const gen = GENERATORS.find(g => g.id === id);
  const state = generatorState[id];
  // Exponential cost scaling per generator and upgrade level
  return Math.floor(gen.baseCost * Math.pow(1.18, state.count) * Math.pow(1.25, state.level-1));
}

function getGeneratorProduction(id) {
  const gen = GENERATORS.find(g => g.id === id);
  const state = generatorState[id];
  // Each level multiplies base production
  return gen.baseProduction * state.count * Math.pow(1.15, state.level-1);
}

function totalGeneratorProduction() {
  return GENERATORS.reduce((sum, gen) => sum + getGeneratorProduction(gen.id), 0);
}

function purchaseGenerator(id) {
  const cost = getGeneratorCost(id);
  if (dreamEnergy >= cost) {
    dreamEnergy -= cost;
    generatorState[id].count++;
    updateEnergyCounter();
    renderGeneratorsScreen();
    // TODO: Play purchase sound
  }
}

function upgradeGenerator(id) {
  const gen = GENERATORS.find(g => g.id === id);
  const state = generatorState[id];
  // Upgrade cost is higher than purchase cost
  const upgradeCost = Math.floor(gen.baseCost * 5 * Math.pow(2, state.level));
  if (dreamEnergy >= upgradeCost && state.level < 10) {
    dreamEnergy -= upgradeCost;
    state.level++;
    updateEnergyCounter();
    renderGeneratorsScreen();
    // TODO: Play upgrade sound
  }
}

// Auto-production tick
setInterval(() => {
  const prod = totalGeneratorProduction();
  if (prod > 0) {
    dreamEnergy += prod / 10; // 10 ticks per second
    updateEnergyCounter();
  }
}, 100);


// --- UI Navigation ---
let currentScreen = 'main'; // 'main' or 'generators'

function renderNavigation() {
  const app = document.getElementById('app-root');
  let nav = `<div class="nav-tabs">
    <button class="nav-btn" data-tab="main" ${currentScreen==='main'?'disabled':''}>Main Orb</button>
    <button class="nav-btn" data-tab="generators" ${currentScreen==='generators'?'disabled':''}>Generators</button>
  </div>`;
  app.insertAdjacentHTML('afterbegin', nav);
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      currentScreen = btn.dataset.tab;
      renderCurrentScreen();
    });
  });
}

function renderCurrentScreen() {
  if (currentScreen === 'main') {
    renderMainScreen();
  } else if (currentScreen === 'generators') {
    renderGeneratorsScreen();
  }
  renderNavigation();
}

// --- Generators Screen ---
function renderGeneratorsScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="generators-screen glass">
      <h2>Dream Generators</h2>
      <div class="generator-list">
        ${GENERATORS.map(gen => {
          const state = generatorState[gen.id];
          return `<div class="generator-card" style="--gen-color:${gen.color}">
            <div class="gen-icon">${gen.icon}</div>
            <div class="gen-info">
              <div class="gen-name">${gen.name}</div>
              <div class="gen-desc">${gen.description}</div>
              <div class="gen-owned">Owned: <b>${state.count}</b></div>
              <div class="gen-prod">Production: <b>${(getGeneratorProduction(gen.id)).toFixed(2)}</b>/sec</div>
              <button class="gen-buy-btn" data-id="${gen.id}">Buy<br><span>${getGeneratorCost(gen.id)}</span></button>
              <button class="gen-upg-btn" data-id="${gen.id}" ${state.level>=10?'disabled':''}>Upgrade<br><span>${state.level<10?getGeneratorUpgradeCost(gen.id):'Max'}</span></button>
              <div class="gen-level">Level: <b>${state.level}</b>/10</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
  // Add event listeners
  document.querySelectorAll('.gen-buy-btn').forEach(btn => {
    btn.addEventListener('click', () => purchaseGenerator(btn.dataset.id));
  });
  document.querySelectorAll('.gen-upg-btn').forEach(btn => {
    btn.addEventListener('click', () => upgradeGenerator(btn.dataset.id));
  });
}

function getGeneratorUpgradeCost(id) {
  const gen = GENERATORS.find(g => g.id === id);
  const state = generatorState[id];
  return Math.floor(gen.baseCost * 5 * Math.pow(2, state.level));
}

// Patch navigation into main screen
function renderMainScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="main-orb-screen glass">
      <div id="energy-counter">${dreamEnergy.toLocaleString()} <span class="energy-unit">Dream Energy</span></div>
      <div id="dream-orb-container">
        <div id="dream-orb" tabindex="0" title="Tap to collect dream energy!"></div>
      </div>
    </div>
  `;
  document.getElementById('dream-orb').addEventListener('click', onOrbClick);
}

// On load, render current screen
window.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  renderCurrentScreen();
}); 