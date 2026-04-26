'use strict';

const FIDGET_STORAGE_KEY = 'bran_fidget_stats';

function getFidgetStats() {
  try {
    return JSON.parse(localStorage.getItem(FIDGET_STORAGE_KEY)) ?? {
      bubblePops: 0,
      spinnerSpins: 0,
      dotLevel: 0,
      stressSqueezes: 0,
      stressTotalTime: 0,
    };
  } catch {
    return {};
  }
}

function saveFidgetStats(stats) {
  localStorage.setItem(FIDGET_STORAGE_KEY, JSON.stringify(stats));
}

/* ── Game 1: Bubble Pop ─────────────────────────────── */
class BubbleGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.bubbles = [];
    this.popCount = 0;
    this.init();
  }

  init() {
    this.loadStats();
    this.spawnBubbles();
    this.setupEventListeners();
  }

  loadStats() {
    const stats = getFidgetStats();
    this.popCount = stats.bubblePops ?? 0;
    this.updateDisplay();
  }

  spawnBubbles() {
    const bubbleCount = Math.floor(Math.random() * 3) + 5;
    for (let i = 0; i < bubbleCount; i++) {
      this.createBubble();
    }
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = Math.floor(Math.random() * 50) + 30;
    const left = Math.random() * (100 - (size / this.container.offsetWidth * 100)) + '%';
    const colors = ['#e87ca0', '#a78bfa', '#7dd3fc', '#f472b6', '#c084fc'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 2 + 3;

    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = left;
    bubble.style.bottom = '-100px';
    bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), ${color})`;
    bubble.style.animationDuration = duration + 's';

    bubble.addEventListener('click', (e) => this.popBubble(e, bubble));

    this.container.appendChild(bubble);
    bubble.offsetHeight;
    bubble.classList.add('bubble-animation');

    setTimeout(() => bubble.remove(), duration * 1000);
  }

  popBubble(e, bubble) {
    e.stopPropagation();
    bubble.classList.add('bubble-pop');
    this.createParticleBurst(e.clientX, e.clientY, bubble.style.background);
    this.popCount++;
    this.updateDisplay();
    this.saveStat();

    setTimeout(() => bubble.remove(), 600);
  }

  createParticleBurst(x, y, color) {
    const particleCount = Math.floor(Math.random() * 6) + 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.background = '#e87ca0';

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    }
  }

  updateDisplay() {
    const el = document.getElementById('bubble-count');
    if (el) el.textContent = this.popCount;
  }

  saveStat() {
    const stats = getFidgetStats();
    stats.bubblePops = this.popCount;
    saveFidgetStats(stats);
  }

  setupEventListeners() {
    setInterval(() => this.createBubble(), 2000);
  }
}

/* ── Game 2: Spinner Wheel ─────────────────────────── */
class SpinnerGame {
  constructor(containerId, wheelId) {
    this.container = document.getElementById(containerId);
    this.wheel = document.getElementById(wheelId);
    this.spinCount = 0;
    this.isSpinning = false;
    this.init();
  }

  init() {
    this.loadStats();
    this.setupWheel();
    this.setupEventListeners();
  }

  loadStats() {
    const stats = getFidgetStats();
    this.spinCount = stats.spinnerSpins ?? 0;
    this.updateDisplay();
  }

  setupWheel() {
    const pointer = document.createElement('div');
    pointer.className = 'spinner-pointer';
    this.wheel.appendChild(pointer);

    const center = document.createElement('div');
    center.className = 'spinner-center';
    this.wheel.appendChild(center);
  }

  setupEventListeners() {
    this.wheel.addEventListener('click', () => this.spin());
  }

  spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    const randomRotation = Math.floor(Math.random() * 360) + 1800;
    const duration = Math.random() * 2 + 2;

    this.wheel.style.setProperty('--rotation', randomRotation + 'deg');
    this.wheel.classList.add('spinning');
    this.wheel.style.transitionDuration = duration + 's';

    setTimeout(() => {
      this.wheel.classList.remove('spinning');
      this.isSpinning = false;
      this.spinCount++;
      this.updateDisplay();
      this.saveStat();

      const finalDegree = randomRotation % 360;
      this.getSegmentFromDegree(finalDegree);
    }, duration * 1000);
  }

  getSegmentFromDegree(degree) {
    const segments = ['Pink', 'Purple', 'Cyan', 'Light Pink', 'Lavender', 'Sky', 'Amber', 'Red'];
    const segment = Math.floor((degree + 22.5) / 45) % 8;
    return segments[segment];
  }

  updateDisplay() {
    const el = document.getElementById('spinner-count');
    if (el) el.textContent = this.spinCount;
  }

  saveStat() {
    const stats = getFidgetStats();
    stats.spinnerSpins = this.spinCount;
    saveFidgetStats(stats);
  }
}

/* ── Game 3: Dot Tapper ────────────────────────────── */
class DotTapperGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.gridContainer = this.container.querySelector('.dot-grid');
    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.score = 0;
    this.isAnimating = false;
    this.gameActive = false;
    this.init();
  }

  init() {
    this.loadStats();
    this.createGrid();
    this.startNewGame();
  }

  loadStats() {
    const stats = getFidgetStats();
    this.level = stats.dotLevel ?? 1;
    this.updateDisplay();
  }

  createGrid() {
    this.gridContainer.innerHTML = '';
    const colors = [
      '#e87ca0', '#a78bfa', '#7dd3fc', '#f472b6',
      '#c084fc', '#22d3ee', '#fbbf24', '#fb7185',
      '#f0ad4e', '#5cb85c', '#5bc0de', '#d9534f',
      '#8b5cf6', '#06b6d4', '#eab308', '#ec4899',
    ];

    for (let i = 0; i < 16; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.setProperty('--dot-color', colors[i]);
      dot.addEventListener('click', () => this.onDotClick(i));
      this.gridContainer.appendChild(dot);
    }
  }

  startNewGame() {
    this.sequence = [];
    this.playerSequence = [];
    this.gameActive = true;
    this.playSequence();
  }

  playSequence() {
    this.isAnimating = true;
    const newDot = Math.floor(Math.random() * 16);
    this.sequence.push(newDot);

    setTimeout(() => {
      this.sequence.forEach((dot, idx) => {
        setTimeout(() => this.lightDot(dot), idx * 600);
      });
      this.isAnimating = false;
    }, 800);
  }

  lightDot(dotIndex) {
    const dots = this.gridContainer.querySelectorAll('.dot');
    const dot = dots[dotIndex];
    dot.classList.add('lit');
    setTimeout(() => dot.classList.remove('lit'), 300);
  }

  onDotClick(dotIndex) {
    if (this.isAnimating || !this.gameActive) return;

    this.playerSequence.push(dotIndex);
    const dots = this.gridContainer.querySelectorAll('.dot');

    dots[dotIndex].style.opacity = '0.5';
    setTimeout(() => dots[dotIndex].style.opacity = '1', 100);

    if (this.playerSequence[this.playerSequence.length - 1] !==
        this.sequence[this.playerSequence.length - 1]) {
      this.wrongTap(dotIndex);
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      this.score += this.sequence.length;
      this.level++;
      this.updateDisplay();
      this.saveStat();
      this.playerSequence = [];
      setTimeout(() => this.playSequence(), 1000);
    }
  }

  wrongTap(dotIndex) {
    this.gameActive = false;
    const dots = this.gridContainer.querySelectorAll('.dot');
    dots[dotIndex].classList.add('wrong');
    setTimeout(() => {
      dots[dotIndex].classList.remove('wrong');
      this.startNewGame();
    }, 1000);
  }

  updateDisplay() {
    const levelEl = document.getElementById('dot-level');
    const scoreEl = document.getElementById('dot-score');
    if (levelEl) levelEl.textContent = this.level;
    if (scoreEl) scoreEl.textContent = this.score;
  }

  saveStat() {
    const stats = getFidgetStats();
    stats.dotLevel = Math.max(stats.dotLevel ?? 0, this.level);
    saveFidgetStats(stats);
  }
}

/* ── Game 4: Stress Ball ────────────────────────────– */
class StressBallGame {
  constructor(ballId, containerId) {
    this.ball = document.getElementById(ballId);
    this.container = document.getElementById(containerId);
    this.squeezeCount = 0;
    this.totalSqueezeTime = 0;
    this.isSqueezing = false;
    this.squeezeStartTime = 0;
    this.relaxingThreshold = 3000;
    this.init();
  }

  init() {
    this.loadStats();
    this.setupEventListeners();
    this.updateDisplay();
  }

  loadStats() {
    const stats = getFidgetStats();
    this.squeezeCount = stats.stressSqueezes ?? 0;
    this.totalSqueezeTime = stats.stressTotalTime ?? 0;
    this.updateDisplay();
  }

  setupEventListeners() {
    this.ball.addEventListener('mousedown', () => this.onSqueeze());
    this.ball.addEventListener('mouseup', () => this.onRelease());
    this.ball.addEventListener('touchstart', () => this.onSqueeze());
    this.ball.addEventListener('touchend', () => this.onRelease());
  }

  onSqueeze() {
    this.isSqueezing = true;
    this.squeezeStartTime = Date.now();
    this.ball.classList.add('squeezed');
    this.ball.style.cursor = 'grabbing';

    setTimeout(() => {
      if (this.isSqueezing) {
        this.ball.classList.add('relaxing');
      }
    }, this.relaxingThreshold);
  }

  onRelease() {
    if (!this.isSqueezing) return;

    this.isSqueezing = false;
    const squeezeDuration = Date.now() - this.squeezeStartTime;

    this.ball.classList.remove('squeezed', 'relaxing');
    this.ball.style.cursor = 'grab';

    this.createParticleBurst();

    this.squeezeCount++;
    this.totalSqueezeTime += squeezeDuration;
    this.updateDisplay();
    this.saveStat();
  }

  createParticleBurst() {
    const particleCount = 15;
    const rect = this.ball.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'stress-particle';

      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Math.random() * 120 + 60;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.width = Math.random() * 8 + 4 + 'px';
      particle.style.height = particle.style.width;
      particle.style.background = ['#e87ca0', '#a78bfa', '#7dd3fc'][Math.floor(Math.random() * 3)];

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    }
  }

  updateDisplay() {
    const countEl = document.getElementById('stress-count');
    const timeEl = document.getElementById('stress-time');
    if (countEl) countEl.textContent = this.squeezeCount;
    if (timeEl) timeEl.textContent = (this.totalSqueezeTime / 1000).toFixed(1);
  }

  saveStat() {
    const stats = getFidgetStats();
    stats.stressSqueezes = this.squeezeCount;
    stats.stressTotalTime = this.totalSqueezeTime;
    saveFidgetStats(stats);
  }
}

/* ── Initialization ─────────────────────────────────– */
document.addEventListener('DOMContentLoaded', () => {
  const bubbleGame = new BubbleGame('bubble-game');
  const spinnerGame = new SpinnerGame('spinner-game', 'spinner-wheel');
  const dotGame = new DotTapperGame('dot-tapper-game');
  const stressBallGame = new StressBallGame('stress-ball', 'stress-ball-game');
});
