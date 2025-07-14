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
const STAR_COUNT = 80; // Reduced star count for less visual complexity
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
  return {el: star, speed: Math.random() * 0.05 + 0.01}; // Much slower speeds
}

function animateStars() {
  for (let s of stars) {
    let top = parseFloat(s.el.style.top);
    top += s.speed * starfieldSpeed; // Apply speed multiplier (now up to 2x)
    if (top > 100) top = 0;
    s.el.style.top = `${top}%`;
  }
  // Adjust frame rate based on speed
  const frameDelay = starfieldSpeed === 0 ? 1000 : Math.max(20, 100 - (starfieldSpeed * 40));
  setTimeout(() => requestAnimationFrame(animateStars), frameDelay);
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

// --- Clicker Upgrade System ---
let clickerUpgrades = {
  clickValue: 1, // Base click value
  clickValueLevel: 0 // Current upgrade level
};

const CLICKER_UPGRADES = [
  {
    id: 'click-value',
    name: 'Dream Touch',
    description: 'Increase energy gained per click',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: (level) => level + 1, // Each level adds 1 to click value
    maxLevel: 20
  }
];



// --- Prestige (Lucidity) System ---
let lucidityPoints = 0;
let totalPrestiges = 0;

function calculatePrestigeProgress() {
  const totalEnergy = dreamEnergy + totalGeneratorProduction() * 10; // Estimate current session
  const baseRequirement = 1000; // Base requirement for first prestige
  const requirement = baseRequirement * Math.pow(1.5, totalPrestiges);
  return Math.min(totalEnergy / requirement, 1);
}

function calculateLucidityGain() {
  const totalEnergy = dreamEnergy + totalGeneratorProduction() * 10;
  const baseRequirement = 1000;
  const requirement = baseRequirement * Math.pow(1.5, totalPrestiges);
  return Math.floor(totalEnergy / requirement);
}

function canPrestige() {
  return calculatePrestigeProgress() >= 1;
}

function prestige() {
  if (!canPrestige()) return;

  // Debug log
  console.log('[DEBUG] Prestige function called.');

  // Show warning confirmation
  const confirmed = confirm('Are you sure? Prestiging will reset ALL Dream Energy, Generators, and Upgrades, but you\'ll gain Lucidity Points for permanent bonuses.');
  if (!confirmed) return;

  const lucidityGain = calculateLucidityGain();
  lucidityPoints += lucidityGain;
  totalPrestiges++;

  // Reset current progress
  dreamEnergy = 0;
  GENERATORS.forEach(gen => {
    generatorState[gen.id] = { count: 0, level: 1 };
  });
  // Reset all clicker upgrades to initial state
  clickerUpgrades = { clickValue: 1, clickValueLevel: 0 };
  // Reset all upgrade levels for each upgrade in CLICKER_UPGRADES
  CLICKER_UPGRADES.forEach(upg => {
    clickerUpgrades[upg.id + 'Level'] = 0;
    // If the upgrade affects a stat (like clickValue), reset it to its base effect
    if (upg.id === 'click-value') {
      clickerUpgrades.clickValue = upg.effect(0);
    }
  });

  // Save the reset state
  saveGame();

  updateEnergyCounter();
  renderCurrentScreen();

  // Now create the particles, anchored to the prestige section
  createPrestigeParticles();

  playSound('prestige');

  setTimeout(() => {
    const particles = document.querySelector('.prestige-particles');
    if (particles) particles.remove();
  }, 3000);
}

function createPrestigeParticles() {
  // Anchor to the center of the prestige-section on the Lucidity screen
  const prestigeSection = document.querySelector('.prestige-section');
  if (!prestigeSection) return;
  const sectionRect = prestigeSection.getBoundingClientRect();

  // Add scroll position to coordinates
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  const centerX = sectionRect.left + sectionRect.width / 2 + scrollX;
  const centerY = sectionRect.top + sectionRect.height / 2 + scrollY;

  const particles = document.createElement('div');
  particles.className = 'prestige-particles';

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'prestige-particle';

    // Random angle and distance
    const angle = (Math.PI * 2 * i) / 20;
    const distance = 100 + Math.random() * 50;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance - 100;

    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;

    // Animate to (endX, endY) using transform
    particle.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${endX - centerX}px,${endY - centerY}px) scale(1.5)`, opacity: 0 }
    ], {
      duration: 3000,
      delay: Math.random() * 500,
      fill: 'forwards'
    });

    particles.appendChild(particle);
  }

  document.body.appendChild(particles);
}

function getLucidityMultiplier() {
  return 1 + (lucidityPoints * 0.1); // 10% per Lucidity Point
}

// Update click value with Lucidity multiplier and clicker upgrades
function onOrbClick(e) {
  const baseClickValue = clickerUpgrades.clickValue;
  const clickValue = Math.floor(baseClickValue * getLucidityMultiplier());
  dreamEnergy += clickValue;
  gameStats.totalClicks++;
  gameStats.totalEnergyEarned += clickValue;
  updateEnergyCounter();
  showFloatingNumber(e, clickValue);
  playSound('click');
}

function updateEnergyCounter() {
  const energyCounter = document.getElementById('energy-counter');
  if (energyCounter) {
    energyCounter.innerHTML = `${dreamEnergy.toLocaleString()} <span class="energy-unit">Dream Energy</span>`;
  }
}

// --- Utility: Reduced Motion Support ---
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Utility: Safe localStorage ---
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}
function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
    return null;
  }
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
  // New generators (locked until prestige)
  {
    id: 'dream-reactor',
    name: 'Dream Reactor',
    baseCost: 3500,
    baseProduction: 22,
    description: 'Converts lucid dreams into raw energy.',
    color: '#ffd700',
    icon: '⚛️',
    requiresPrestige: true,
  },
  {
    id: 'astral-engine',
    name: 'Astral Engine',
    baseCost: 18000,
    baseProduction: 110,
    description: 'Taps into astral currents for immense power.',
    color: '#00e5ff',
    icon: '🚀',
    requiresPrestige: true,
  },
  {
    id: 'cosmic-loom',
    name: 'Cosmic Loom',
    baseCost: 95000,
    baseProduction: 600,
    description: 'Weaves the fabric of the cosmos into energy.',
    color: '#ff69b4',
    icon: '🪐',
    requiresPrestige: true,
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



// Auto-production tick
setInterval(() => {
  const prod = totalGeneratorProduction();
  if (prod > 0) {
    dreamEnergy += prod / 10; // 10 ticks per second
    updateEnergyCounter();
  }
}, 100);


// --- UI Navigation ---
let currentScreen = 'main'; // 'main', 'generators', 'lucidity', or 'settings'

function renderNavigation() {
  const app = document.getElementById('app-root');
  let nav = `<div class="nav-tabs">
    <button class="nav-btn" data-tab="main" ${currentScreen==='main'?'disabled':''}>Main Orb</button>
    <button class="nav-btn" data-tab="generators" ${currentScreen==='generators'?'disabled':''}>Generators</button>
    <button class="nav-btn" data-tab="upgrades" ${currentScreen==='upgrades'?'disabled':''}>Upgrades</button>
    <button class="nav-btn" data-tab="lucidity" ${currentScreen==='lucidity'?'disabled':''}>Lucidity</button>
    <button class="nav-btn" data-tab="stats" ${currentScreen==='stats'?'disabled':''}>Stats</button>
    <button class="nav-btn" data-tab="settings" ${currentScreen==='settings'?'disabled':''}>Settings</button>
  </div>`;
  app.insertAdjacentHTML('afterbegin', nav);
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (btn.dataset.tab !== currentScreen) {
        playSound('menu'); // Play menu switch sound
      }
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
  } else if (currentScreen === 'upgrades') {
    renderUpgradesScreen();
  } else if (currentScreen === 'lucidity') {
    renderLucidityScreen();
  } else if (currentScreen === 'stats') {
    renderStatisticsScreen();
  } else if (currentScreen === 'settings') {
    renderSettingsScreen();
  }
  renderNavigation();
}

// --- Generators Screen ---
// --- Animated Generator Graphics ---
const GENERATOR_ANIMATIONS = {
  'lucid-loom': {
    svg: `<svg class="gen-animation" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#b3aaff" stroke-width="3" class="outer-ring"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="#e0b3ff" stroke-width="2" class="inner-ring"/>
      <circle cx="50" cy="50" r="8" fill="#b3aaff" class="center-dot"/>
      <g class="gear-group">
        <circle cx="30" cy="30" r="8" fill="none" stroke="#b3aaff" stroke-width="2" class="gear"/>
        <circle cx="70" cy="30" r="8" fill="none" stroke="#b3aaff" stroke-width="2" class="gear"/>
        <circle cx="30" cy="70" r="8" fill="none" stroke="#b3aaff" stroke-width="2" class="gear"/>
        <circle cx="70" cy="70" r="8" fill="none" stroke="#b3aaff" stroke-width="2" class="gear"/>
      </g>
    </svg>`,
    class: 'lucid-animation'
  },
  'nightmare-forge': {
    svg: `<svg class="gen-animation" viewBox="0 0 100 100">
      <rect x="30" y="40" width="40" height="20" fill="none" stroke="#ff7fae" stroke-width="3" class="forge-frame"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="#ff7fae" stroke-width="2" class="fire-ring"/>
      <g class="flame-group">
        <path d="M45 45 L50 35 L55 45" fill="#ff7fae" class="flame"/>
        <path d="M40 50 L45 40 L50 50" fill="#ffb3d9" class="flame"/>
        <path d="M50 50 L55 40 L60 50" fill="#ffb3d9" class="flame"/>
      </g>
    </svg>`,
    class: 'nightmare-animation'
  },
  'starlight-siphon': {
    svg: `<svg class="gen-animation" viewBox="0 0 100 100">
      <polygon points="50,20 60,40 80,40 65,55 70,75 50,65 30,75 35,55 20,40 40,40" fill="none" stroke="#7fffd4" stroke-width="2" class="star"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#7fffd4" stroke-width="1" stroke-dasharray="5,5" class="orbit-ring"/>
      <g class="particle-group">
        <circle cx="20" cy="30" r="2" fill="#7fffd4" class="particle"/>
        <circle cx="80" cy="70" r="2" fill="#7fffd4" class="particle"/>
        <circle cx="30" cy="80" r="2" fill="#7fffd4" class="particle"/>
        <circle cx="70" cy="20" r="2" fill="#7fffd4" class="particle"/>
      </g>
    </svg>`,
    class: 'starlight-animation'
  }
};

// Update generator rendering to include animations
function renderGeneratorsScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="generators-screen glass">
      <h2>Dream Generators</h2>
      <div class="generator-list">
        ${GENERATORS.map(gen => {
          const state = generatorState[gen.id];
          const animation = GENERATOR_ANIMATIONS[gen.id];
          const currentProduction = getGeneratorProduction(gen.id);
          const nextProduction = gen.baseProduction * (state.count + 1) * Math.pow(1.15, state.level - 1);
          const productionIncrease = nextProduction - currentProduction;
          const locked = gen.requiresPrestige && totalPrestiges === 0;
          if (locked) {
            return `<div class="generator-card locked" style="--gen-color:${gen.color}">
              <div class="gen-animation-container">
                <span style="font-size:2.5em;">🔒</span>
              </div>
              <div class="gen-info">
                <div class="gen-name">${gen.name}</div>
                <div class="gen-desc">${gen.description}</div>
                <div class="gen-locked-msg">Unlocks after your first Prestige!</div>
              </div>
            </div>`;
          }
          return `<div class="generator-card ${animation ? animation.class : ''}" style="--gen-color:${gen.color}">
            <div class="gen-animation-container">
              ${animation ? animation.svg : gen.icon}
            </div>
            <div class="gen-info">
              <div class="gen-name">${gen.name}</div>
              <div class="gen-desc">${gen.description}</div>
              <div class="gen-owned">Owned: <b>${state.count}</b></div>
              <div class="gen-prod">Production: <b>${currentProduction.toFixed(2)}</b>/sec</div>
              <div class="gen-preview">Next purchase: <b>+${productionIncrease.toFixed(2)}</b>/sec</div>
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

function updateGeneratorsDisplay() {
  // Only update the generator content without re-rendering the entire screen
  const generatorList = document.querySelector('.generator-list');
  if (generatorList) {
    generatorList.innerHTML = GENERATORS.map(gen => {
      const state = generatorState[gen.id];
      const animation = GENERATOR_ANIMATIONS[gen.id];
      const currentProduction = getGeneratorProduction(gen.id);
      const nextProduction = gen.baseProduction * (state.count + 1) * Math.pow(1.15, state.level - 1);
      const productionIncrease = nextProduction - currentProduction;
      const locked = gen.requiresPrestige && totalPrestiges === 0;
      if (locked) {
        return `<div class="generator-card locked" style="--gen-color:${gen.color}">
          <div class="gen-animation-container">
            <span style="font-size:2.5em;">🔒</span>
          </div>
          <div class="gen-info">
            <div class="gen-name">${gen.name}</div>
            <div class="gen-desc">${gen.description}</div>
            <div class="gen-locked-msg">Unlocks after your first Prestige!</div>
          </div>
        </div>`;
      }
      return `<div class="generator-card ${animation ? animation.class : ''}" style="--gen-color:${gen.color}">
        <div class="gen-animation-container">
          ${animation ? animation.svg : gen.icon}
        </div>
        <div class="gen-info">
          <div class="gen-name">${gen.name}</div>
          <div class="gen-desc">${gen.description}</div>
          <div class="gen-owned">Owned: <b>${state.count}</b></div>
          <div class="gen-prod">Production: <b>${currentProduction.toFixed(2)}</b>/sec</div>
          <div class="gen-preview">Next purchase: <b>+${productionIncrease.toFixed(2)}</b>/sec</div>
          <button class="gen-buy-btn" data-id="${gen.id}">Buy<br><span>${getGeneratorCost(gen.id)}</span></button>
          <button class="gen-upg-btn" data-id="${gen.id}" ${state.level>=10?'disabled':''}>Upgrade<br><span>${state.level<10?getGeneratorUpgradeCost(gen.id):'Max'}</span></button>
          <div class="gen-level">Level: <b>${state.level}</b>/10</div>
        </div>
      </div>`;
    }).join('');
    
    // Re-add event listeners
    document.querySelectorAll('.gen-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => purchaseGenerator(btn.dataset.id));
    });
    document.querySelectorAll('.gen-upg-btn').forEach(btn => {
      btn.addEventListener('click', () => upgradeGenerator(btn.dataset.id));
    });
  }
}

