'use strict';
/* Fidget Garden — calm toy implementations (2026-09-30)
   No scores to chase, no fail states. Just gentle things to touch. */

/* ── Soft sounds (created on first touch) ──────────────────── */
const Garden_Sound = (() => {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur = 0.12, type = 'sine', vol = 0.05, when = 0) {
    const c = ensure();
    if (!c) return;
    const t = c.currentTime + when;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
  /** soft bubble pop — pitch varies a little */
  function pop() { tone(420 + Math.random() * 260, 0.10, 'sine', 0.045); }
  /** gentle high tick for the stone's full circles */
  function tick() { tone(880, 0.08, 'sine', 0.03); }
  /** warm low release for the stress ball */
  function release() { tone(180, 0.18, 'sine', 0.05); tone(120, 0.22, 'sine', 0.04, 0.02); }
  /** soft chime when the orb completes a breath cycle */
  function breathChime() { tone(523, 0.5, 'sine', 0.035); tone(784, 0.6, 'sine', 0.03, 0.12); }
  return { pop, tick, release, breathChime };
})();

const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/* ── Toy 1: Bubble Pop ─────────────────────────────────────── */
function initBubbles() {
  const stage = document.getElementById('bubble-stage');
  const countEl = document.getElementById('bubble-count');
  if (!stage) return;
  let popped = 0;
  const bubbles = new Set();
  const MAX_BUBBLES = 8;

  function spawn() {
    if (bubbles.size >= MAX_BUBBLES) return;
    const size = 34 + Math.random() * 30;
    const b = document.createElement('div');
    b.className = 'garden-bubble';
    const left = 4 + Math.random() * 88;
    b.style.width = b.style.height = `${size.toFixed(0)}px`;
    b.style.left = `${left.toFixed(1)}%`;
    b.setAttribute('role', 'button');
    b.setAttribute('aria-label', 'Pop bubble');
    const speed = (REDUCED_MOTION ? 18 : 45) + Math.random() * 40; // px per second
    const rec = { el: b, y: stage.clientHeight + 10, speed, size, dead: false };
    b.style.top = '0';
    b.style.bottom = 'auto';
    b.style.transform = `translateY(${rec.y}px)`;

    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      popBubble(rec);
    });
    stage.appendChild(b);
    bubbles.add(rec);
  }

  function popBubble(rec) {
    if (rec.dead) return;
    rec.dead = true;
    const { el, y, size } = rec;
    el.classList.add('popping');
    Garden_Sound.pop();
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('div');
      p.className = 'bubble-puff';
      const ps = 8 + Math.random() * 14;
      p.style.width = p.style.height = `${ps.toFixed(0)}px`;
      p.style.left = `${(Math.random() * size).toFixed(0)}px`;
      p.style.top = `${(y + Math.random() * size * 0.5).toFixed(0)}px`;
      stage.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
    popped += 1;
    if (countEl) countEl.textContent = popped;
    setTimeout(() => { el.remove(); bubbles.delete(rec); }, 300);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    for (const rec of bubbles) {
      if (rec.dead) continue;
      rec.y -= rec.speed * dt;
      if (rec.y < -rec.size - 20) {
        rec.el.remove();
        bubbles.delete(rec);
        continue;
      }
      rec.el.style.transform = `translateY(${rec.y.toFixed(1)}px)`;
    }
    requestAnimationFrame(frame);
  }

  for (let i = 0; i < 5; i++) setTimeout(spawn, i * 350);
  setInterval(spawn, 1500);
  requestAnimationFrame(frame);
}

/* ── Toy 2: Breathing Orb ──────────────────────────────────── */
function initBreathOrb() {
  const orb = document.getElementById('breath-orb');
  const phaseEl = document.getElementById('orb-phase');
  const btn = document.getElementById('orb-toggle');
  if (!orb || !btn) return;

  const PHASES = [
    { name: 'Breathe in…',  dur: 4000, from: 1,    to: 1.45 },
    { name: 'Hold…',        dur: 4000, from: 1.45, to: 1.45 },
    { name: 'Breathe out…', dur: 6000, from: 1.45, to: 1 },
  ];
  let running = false;
  let rafId = null;
  let phaseIdx = 0;
  let phaseStart = 0;

  const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function tick(now) {
    if (!running) return;
    if (!phaseStart) phaseStart = now;
    const ph = PHASES[phaseIdx];
    const t = Math.min((now - phaseStart) / ph.dur, 1);
    const s = ph.from + (ph.to - ph.from) * ease(t);
    orb.style.transform = `scale(${s.toFixed(3)})`;
    if (t >= 1) {
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      phaseStart = now;
      if (phaseIdx === 0) Garden_Sound.breathChime();
      if (phaseEl) phaseEl.textContent = PHASES[phaseIdx].name;
    }
    rafId = requestAnimationFrame(tick);
  }

  btn.addEventListener('click', () => {
    running = !running;
    if (running) {
      phaseIdx = 0;
      phaseStart = 0;
      orb.classList.add('breath-orb--active');
      btn.textContent = 'Rest 🌙';
      if (phaseEl) phaseEl.textContent = PHASES[0].name;
      rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafId);
      orb.classList.remove('breath-orb--active');
      orb.style.transform = 'scale(1)';
      btn.textContent = 'Begin 🌸';
      if (phaseEl) phaseEl.textContent = 'Press begin when you\u2019re ready';
    }
  });
}

