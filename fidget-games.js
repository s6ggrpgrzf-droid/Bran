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
    return { bubblePops: 0, spinnerSpins: 0, dotLevel: 0, stressSqueezes: 0, stressTotalTime: 0 };
  }
}

function saveFidgetStats(stats) {
  localStorage.setItem(FIDGET_STORAGE_KEY, JSON.stringify(stats));
}

/* ── Game 1: Bubble Pop ─────────────────────────────── */
class BubbleGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.popCount = 0;
    this.lastPopTime = 0;
    this.comboCount = 0;
    this.comboTimer = null;
    this.init();
  }

  init() {
    this.loadStats();
    for (let i = 0; i < 7; i++) this.createBubble();
    setInterval(() => this.createBubble(), 1800);
  }

  loadStats() {
    const stats = getFidgetStats();
    this.popCount = stats.bubblePops ?? 0;
    this.updateDisplay();
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = Math.floor(Math.random() * 55) + 28;
    const maxLeft = Math.max(0, this.container.offsetWidth - size);
    const left = Math.floor(Math.random() * maxLeft);
    const colors = [
      ['#fce7f3', '#e87ca0'],
      ['#ede9fe', '#a78bfa'],
      ['#e0f2fe', '#7dd3fc'],
      ['#fdf2f8', '#f472b6'],
      ['#f3e8ff', '#c084fc'],
    ];
    const [light, main] = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 2 + 3.5;

    bubble.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}px; bottom:-80px;
      background: radial-gradient(circle at 30% 28%, rgba(255,255,255,0.75) 0%, ${light} 35%, ${main} 80%);
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: inset 0 1px 4px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.08);
      animation-duration:${duration}s;
    `;
    bubble.classList.add('bubble-animation');

    const floatTimer = setTimeout(() => bubble.remove(), duration * 1000);

    bubble.addEventListener('click', (e) => {
      clearTimeout(floatTimer);
      this.popBubble(e, bubble);
    }, { once: true });

    this.container.appendChild(bubble);
  }

  popBubble(e, bubble) {
    e.stopPropagation();

    const rect    = bubble.getBoundingClientRect();
    const size    = rect.width;
    const contRect = this.container.getBoundingClientRect();
    const relLeft = rect.left - contRect.left;
    const relTop  = rect.top  - contRect.top;

    bubble.style.animation = 'none';
    bubble.classList.add('bubble-pop');

    // Ring shockwave — positioned relative to container
    const ring = document.createElement('div');
    ring.className = 'pop-ring';
    ring.style.cssText = `
      width:${size}px; height:${size}px;
      left:${relLeft}px; top:${relTop}px;
    `;
    this.container.appendChild(ring);
    setTimeout(() => ring.remove(), 520);

    this.createParticleBurst(e.clientX, e.clientY);
    this.trackCombo(relLeft + size / 2, relTop);
    this.popCount++;
    this.updateDisplay();
    this.saveStat();
    setTimeout(() => bubble.remove(), 500);
    setTimeout(() => this.createBubble(), 500);
  }

  trackCombo(cx, cy) {
    const now = Date.now();
    if (now - this.lastPopTime < 1500) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastPopTime = now;

    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => { this.comboCount = 0; }, 1600);

    if (this.comboCount >= 2) this.showCombo(cx, cy, this.comboCount);
  }

  showCombo(cx, cy, n) {
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.textContent = `×${n} Combo!`;
    el.style.cssText = `left:${cx}px; top:${cy}px; transform: translateX(-50%);`;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), 920);
  }

  createParticleBurst(x, y) {
    const colors = ['#e87ca0', '#a78bfa', '#7dd3fc', '#f472b6'];
    const count = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = (i / count) * Math.PI * 2;
      const v = Math.random() * 80 + 50;
      p.style.cssText = `
        left:${x}px; top:${y}px;
        width:${Math.random() * 5 + 4}px; height:${Math.random() * 5 + 4}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        --tx:${(Math.cos(angle) * v).toFixed(1)}px;
        --ty:${(Math.sin(angle) * v).toFixed(1)}px;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
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
}

/* ── Game 2: Spinner Wheel ─────────────────────────── */
class SpinnerGame {
  constructor(containerId, wheelId) {
    this.container = document.getElementById(containerId);
    this.wheel = document.getElementById(wheelId);
    this.spinCount = 0;
    this.isSpinning = false;
    this.totalRotation = 0;
    this.init();
  }

  init() {
    this.loadStats();
    this.buildWheel();
    this.container.style.cursor = 'pointer';
    this.container.addEventListener('click', () => this.spin());
  }

  loadStats() {
    const stats = getFidgetStats();
    this.spinCount = stats.spinnerSpins ?? 0;
    this.updateDisplay();
  }

