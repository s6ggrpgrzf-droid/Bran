'use strict';

const FIDGET_STORAGE_KEY = 'bran_fidget_stats';

function getFidgetStats() {
  try {
    return JSON.parse(localStorage.getItem(FIDGET_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveFidgetStats(stats) {
  try {
    localStorage.setItem(FIDGET_STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

function updateStat(key, value) {
  const stats = getFidgetStats();
  stats[key] = value;
  saveFidgetStats(stats);
}

/* Tiny WebAudio chime so taps feel satisfying without bundling sound files. */
const Sound = (() => {
  let ctx = null;
  function ensureCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { ctx = null; }
    }
    return ctx;
  }
  function blip(freq = 660, duration = 0.08, type = 'sine', volume = 0.06) {
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }
  return { blip };
})();

/* ── Game 1: Bubble Pop (reworked) ─────────────────────────── */
class BubbleGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.popCount = 0;
    this.bestCombo = 0;
    this.lastPopTime = 0;
    this.comboCount = 0;
    this.comboTimer = null;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.popCount = stats.bubblePops ?? 0;
    this.bestCombo = stats.bubbleBestCombo ?? 0;
    this.updateDisplay();
    for (let i = 0; i < 7; i++) this.createBubble();
    setInterval(() => this.createBubble(), 1700);
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = Math.floor(Math.random() * 55) + 28;
    const maxLeft = Math.max(0, this.container.offsetWidth - size);
    const left = Math.floor(Math.random() * maxLeft);
    const isGolden = Math.random() < 0.06;
    const colors = [
      ['#fce7f3', '#e87ca0'],
      ['#ede9fe', '#a78bfa'],
      ['#e0f2fe', '#7dd3fc'],
      ['#fdf2f8', '#f472b6'],
      ['#f3e8ff', '#c084fc'],
    ];
    const [light, main] = isGolden
      ? ['#fff7c2', '#fbbf24']
      : colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 2 + 3.5;

    bubble.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}px; bottom:-80px;
      background: radial-gradient(circle at 30% 28%, rgba(255,255,255,0.78) 0%, ${light} 35%, ${main} 80%);
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: inset 0 1px 4px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.08)${isGolden ? ', 0 0 18px rgba(251,191,36,0.7)' : ''};
      animation-duration:${duration}s;
    `;
    bubble.classList.add('bubble-animation');
    if (isGolden) bubble.classList.add('bubble-golden');
    bubble.dataset.golden = isGolden ? '1' : '0';

    const floatTimer = setTimeout(() => bubble.remove(), duration * 1000);
    bubble.addEventListener('click', (e) => {
      clearTimeout(floatTimer);
      this.popBubble(e, bubble);
    }, { once: true });
    this.container.appendChild(bubble);
  }

  popBubble(e, bubble) {
    e.stopPropagation();
    const isGolden = bubble.dataset.golden === '1';
    const rect = bubble.getBoundingClientRect();
    const size = rect.width;

    bubble.style.animation = 'none';
    bubble.classList.add('bubble-pop');

    const ring = document.createElement('div');
    ring.className = 'pop-ring';
    if (isGolden) ring.classList.add('pop-ring-gold');
    ring.style.cssText = `width:${size}px;height:${size}px;left:${rect.left}px;top:${rect.top}px;`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 520);

    this.particleBurst(e.clientX, e.clientY, isGolden);
    this.trackCombo(e.clientX, e.clientY);

    Sound.blip(isGolden ? 880 : 540 + Math.random() * 300, 0.07, 'sine', isGolden ? 0.09 : 0.05);

    this.popCount += isGolden ? 5 : 1;
    if (isGolden) this.goldenSparkle();
    this.updateDisplay();
    updateStat('bubblePops', this.popCount);

    setTimeout(() => bubble.remove(), 500);
    setTimeout(() => this.createBubble(), 480);
  }

  trackCombo(x, y) {
    const now = Date.now();
    if (now - this.lastPopTime < 1500) this.comboCount++;
    else this.comboCount = 1;
    this.lastPopTime = now;

    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => { this.comboCount = 0; }, 1600);

    if (this.comboCount > this.bestCombo) {
      this.bestCombo = this.comboCount;
      updateStat('bubbleBestCombo', this.bestCombo);
      this.updateDisplay();
    }
    if (this.comboCount >= 2) this.showCombo(x, y, this.comboCount);
  }

  showCombo(x, y, n) {
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.textContent = `×${n} Combo!`;
    el.style.cssText = `position:fixed;left:${x}px;top:${y - 20}px;transform:translateX(-50%);`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 920);
  }

  particleBurst(x, y, golden) {
    const colors = golden
      ? ['#fbbf24', '#fde68a', '#fff7c2', '#f59e0b']
      : ['#e87ca0', '#a78bfa', '#7dd3fc', '#f472b6'];
    const count = golden ? 18 : Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = (i / count) * Math.PI * 2;
      const v = Math.random() * 80 + (golden ? 80 : 50);
      p.style.cssText = `
        left:${x}px;top:${y}px;
        width:${Math.random() * 5 + 4}px;height:${Math.random() * 5 + 4}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        --tx:${(Math.cos(angle) * v).toFixed(1)}px;
        --ty:${(Math.sin(angle) * v).toFixed(1)}px;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  goldenSparkle() {
    const flash = document.createElement('div');
    flash.className = 'golden-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  updateDisplay() {
    const popEl = document.getElementById('bubble-count');
    const comboEl = document.getElementById('bubble-best-combo');
    if (popEl) popEl.textContent = this.popCount;
    if (comboEl) comboEl.textContent = this.bestCombo;
  }
}

/* ── Game 2: Spinner Wheel (drag-to-spin, labelled segments) ─── */
class SpinnerGame {
  static SEGMENTS = [
    { name: 'Pink',   color: '#e87ca0' },
    { name: 'Purple', color: '#a78bfa' },
    { name: 'Cyan',   color: '#7dd3fc' },
    { name: 'Rose',   color: '#f472b6' },
    { name: 'Violet', color: '#c084fc' },
    { name: 'Sky',    color: '#22d3ee' },
    { name: 'Amber',  color: '#fbbf24' },
    { name: 'Coral',  color: '#fb7185' },
  ];

  constructor(containerId, wheelId) {
    this.container = document.getElementById(containerId);
    this.wheel = document.getElementById(wheelId);
    this.spinCount = 0;
    this.isSpinning = false;
    this.totalRotation = 0;
    this.dragState = null;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.spinCount = stats.spinnerSpins ?? 0;
    this.updateDisplay();
    this.buildWheel();
    this.attachEvents();
  }

  buildWheel() {
    const pointer = document.createElement('div');
    pointer.className = 'spinner-pointer';

    const center = document.createElement('div');
    center.className = 'spinner-center';
    center.textContent = '✦';

    const labels = document.createElement('div');
    labels.className = 'spinner-labels';
    SpinnerGame.SEGMENTS.forEach((seg, i) => {
      const span = document.createElement('span');
      span.className = 'spinner-label';
      span.textContent = seg.name;
      span.style.transform = `rotate(${i * 45 + 22.5}deg) translateY(-110px)`;
      labels.appendChild(span);
    });

    this.wheel.appendChild(labels);
    this.wheel.appendChild(pointer);
    this.wheel.appendChild(center);
    this.wheel.style.transition = 'none';
    this.wheel.style.transform = 'rotate(0deg)';
  }

  attachEvents() {
    this.container.style.cursor = 'grab';
    this.container.addEventListener('pointerdown', (e) => this.onDown(e));
    this.container.addEventListener('pointermove', (e) => this.onMove(e));
    this.container.addEventListener('pointerup',   (e) => this.onUp(e));
    this.container.addEventListener('pointercancel', (e) => this.onUp(e));
  }

  pointerAngle(e) {
    const r = this.container.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
  }

  onDown(e) {
    if (this.isSpinning) return;
    this.container.setPointerCapture?.(e.pointerId);
    this.container.style.cursor = 'grabbing';
    this.dragState = {
      startAngle: this.pointerAngle(e),
      startTime: performance.now(),
      lastAngle: this.pointerAngle(e),
      lastTime: performance.now(),
      angularVel: 0,
      moved: false,
    };
  }

  onMove(e) {
    if (!this.dragState) return;
    const a = this.pointerAngle(e);
    const t = performance.now();
    let delta = a - this.dragState.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const dt = Math.max(t - this.dragState.lastTime, 1);
    this.dragState.angularVel = delta / dt;
    this.dragState.lastAngle = a;
    this.dragState.lastTime = t;
    if (Math.abs(delta) > 1) this.dragState.moved = true;

    this.totalRotation += delta;
    this.wheel.style.transition = 'none';
    this.wheel.style.transform = `rotate(${this.totalRotation}deg)`;
  }

  onUp(e) {
    if (!this.dragState) return;
    const flickVel = this.dragState.angularVel; // deg / ms
    const moved = this.dragState.moved;
    this.dragState = null;
    this.container.style.cursor = 'grab';

    let extra;
    if (!moved) {
      extra = 1800 + Math.random() * 360; // tap → fixed spin
    } else {
      const force = Math.min(Math.abs(flickVel) * 380, 2400);
      const sign = flickVel === 0 ? 1 : Math.sign(flickVel);
      extra = sign * Math.max(force, 540);
    }
    if (Math.abs(extra) < 360) extra = (extra < 0 ? -1 : 1) * 540;

    this.spin(extra);
  }

  spin(extra) {
    this.isSpinning = true;
    this.totalRotation += extra;
    const duration = (Math.min(Math.abs(extra) / 700, 4.5) + 1.6).toFixed(2);

    this.wheel.style.transition = `transform ${duration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
    this.wheel.style.transform = `rotate(${this.totalRotation}deg)`;
    this.wheel.classList.add('spinning-glow');

    setTimeout(() => {
      this.wheel.classList.remove('spinning-glow');
      this.isSpinning = false;
      this.spinCount++;
      this.updateDisplay();
      updateStat('spinnerSpins', this.spinCount);
      this.announceLanding();
    }, duration * 1000);
  }

  announceLanding() {
    const segs = SpinnerGame.SEGMENTS;
    let deg = ((this.totalRotation % 360) + 360) % 360;
    // Pointer is at the top (12 o'clock). The visible segment under the pointer
    // is the one whose conic-gradient slice rotated to that position.
    const pointerOffset = 270; // align with 12 o'clock in conic-gradient space
    const idx = Math.floor(((360 - deg + pointerOffset) % 360) / 45) % 8;
    const seg = segs[idx];
    const resultEl = document.getElementById('spinner-result');
    if (resultEl) {
      resultEl.textContent = seg.name;
      resultEl.style.color = seg.color;
      resultEl.style.textShadow = `0 1px 8px ${seg.color}80`;
    }
    Sound.blip(440, 0.18, 'triangle', 0.07);
  }

  updateDisplay() {
    const el = document.getElementById('spinner-count');
    if (el) el.textContent = this.spinCount;
  }
}

/* ── Game 3: Dot Tapper (3x3, persisted best, level-up confetti) ── */
class DotTapperGame {
  static GRID_SIZE = 9;

  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.gridEl = this.container.querySelector('.dot-grid');
    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.bestLevel = 1;
    this.isPlaying = false;
    this.gameActive = false;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.bestLevel = Math.max(stats.dotBestLevel ?? 1, 1);
    this.updateDisplay();
    this.createGrid();
    setTimeout(() => this.startNewGame(), 700);
  }

  createGrid() {
    this.gridEl.innerHTML = '';
    const colors = [
      '#e87ca0','#a78bfa','#7dd3fc',
      '#f472b6','#c084fc','#22d3ee',
      '#fbbf24','#fb7185','#34d399',
    ];
    for (let i = 0; i < DotTapperGame.GRID_SIZE; i++) {
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
    this.sequence.push(Math.floor(Math.random() * DotTapperGame.GRID_SIZE));
    this.setStatus('Watch carefully…');
    this.playSequence();
  }

  playSequence() {
    this.isPlaying = true;
    const step = Math.max(280, 650 - this.sequence.length * 30);
    setTimeout(() => {
      this.sequence.forEach((dotIdx, i) => {
        setTimeout(() => {
          this.lightDot(dotIdx);
          if (i === this.sequence.length - 1) {
            setTimeout(() => {
              this.isPlaying = false;
              this.setStatus('Your turn!');
            }, step * 0.7);
          }
        }, i * step);
      });
    }, 700);
  }

  lightDot(idx) {
    const dot = this.gridEl.children[idx];
    if (!dot) return;
    dot.classList.add('lit');
    Sound.blip(360 + idx * 32, 0.13, 'triangle', 0.05);
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

    Sound.blip(420 + idx * 28, 0.09, 'sine', 0.05);
    dot.classList.add('correct');
    setTimeout(() => dot.classList.remove('correct'), 300);

    if (this.playerSequence.length === this.sequence.length) {
      this.level++;
      if (this.level > this.bestLevel) {
        this.bestLevel = this.level;
        updateStat('dotBestLevel', this.bestLevel);
      }
      this.updateDisplay();
      if (this.level % 5 === 0) this.celebrate();
      this.setStatus(`Nice! Level ${this.level}…`);
      setTimeout(() => this.nextRound(), 1000);
    }
  }

  wrongTap(dot) {
    this.gameActive = false;
    this.isPlaying = false;
    dot.classList.add('wrong');
    Sound.blip(180, 0.25, 'sawtooth', 0.06);
    this.setStatus('Oops! Starting over…');
    setTimeout(() => {
      dot.classList.remove('wrong');
      this.level = 1;
      this.updateDisplay();
      this.startNewGame();
    }, 1300);
  }

  celebrate() {
    const rect = this.gridEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#e87ca0','#a78bfa','#7dd3fc','#fbbf24','#34d399'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * 140 + 80;
      p.style.cssText = `
        left:${cx}px;top:${cy}px;
        width:${Math.random() * 6 + 5}px;height:${Math.random() * 6 + 5}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        --tx:${(Math.cos(angle) * v).toFixed(1)}px;
        --ty:${(Math.sin(angle) * v).toFixed(1)}px;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  updateDisplay() {
    const lvl = document.getElementById('dot-level');
    const best = document.getElementById('dot-best');
    if (lvl) lvl.textContent = this.level;
    if (best) best.textContent = this.bestLevel;
  }
}

/* ── Game 4: Stress Ball (heat-up tint, idle breathe) ─────── */
class StressBallGame {
  constructor(ballId) {
    this.ball = document.getElementById(ballId);
    this.ringCircle = document.querySelector('#squeeze-ring circle');
    this.squeezeCount = 0;
    this.totalSqueezeTime = 0;
    this.isSqueezing = false;
    this.squeezeStart = 0;
    this.squeezeInterval = null;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.squeezeCount = stats.stressSqueezes ?? 0;
    this.totalSqueezeTime = stats.stressTotalTime ?? 0;
    this.updateDisplay();
    this.ball.classList.add('idle-breathe');
    this.ball.addEventListener('pointerdown', () => this.squeeze());
    document.addEventListener('pointerup',     () => this.release());
    document.addEventListener('pointercancel', () => this.release());
  }

  squeeze() {
    if (this.isSqueezing) return;
    this.isSqueezing = true;
    this.squeezeStart = Date.now();
    this.ball.classList.remove('idle-breathe', 'releasing', 'squeezed-hard', 'squeezed-hot');
    this.ball.classList.add('squeezed');
    this.ball.style.animation = '';
    if (this.ringCircle) {
      this.ringCircle.style.opacity = '0.85';
      this.ringCircle.style.strokeDashoffset = '289';
    }

    this.squeezeInterval = setInterval(() => {
      const elapsed = Date.now() - this.squeezeStart;
      const t = Math.min(elapsed / 2500, 1);
      if (this.ringCircle) {
        this.ringCircle.style.strokeDashoffset = (289 * (1 - t)).toFixed(1);
        // Heat-up colour shift on the ring
        const hue = 350 - t * 40; // pink → red-orange
        this.ringCircle.style.stroke = `hsl(${hue.toFixed(0)}, 80%, 60%)`;
      }

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
        if (!this.ball.classList.contains('squeezed-hot')) {
          this.ball.classList.add('squeezed-hot');
        }
      }
      this.ball.style.transform = `scaleX(${sx.toFixed(3)}) scaleY(${sy.toFixed(3)})`;
    }, 40);
  }

  release() {
    if (!this.isSqueezing) return;
    this.isSqueezing = false;
    clearInterval(this.squeezeInterval);

    const dur = Date.now() - this.squeezeStart;
    const fromTransform = this.ball.style.transform || 'scale(1)';
    this.ball.style.transform = '';
    this.ball.classList.remove('squeezed', 'squeezed-hard', 'squeezed-hot');

    if (this.ringCircle) {
      this.ringCircle.style.opacity = '0';
      this.ringCircle.style.strokeDashoffset = '289';
      this.ringCircle.style.stroke = '';
    }

    this.ball.animate([
      { transform: fromTransform },
      { transform: 'scaleX(0.87) scaleY(1.11)' },
      { transform: 'scaleX(1.06) scaleY(0.97)' },
      { transform: 'scale(1)' },
    ], { duration: 550, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'none' });

    this.burst(dur);
    this.squeezeCount++;
    this.totalSqueezeTime += dur;
    this.updateDisplay();
    updateStat('stressSqueezes', this.squeezeCount);
    updateStat('stressTotalTime', this.totalSqueezeTime);

    setTimeout(() => this.ball.classList.add('idle-breathe'), 600);
  }

  burst(dur) {
    const rect = this.ball.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let colors, count, minV, maxV;
    if (dur < 1000) {
      colors = ['#7dd3fc', '#a78bfa', '#bae6fd'];
      count = 8; minV = 40; maxV = 80;
      Sound.blip(540, 0.10, 'sine', 0.05);
    } else if (dur < 2500) {
      colors = ['#e87ca0', '#a78bfa', '#f472b6'];
      count = 16; minV = 70; maxV = 130;
      Sound.blip(440, 0.16, 'sine', 0.07);
    } else {
      colors = ['#fbbf24', '#e87ca0', '#fb7185', '#f472b6'];
      count = 28; minV = 100; maxV = 180;
      this.screenFlash();
      Sound.blip(330, 0.30, 'triangle', 0.09);
    }

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'stress-particle';
      const angle = (i / count) * Math.PI * 2;
      const v = Math.random() * (maxV - minV) + minV;
      p.style.cssText = `
        left:${cx}px;top:${cy}px;
        width:${Math.random() * 7 + 5}px;height:${Math.random() * 7 + 5}px;
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
    const c = document.getElementById('stress-count');
    const t = document.getElementById('stress-time');
    if (c) c.textContent = this.squeezeCount;
    if (t) t.textContent = (this.totalSqueezeTime / 1000).toFixed(1);
  }
}

/* ── Game 5: Zen Sand Garden ─────────────────────────────── */
class SandGardenGame {
  constructor() {
    this.canvas = document.getElementById('sand-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.strokes = 0;
    this.tool = 'rake';
    this.drawing = false;
    this.lastPt = null;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.strokes = stats.sandStrokes ?? 0;
    this.updateDisplay();
    this.fitCanvas();
    this.smoothSand();
    window.addEventListener('resize', () => { this.fitCanvas(); this.smoothSand(true); });

    this.canvas.addEventListener('pointerdown', (e) => this.startStroke(e));
    this.canvas.addEventListener('pointermove', (e) => this.continueStroke(e));
    document.addEventListener('pointerup',      () => this.endStroke());
    document.addEventListener('pointercancel',  () => this.endStroke());

    document.getElementById('sand-smooth').addEventListener('click', () => this.smoothSand());
    const toolBtn = document.getElementById('sand-tool');
    toolBtn.addEventListener('click', () => {
      this.tool = this.tool === 'rake' ? 'finger' : 'rake';
      toolBtn.dataset.tool = this.tool;
      toolBtn.textContent = this.tool === 'rake' ? 'Rake 🪮' : 'Finger ☝️';
    });
  }

  fitCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.min(600, this.canvas.parentElement.clientWidth - 8);
    const cssH = Math.round(cssW * 0.62);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssW = cssW; this.cssH = cssH;
  }

  smoothSand(silent) {
    const ctx = this.ctx;
    const w = this.cssW, h = this.cssH;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f6e7d6');
    grad.addColorStop(1, '#e9d3b3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle grain noise
    const grainCount = Math.floor(w * h * 0.012);
    for (let i = 0; i < grainCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * 0.07 + 0.02;
      ctx.fillStyle = `rgba(120,90,60,${a.toFixed(3)})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // A couple of decorative stones
    [
      [w * 0.18, h * 0.78, 32],
      [w * 0.82, h * 0.32, 24],
      [w * 0.55, h * 0.7, 18],
    ].forEach(([cx, cy, r]) => {
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
      g.addColorStop(0, '#9aa0a6');
      g.addColorStop(1, '#5b6066');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!silent) Sound.blip(220, 0.4, 'sine', 0.04);
  }

  pointerXY(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  startStroke(e) {
    e.preventDefault();
    this.drawing = true;
    this.lastPt = this.pointerXY(e);
    this.canvas.setPointerCapture?.(e.pointerId);
  }

  continueStroke(e) {
    if (!this.drawing) return;
    const pt = this.pointerXY(e);
    if (this.tool === 'rake') this.drawRake(this.lastPt, pt);
    else this.drawFinger(this.lastPt, pt);
    this.lastPt = pt;
  }

  endStroke() {
    if (!this.drawing) return;
    this.drawing = false;
    this.lastPt = null;
    this.strokes++;
    this.updateDisplay();
    updateStat('sandStrokes', this.strokes);
  }

  drawRake(a, b) {
    const ctx = this.ctx;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const nx = -dy / len, ny = dx / len; // perpendicular
    const tines = 5, spacing = 5;
    ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      const ox = nx * i * spacing;
      const oy = ny * i * spacing;
      // dark groove
      ctx.strokeStyle = 'rgba(110, 80, 50, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(a.x + ox, a.y + oy);
      ctx.lineTo(b.x + ox, b.y + oy);
      ctx.stroke();
      // light highlight just beside it
      ctx.strokeStyle = 'rgba(255, 244, 220, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x + ox + 1, a.y + oy + 1);
      ctx.lineTo(b.x + ox + 1, b.y + oy + 1);
      ctx.stroke();
    }
  }

  drawFinger(a, b) {
    const ctx = this.ctx;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(110, 80, 50, 0.55)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 244, 220, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(a.x - 3, a.y - 3);
    ctx.lineTo(b.x - 3, b.y - 3);
    ctx.stroke();
  }

  updateDisplay() {
    const el = document.getElementById('sand-strokes');
    if (el) el.textContent = this.strokes;
  }
}

/* ── Game 6: Pop-It Grid ────────────────────────────────── */
class PopItGame {
  static ROWS = 5;
  static COLS = 5;

  constructor() {
    this.grid = document.getElementById('popit-grid');
    if (!this.grid) return;
    this.popCount = 0;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.popCount = stats.popitCount ?? 0;
    this.updateDisplay();

    const palette = ['#e87ca0', '#a78bfa', '#7dd3fc', '#f472b6', '#c084fc', '#fbbf24', '#34d399', '#22d3ee'];
    this.grid.style.gridTemplateColumns = `repeat(${PopItGame.COLS}, 1fr)`;
    for (let i = 0; i < PopItGame.ROWS * PopItGame.COLS; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'popit-cell';
      cell.style.setProperty('--popit-color', palette[i % palette.length]);
      cell.setAttribute('aria-label', 'Pop bubble');
      cell.addEventListener('click', () => this.toggle(cell));
      this.grid.appendChild(cell);
    }

    document.getElementById('popit-reset').addEventListener('click', () => {
      Array.from(this.grid.children).forEach(c => c.classList.remove('popit-down'));
    });
  }

  toggle(cell) {
    const goingDown = !cell.classList.contains('popit-down');
    cell.classList.toggle('popit-down');
    if (goingDown) {
      this.popCount++;
      this.updateDisplay();
      updateStat('popitCount', this.popCount);
      Sound.blip(620 + Math.random() * 220, 0.05, 'sine', 0.05);
    } else {
      Sound.blip(360 + Math.random() * 120, 0.07, 'triangle', 0.045);
    }
  }

  updateDisplay() {
    const el = document.getElementById('popit-count');
    if (el) el.textContent = this.popCount;
  }
}

/* ── Game 7: Ripple Pond ─────────────────────────────────── */
class RipplePondGame {
  constructor() {
    this.canvas = document.getElementById('ripple-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ripples = [];
    this.count = 0;
    this.running = false;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.count = stats.rippleCount ?? 0;
    this.updateDisplay();
    this.fitCanvas();
    window.addEventListener('resize', () => this.fitCanvas());

    this.canvas.addEventListener('pointerdown', (e) => this.addRipple(e));

    this.startLoop();
  }

  fitCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.min(600, this.canvas.parentElement.clientWidth - 8);
    const cssH = Math.round(cssW * 0.62);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssW = cssW; this.cssH = cssH;
  }

  addRipple(e) {
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const palette = ['#7dd3fc', '#a78bfa', '#e87ca0', '#22d3ee'];
    this.ripples.push({
      x, y,
      t: 0,
      maxR: 200 + Math.random() * 80,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
    this.count++;
    this.updateDisplay();
    updateStat('rippleCount', this.count);
    Sound.blip(520 + Math.random() * 200, 0.18, 'sine', 0.04);
  }

  startLoop() {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this.draw(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  draw(dt) {
    const ctx = this.ctx;
    const w = this.cssW, h = this.cssH;
    // Water background — soft cyan-purple gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#bee9fb');
    g.addColorStop(0.5, '#cfd9fb');
    g.addColorStop(1, '#e7d6f5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft caustic shimmer
    const time = performance.now() / 1000;
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff' : '#a78bfa';
      const cx = (Math.sin(time * 0.4 + i) * 0.5 + 0.5) * w;
      const cy = (Math.cos(time * 0.3 + i * 1.4) * 0.5 + 0.5) * h;
      const rad = 80 + Math.sin(time + i) * 30;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ripples
    this.ripples = this.ripples.filter(rp => {
      rp.t += dt;
      const r = rp.t * 140;
      if (r > rp.maxR) return false;
      const alpha = Math.max(0, 1 - r / rp.maxR);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = `${rp.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2);
      ctx.stroke();
      // Inner softer ring
      if (r > 14) {
        ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, r - 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      return true;
    });
  }

  updateDisplay() {
    const el = document.getElementById('ripple-count');
    if (el) el.textContent = this.count;
  }
}

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  new BubbleGame('bubble-game');
  new SpinnerGame('spinner-game', 'spinner-wheel');
  new DotTapperGame('dot-tapper-game');
  new StressBallGame('stress-ball');
  new SandGardenGame();
  new PopItGame();
  new RipplePondGame();
});