/* ── Toy 3: Worry Stone ────────────────────────────────────── */
function initWorryStone() {
  const stone = document.getElementById('worry-stone');
  const rubsEl = document.getElementById('stone-rubs');
  if (!stone) return;

  let rubbing = false;
  let lastAngle = 0;
  let acc = 0;
  let rubs = 0;
  let warmth = 0;
  let lastTick = 0;

  function center() {
    const r = stone.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function angleOf(e) {
    const c = center();
    return Math.atan2(e.clientY - c.y, e.clientX - c.x);
  }
  function delta(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  stone.addEventListener('pointerdown', (e) => {
    rubbing = true;
    lastAngle = angleOf(e);
    try { stone.setPointerCapture(e.pointerId); } catch {}
  });
  stone.addEventListener('pointermove', (e) => {
    if (!rubbing) return;
    const a = angleOf(e);
    const d = delta(a, lastAngle);
    lastAngle = a;
    acc += Math.abs(d);
    warmth = Math.min(1, warmth + Math.abs(d) * 0.06);
    if (acc >= Math.PI * 2) {
      acc -= Math.PI * 2;
      rubs += 1;
      if (rubsEl) rubsEl.textContent = rubs;
      if (performance.now() - lastTick > 900) {
        lastTick = performance.now();
        Garden_Sound.tick();
      }
    }
  });
  const end = () => { rubbing = false; };
  stone.addEventListener('pointerup', end);
  stone.addEventListener('pointercancel', end);

  (function glowLoop() {
    warmth = Math.max(0, warmth - 0.008);
    const w = warmth;
    stone.style.boxShadow =
      `inset -8px -12px 24px rgba(124,58,237,${(0.25 - w * 0.1).toFixed(2)}),` +
      ` inset 6px 8px 18px rgba(255,255,255,0.6),` +
      ` 0 14px 34px rgba(167,139,250,0.3),` +
      ` 0 0 ${(w * 46).toFixed(0)}px rgba(251,191,36,${(w * 0.55).toFixed(2)})`;
    stone.style.filter = `saturate(${(1 + w * 0.35).toFixed(2)}) brightness(${(1 + w * 0.08).toFixed(2)})`;
    requestAnimationFrame(glowLoop);
  })();
}

/* ── Toy 4: Spinner Wheel ──────────────────────────────────── */
function initSpinner() {
  const canvas = document.getElementById('spinner-canvas');
  const wordEl = document.getElementById('spinner-word');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const WORDS = ['breathe', 'soften', 'rest', 'unclench', 'pause', 'float', 'ease', 'be'];
  const COLORS = ['#f9b8d0', '#e8b4e8', '#c4b5fd', '#a78bfa', '#7dd3fc', '#bae6fd', '#fbcfe8', '#ddd6fe'];
  const N = WORDS.length;
  const R = 140, CX = 150, CY = 150;

  let angle = 0;        // current rotation (radians)
  let vel = 0;          // angular velocity
  let dragging = false;
  let lastPtr = 0;
  let lastT = 0;

  function draw() {
    ctx.clearRect(0, 0, 300, 300);
    for (let i = 0; i < N; i++) {
      const a0 = angle + (i / N) * Math.PI * 2;
      const a1 = angle + ((i + 1) / N) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // word
      const mid = (a0 + a1) / 2;
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#5b4a63';
      ctx.font = '700 15px Nunito, sans-serif';
      ctx.fillText(WORDS[i], R - 18, 0);
      ctx.restore();
    }
    // hub
    ctx.beginPath();
    ctx.arc(CX, CY, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e87ca0';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#e87ca0';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌸', CX, CY + 1);
  }

  function ptrAngle(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width) - CX;
    const y = (e.clientY - r.top) * (canvas.height / r.height) - CY;
    return Math.atan2(y, x);
  }
  function angDelta(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    vel = 0;
    lastPtr = ptrAngle(e);
    lastT = performance.now();
    try { canvas.setPointerCapture(e.pointerId); } catch {}
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const a = ptrAngle(e);
    const now = performance.now();
    const d = angDelta(a, lastPtr);
    const dt = Math.max((now - lastT) / 1000, 0.001);
    angle += d;
    vel = 0.7 * vel + 0.3 * (d / dt);
    lastPtr = a;
    lastT = now;
    draw();
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    // a simple tap (no real flick) gets a gentle random spin
    if (Math.abs(vel) < 1.2) vel = (2.5 + Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1);
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function landedWord() {
    // pointer is at top (-90°). Find segment under it.
    let rel = (-Math.PI / 2 - angle) % (Math.PI * 2);
    if (rel < 0) rel += Math.PI * 2;
    const idx = Math.floor(rel / (Math.PI * 2 / N)) % N;
    return WORDS[idx];
  }

  let lastWord = '';
  (function spinLoop() {
    if (!dragging && Math.abs(vel) > 0.002) {
      angle += vel / 60;
      vel *= 0.985;
      draw();
      if (Math.abs(vel) <= 0.02) {
        const w = landedWord();
        if (w !== lastWord && wordEl) {
          wordEl.textContent = `\u201c${w}\u201d`;
          lastWord = w;
        }
      }
    }
    requestAnimationFrame(spinLoop);
  })();

  draw();
}

/* ── Toy 5: Stress Ball ────────────────────────────────────── */
function initStressBall() {
  const ball = document.getElementById('stress-ball');
  if (!ball) return;

  ball.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ball.classList.remove('stress-ball--released');
    ball.classList.add('stress-ball--squeezed');
    try { ball.setPointerCapture(e.pointerId); } catch {}
  });
  const release = () => {
    if (!ball.classList.contains('stress-ball--squeezed')) return;
    ball.classList.remove('stress-ball--squeezed');
    ball.classList.add('stress-ball--released');
    Garden_Sound.release();
    setTimeout(() => ball.classList.remove('stress-ball--released'), 550);
  };
  ball.addEventListener('pointerup', release);
  ball.addEventListener('pointercancel', release);
}

/* ── Toy 6: Zen Sand Garden ────────────────────────────────── */
function initSand() {
  const canvas = document.getElementById('sand-canvas');
  const smoothBtn = document.getElementById('sand-smooth');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function paintSand() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f6ead9');
    g.addColorStop(1, '#efdfc8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // subtle grain
    ctx.fillStyle = 'rgba(160,130,100,0.10)';
    for (let i = 0; i < 500; i++) {
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
    }
  }
  paintSand();

  let drawing = false;
  let last = null;
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (W / r.width),
      y: (e.clientY - r.top) * (H / r.height),
    };
  }
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    last = pos(e);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = 'rgba(150,115,90,0.55)';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    // inner highlight line for a raked look
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y - 2);
    ctx.lineTo(p.x, p.y - 2);
    ctx.stroke();
    last = p;
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  if (smoothBtn) {
    smoothBtn.addEventListener('click', () => {
      // gentle fade-out then fresh sand
      let a = 0;
      const fade = setInterval(() => {
        a += 0.08;
        ctx.fillStyle = `rgba(246,234,217,${Math.min(a, 1) * 0.25})`;
        ctx.fillRect(0, 0, W, H);
        if (a >= 1) {
          clearInterval(fade);
          paintSand();
        }
      }, 40);
    });
  }
}