function getGeneratorUpgradeCost(id) {
  const gen = GENERATORS.find(g => g.id === id);
  const state = generatorState[id];
  return Math.floor(gen.baseCost * 5 * Math.pow(2, state.level));
}

// --- Clicker Upgrade Functions ---
function getUpgradeCost(upgradeId) {
  const upgrade = CLICKER_UPGRADES.find(u => u.id === upgradeId);
  const currentLevel = clickerUpgrades[upgradeId + 'Level'] || 0;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

function canAffordUpgrade(upgradeId) {
  return dreamEnergy >= getUpgradeCost(upgradeId);
}

function purchaseUpgrade(upgradeId) {
  const upgrade = CLICKER_UPGRADES.find(u => u.id === upgradeId);
  const currentLevel = clickerUpgrades[upgradeId + 'Level'] || 0;
  
  if (currentLevel >= upgrade.maxLevel) return;
  if (!canAffordUpgrade(upgradeId)) return;
  
  const cost = getUpgradeCost(upgradeId);
  dreamEnergy -= cost;
  
  // Update upgrade level
  clickerUpgrades[upgradeId + 'Level'] = currentLevel + 1;
  
  // Update the actual effect
  if (upgradeId === 'click-value') {
    clickerUpgrades.clickValue = upgrade.effect(clickerUpgrades[upgradeId + 'Level']);
  }
  
  // Track upgrade purchase in stats
  gameStats.upgradesPurchased++;
  
  updateEnergyCounter();
  renderCurrentScreen();
  playSound('purchase'); // FIX: Add sound effect
}

// --- Upgrades Screen ---
function renderUpgradesScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="upgrades-screen glass">
      <h2>Dream Upgrades</h2>
      <div class="upgrade-list">
        ${CLICKER_UPGRADES.map(upgrade => {
          const currentLevel = clickerUpgrades[upgrade.id + 'Level'] || 0;
          const cost = getUpgradeCost(upgrade.id);
          const canAfford = canAffordUpgrade(upgrade.id);
          const isMaxed = currentLevel >= upgrade.maxLevel;
          
          let currentEffect = 0;
          if (upgrade.id === 'click-value') {
            currentEffect = clickerUpgrades.clickValue;
          }
          
          let nextEffect = 0;
          if (!isMaxed) {
            nextEffect = upgrade.effect(currentLevel + 1);
          }
          
          return `<div class="upgrade-card" style="--upgrade-color: #b3aaff">
            <div class="upgrade-icon">✨</div>
            <div class="upgrade-info">
              <div class="upgrade-name">${upgrade.name}</div>
              <div class="upgrade-desc">${upgrade.description}</div>
              <div class="upgrade-level">Level: <b>${currentLevel}</b>/${upgrade.maxLevel}</div>
              <div class="upgrade-effect">Current: <b>+${currentEffect}</b> per click</div>
              ${!isMaxed ? `<div class="upgrade-next">Next: <b>+${nextEffect}</b> per click</div>` : ''}
              <button class="upgrade-btn ${canAfford && !isMaxed ? '' : 'disabled'}" data-id="${upgrade.id}" ${isMaxed ? 'disabled' : ''}>
                ${isMaxed ? 'Maxed' : `Upgrade<br><span>${cost}</span>`}
              </button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
  
  // Add event listeners
  document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) {
        purchaseUpgrade(btn.dataset.id);
      }
    });
  });
}

// --- Lucidity Screen ---
function renderLucidityScreen() {
  const progress = calculatePrestigeProgress();
  const canPrestigeNow = canPrestige();
  const lucidityGain = calculateLucidityGain();
  
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="lucidity-screen glass">
      <h2>Lucidity Points</h2>
      <div class="lucidity-stats">
        <div class="stat-item">
          <span class="stat-label">Current Lucidity:</span>
          <span class="stat-value">${lucidityPoints}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Prestiges:</span>
          <span class="stat-value">${totalPrestiges}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Click Multiplier:</span>
          <span class="stat-value">${getLucidityMultiplier().toFixed(1)}x</span>
        </div>
      </div>
      
      <div class="prestige-section">
        <h3>Prestige Progress</h3>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress * 100}%"></div>
          </div>
          <div class="progress-text">${Math.floor(progress * 100)}%</div>
        </div>
        <div class="prestige-info">
          <p>Next prestige will grant: <b>${lucidityGain}</b> Lucidity Points</p>
          <button class="prestige-btn ${canPrestigeNow ? 'ready' : 'disabled'}" ${canPrestigeNow ? '' : 'disabled'}>
            ${canPrestigeNow ? 'PRESTIGE NOW!' : 'Not Ready Yet'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add prestige button event listener
  const prestigeBtn = document.querySelector('.prestige-btn');
  if (prestigeBtn && canPrestigeNow) {
    prestigeBtn.addEventListener('click', prestige);
  }
}

// --- Settings Screen ---
function renderSettingsScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="settings-screen glass">
      <h2>Settings</h2>
      
      <div class="settings-section">
        <h3>Save & Load</h3>
        <div class="setting-item">
          <label>Auto-save every 30 seconds</label>
          <div class="status-indicator">✓ Active</div>
        </div>
        
        <div class="setting-item">
          <button class="export-btn" onclick="exportSave()">Export Save Data</button>
          <p class="setting-desc">Copy this string to backup your progress</p>
        </div>
        
        <div class="setting-item">
          <label>Import Save Data:</label>
          <input type="text" id="import-input" placeholder="Paste save data here..." />
          <button class="import-btn" onclick="importSave()">Import</button>
        </div>
        
        <div class="setting-item">
          <button class="reset-btn" onclick="resetGame()">Reset Game</button>
          <p class="setting-desc warning">⚠️ This will permanently delete all progress!</p>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Game Info</h3>
        <div class="setting-item">
          <span>Version:</span>
          <span>1.0.0</span>
        </div>
        <div class="setting-item">
          <span>Last Save:</span>
          <span id="last-save-time">${new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}

function exportSave() {
  const saveData = exportSaveData();
  const textArea = document.createElement('textarea');
  textArea.value = saveData;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  
  alert('Save data copied to clipboard! You can paste this string to backup your progress.');
}

function importSave() {
  const importInput = document.getElementById('import-input');
  const saveString = importInput.value.trim();
  
  if (!saveString) {
    alert('Please paste save data first!');
    return;
  }
  
  if (importSaveData(saveString)) {
    alert('Save data imported successfully!');
    importInput.value = '';
  } else {
    alert('Invalid save data! Please check the string and try again.');
  }
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
  // Add click event listener to the orb
  const orb = document.getElementById('dream-orb');
  if (orb) {
    orb.addEventListener('click', onOrbClick);
    addOrbAccessibility(); // Call this after the orb is rendered
  }
}

// --- Save/Load System ---
const SAVE_KEY = 'dreamFactorySave';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

function saveGame() {
  const saveData = {
    dreamEnergy,
    lucidityPoints,
    totalPrestiges,
    generatorState,
    clickerUpgrades,
    gameStats,
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    menuVolume,
    starfieldSpeed,
    lastSaveTime: Date.now()
  };
  
  try {
    safeSetItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('Game saved successfully');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

function loadGame() {
  try {
    const saveString = safeGetItem(SAVE_KEY);
    if (saveString) {
      const saveData = JSON.parse(saveString);
      
      dreamEnergy = saveData.dreamEnergy || 0;
      lucidityPoints = saveData.lucidityPoints || 0;
      totalPrestiges = saveData.totalPrestiges || 0;
      generatorState = saveData.generatorState || {};
      clickerUpgrades = saveData.clickerUpgrades || { clickValue: 1, clickValueLevel: 0 };
      gameStats = saveData.gameStats || gameStats;
      
      // Load audio settings
      soundEnabled = saveData.soundEnabled !== undefined ? saveData.soundEnabled : true;
      musicEnabled = saveData.musicEnabled !== undefined ? saveData.musicEnabled : true;
      soundVolume = saveData.soundVolume !== undefined ? saveData.soundVolume : 1.0;
      musicVolume = saveData.musicVolume !== undefined ? saveData.musicVolume : 1.0;
      menuVolume = saveData.menuVolume !== undefined ? saveData.menuVolume : 1.0;
      starfieldSpeed = saveData.starfieldSpeed !== undefined ? saveData.starfieldSpeed : 1;
      
      // Ensure all generators exist in state
      GENERATORS.forEach(gen => {
        if (!generatorState[gen.id]) {
          generatorState[gen.id] = { count: 0, level: 1 };
        }
      });
      
      console.log('Game loaded successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
  return false;
}

function exportSaveData() {
  const saveData = {
    dreamEnergy,
    lucidityPoints,
    totalPrestiges,
    generatorState,
    clickerUpgrades,
    gameStats,
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    menuVolume,
    starfieldSpeed,
    exportTime: Date.now()
  };
  return btoa(JSON.stringify(saveData)); // Base64 encode
}

function importSaveData(importString) {
  try {
    const saveData = JSON.parse(atob(importString)); // Base64 decode
    
    dreamEnergy = saveData.dreamEnergy || 0;
    lucidityPoints = saveData.lucidityPoints || 0;
    totalPrestiges = saveData.totalPrestiges || 0;
    generatorState = saveData.generatorState || {};
    clickerUpgrades = saveData.clickerUpgrades || { clickValue: 1, clickValueLevel: 0 };
    gameStats = saveData.gameStats || gameStats;
    
    // Load audio settings
    soundEnabled = saveData.soundEnabled !== undefined ? saveData.soundEnabled : true;
    musicEnabled = saveData.musicEnabled !== undefined ? saveData.musicEnabled : true;
    soundVolume = saveData.soundVolume !== undefined ? saveData.soundVolume : 1.0;
    musicVolume = saveData.musicVolume !== undefined ? saveData.musicVolume : 1.0;
    menuVolume = saveData.menuVolume !== undefined ? saveData.menuVolume : 1.0;
    starfieldSpeed = saveData.starfieldSpeed !== undefined ? saveData.starfieldSpeed : 1;
    
    // Ensure all generators exist in state
    GENERATORS.forEach(gen => {
      if (!generatorState[gen.id]) {
        generatorState[gen.id] = { count: 0, level: 1 };
      }
    });
    
    updateEnergyCounter();
    renderCurrentScreen();
    console.log('Save data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import save data:', error);
    return false;
  }
}

function resetGame() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
    dreamEnergy = 0;
    lucidityPoints = 0;
    totalPrestiges = 0;
    clickerUpgrades = { clickValue: 1, clickValueLevel: 0 };
    gameStats = {
      totalClicks: 0,
      totalEnergyEarned: 0,
      timePlayed: 0,
      totalPrestiges: 0,
      generatorsPurchased: 0,
      upgradesPurchased: 0,
      startTime: Date.now()
    };
    // Reset audio settings to defaults
    soundEnabled = true;
    musicEnabled = true;
    soundVolume = 1.0;
    musicVolume = 1.0;
    menuVolume = 1.0;
    starfieldSpeed = 1; // Reset starfield speed to default
    GENERATORS.forEach(gen => {
      generatorState[gen.id] = { count: 0, level: 1 };
    });
    safeSetItem(SAVE_KEY, ''); // Clear saved data
    updateEnergyCounter();
    renderCurrentScreen();
    console.log('Game reset successfully');
  }
}

// Auto-save timer
setInterval(saveGame, AUTO_SAVE_INTERVAL);

// Save on page unload
window.addEventListener('beforeunload', saveGame);

// --- Sound System ---
const SOUNDS = {
  click: new Audio('assets/sounds/click.mp3'),
  purchase: new Audio('assets/sounds/purchase.mp3'),
  prestige: new Audio('assets/sounds/prestige.mp3'),
  ambient: new Audio('assets/sounds/ambient.mp3'),
  menu: new Audio('assets/sounds/menu.mp3'), // New menu switch sound
};
SOUNDS.ambient.loop = true;
SOUNDS.ambient.volume = 0.4;

let soundEnabled = true;
let musicEnabled = true;
let soundVolume = 1.0; // 100% default
let musicVolume = 1.0; // 100% default
let menuVolume = 1.0; // 100% default
let starfieldSpeed = 1; // 1 = normal, 2 = double speed

function playSound(name) {
  if (soundEnabled && SOUNDS[name]) {
    try {
      SOUNDS[name].currentTime = 0;
      // Apply appropriate volume based on sound type
      if (name === 'ambient') {
        SOUNDS[name].volume = musicVolume;
      } else if (name === 'menu') {
        SOUNDS[name].volume = menuVolume;
      } else if (name === 'prestige') {
        SOUNDS[name].volume = soundVolume * 0.25; // 25% of SFX volume
      } else {
        SOUNDS[name].volume = soundVolume;
      }
      SOUNDS[name].play().catch(e => {
        console.warn(`Could not play sound ${name}:`, e);
      });
    } catch (e) {
      console.warn(`Error playing sound ${name}:`, e);
    }
  }
}

function initializeAudio() {
  // Check if audio files exist and handle gracefully
  Object.keys(SOUNDS).forEach(soundName => {
    SOUNDS[soundName].addEventListener('error', () => {
      console.warn(`Audio file for ${soundName} could not be loaded`);
    });
  });
}

function playMusic() {
  if (musicEnabled) {
    SOUNDS.ambient.volume = musicVolume;
    SOUNDS.ambient.play();
  }
}
function stopMusic() {
  SOUNDS.ambient.pause();
  SOUNDS.ambient.currentTime = 0;
}

function updateMusicVolume(volume) {
  musicVolume = volume;
  if (musicEnabled) {
    SOUNDS.ambient.volume = musicVolume;
  }
}

function updateSoundVolume(volume) {
  soundVolume = volume;
  // Update all sound effect volumes
  SOUNDS.click.volume = soundVolume;
  SOUNDS.purchase.volume = soundVolume;
  SOUNDS.prestige.volume = soundVolume;
}

function updateMenuVolume(volume) {
  menuVolume = volume;
  SOUNDS.menu.volume = menuVolume;
}

// --- Integrate sounds into game actions ---
// Play purchase/upgrade sound
function purchaseGenerator(id) {
  const gen = GENERATORS.find(g => g.id === id);
  if (gen.requiresPrestige && totalPrestiges === 0) return;
  const cost = getGeneratorCost(id);
  if (dreamEnergy >= cost) {
    dreamEnergy -= cost;
    generatorState[id].count++;
    gameStats.generatorsPurchased++;
    updateEnergyCounter();
    updateGeneratorsDisplay();
    playSound('purchase');
  }
}
function upgradeGenerator(id) {
  const gen = GENERATORS.find(g => g.id === id);
  if (gen.requiresPrestige && totalPrestiges === 0) return;
  const state = generatorState[id];
  const upgradeCost = Math.floor(gen.baseCost * 5 * Math.pow(2, state.level));
  if (dreamEnergy >= upgradeCost && state.level < 10) {
    dreamEnergy -= upgradeCost;
    state.level++;
    gameStats.upgradesPurchased++;
    updateEnergyCounter();
    updateGeneratorsDisplay();
    playSound('purchase');
  }
}

// --- Game Statistics ---
let gameStats = {
  totalClicks: 0,
  totalEnergyEarned: 0,
  timePlayed: 0,
  totalPrestiges: 0,
  generatorsPurchased: 0,
  upgradesPurchased: 0,
  startTime: Date.now()
};

function updateStats() {
  gameStats.timePlayed = Date.now() - gameStats.startTime;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// --- Statistics Screen ---
function renderStatisticsScreen() {
  updateStats();
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="statistics-screen glass">
      <h2>Statistics</h2>
      
      <div class="stats-section">
        <h3>Game Progress</h3>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${gameStats.totalClicks.toLocaleString()}</div>
            <div class="stat-label">Total Clicks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${gameStats.totalEnergyEarned.toLocaleString()}</div>
            <div class="stat-label">Energy Earned</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatTime(gameStats.timePlayed)}</div>
            <div class="stat-label">Time Played</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${gameStats.totalPrestiges}</div>
            <div class="stat-label">Prestiges</div>
          </div>
        </div>
      </div>
      
      <div class="stats-section">
        <h3>Purchases</h3>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${gameStats.generatorsPurchased}</div>
            <div class="stat-label">Generators Bought</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${gameStats.upgradesPurchased}</div>
            <div class="stat-label">Upgrades Bought</div>
          </div>
        </div>
      </div>
      
      <div class="stats-section">
        <h3>Current Status</h3>
        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-label">Current Energy:</span>
            <span class="stat-value">${dreamEnergy.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Lucidity Points:</span>
            <span class="stat-value">${lucidityPoints}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Click Multiplier:</span>
            <span class="stat-value">${getLucidityMultiplier().toFixed(1)}x</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Click Value:</span>
            <span class="stat-value">+${clickerUpgrades.clickValue}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Production:</span>
            <span class="stat-value">${totalGeneratorProduction().toFixed(2)}/sec</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- Settings Screen: Add sound/music toggles and volume sliders ---
function renderSettingsScreen() {
  const app = document.getElementById('app-root');
  app.innerHTML = `
    <div class="settings-screen glass">
      <h2>Settings</h2>
      <div class="settings-section">
        <h3>Audio</h3>
        <div class="setting-item">
          <div class="volume-control">
            <span class="volume-label">Sound Effects:</span>
            <input type="range" id="sound-volume" min="0" max="1" step="0.1" value="${soundVolume}" />
            <span class="volume-display">${Math.round(soundVolume * 100)}%</span>
            <button class="mute-btn ${soundEnabled ? '' : 'muted'}" id="sound-mute">${soundEnabled ? 'Mute' : 'Unmute'}</button>
          </div>
        </div>
        <div class="setting-item">
          <div class="volume-control">
            <span class="volume-label">Background Music:</span>
            <input type="range" id="music-volume" min="0" max="1" step="0.1" value="${musicVolume}" />
            <span class="volume-display">${Math.round(musicVolume * 100)}%</span>
            <button class="mute-btn ${musicEnabled ? '' : 'muted'}" id="music-mute">${musicEnabled ? 'Mute' : 'Unmute'}</button>
          </div>
        </div>
        <div class="setting-item">
          <div class="volume-control">
            <span class="volume-label">Menu Sounds:</span>
            <input type="range" id="menu-volume" min="0" max="1" step="0.1" value="${menuVolume}" />
            <span class="volume-display">${Math.round(menuVolume * 100)}%</span>
          </div>
        </div>
        <div class="setting-item">
          <div class="volume-control">
            <span class="volume-label">Starfield Speed:</span>
            <input type="range" id="starfield-speed" min="1" max="2" step="0.01" value="${starfieldSpeed}" />
            <span class="volume-display" id="starfield-speed-display">${Math.round((starfieldSpeed - 1) * 100)}%</span>
          </div>
        </div>
      </div>
      <div class="settings-section">
        <h3>Save & Load</h3>
        <div class="setting-item">
          <label>Auto-save every 30 seconds</label>
          <div class="status-indicator">✓ Active</div>
        </div>
        <div class="setting-item">
          <button class="export-btn" onclick="exportSave()">Export Save Data</button>
          <p class="setting-desc">Copy this string to backup your progress</p>
        </div>
        <div class="setting-item">
          <label>Import Save Data:</label>
          <input type="text" id="import-input" placeholder="Paste save data here..." />
          <button class="import-btn" onclick="importSave()">Import</button>
        </div>
        <div class="setting-item">
          <button class="reset-btn" onclick="resetGame()">Reset Game</button>
          <p class="setting-desc warning">⚠️ This will permanently delete all progress!</p>
        </div>
      </div>
      <div class="settings-section">
        <h3>Game Info</h3>
        <div class="setting-item">
          <span>Version:</span>
          <span>1.0.0</span>
        </div>
        <div class="setting-item">
          <span>Last Save:</span>
          <span id="last-save-time">${new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
  
  // Volume slider event listeners
  const soundVolumeSlider = document.getElementById('sound-volume');
  const musicVolumeSlider = document.getElementById('music-volume');
  const menuVolumeSlider = document.getElementById('menu-volume');
  const starfieldSpeedSlider = document.getElementById('starfield-speed');

  if (soundVolumeSlider) {
    soundVolumeSlider.addEventListener('input', e => {
      const volume = parseFloat(e.target.value);
      updateSoundVolume(volume);
      e.target.nextElementSibling.textContent = Math.round(volume * 100) + '%';
      saveGame(); // Save immediately when volume changes
    });
  }

  if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener('input', e => {
      const volume = parseFloat(e.target.value);
      updateMusicVolume(volume);
      e.target.nextElementSibling.textContent = Math.round(volume * 100) + '%';
      saveGame(); // Save immediately when volume changes
    });
  }

  if (menuVolumeSlider) {
    menuVolumeSlider.addEventListener('input', e => {
      const volume = parseFloat(e.target.value);
      updateMenuVolume(volume);
      e.target.nextElementSibling.textContent = Math.round(volume * 100) + '%';
      saveGame(); // Save immediately when volume changes
    });
  }

  if (starfieldSpeedSlider) {
    starfieldSpeedSlider.addEventListener('input', e => {
      starfieldSpeed = parseFloat(e.target.value);
      const display = document.getElementById('starfield-speed-display');
      if (display) {
        display.textContent = Math.round((starfieldSpeed - 1) * 100) + '%';
      }
      saveGame();
    });
  }
  
  // Mute button event listeners
  const soundMuteBtn = document.getElementById('sound-mute');
  const musicMuteBtn = document.getElementById('music-mute');

  if (soundMuteBtn) {
    soundMuteBtn.addEventListener('click', e => {
      soundEnabled = !soundEnabled;
      e.target.textContent = soundEnabled ? 'Mute' : 'Unmute';
      e.target.classList.toggle('muted', !soundEnabled);
      if (soundEnabled) playSound('click');
      saveGame(); // Save immediately when mute state changes
    });
  }

  if (musicMuteBtn) {
    musicMuteBtn.addEventListener('click', e => {
      musicEnabled = !musicEnabled;
      e.target.textContent = musicEnabled ? 'Mute' : 'Unmute';
      e.target.classList.toggle('muted', !musicEnabled);
      if (musicEnabled) playMusic();
      else stopMusic();
      saveGame(); // Save immediately when mute state changes
    });
  }
}

// --- Keyboard Accessibility for Orb ---
function addOrbAccessibility() {
  const orb = document.getElementById('dream-orb');
  if (orb) {
    orb.setAttribute('tabindex', '0');
    orb.setAttribute('role', 'button');
    orb.setAttribute('aria-label', 'Dream Orb: Click or press Space/Enter to gain energy');
    orb.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onOrbClick(e);
      }
    });
  }
}