  buildWheel() {
    const pointer = document.createElement('div');
    pointer.className = 'spinner-pointer';

    const center = document.createElement('div');
    center.className = 'spinner-center';
    center.textContent = '✦';

    this.wheel.appendChild(pointer);
    this.wheel.appendChild(center);

    this.wheel.style.transition = 'none';
    this.wheel.style.transform = 'rotate(0deg)';
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const extra = Math.floor(Math.random() * 360) + 1800;
    this.totalRotation += extra;
    const duration = (Math.random() * 2 + 2.5).toFixed(2);

    this.wheel.style.transition = `transform ${duration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
    this.wheel.style.transform = `rotate(${this.totalRotation}deg)`;
    this.wheel.classList.add('spinning-glow');

    setTimeout(() => {
      this.wheel.classList.remove('spinning-glow');
      this.isSpinning = false;
      this.spinCount++;
      this.updateDisplay();
      this.saveStat();

      const segment = this.getSegmentName(this.totalRotation % 360);
      const resultEl = document.getElementById('spinner-result');
      if (resultEl) resultEl.textContent = segment;
    }, duration * 1000);
  }

  getSegmentName(deg) {
    const names = ['Pink', 'Purple', 'Cyan', 'Rose', 'Violet', 'Sky', 'Amber', 'Red'];
    return names[Math.floor(((deg % 360) + 22.5) / 45) % 8];
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
    this.gridEl = this.container.querySelector('.dot-grid');
    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.score = 0;
    this.isPlaying = false;
    this.gameActive = false;
    this.init();
  }

  init() {
    this.loadStats();
    this.createGrid();
    setTimeout(() => this.startNewGame(), 600);
  }

  loadStats() {
    const stats = getFidgetStats();
    this.level = Math.max(stats.dotLevel ?? 1, 1);
    this.updateDisplay();
  }

  createGrid() {
    this.gridEl.innerHTML = '';
    const colors = [
      '#e87ca0','#a78bfa','#7dd3fc','#f472b6',
      '#c084fc','#22d3ee','#fbbf24','#fb7185',
      '#f0ad4e','#5cb85c','#5bc0de','#d9534f',
      '#8b5cf6','#06b6d4','#eab308','#ec4899',
    ];
    for (let i = 0; i < 16; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.dataset.idx = i;
      dot.style.setProperty('--dot-color', colors[i]);
      dot.addEventListener('click', () => this.onDotClick(i));
      this.gridEl.appendChild(dot);
    }
  }

  setStatus(msg) {
    const el = document.getElementById('dot-status');
    if (el) el.textContent = msg;
  }

  startNewGame() {
    this.sequence = [];
    this.playerSequence = [];
    this.gameActive = true;
    this.nextRound();
  }

  nextRound() {
    this.playerSequence = [];
    const newDot = Math.floor(Math.random() * 16);
    this.sequence.push(newDot);
    this.setStatus('Watch carefully...');
    this.playSequence();
  }

  playSequence() {
    this.isPlaying = true;
    const totalTime = 800 + this.sequence.length * 650;

    setTimeout(() => {
      this.sequence.forEach((dotIdx, i) => {
        const isLast = i === this.sequence.length - 1;
        setTimeout(() => {
          this.lightDot(dotIdx);
          if (isLast) {
            setTimeout(() => {
              this.isPlaying = false;
              this.setStatus('Your turn!');
            }, 450);
          }
        }, i * 650);
      });
    }, 800);

    setTimeout(() => {}, totalTime); // keep alive
  }

  lightDot(idx) {
    const dot = this.gridEl.children[idx];
    if (!dot) return;
    dot.classList.add('lit');
    setTimeout(() => dot.classList.remove('lit'), 380);
  }

  onDotClick(idx) {
    if (this.isPlaying || !this.gameActive) return;

    const dot = this.gridEl.children[idx];
    const pos = this.playerSequence.length;
    this.playerSequence.push(idx);

    if (idx !== this.sequence[pos]) {
      this.wrongTap(dot);
      return;
    }

    dot.classList.add('correct');
    setTimeout(() => dot.classList.remove('correct'), 300);

    if (this.playerSequence.length === this.sequence.length) {
      this.score += this.sequence.length;
      this.level++;
      this.updateDisplay();
      this.saveStat();
      this.setStatus('Nice! Next round...');
      setTimeout(() => this.nextRound(), 1000);
    }
  }

  wrongTap(dot) {
    this.gameActive = false;
    this.isPlaying = false;
    dot.classList.add('wrong');
    this.setStatus('Oops! Starting over...');
    setTimeout(() => {
      dot.classList.remove('wrong');
      this.level = 1;
      this.score = 0;
      this.updateDisplay();
      this.startNewGame();
    }, 1200);
  }

  updateDisplay() {
    const lEl = document.getElementById('dot-level');
    const sEl = document.getElementById('dot-score');
    if (lEl) lEl.textContent = this.level;
    if (sEl) sEl.textContent = this.score;
  }

  saveStat() {
    const stats = getFidgetStats();
    stats.dotLevel = Math.max(stats.dotLevel ?? 0, this.level);
    saveFidgetStats(stats);
  }
}

/* ── Game 4: Stress Ball ────────────────────────────── */
class StressBallGame {
  constructor(ballId) {
    this.ball       = document.getElementById(ballId);
    this.ringCircle = document.querySelector('#squeeze-ring circle');
    this.squeezeCount     = 0;
    this.totalSqueezeTime = 0;
    this.isSqueezing  = false;
    this.squeezeStart = 0;
    this.squeezeInterval = null;
    this.init();
  }

  init() {
    this.loadStats();
    this.setupEvents();
  }

  loadStats() {
    const stats = getFidgetStats();
    this.squeezeCount     = stats.stressSqueezes ?? 0;
    this.totalSqueezeTime = stats.stressTotalTime ?? 0;
    this.updateDisplay();
  }

  setupEvents() {
    this.ball.addEventListener('pointerdown', () => this.squeeze());
    document.addEventListener('pointerup',     () => this.release());
    document.addEventListener('pointercancel', () => this.release());
  }

  squeeze() {
    if (this.isSqueezing) return;
    this.isSqueezing  = true;
    this.squeezeStart = Date.now();

    this.ball.classList.remove('releasing', 'squeezed-hard');
    this.ball.classList.add('squeezed');
    this.ball.style.animation = '';

    // Show ring
    if (this.ringCircle) {
      this.ringCircle.style.opacity = '0.75';
      this.ringCircle.style.strokeDashoffset = '289';
    }

    this.squeezeInterval = setInterval(() => {
      const elapsed = Date.now() - this.squeezeStart;
      const t = Math.min(elapsed / 2500, 1);

      // Fill ring
      if (this.ringCircle) {
        this.ringCircle.style.strokeDashoffset = (289 * (1 - t)).toFixed(1);
      }

      // Progressive deformation
      let sx, sy;
      if (elapsed < 800) {
        const p = elapsed / 800;
        sx = 1 + 0.12 * p;
        sy = 1 - 0.07 * p;
      } else if (elapsed < 2000) {
        const p = (elapsed - 800) / 1200;
        sx = 1.12 + 0.10 * p;
        sy = 0.93 - 0.05 * p;
        if (!this.ball.classList.contains('squeezed-hard')) {
          this.ball.classList.add('squeezed-hard');
        }
      } else {
        const p = Math.min((elapsed - 2000) / 500, 1);
        sx = 1.22 + 0.13 * p;
        sy = 0.88 - 0.06 * p;
      }
      this.ball.style.transform = `scaleX(${sx.toFixed(3)}) scaleY(${sy.toFixed(3)})`;
    }, 40);
  }

  release() {
    if (!this.isSqueezing) return;
    this.isSqueezing = false;
    clearInterval(this.squeezeInterval);

    const dur = Date.now() - this.squeezeStart;
    this.ball.style.transform = '';
    this.ball.classList.remove('squeezed', 'squeezed-hard');

    // Reset ring
    if (this.ringCircle) {
      this.ringCircle.style.opacity = '0';
      this.ringCircle.style.strokeDashoffset = '289';
    }

    // Jiggle release animation
    this.ball.classList.add('releasing');
    this.ball.addEventListener('animationend', () => {
      this.ball.classList.remove('releasing');
    }, { once: true });

    this.burst(dur);
    this.squeezeCount++;
    this.totalSqueezeTime += dur;
    this.updateDisplay();
    this.saveStat();
  }

  burst(dur) {
    const rect = this.ball.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const colors = ['#e87ca0','#a78bfa','#7dd3fc','#f472b6','#fbbf24'];

    let count, minV, maxV;
    if (dur < 1000) {
      count = 8;  minV = 40;  maxV = 80;
    } else if (dur < 2500) {
      count = 16; minV = 70;  maxV = 130;
    } else {
      count = 28; minV = 100; maxV = 180;
      this.screenFlash();
    }

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'stress-particle';
      const angle = (i / count) * Math.PI * 2;
      const v = Math.random() * (maxV - minV) + minV;
      p.style.cssText = `
        left:${cx}px; top:${cy}px;
        width:${Math.random() * 7 + 5}px; height:${Math.random() * 7 + 5}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        --tx:${(Math.cos(angle) * v).toFixed(1)}px;
        --ty:${(Math.sin(angle) * v).toFixed(1)}px;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  screenFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 350);
  }

  updateDisplay() {
    const cEl = document.getElementById('stress-count');
    const tEl = document.getElementById('stress-time');
    if (cEl) cEl.textContent = this.squeezeCount;
    if (tEl) tEl.textContent = (this.totalSqueezeTime / 1000).toFixed(1);
  }

  saveStat() {
    const stats = getFidgetStats();
    stats.stressSqueezes = this.squeezeCount;
    stats.stressTotalTime = this.totalSqueezeTime;
    saveFidgetStats(stats);
  }
}

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  new BubbleGame('bubble-game');
  new SpinnerGame('spinner-game', 'spinner-wheel');
  new DotTapperGame('dot-tapper-game');
  new StressBallGame('stress-ball');
});