/* ── Toy 7: Pop-It Board ───────────────────────────────────── */
function initPopIt() {
  const grid = document.getElementById('popit-grid');
  const resetBtn = document.getElementById('popit-reset');
  if (!grid) return;
  const PALETTES = [
    ['#fbcfe8', '#f472b6'], ['#ddd6fe', '#a78bfa'], ['#bae6fd', '#60a5fa'],
    ['#fde68a', '#fbbf24'], ['#bbf7d0', '#34d399'], ['#fecdd3', '#fb7185'],
  ];
  const CELLS = 36;
  for (let i = 0; i < CELLS; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'popit';
    const [c1, c2] = PALETTES[i % PALETTES.length];
    b.style.setProperty('--pop-c1', c1);
    b.style.setProperty('--pop-c2', c2);
    b.setAttribute('aria-label', `Pop bubble ${i + 1}`);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      const down = b.classList.toggle('popit--down');
      b.setAttribute('aria-pressed', down ? 'true' : 'false');
      Garden_Sound.pop();
    });
    grid.appendChild(b);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      grid.querySelectorAll('.popit--down').forEach((b) => {
        b.classList.remove('popit--down');
        b.setAttribute('aria-pressed', 'false');
      });
    });
  }
}

/* ── Toy 8: Ripple Pond ────────────────────────────────────── */
function initRipples() {
  const canvas = document.getElementById('ripple-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const ripples = [];

  function paintWater() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#dbeafe');
    g.addColorStop(0.55, '#bfdbfe');
    g.addColorStop(1, '#a5c4f5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drop(x, y) {
    ripples.push({ x, y, r: 6, alpha: 0.7, speed: REDUCED_MOTION ? 22 : 55 });
    if (ripples.length > 24) ripples.shift();
  }

  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    drop(
      (e.clientX - r.left) * (W / r.width),
      (e.clientY - r.top) * (H / r.height)
    );
  });

  let last = performance.now();
  (function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    paintWater();
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += rp.speed * dt;
      rp.alpha -= dt * 0.35;
      if (rp.alpha <= 0 || rp.r > 260) {
        ripples.splice(i, 1);
        continue;
      }
      for (let ring = 0; ring < 3; ring++) {
        const rr = rp.r - ring * 14;
        if (rr <= 0) continue;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${(rp.alpha * (1 - ring * 0.25)).toFixed(3)})`;
        ctx.lineWidth = 3 - ring * 0.7;
        ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  })(last);
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initBubbles();
  initBreathOrb();
  initWorryStone();
  initSpinner();
  initStressBall();
  initSand();
  initPopIt();
  initRipples();
});