// --- Add ARIA attributes to dynamic elements where relevant (e.g., floating numbers, buttons) ---
const FLOATING_NUMBER_ANIMATION_DISTANCE = 40;
const FLOATING_NUMBER_ANIMATION_DURATION = 900;
function showFloatingNumber(e, value = 1) {
  const orb = document.getElementById('dream-orb');
  const num = document.createElement('div');
  num.className = 'floating-number';
  num.textContent = `+${value}`;
  num.setAttribute('aria-live', 'polite');
  orb.appendChild(num);
  if (!prefersReducedMotion) {
    setTimeout(() => {
      num.style.transform = `translateY(-${FLOATING_NUMBER_ANIMATION_DISTANCE}px) scale(1.2)`;
      num.style.opacity = '0';
    }, 10);
    setTimeout(() => {
      num.remove();
    }, FLOATING_NUMBER_ANIMATION_DURATION);
  } else {
    setTimeout(() => num.remove(), 300);
  }
}

// Mobile touch improvements
function addMobileTouchSupport() {
  // Prevent double-tap zoom on buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
    }, { passive: false });
  });
  
  // Prevent zoom on input elements
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('touchstart', e => {
      e.preventDefault();
    }, { passive: false });
  });
}

// Start music on load if enabled
window.addEventListener('DOMContentLoaded', () => {
  initializeAudio();
  const loaded = loadGame();
  initStarfield();
  renderCurrentScreen();
  addMobileTouchSupport();
  if (musicEnabled) playMusic();
  if (loaded) {
    console.log('Previous save found and loaded');
  } else {
    console.log('Starting new game');
  }
}); 