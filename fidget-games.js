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
  function jingle(profile = 'cha-ching') {
    const patterns = {
      'cha-ching':  [[660, 0.06, 'square', 0.05], [990, 0.10, 'square', 0.05]],
      'level-up':   [[523, 0.06, 'triangle', 0.06], [659, 0.06, 'triangle', 0.06], [880, 0.18, 'triangle', 0.06]],
      'jackpot':    [[440, 0.07, 'square', 0.06], [554, 0.07, 'square', 0.06], [659, 0.07, 'square', 0.06], [880, 0.22, 'square', 0.07]],
      'super':      [[330, 0.10, 'sawtooth', 0.05], [440, 0.10, 'sawtooth', 0.05], [660, 0.30, 'triangle', 0.07]],
      'fail':       [[260, 0.20, 'sawtooth', 0.06], [180, 0.30, 'sawtooth', 0.06]],
    };
    const seq = patterns[profile] || patterns['cha-ching'];
    seq.forEach((args, i) => setTimeout(() => blip(...args), i * 80));
  }
  return { blip, jingle };
})();

/* ── Arcade effects helper — score popups, banners, shake, confetti ─── */
const Arcade = (() => {
  const layer = () => document.getElementById('fx-layer') || document.body;
  const PALETTES = {
    neon:    ['#e87ca0', '#a78bfa', '#7dd3fc', '#f472b6'],
    gold:    ['#fbbf24', '#fde68a', '#f59e0b', '#fff7c2'],
    rainbow: ['#e87ca0', '#a78bfa', '#7dd3fc', '#fbbf24', '#34d399', '#fb7185'],
    cool:    ['#7dd3fc', '#a78bfa', '#bae6fd', '#c4b5fd'],
  };
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function popScore(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'fx-score-pop';
    el.textContent = text;
    if (color) el.style.color = color;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    layer().appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function banner(text, variant = 'neon') {
    const el = document.createElement('div');
    el.className = `fx-banner fx-banner--${variant}`;
    el.textContent = text;
    layer().appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  function shake(targetEl, intensity = 'soft') {
    if (!targetEl || reduced()) return;
    const cls = intensity === 'hard' ? 'fx-shake-hard' : 'fx-shake';
    targetEl.classList.remove(cls);
    // force reflow so the animation restarts
    void targetEl.offsetWidth;
    targetEl.classList.add(cls);
    setTimeout(() => targetEl.classList.remove(cls), 480);
  }

  function confetti(x, y, count = 14, paletteName = 'neon') {
    const pal = PALETTES[paletteName] || PALETTES.neon;
    const lay = layer();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const v = 60 + Math.random() * 100;
      p.style.cssText = `
        left:${x}px;top:${y}px;
        width:${4 + Math.random() * 5}px;height:${4 + Math.random() * 5}px;
        background:${pal[Math.floor(Math.random() * pal.length)]};
        --tx:${(Math.cos(angle) * v).toFixed(1)}px;
        --ty:${(Math.sin(angle) * v).toFixed(1)}px;
      `;
      lay.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function confettiRain(targetEl, count = 30, paletteName = 'rainbow') {
    if (!targetEl) return;
    const pal = PALETTES[paletteName] || PALETTES.rainbow;
    const r = targetEl.getBoundingClientRect();
    const lay = layer();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-rain';
      const x = r.left + Math.random() * r.width;
      const dx = (Math.random() - 0.5) * 80;
      const dy = r.height + 60 + Math.random() * 40;
      p.style.cssText = `
        left:${x}px;top:${r.top - 10}px;
        width:${5 + Math.random() * 6}px;height:${8 + Math.random() * 10}px;
        background:${pal[Math.floor(Math.random() * pal.length)]};
        --tx:${dx.toFixed(1)}px;
        --ty:${dy.toFixed(1)}px;
        animation-delay:${(Math.random() * 0.4).toFixed(2)}s;
      `;
      lay.appendChild(p);
      setTimeout(() => p.remove(), 1700);
    }
  }

  return { popScore, banner, shake, confetti, confettiRain, palettes: PALETTES };
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
    this.feverUntil = 0;
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

  pickType() {
    if (Date.now() < this.feverUntil) return 'golden';
    const r = Math.random();
    if (r < 0.04) return 'bomb';
    if (r < 0.09) return 'star';
    if (r < 0.12) return 'ice';
    if (r < 0.18) return 'golden';
    return 'common';
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const type = this.pickType();
    const size = Math.floor(Math.random() * 55) + 28;
    const maxLeft = Math.max(0, this.container.offsetWidth - size);
    const left = Math.floor(Math.random() * maxLeft);
    const PALETTE = {
      common: [
        ['#fce7f3', '#e87ca0'], ['#ede9fe', '#a78bfa'], ['#e0f2fe', '#7dd3fc'],
        ['#fdf2f8', '#f472b6'], ['#f3e8ff', '#c084fc'],
      ],
      golden: [['#fff7c2', '#fbbf24']],
      bomb:   [['#fda4af', '#9f1239']],
      star:   [['#fbcfe8', '#a855f7']],
      ice:    [['#dbeafe', '#38bdf8']],
    };
    const set = PALETTE[type] || PALETTE.common;
    const [light, main] = set[Math.floor(Math.random() * set.length)];
    const duration = Math.random() * 2 + 3.5;

    const glow = ({
      golden: ', 0 0 18px rgba(251,191,36,0.75)',
      bomb:   ', 0 0 14px rgba(220,38,38,0.7)',
      star:   ', 0 0 18px rgba(168,85,247,0.7)',
      ice:    ', 0 0 16px rgba(125,211,252,0.85)',
    })[type] || '';

    bubble.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}px; bottom:-80px;
      background: radial-gradient(circle at 30% 28%, rgba(255,255,255,0.78) 0%, ${light} 35%, ${main} 80%);
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: inset 0 1px 4px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.08)${glow};
      animation-duration:${duration}s;
    `;
    bubble.classList.add('bubble-animation');
    bubble.classList.add(`bubble-${type}`);
    bubble.dataset.type = type;
    if (type === 'bomb')   bubble.textContent = '💣';
    if (type === 'star')   bubble.textContent = '★';
    if (type === 'ice')    bubble.textContent = '❄';
    if (type === 'golden') bubble.classList.add('bubble-golden');

    const floatTimer = setTimeout(() => bubble.remove(), duration * 1000);
    bubble.addEventListener('click', (e) => {
      clearTimeout(floatTimer);
      this.popBubble(e, bubble);
    }, { once: true });
    this.container.appendChild(bubble);
  }

  popBubble(e, bubble) {
    e.stopPropagation();
    const type = bubble.dataset.type || 'common';
    const rect = bubble.getBoundingClientRect();
    const size = rect.width;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    bubble.style.animation = 'none';
    bubble.classList.add('bubble-pop');

    const ring = document.createElement('div');
    ring.className = 'pop-ring';
    if (type === 'golden') ring.classList.add('pop-ring-gold');
    ring.style.cssText = `width:${size}px;height:${size}px;left:${rect.left}px;top:${rect.top}px;`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 520);

    const inFever = Date.now() < this.feverUntil;
    let basePoints;
    switch (type) {
      case 'golden': basePoints = 5; break;
      case 'bomb':   basePoints = 4; break;
      case 'star':   basePoints = 3; break;
      case 'ice':    basePoints = 2; break;
      default:       basePoints = 1;
    }
    const points = inFever ? basePoints * 2 : basePoints;

    // Visual + audio per type
    if (type === 'golden') {
      this.particleBurst(e.clientX, e.clientY, true);
      this.goldenSparkle();
      Sound.blip(880, 0.08, 'sine', 0.09);
    } else if (type === 'bomb') {
      Arcade.confetti(cx, cy, 26, 'rainbow');
      Arcade.shake(this.container.closest('.fidget-game-card'), 'hard');
      Sound.blip(160, 0.20, 'sawtooth', 0.08);
      this.chainBomb(bubble);
    } else if (type === 'star') {
      Arcade.confetti(cx, cy, 22, 'rainbow');
      Sound.jingle('cha-ching');
    } else if (type === 'ice') {
      this.freezeAll(1200);
      Arcade.confetti(cx, cy, 14, 'cool');
      Sound.blip(660, 0.18, 'triangle', 0.06);
    } else {
      this.particleBurst(e.clientX, e.clientY, false);
      Sound.blip(540 + Math.random() * 300, 0.07, 'sine', 0.05);
    }

    Arcade.popScore(e.clientX, e.clientY, `+${points}`,
      type === 'golden' ? '#fbbf24' :
      type === 'bomb'   ? '#fb7185' :
      type === 'star'   ? '#a855f7' :
      type === 'ice'    ? '#38bdf8' : '#e87ca0');

    this.trackCombo(e.clientX, e.clientY);
    this.popCount += points;
    this.updateDisplay();
    updateStat('bubblePops', this.popCount);

    setTimeout(() => bubble.remove(), 500);
    setTimeout(() => this.createBubble(), 480);
  }

  chainBomb(sourceBubble) {
    const rect = sourceBubble.getBoundingClientRect();
    const sx = rect.left + rect.width / 2;
    const sy = rect.top + rect.height / 2;
    const others = Array.from(this.container.querySelectorAll('.bubble'))
      .filter(b => b !== sourceBubble && !b.classList.contains('bubble-pop'));
    others.forEach(b => {
      const r = b.getBoundingClientRect();
      const dx = (r.left + r.width / 2) - sx;
      const dy = (r.top + r.height / 2) - sy;
      if (Math.hypot(dx, dy) < 110) {
        setTimeout(() => {
          if (!b.isConnected) return;
          const fakeEvent = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, stopPropagation() {} };
          this.popBubble(fakeEvent, b);
        }, 60 + Math.random() * 80);
      }
    });
  }

  freezeAll(ms) {
    Array.from(this.container.querySelectorAll('.bubble')).forEach(b => {
      const cur = getComputedStyle(b).animationPlayState;
      b.style.animationPlayState = 'paused';
      setTimeout(() => { b.style.animationPlayState = cur || 'running'; }, ms);
    });
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

    if (this.comboCount === 8 && Date.now() >= this.feverUntil) {
      this.startFever();
    }
  }

  startFever() {
    this.feverUntil = Date.now() + 4000;
    this.container.classList.add('fever');
    Arcade.banner('FEVER!', 'rainbow');
    Sound.jingle('jackpot');
    setTimeout(() => this.container.classList.remove('fever'), 4000);
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
    this.lastSegmentIdx = -1;
    this.lastLandedIdx = null;
    this.streak = 0;
    this.tickEl = null;
    this.tickRAF = 0;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.spinCount = stats.spinnerSpins ?? 0;
    this.lastLandedIdx = stats.spinnerLastIdx ?? null;
    this.streak = stats.spinnerStreak ?? 0;
    this.updateDisplay();
    this.buildWheel();
    this.attachEvents();
  }

  buildWheel() {
    const pointer = document.createElement('div');
    pointer.className = 'spinner-pointer';

    const tick = document.createElement('div');
    tick.className = 'spinner-tick';
    this.tickEl = tick;

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
    this.wheel.appendChild(tick);
    this.wheel.appendChild(center);
    this.wheel.style.transition = 'none';
    this.wheel.style.transform = 'rotate(0deg)';
  }

  currentWheelAngle() {
    // Read actual on-screen rotation from the matrix during the CSS transition.
    const t = getComputedStyle(this.wheel).transform;
    if (!t || t === 'none') return 0;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    const [a, b] = m[1].split(',').map(parseFloat);
    return Math.atan2(b, a) * 180 / Math.PI;
  }

  segmentAt(deg) {
    const norm = ((deg % 360) + 360) % 360;
    const pointerOffset = 270;
    return Math.floor(((360 - norm + pointerOffset) % 360) / 45) % 8;
  }

  startTickPolling() {
    cancelAnimationFrame(this.tickRAF);
    let last = this.segmentAt(this.currentWheelAngle());
    this.lastSegmentIdx = last;
    const step = () => {
      if (!this.isSpinning) return;
      const idx = this.segmentAt(this.currentWheelAngle());
      if (idx !== last) {
        last = idx;
        if (this.tickEl) {
          this.tickEl.classList.remove('tick-flash');
          void this.tickEl.offsetWidth;
          this.tickEl.classList.add('tick-flash');
        }
        Sound.blip(900, 0.02, 'square', 0.025);
      }
      this.tickRAF = requestAnimationFrame(step);
    };
    this.tickRAF = requestAnimationFrame(step);
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
    this.startTickPolling();

    setTimeout(() => {
      cancelAnimationFrame(this.tickRAF);
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
    const idx = this.segmentAt(this.totalRotation);
    const seg = segs[idx];

    const resultEl = document.getElementById('spinner-result');
    if (resultEl) {
      resultEl.textContent = seg.name;
      resultEl.style.color = seg.color;
      resultEl.style.textShadow = `0 1px 8px ${seg.color}80`;
    }

    const r = this.wheel.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const isJackpot = this.lastLandedIdx === idx && this.spinCount > 1;
    if (isJackpot) {
      this.streak++;
      Arcade.banner(`JACKPOT × ${this.streak + 1}!`, 'gold');
      Arcade.confetti(cx, cy, 36, 'gold');
      Arcade.popScore(cx, cy - 30, '+50', '#fbbf24');
      Sound.jingle('jackpot');
    } else {
      this.streak = 0;
      Arcade.banner(`${seg.name.toUpperCase()}!`, 'neon');
      Arcade.confetti(cx, cy, 22, 'neon');
      Arcade.popScore(cx, cy - 30, '+10', seg.color);
      Sound.jingle('cha-ching');
    }
    this.lastLandedIdx = idx;
    updateStat('spinnerLastIdx', idx);
    updateStat('spinnerStreak', this.streak);
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
    this.dotColors = colors;
    for (let i = 0; i < DotTapperGame.GRID_SIZE; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.dataset.idx = i;
      dot.style.setProperty('--dot-color', colors[i]);
      dot.addEventListener('click', () => this.onDotClick(i));
      this.gridEl.appendChild(dot);
    }
    // SVG trace overlay for connecting consecutive lit dots during playback
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('dot-trace');
    svg.setAttribute('aria-hidden', 'true');
    this.container.appendChild(svg);
    this.traceSvg = svg;
  }

  dotCenter(idx) {
    const dot = this.gridEl.children[idx];
    if (!dot) return null;
    const r = dot.getBoundingClientRect();
    const containerR = this.container.getBoundingClientRect();
    return { x: r.left - containerR.left + r.width / 2, y: r.top - containerR.top + r.height / 2 };
  }

  drawTraceLine(fromIdx, toIdx, color) {
    if (!this.traceSvg) return;
    const a = this.dotCenter(fromIdx);
    const b = this.dotCenter(toIdx);
    if (!a || !b) return;
    const containerR = this.container.getBoundingClientRect();
    this.traceSvg.setAttribute('viewBox', `0 0 ${containerR.width} ${containerR.height}`);
    const svgNS = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('class', 'dot-trace-line');
    this.traceSvg.appendChild(line);
    setTimeout(() => line.remove(), 900);
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
          if (i > 0) {
            const prevIdx = this.sequence[i - 1];
            const color = (this.dotColors && this.dotColors[dotIdx]) || '#a78bfa';
            this.drawTraceLine(prevIdx, dotIdx, color);
          }
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

    const r = dot.getBoundingClientRect();
    Arcade.popScore(r.left + r.width / 2, r.top + r.height / 2 - 18,
      `+${this.level}`, this.dotColors[idx]);

    if (this.playerSequence.length === this.sequence.length) {
      this.level++;
      if (this.level > this.bestLevel) {
        this.bestLevel = this.level;
        updateStat('dotBestLevel', this.bestLevel);
      }
      this.updateDisplay();

      const card = this.container.closest('.fidget-game-card');
      if (this.level % 5 === 0) {
        Arcade.banner('PERFECT!', 'rainbow');
        if (card) Arcade.confettiRain(card, 36, 'rainbow');
        Sound.jingle('level-up');
      } else if (this.level % 3 === 0) {
        Arcade.banner(`LEVEL ${this.level}!`, 'gold');
        Sound.jingle('cha-ching');
      }
      this.setStatus(`Nice! Level ${this.level}…`);
      setTimeout(() => this.nextRound(), 1000);
    }
  }

  wrongTap(dot) {
    this.gameActive = false;
    this.isPlaying = false;
    dot.classList.add('wrong');
    Sound.jingle('fail');
    const card = this.container.closest('.fidget-game-card');
    Arcade.shake(card, 'hard');
    if (card) {
      card.classList.add('card-flash-red');
      setTimeout(() => card.classList.remove('card-flash-red'), 700);
    }
    Arcade.banner('OOPS', 'neon');
    this.setStatus('Oops! Starting over…');
    setTimeout(() => {
      dot.classList.remove('wrong');
      this.level = 1;
      this.updateDisplay();
      this.startNewGame();
    }, 1300);
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
    this.powerFill  = document.querySelector('#power-meter .power-fill');
    this.squeezeCount = 0;
    this.totalSqueezeTime = 0;
    this.isSqueezing = false;
    this.squeezeStart = 0;
    this.squeezeInterval = null;
    this.steamInterval = null;
    this.shakeInterval = null;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.squeezeCount = stats.stressSqueezes ?? 0;
    this.totalSqueezeTime = stats.stressTotalTime ?? 0;
    this.updateDisplay();
    this.ball.classList.add('idle-breathe');
    if (this.powerFill) {
      // 2π × 48 ≈ 301.6
      this.powerFill.style.strokeDasharray = '301.6';
      this.powerFill.style.strokeDashoffset = '301.6';
    }
    this.ball.addEventListener('pointerdown', () => this.squeeze());
    document.addEventListener('pointerup',     () => this.release());
    document.addEventListener('pointercancel', () => this.release());
  }

  emitSteam() {
    const r = this.ball.getBoundingClientRect();
    const card = this.ball.closest('.fidget-game-card');
    const layer = document.getElementById('fx-layer') || document.body;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.18;
    for (let i = 0; i < 2; i++) {
      const puff = document.createElement('div');
      puff.className = 'fx-steam';
      const dx = (Math.random() - 0.5) * 60;
      const size = 18 + Math.random() * 14;
      puff.style.cssText = `
        left:${cx + (Math.random() - 0.5) * 30}px;
        top:${cy}px;
        width:${size}px;height:${size}px;
        --tx:${dx.toFixed(1)}px;
      `;
      layer.appendChild(puff);
      setTimeout(() => puff.remove(), 1200);
    }
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
        const hue = 350 - t * 40; // pink → red-orange
        this.ringCircle.style.stroke = `hsl(${hue.toFixed(0)}, 80%, 60%)`;
      }
      if (this.powerFill) {
        this.powerFill.style.strokeDashoffset = (301.6 * (1 - t)).toFixed(1);
        // Power bar colour: cool blue → magenta → red
        const r = Math.round(125 + (220 - 125) * t);
        const g = Math.round(211 + (38 - 211) * t);
        const b = Math.round(252 + (38 - 252) * t);
        this.powerFill.style.stroke = `rgb(${r},${g},${b})`;
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
          this.steamInterval = setInterval(() => this.emitSteam(), 220);
          // Light card shake every second once we've gone full hot
          this.shakeInterval = setInterval(() => {
            Arcade.shake(this.ball.closest('.fidget-game-card'), 'soft');
          }, 1000);
        }
      }
      this.ball.style.transform = `scaleX(${sx.toFixed(3)}) scaleY(${sy.toFixed(3)})`;
    }, 40);
  }

  release() {
    if (!this.isSqueezing) return;
    this.isSqueezing = false;
    clearInterval(this.squeezeInterval);
    clearInterval(this.steamInterval);
    clearInterval(this.shakeInterval);
    this.steamInterval = null;
    this.shakeInterval = null;

    const dur = Date.now() - this.squeezeStart;
    const fromTransform = this.ball.style.transform || 'scale(1)';
    this.ball.style.transform = '';
    this.ball.classList.remove('squeezed', 'squeezed-hard', 'squeezed-hot');

    if (this.ringCircle) {
      this.ringCircle.style.opacity = '0';
      this.ringCircle.style.strokeDashoffset = '289';
      this.ringCircle.style.stroke = '';
    }
    if (this.powerFill) {
      this.powerFill.style.strokeDashoffset = '301.6';
      this.powerFill.style.stroke = '';
    }

    this.ball.animate([
      { transform: fromTransform },
      { transform: 'scaleX(0.87) scaleY(1.11)' },
      { transform: 'scaleX(1.06) scaleY(0.97)' },
      { transform: 'scale(1)' },
    ], { duration: 550, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'none' });

    this.burst(dur);
    if (dur >= 2500) {
      Arcade.banner('SUPER!', 'gold');
      Arcade.shake(this.ball.closest('.fidget-game-card'), 'hard');
      Arcade.confetti(
        this.ball.getBoundingClientRect().left + this.ball.offsetWidth / 2,
        this.ball.getBoundingClientRect().top  + this.ball.offsetHeight / 2,
        30, 'gold'
      );
      Sound.jingle('super');
    }
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
    requestAnimationFrame(() => { this.fitCanvas(); this.smoothSand(true); });
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
    const parentW = this.canvas.parentElement?.clientWidth || 0;
    const fallback = Math.min(600, (window.innerWidth || 600) * 0.92);
    const cssW = Math.max(160, Math.min(600, parentW > 32 ? parentW : fallback));
    const cssH = Math.round(cssW * 0.62);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.max(1, Math.round(cssW * dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * dpr));
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
    this.lastSparkAt = 0;
    this.canvas.setPointerCapture?.(e.pointerId);
  }

  continueStroke(e) {
    if (!this.drawing) return;
    const pt = this.pointerXY(e);
    if (this.tool === 'rake') this.drawRake(this.lastPt, pt);
    else this.drawFinger(this.lastPt, pt);
    this.lastPt = pt;

    // Light gold sparkle trail behind the cursor (rate-limited)
    const now = performance.now();
    if (now - (this.lastSparkAt || 0) > 50) {
      this.lastSparkAt = now;
      const r = this.canvas.getBoundingClientRect();
      const layer = document.getElementById('fx-layer') || document.body;
      const spark = document.createElement('div');
      spark.className = 'fx-spark';
      spark.style.cssText = `left:${r.left + pt.x}px;top:${r.top + pt.y}px;`;
      layer.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    }
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
    this.cells = [];
    this.lastPopAt = 0;
    this.combo = 0;
    this.comboTimer = null;
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
      cell.dataset.idx = i;
      cell.addEventListener('click', () => this.toggle(cell));
      this.grid.appendChild(cell);
      this.cells.push(cell);
    }

    document.getElementById('popit-reset').addEventListener('click', () => this.cascadeReset());
  }

  rowOf(idx) { return Math.floor(idx / PopItGame.COLS); }
  colOf(idx) { return idx % PopItGame.COLS; }

  isDown(cell) { return cell.classList.contains('popit-down'); }

  toggle(cell) {
    const goingDown = !this.isDown(cell);
    cell.classList.toggle('popit-down');
    const r = cell.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    if (goingDown) {
      this.popCount++;
      this.updateDisplay();
      updateStat('popitCount', this.popCount);
      Sound.blip(620 + Math.random() * 220, 0.05, 'sine', 0.05);

      // Combo tracking
      const now = Date.now();
      if (now - this.lastPopAt < 600) this.combo++; else this.combo = 1;
      this.lastPopAt = now;
      clearTimeout(this.comboTimer);
      this.comboTimer = setTimeout(() => { this.combo = 0; }, 700);
      if (this.combo >= 3) {
        Arcade.popScore(cx, cy, `×${this.combo}`, '#fbbf24');
      }

      // Line detection
      const idx = +cell.dataset.idx;
      const row = this.rowOf(idx);
      const col = this.colOf(idx);
      const rowDone = this.cells.filter((_, i) => this.rowOf(i) === row).every(c => this.isDown(c));
      const colDone = this.cells.filter((_, i) => this.colOf(i) === col).every(c => this.isDown(c));
      if (rowDone) this.flashLine('row', row);
      if (colDone) this.flashLine('col', col);

      // Whole-grid completion
      if (this.cells.every(c => this.isDown(c))) {
        Arcade.banner('ALL POPPED!', 'rainbow');
        const card = this.grid.closest('.fidget-game-card');
        if (card) Arcade.confettiRain(card, 50, 'rainbow');
        Sound.jingle('jackpot');
        setTimeout(() => this.cascadeReset(), 700);
      }
    } else {
      Sound.blip(360 + Math.random() * 120, 0.07, 'triangle', 0.045);
    }
  }

  flashLine(axis, n) {
    const cells = axis === 'row'
      ? this.cells.filter((_, i) => this.rowOf(i) === n)
      : this.cells.filter((_, i) => this.colOf(i) === n);
    cells.forEach((c, i) => {
      setTimeout(() => {
        c.classList.add('popit-line-flash');
        setTimeout(() => c.classList.remove('popit-line-flash'), 380);
      }, i * 40);
    });
    const last = cells[Math.floor(cells.length / 2)];
    if (last) {
      const r = last.getBoundingClientRect();
      Arcade.popScore(r.left + r.width / 2, r.top - 6,
        axis === 'row' ? '+50 LINE!' : '+50 COLUMN!', '#fbbf24');
    }
    Sound.jingle('cha-ching');
  }

  cascadeReset() {
    this.cells.forEach((c, i) => {
      setTimeout(() => {
        c.classList.remove('popit-down');
        c.classList.add('popit-pop-up');
        setTimeout(() => c.classList.remove('popit-pop-up'), 280);
      }, i * 28);
    });
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
    requestAnimationFrame(() => this.fitCanvas());
    window.addEventListener('resize', () => this.fitCanvas());

    this.canvas.addEventListener('pointerdown', (e) => this.addRipple(e));

    this.startLoop();
  }

  fitCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const parentW = this.canvas.parentElement?.clientWidth || 0;
    const fallback = Math.min(600, (window.innerWidth || 600) * 0.92);
    const cssW = Math.max(160, Math.min(600, parentW > 32 ? parentW : fallback));
    const cssH = Math.round(cssW * 0.62);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.max(1, Math.round(cssW * dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * dpr));
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

    // Three soft cyan sparkles at the tap point
    Arcade.confetti(e.clientX, e.clientY, 3, 'cool');
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
