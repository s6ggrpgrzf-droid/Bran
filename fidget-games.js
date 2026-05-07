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

    // 1. Warm radial-vignette base
    const base = ctx.createRadialGradient(w * 0.5, h * 0.35, w * 0.1, w * 0.5, h * 0.55, w * 0.85);
    base.addColorStop(0, '#f8ecd6');
    base.addColorStop(0.55, '#eddcb9');
    base.addColorStop(1, '#cfb38a');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. Diagonal "sun" wash so the sand looks lit from upper-left
    const sun = ctx.createLinearGradient(0, 0, w, h);
    sun.addColorStop(0, 'rgba(255, 240, 200, 0.25)');
    sun.addColorStop(0.6, 'rgba(255, 240, 200, 0)');
    sun.addColorStop(1, 'rgba(80, 50, 20, 0.18)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

    // 3. Layered grain noise — three passes at varying density and tone
    for (const [count, alpha, color] of [
      [w * h * 0.020, 0.05, '110,80,50'],
      [w * h * 0.012, 0.07, '60,40,20'],
      [w * h * 0.010, 0.06, '255,235,200'],
    ]) {
      const n = Math.floor(count);
      for (let i = 0; i < n; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const a = Math.random() * alpha + 0.02;
        ctx.fillStyle = `rgba(${color},${a.toFixed(3)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // 4. Bamboo border frame — slim warm-brown bands top & bottom with fibre lines
    const frameH = Math.max(8, Math.round(h * 0.04));
    [0, h - frameH].forEach(y => {
      const fg = ctx.createLinearGradient(0, y, 0, y + frameH);
      fg.addColorStop(0, '#8c6135');
      fg.addColorStop(0.5, '#a07747');
      fg.addColorStop(1, '#6a4724');
      ctx.fillStyle = fg;
      ctx.fillRect(0, y, w, frameH);
      // Fibre lines
      ctx.strokeStyle = 'rgba(50,30,15,0.4)';
      ctx.lineWidth = 0.6;
      for (let x = 0; x < w; x += 4 + Math.random() * 6) {
        ctx.beginPath();
        ctx.moveTo(x, y + 1);
        ctx.lineTo(x + (Math.random() - 0.5) * 3, y + frameH - 1);
        ctx.stroke();
      }
    });

    // 5. Mossy patch — soft green blob lower right for color contrast
    const mossR = Math.max(28, w * 0.10);
    const mossX = w * 0.78, mossY = h * 0.74;
    const moss = ctx.createRadialGradient(mossX, mossY, 0, mossX, mossY, mossR);
    moss.addColorStop(0, 'rgba(120, 160, 90, 0.55)');
    moss.addColorStop(0.6, 'rgba(110, 150, 85, 0.30)');
    moss.addColorStop(1, 'rgba(110, 150, 85, 0)');
    ctx.fillStyle = moss;
    ctx.beginPath();
    ctx.ellipse(mossX, mossY, mossR, mossR * 0.62, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 6. Decorative stones — five irregular shapes with proper highlights and contour shadow
    const stones = [
      [w * 0.18, h * 0.72, 30, 0.78,  0.20],
      [w * 0.30, h * 0.68, 16, 0.85,  0.10],
      [w * 0.78, h * 0.34, 24, 0.70, -0.15],
      [w * 0.55, h * 0.62, 20, 0.92,  0.05],
      [w * 0.66, h * 0.30, 12, 0.88,  0.45],
    ];
    stones.forEach(([cx, cy, r, ratio, tilt]) => {
      // Cast shadow (drop)
      ctx.fillStyle = 'rgba(60, 40, 20, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.18, cy + r * 0.36, r * 1.05, r * ratio * 0.5, tilt, 0, Math.PI * 2);
      ctx.fill();

      // Main body
      const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.15, cx, cy, r * 1.05);
      g.addColorStop(0, '#cdd2d8');
      g.addColorStop(0.45, '#8a8e93');
      g.addColorStop(1, '#3d4147');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * ratio, tilt, 0, Math.PI * 2);
      ctx.fill();

      // Contour speckles for texture
      for (let s = 0; s < 8; s++) {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.random() * r * 0.7;
        ctx.fillStyle = `rgba(20,20,30,${0.05 + Math.random() * 0.1})`;
        ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * ratio, 1.5, 1.5);
      }

      // Highlight crescent
      const hl = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.45, 0, cx - r * 0.35, cy - r * 0.45, r * 0.6);
      hl.addColorStop(0, 'rgba(255,255,255,0.45)');
      hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * ratio, tilt, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. Cherry-blossom petals scattered — 6–8 tiny pink dots
    const petalCount = 7;
    for (let i = 0; i < petalCount; i++) {
      const px = Math.random() * w;
      const py = h * 0.18 + Math.random() * h * 0.50;
      const pr = 2.5 + Math.random() * 2.5;
      ctx.fillStyle = `rgba(255, 192, 203, ${0.55 + Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.68, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      // Small darker pink centre
      ctx.fillStyle = 'rgba(216, 95, 130, 0.45)';
      ctx.beginPath();
      ctx.arc(px, py, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

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
    const nx = -dy / len, ny = dx / len; // perpendicular unit vector
    const spacing = 6;
    ctx.lineCap = 'round';
    // Light direction is upper-left, so the highlight goes on the upper-left
    // side of each groove and the shadow on the lower-right.
    const lightOffset = 1.4;
    for (let i = -2; i <= 2; i++) {
      const ox = nx * i * spacing;
      const oy = ny * i * spacing;
      // Outer soft shadow (groove depth)
      ctx.strokeStyle = 'rgba(70, 45, 20, 0.22)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(a.x + ox + nx * lightOffset, a.y + oy + ny * lightOffset);
      ctx.lineTo(b.x + ox + nx * lightOffset, b.y + oy + ny * lightOffset);
      ctx.stroke();
      // Dark groove — main line
      ctx.strokeStyle = 'rgba(95, 65, 35, 0.55)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(a.x + ox, a.y + oy);
      ctx.lineTo(b.x + ox, b.y + oy);
      ctx.stroke();
      // Bright highlight on the lit side
      ctx.strokeStyle = 'rgba(255, 245, 220, 0.55)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(a.x + ox - nx * lightOffset, a.y + oy - ny * lightOffset);
      ctx.lineTo(b.x + ox - nx * lightOffset, b.y + oy - ny * lightOffset);
      ctx.stroke();
    }
  }

  drawFinger(a, b) {
    const ctx = this.ctx;
    ctx.lineCap = 'round';
    // Wide soft shadow underneath
    ctx.strokeStyle = 'rgba(70, 45, 20, 0.30)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(a.x + 2, a.y + 2);
    ctx.lineTo(b.x + 2, b.y + 2);
    ctx.stroke();
    // Main groove — darker centre
    ctx.strokeStyle = 'rgba(95, 65, 35, 0.55)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    // Sand-edge highlight
    ctx.strokeStyle = 'rgba(255, 244, 220, 0.55)';
    ctx.lineWidth = 3;
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
    this.lilies = [];
    this.koi = [];
    this.count = 0;
    this.running = false;
    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.count = stats.rippleCount ?? 0;
    this.updateDisplay();
    this.fitCanvas();
    this.layoutScene();
    requestAnimationFrame(() => { this.fitCanvas(); this.layoutScene(); });
    window.addEventListener('resize', () => { this.fitCanvas(); this.layoutScene(); });

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

  layoutScene() {
    const w = this.cssW, h = this.cssH;
    // Three lily pads — fixed positions, scale by canvas size, pinkish flowers
    this.lilies = [
      { x: w * 0.22, y: h * 0.72, r: Math.max(22, w * 0.07), flower: '#fce7f3' },
      { x: w * 0.78, y: h * 0.30, r: Math.max(18, w * 0.06), flower: '#fbcfe8' },
      { x: w * 0.55, y: h * 0.55, r: Math.max(20, w * 0.065), flower: '#f5d0fe' },
    ].map(L => ({ ...L, pulse: 0, lastHit: 0 }));

    // Two koi fish drifting at slow speed with phase offset
    this.koi = [
      { y: h * 0.45, dir:  1, speed: 14, phase: Math.random() * Math.PI * 2, size: Math.max(16, w * 0.05), color: '#fb923c' },
      { y: h * 0.20, dir: -1, speed: 10, phase: Math.random() * Math.PI * 2, size: Math.max(14, w * 0.045), color: '#f87171' },
    ];
    this.koi.forEach(k => { k.x = k.dir > 0 ? -k.size : w + k.size; });
  }

  addRipple(e) {
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const palette = ['#bae6fd', '#7dd3fc', '#a78bfa', '#22d3ee'];
    const color = palette[Math.floor(Math.random() * palette.length)];
    // Layered: 3 concentric ripples with different speeds for depth
    this.ripples.push({ x, y, t: 0, maxR: 220 + Math.random() * 60, speed: 140, color, opacity: 1.0, width: 2.4 });
    this.ripples.push({ x, y, t: -0.12, maxR: 170 + Math.random() * 40, speed: 110, color, opacity: 0.7, width: 1.5 });
    this.ripples.push({ x, y, t: -0.24, maxR: 130 + Math.random() * 30, speed:  90, color, opacity: 0.5, width: 1.0 });

    this.count++;
    this.updateDisplay();
    updateStat('rippleCount', this.count);
    Sound.blip(520 + Math.random() * 200, 0.22, 'sine', 0.05);

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
    const time = performance.now() / 1000;

    // 1. Deep-water vertical gradient — midnight teal at top, darker bottom
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0,    '#1e3a5f');
    base.addColorStop(0.45, '#0f5f7a');
    base.addColorStop(1,    '#0a3450');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. Shimmering surface bands — horizontal sinusoidal stripes that shift
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const y = h * (i / 8) + Math.sin(time * 0.6 + i * 0.7) * 6;
      const h2 = 4 + Math.sin(time * 0.9 + i) * 1.2;
      const alpha = 0.05 + Math.abs(Math.sin(time * 0.5 + i * 0.4)) * 0.08;
      ctx.fillStyle = `rgba(180, 230, 255, ${alpha.toFixed(3)})`;
      ctx.fillRect(0, y, w, h2);
    }
    ctx.restore();

    // 3. Soft caustic blobs drifting on the surface
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const cx = (Math.sin(time * 0.32 + i * 1.7) * 0.5 + 0.5) * w;
      const cy = (Math.cos(time * 0.27 + i * 2.1) * 0.5 + 0.5) * h;
      const rad = 70 + Math.sin(time + i) * 26;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, i % 2 ? '#ffffff' : '#a78bfa');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Koi fish — drift across, slight vertical bob
    this.koi.forEach(k => {
      k.x += k.dir * k.speed * dt;
      const fx = k.x;
      const fy = k.y + Math.sin(time + k.phase) * 4;
      // Wrap when off-canvas
      if (k.dir > 0 && fx > w + k.size * 1.5) k.x = -k.size * 1.5;
      if (k.dir < 0 && fx < -k.size * 1.5) k.x = w + k.size * 1.5;
      this.drawKoi(fx, fy, k.size, k.dir, k.color, time + k.phase);
    });

    // 5. Lily pads — rendered before ripples but their "pulse" updates from ripple intersections
    this.lilies.forEach(L => {
      // Update pulse toward 0
      L.pulse = Math.max(0, L.pulse - dt * 2.6);
      this.drawLilyPad(L.x, L.y, L.r, L.flower, L.pulse);
    });

    // 6. Ripples — three layered rings per click, plus a faint inner highlight
    this.ripples = this.ripples.filter(rp => {
      rp.t += dt;
      if (rp.t < 0) return true;  // delayed start
      const r = rp.t * rp.speed;
      if (r > rp.maxR) return false;
      const alpha = Math.max(0, (1 - r / rp.maxR)) * (rp.opacity ?? 1);

      // Hit-test lily pads — bump their pulse if a ripple front is near
      this.lilies.forEach(L => {
        const d = Math.hypot(L.x - rp.x, L.y - rp.y);
        if (Math.abs(d - r) < 6 && (time - (L.lastHit || 0)) > 0.18) {
          L.pulse = 1;
          L.lastHit = time;
        }
      });

      ctx.lineWidth = rp.width || 2;
      ctx.strokeStyle = `${rp.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2);
      ctx.stroke();
      if (r > 12) {
        ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.55).toFixed(3)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, r - 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      return true;
    });
  }

  drawLilyPad(cx, cy, r, flowerColor, pulse) {
    const ctx = this.ctx;
    const lift = Math.sin(pulse * Math.PI) * 3;
    const sx = 1 + pulse * 0.06;
    const sy = 1 + pulse * 0.06;
    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.beginPath();
    ctx.ellipse(cx + 3, cy + 5, r * 1.04 * sx, r * 0.62 * sy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pad body — radial gradient deep green to bright edge
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4 - lift, r * 0.1, cx, cy - lift, r);
    g.addColorStop(0, '#5fb874');
    g.addColorStop(0.55, '#2f7a4a');
    g.addColorStop(1, '#0f3f28');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy - lift, r * sx, r * 0.62 * sy, 0, 0, Math.PI * 2);
    ctx.fill();

    // The classic lily-pad "notch" — a wedge cut from the right edge
    ctx.save();
    ctx.fillStyle = '#0a3450';
    ctx.beginPath();
    ctx.moveTo(cx, cy - lift);
    ctx.lineTo(cx + r * 1.05 * sx, cy - lift - r * 0.15);
    ctx.lineTo(cx + r * 1.05 * sx, cy - lift + r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Vein lines
    ctx.strokeStyle = 'rgba(15, 50, 30, 0.55)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.45 + i * (Math.PI * 0.9 / 4);
      ctx.beginPath();
      ctx.moveTo(cx, cy - lift);
      ctx.lineTo(cx + Math.cos(a) * r * 0.95 * sx, cy - lift + Math.sin(a) * r * 0.58 * sy);
      ctx.stroke();
    }

    // Pad highlight — soft rim
    ctx.strokeStyle = 'rgba(180, 240, 200, 0.4)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(cx, cy - lift, r * sx * 0.96, r * 0.62 * sy * 0.96, 0, Math.PI * 1.05, Math.PI * 1.85);
    ctx.stroke();

    // Flower at the centre — five petals + golden core
    const fr = r * 0.32;
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * fr * 0.7;
      const py = cy - lift + Math.sin(angle) * fr * 0.7;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, fr * 0.85);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, flowerColor);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(px, py, fr * 0.55, fr * 0.32, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Core
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy - lift, fr * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy - lift, fr * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  drawKoi(cx, cy, size, dir, color, t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dir, 1);
    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(2, 4, size, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body
    const g = ctx.createLinearGradient(-size, 0, size, 0);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.5, color);
    g.addColorStop(1, '#7c2d12');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail — wiggle with time
    const wag = Math.sin(t * 4) * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-size * 0.85, 0);
    ctx.quadraticCurveTo(-size * 1.45, -size * 0.5 + wag * size * 0.3, -size * 1.6, -size * 0.42 + wag * size * 0.3);
    ctx.lineTo(-size * 1.55, size * 0.4 - wag * size * 0.3);
    ctx.quadraticCurveTo(-size * 1.4, size * 0.45 - wag * size * 0.3, -size * 0.85, 0);
    ctx.closePath();
    ctx.fill();
    // Top fin
    ctx.fillStyle = `${color}cc`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.35);
    ctx.quadraticCurveTo(-size * 0.1, -size * 0.6, size * 0.1, -size * 0.35);
    ctx.closePath();
    ctx.fill();
    // White spots
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(size * 0.25, -size * 0.05, size * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-size * 0.1, size * 0.18, size * 0.07, 0, Math.PI * 2); ctx.fill();
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(size * 0.55, -size * 0.05, size * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(size * 0.57, -size * 0.07, size * 0.022, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  updateDisplay() {
    const el = document.getElementById('ripple-count');
    if (el) el.textContent = this.count;
  }
}

/* ── Game 8: Galactic Slots (Star Wars) ──────────────────── */
class SlotMachineGame {
  static SYMBOLS = [
    { glyph: '⚔️', name: 'JEDI MASTER',     glow: '#00d4ff', payout: 100, weight: 4, banner: 'rainbow', palette: 'cool'    },
    { glyph: '🪐', name: 'IMPERIAL VICTORY', glow: '#ff3333', payout: 80,  weight: 3, banner: 'gold',    palette: 'gold'    },
    { glyph: '🤖', name: 'RESCUE COMPLETE', glow: '#a78bfa', payout: 60,  weight: 4, banner: 'neon',    palette: 'neon'    },
    { glyph: '🛸', name: 'REBEL ALLIANCE',  glow: '#fbbf24', payout: 40,  weight: 6, banner: 'gold',    palette: 'gold'    },
    { glyph: '⭐', name: 'THE FORCE',       glow: '#ffe81f', payout: 200, weight: 1, banner: 'rainbow', palette: 'rainbow' },
    { glyph: '💀', name: 'DARK SIDE',       glow: '#fb7185', payout: 30,  weight: 6, banner: 'neon',    palette: 'neon'    },
    { glyph: '⚡', name: 'UNLIMITED POWER', glow: '#c084fc', payout: 50,  weight: 3, banner: 'rainbow', palette: 'rainbow' },
  ];
  static SYMBOL_HEIGHT = 84;  // px — matches CSS .slot-symbol height
  static STRIP_LENGTH  = 32;  // symbols rendered per reel strip

  constructor() {
    this.root = document.getElementById('slot-game');
    if (!this.root) return;
    this.cabinet = this.root.querySelector('.slot-cabinet');
    this.stripEls = Array.from(this.root.querySelectorAll('.slot-strip'));
    this.reelEls  = Array.from(this.root.querySelectorAll('.slot-reel'));
    this.lever    = document.getElementById('slot-lever');
    this.statusEl = document.getElementById('slot-status');
    this.spinning = false;

    this.spins = 0;
    this.jackpots = 0;
    this.bestWin = 0;

    // Build a weighted pool used to roll fair-ish landing symbols
    this.pool = [];
    SlotMachineGame.SYMBOLS.forEach((s, i) => {
      for (let j = 0; j < s.weight; j++) this.pool.push(i);
    });

    this.init();
  }

  init() {
    const stats = getFidgetStats();
    this.spins    = stats.slotSpins ?? 0;
    this.jackpots = stats.slotJackpots ?? 0;
    this.bestWin  = stats.slotBestStreak ?? 0;
    this.updateDisplay();

    this.buildStrips();
    this.buildStarfield();

    if (this.lever) this.lever.addEventListener('click', () => this.spin());
  }

  buildStrips() {
    this.stripEls.forEach((strip, reelIdx) => {
      strip.innerHTML = '';
      // Fill each strip with STRIP_LENGTH symbols from the pool, then ensure
      // every symbol type appears at least once so any landing slot is reachable.
      const symbolsForStrip = [];
      for (let i = 0; i < SlotMachineGame.STRIP_LENGTH; i++) {
        symbolsForStrip.push(this.pool[Math.floor(Math.random() * this.pool.length)]);
      }
      // Guarantee every symbol index appears in the strip
      SlotMachineGame.SYMBOLS.forEach((_, idx) => {
        if (!symbolsForStrip.includes(idx)) {
          symbolsForStrip[Math.floor(Math.random() * symbolsForStrip.length)] = idx;
        }
      });
      symbolsForStrip.forEach((symIdx) => {
        const cell = document.createElement('div');
        cell.className = 'slot-symbol';
        cell.dataset.symbol = symIdx;
        const sym = SlotMachineGame.SYMBOLS[symIdx];
        cell.style.setProperty('--sym-glow', sym.glow);
        cell.textContent = sym.glyph;
        strip.appendChild(cell);
      });
      strip.dataset.symbols = symbolsForStrip.join(',');
      // Initial position: random landing — measured at spin time, set
      // simply to 0 here so it's well-defined even before layout.
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0px)';
      strip.dataset.landing = '0';
    });
  }

  /** Read the actual rendered symbol-cell height. Falls back to 84 if
      the layout hasn't settled yet (returns 0 from the DOM). */
  cellHeight(strip) {
    const first = strip && strip.firstElementChild;
    if (!first) return 84;
    const h = first.getBoundingClientRect().height;
    return h > 4 ? h : (first.offsetHeight || 84);
  }

  buildStarfield() {
    const container = this.root.querySelector('.slot-stars');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('span');
      s.className = 'slot-star';
      const sz = 1 + Math.random() * 2.4;
      s.style.cssText = [
        `left:${(Math.random() * 100).toFixed(2)}%`,
        `top:${(Math.random() * 100).toFixed(2)}%`,
        `width:${sz.toFixed(1)}px`,
        `height:${sz.toFixed(1)}px`,
        `animation-delay:${(Math.random() * 5).toFixed(2)}s`,
        `animation-duration:${(2 + Math.random() * 3).toFixed(2)}s`,
      ].join(';');
      container.appendChild(s);
    }
  }

  pickSymbolIndex() {
    return this.pool[Math.floor(Math.random() * this.pool.length)];
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.cabinet.classList.add('spinning');
    if (this.lever) this.lever.classList.add('pulled');
    Sound.blip(120, 0.45, 'sawtooth', 0.04);
    if (this.statusEl) this.statusEl.textContent = 'The reels stir…';

    // Roll three landing symbols
    const targets = [this.pickSymbolIndex(), this.pickSymbolIndex(), this.pickSymbolIndex()];

    // Stop times stagger so reels lock left → middle → right
    const stopMs = [1400, 2000, 2600];

    this.stripEls.forEach((strip, reelIdx) => {
      const symbols = strip.dataset.symbols.split(',').map(Number);
      // Find any instance of the target in the strip
      let landingPos = symbols.indexOf(targets[reelIdx]);
      if (landingPos < 0) landingPos = 0;

      const H = this.cellHeight(strip);
      // Add full strip cycles so the reel actually appears to spin a few times
      const cycles = 4 + reelIdx;
      const totalIndex = landingPos + cycles * symbols.length;
      const totalY = -totalIndex * H;
      const landY  = -landingPos  * H;
      const durationS = (stopMs[reelIdx] / 1000).toFixed(2);

      // Commit transition: none on the strip's current position, then in
      // the next animation frame apply a fresh transition + target so the
      // browser actually animates the change (rather than batching the
      // transition + transform into a single non-animated update).
      strip.style.transition = 'none';
      void strip.offsetWidth;

      requestAnimationFrame(() => {
        strip.style.transition = `transform ${durationS}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
        strip.style.transform = `translateY(${totalY}px)`;
      });

      setTimeout(() => {
        // Snap to a normalized position so further spins stay in range
        strip.style.transition = 'none';
        strip.style.transform = `translateY(${landY}px)`;
        strip.dataset.landing = String(landingPos);
        this.reelEls[reelIdx].classList.add('locked');
        Sound.blip(420, 0.05, 'square', 0.06);
        if (reelIdx === 2) {
          setTimeout(() => this.evaluate(targets), 220);
        }
      }, stopMs[reelIdx]);
    });

    this.spins++;
    updateStat('slotSpins', this.spins);
    this.updateDisplay();
  }

  evaluate(targets) {
    this.cabinet.classList.remove('spinning');
    if (this.lever) this.lever.classList.remove('pulled');
    this.reelEls.forEach(r => r.classList.remove('locked'));

    const [a, b, c] = targets;
    const sym = SlotMachineGame.SYMBOLS;
    const cardEl = this.root.closest('.fidget-game-card');
    const r = this.cabinet.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    if (a === b && b === c) {
      // Triple jackpot
      const winSym = sym[a];
      this.jackpots++;
      const win = winSym.payout;
      if (win > this.bestWin) this.bestWin = win;
      updateStat('slotJackpots', this.jackpots);
      updateStat('slotBestStreak', this.bestWin);

      Arcade.banner(winSym.name + '!', winSym.banner);
      Arcade.confetti(cx, cy, 28, winSym.palette);
      if (cardEl) {
        Arcade.confettiRain(cardEl, 50, winSym.palette);
        Arcade.shake(cardEl, 'hard');
      }
      Arcade.popScore(cx, cy - 30, `+${win}`, winSym.glow);
      Sound.jingle('jackpot');
      // Glow the locked reels in the win colour briefly
      this.reelEls.forEach(reel => {
        reel.style.setProperty('--reel-win-glow', winSym.glow);
        reel.classList.add('win-glow');
        setTimeout(() => reel.classList.remove('win-glow'), 1400);
      });
      if (this.statusEl) this.statusEl.textContent = `★ ${winSym.name} — +${win}!`;
    } else if (a === b || b === c || a === c) {
      // Pair = near miss
      Arcade.banner('ALMOST!', 'neon');
      Arcade.popScore(cx, cy - 30, '+5', '#7dd3fc');
      Sound.jingle('cha-ching');
      if (this.statusEl) this.statusEl.textContent = 'So close — pair found.';
    } else {
      Sound.blip(220, 0.18, 'triangle', 0.04);
      if (this.statusEl) this.statusEl.textContent = 'Try again — the Force is patient.';
    }

    this.updateDisplay();
    this.spinning = false;
  }

  updateDisplay() {
    const s = document.getElementById('slot-spins');
    const j = document.getElementById('slot-jackpots');
    const b = document.getElementById('slot-best');
    if (s) s.textContent = this.spins;
    if (j) j.textContent = this.jackpots;
    if (b) b.textContent = this.bestWin;
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
  new SlotMachineGame();
});
