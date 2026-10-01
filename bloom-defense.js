'use strict';
/* Bloom Defense — a cozy lane-defense game for the Fidget Garden (2026-10-01)
   Vanilla JS, DOM-based. 5 rows x 9 cols. No audio — silent and calm. */

(function () {
  /* ── Helpers ─────────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ── Config ──────────────────────────────────────────────── */
  const ROWS = 5, COLS = 9;
  const TICK = 0.1;                 // seconds per game tick
  const XMAX = 10.5;                // lane units: mower col [0,1), plant cols -> [c+1, c+2)
  const BEST_KEY = 'bloom_best';
  const SKY_SUN_EVERY = 8;          // seconds between sky suns
  const SUN_VALUE = 25;
  const SUNFLOWER_EVERY = 12;       // seconds between sunflower drops
  const SUN_DESPAWN = 10;           // seconds before an uncollected sun fades
  const PEA_EVERY = 1.4, PEA_DMG = 20, PEA_SPEED = 2.6; // cols/sec
  const BITE_DPS = 100;
  const CRATER_SECS = 10;

  const PLANTS = [
    { id: 'sunflower',  name: 'Sunflower',   emoji: '🌻', cost: 50,  hp: 300,  cd: 5,  hint: 'Makes extra sun' },
    { id: 'peashooter', name: 'Peashooter',  emoji: '🌱', cost: 100, hp: 300,  cd: 7,  hint: 'Shoots peas' },
    { id: 'snowpea',    name: 'Snow Pea',    emoji: '❄️', cost: 175, hp: 300,  cd: 7,  hint: 'Slowing peas' },
    { id: 'wallnut',    name: 'Wall-nut',    emoji: '🥜', cost: 50,  hp: 4000, cd: 12, hint: 'Tough blocker' },
    { id: 'cherry',     name: 'Cherry Bomb', emoji: '🍒', cost: 150, hp: 300,  cd: 20, hint: 'Big 3×3 boom' },
  ];
  const PLANT_BY_ID = {};
  PLANTS.forEach((p) => { PLANT_BY_ID[p.id] = p; });

  const ZTYPES = {
    basic:  { emoji: '🧟',   hp: 200, speed: 0.34, score: 100, name: 'Zombie' },
    speedy: { emoji: '🧟‍♀️', hp: 130, speed: 0.55, score: 150, name: 'Speedy zombie' },
    cone:   { emoji: '🧟‍♂️', hp: 560, speed: 0.27, score: 250, name: 'Conehead zombie' },
  };

  // Wave builder: (basics, speedies, coneheads, spawn gap secs, huge?)
  function makeWave(b, s, c, gap, huge) {
    const q = [];
    for (let i = 0; i < b; i++) q.push('basic');
    for (let i = 0; i < s; i++) q.push('speedy');
    for (let i = 0; i < c; i++) q.push('cone');
    for (let i = q.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = q[i]; q[i] = q[j]; q[j] = t;
    }
    return { queue: q, gap: gap, huge: !!huge };
  }
  const WAVES = [
    makeWave(4, 0, 0, 6),
    makeWave(4, 0, 0, 6.5),
    makeWave(6, 2, 0, 5.5),
    makeWave(8, 3, 0, 5),
    makeWave(10, 4, 2, 4.5, true),
    makeWave(8, 4, 2, 4.5),
    makeWave(10, 6, 3, 4),
    makeWave(12, 6, 4, 4),
    makeWave(12, 8, 6, 3.5),
    makeWave(14, 8, 8, 3.5, true),
  ];

  /* ── State ───────────────────────────────────────────────── */
  const S = {
    running: false, paused: false, over: false,
    sun: 250, score: 0, best: 0,
    wave: 0, waveActive: false, waveTotal: 0, waveKilled: 0,
    plants: [], zombies: [], peas: [], suns: [],
    mowers: [], craters: new Map(), cooldowns: {},
    selected: null, time: 0, skyT: 3,
    spawnQueue: [], spawnT: 0, spawnGap: 5,
    tickId: null, overlayKind: null,
  };

  /* ── DOM refs (filled in init) ───────────────────────────── */
  let stage, lawn, fx, overlay, banner, statusEl;
  let sunEl, waveNumEl, waveFillEl, scoreEl, pauseBtn, packetsEl, bankEl;

  const tileKey = (r, c) => r + ',' + c;
  const tileEl = (r, c) => lawn.querySelector(`.bloom-tile[data-r="${r}"][data-c="${c}"]`);

  /* ── Status announcements ────────────────────────────────── */
  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

  /* ── Top bar / packets UI ────────────────────────────────── */
  function updateTopbar() {
    if (sunEl) sunEl.textContent = S.sun;
    if (scoreEl) scoreEl.textContent = S.score;
    if (waveNumEl) waveNumEl.textContent = S.wave === 0 ? '–' : S.wave;
  }
  function bumpBank() {
    if (!bankEl) return;
    bankEl.classList.remove('bump');
    void bankEl.offsetWidth;
    bankEl.classList.add('bump');
  }
  function updateWavebar() {
    if (!waveFillEl) return;
    const pct = S.waveTotal > 0 ? (S.waveKilled / S.waveTotal) * 100 : 0;
    waveFillEl.style.width = clamp(pct, 0, 100).toFixed(1) + '%';
  }
  function updatePackets() {
    if (!packetsEl) return;
    packetsEl.querySelectorAll('.bloom-packet').forEach((btn) => {
      const id = btn.dataset.p;
      if (id === 'shovel') {
        btn.classList.toggle('sel', S.selected === 'shovel');
        return;
      }
      const p = PLANT_BY_ID[id];
      const cdLeft = S.cooldowns[id] || 0;
      const afford = S.sun >= p.cost;
      btn.classList.toggle('cant', !afford || cdLeft > 0);
      btn.classList.toggle('cooling', cdLeft > 0);
      btn.classList.toggle('sel', S.selected === id);
      btn.style.setProperty('--cd', (cdLeft / p.cd).toFixed(3));
      btn.setAttribute('aria-label',
        `${p.name}, costs ${p.cost} sun${cdLeft > 0 ? ', recharging' : ''}${!afford ? ', not enough sun' : ''}. ${p.hint}.`);
    });
  }

  /* ── Selection ───────────────────────────────────────────── */
  function select(id) {
    S.selected = (S.selected === id) ? null : id;
    lawn.classList.toggle('placing', !!S.selected);
    updatePackets();
    if (S.selected && S.selected !== 'shovel') {
      setStatus(`${PLANT_BY_ID[S.selected].name} selected — tap a lawn tile to plant 🌱`);
    } else if (S.selected === 'shovel') {
      setStatus('Shovel selected — tap a plant to remove it');
    }
  }

  /* ── Build: packets + lawn ───────────────────────────────── */
  function buildPackets() {
    packetsEl.innerHTML = '';
    PLANTS.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bloom-packet';
      b.dataset.p = p.id;
      b.setAttribute('aria-label', `${p.name}, costs ${p.cost} sun. ${p.hint}.`);
      b.innerHTML =
        `<span class="bp-emoji" aria-hidden="true">${p.emoji}</span>` +
        `<span class="bp-name" aria-hidden="true">${p.name}</span>` +
        `<span class="bp-cost" aria-hidden="true">☀️${p.cost}</span>` +
        `<span class="bp-cd" aria-hidden="true"></span>`;
      b.addEventListener('click', () => {
        if (!S.running || S.paused || S.over) return;
        const cdLeft = S.cooldowns[p.id] || 0;
        if (S.sun < p.cost || cdLeft > 0) { setStatus(`Not ready yet — ${p.name} needs ${p.cost} sun`); return; }
        select(p.id);
      });
      packetsEl.appendChild(b);
    });
    const sh = document.createElement('button');
    sh.type = 'button';
    sh.className = 'bloom-packet';
    sh.dataset.p = 'shovel';
    sh.setAttribute('aria-label', 'Shovel — remove a plant');
    sh.innerHTML =
      `<span class="bp-emoji" aria-hidden="true">⛏️</span>` +
      `<span class="bp-name" aria-hidden="true">Shovel</span>` +
      `<span class="bp-cost" aria-hidden="true">&nbsp;</span>`;
    sh.addEventListener('click', () => {
      if (!S.running || S.paused || S.over) return;
      select('shovel');
    });
    packetsEl.appendChild(sh);
  }

  function buildLawn() {
    lawn.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'bloom-row';
      const mc = document.createElement('div');
      mc.className = 'bloom-mower-cell';
      const mspan = document.createElement('span');
      mspan.className = 'bloom-mower';
      mspan.id = 'bloom-mower-' + r;
      mspan.setAttribute('aria-hidden', 'true');
      mspan.textContent = '🚜';
      mc.appendChild(mspan);
      row.appendChild(mc);
      for (let c = 0; c < COLS; c++) {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'bloom-tile t' + ((r + c) % 2);
        t.dataset.r = r; t.dataset.c = c;
        t.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}, empty`);
        t.addEventListener('click', () => onTile(r, c));
        row.appendChild(t);
      }
      lawn.appendChild(row);
    }
  }

  /* ── Tiles / plants ──────────────────────────────────────── */
  function onTile(r, c) {
    if (!S.running || S.paused || S.over) return;
    if (!S.selected) { setStatus('Pick a seed packet first 🌱'); return; }
    if (S.selected === 'shovel') { shovelTile(r, c); return; }
    tryPlace(r, c);
  }

  function deny(r, c, msg) {
    const t = tileEl(r, c);
    if (t) { t.classList.remove('deny'); void t.offsetWidth; t.classList.add('deny'); }
    if (msg) setStatus(msg);
    updatePackets();
  }

  function tryPlace(r, c) {
    const p = PLANT_BY_ID[S.selected];
    if (!p) return;
    if (S.craters.has(tileKey(r, c))) return deny(r, c, 'Too soon — let the soil rest a moment 🌋');
    if (S.plants[r][c]) return deny(r, c, 'Something is already growing there 🌷');
    const cdLeft = S.cooldowns[p.id] || 0;
    if (S.sun < p.cost) return deny(r, c, `Need ${p.cost} sun for ${p.name} ☀️`);
    if (cdLeft > 0) return deny(r, c, `${p.name} is still recharging ⏳`);

    S.sun -= p.cost;
    S.cooldowns[p.id] = p.cd;
    const plant = {
      type: p.id, hp: p.hp, maxHp: p.hp, row: r, col: c,
      lastShot: 0, lastSun: S.time, fuseT: p.id === 'cherry' ? 1.2 : 0,
      hurtT: -9, el: null, hpEl: null,
    };
    S.plants[r][c] = plant;
    renderPlant(plant);
    S.selected = null;
    lawn.classList.remove('placing');
    updateTopbar(); updatePackets();
    if ((p.id === 'peashooter' || p.id === 'snowpea') && !zombieAhead(r, c + 1.6)) {
      setStatus(`${p.name} planted — it'll open fire when a zombie comes down this row 🎯`);
    } else {
      setStatus(`${p.name} planted 🌷`);
    }
  }

  function renderPlant(plant) {
    const t = tileEl(plant.row, plant.col);
    if (!t) return;
    const p = PLANT_BY_ID[plant.type];
    t.classList.add('has-plant');
    t.innerHTML =
      `<span class="bloom-plant${plant.type === 'cherry' ? ' fusing' : ''}" aria-hidden="true"` +
      ` style="animation-delay:${(-rnd(0, 3)).toFixed(2)}s">${p.emoji}</span>` +
      `<span class="bloom-hpbar" aria-hidden="true" hidden><i style="width:100%"></i></span>`;
    plant.el = t.querySelector('.bloom-plant');
    plant.hpEl = t.querySelector('.bloom-hpbar');
    t.setAttribute('aria-label', `Row ${plant.row + 1}, column ${plant.col + 1}, ${p.name}`);
  }

  function refreshPlantHp(plant) {
    if (!plant.hpEl) return;
    const frac = clamp(plant.hp / plant.maxHp, 0, 1);
    if (frac >= 1) { plant.hpEl.hidden = true; return; }
    plant.hpEl.hidden = false;
    plant.hpEl.firstChild.style.width = (frac * 100).toFixed(1) + '%';
  }

  function flashPlantHurt(plant) {
    if (S.time - plant.hurtT < 0.5 || !plant.el) return;
    plant.hurtT = S.time;
    plant.el.classList.add('hurt');
    setTimeout(() => { if (plant.el) plant.el.classList.remove('hurt'); }, 180);
  }

  function removePlant(r, c) {
    const plant = S.plants[r][c];
    S.plants[r][c] = null;
    const t = tileEl(r, c);
    if (t) {
      t.classList.remove('has-plant');
      t.innerHTML = '';
      t.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}, empty`);
    }
    return plant;
  }

  function shovelTile(r, c) {
    if (!S.plants[r][c]) { setStatus('Nothing to dig up there'); return; }
    const p = PLANT_BY_ID[S.plants[r][c].type];
    removePlant(r, c);
    S.selected = null;
    lawn.classList.remove('placing');
    updatePackets();
    setStatus(`${p.name} removed`);
  }

  /* ── Zombies ─────────────────────────────────────────────── */
  /* Draw a zombie spawn row from a shuffled deck so waves spread fairly
     across rows instead of randomly stacking one row. */
  function drawRow() {
    if (S.rowDeck.length === 0) {
      S.rowDeck = [0, 1, 2, 3, 4];
      for (let i = S.rowDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = S.rowDeck[i]; S.rowDeck[i] = S.rowDeck[j]; S.rowDeck[j] = tmp;
      }
    }
    return S.rowDeck.pop();
  }

  function spawnZombie(type, row) {
    const t = ZTYPES[type];
    const el = document.createElement('div');
    el.className = 'bloom-zombie';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      `<span class="zs">${t.emoji}</span>` +
      `<span class="bloom-zhp"><i style="width:100%"></i></span>`;
    fx.appendChild(el);
    const z = {
      type: type, hp: t.hp, maxHp: t.hp, x: XMAX - 0.1, row: row,
      speed: t.speed * rnd(0.92, 1.08), slowUntil: 0,
      biting: false, el: el,
      hpEl: el.querySelector('.bloom-zhp'),
      hpFill: el.querySelector('.bloom-zhp i'),
      sprite: el.querySelector('.zs'),
    };
    S.zombies.push(z);
    positionZombie(z);
    return z;
  }

  function positionZombie(z) {
    z.el.style.left = (z.x / XMAX * 100).toFixed(2) + '%';
    z.el.style.top = ((z.row + 0.5) / ROWS * 100).toFixed(2) + '%';
  }

  function refreshZombieHp(z) {
    const frac = clamp(z.hp / z.maxHp, 0, 1);
    if (z.hpFill) z.hpFill.style.width = (frac * 100).toFixed(1) + '%';
    if (z.hpEl) z.hpEl.style.display = frac >= 1 ? 'none' : 'block';
  }

  function damageZombie(z, dmg, frozen) {
    z.hp -= dmg;
    if (frozen) {
      z.slowUntil = S.time + 4;
      z.el.classList.add('slowed');
    }
    z.el.classList.remove('flinch');
    void z.el.offsetWidth;
    z.el.classList.add('flinch');
    refreshZombieHp(z);
    if (z.hp <= 0) killZombie(z, true);
  }

  function killZombie(z, scored) {
    const i = S.zombies.indexOf(z);
    if (i === -1) return; // already gone
    S.zombies.splice(i, 1);
    S.waveKilled++;
    if (scored) S.score += ZTYPES[z.type].score;
    updateTopbar(); updateWavebar();
    z.el.classList.add('dying');
    const el = z.el;
    setTimeout(() => el.remove(), 480);
  }

  function updateZombies() {
    for (const z of [...S.zombies]) {
      // find plant to bite: tile col under zombie's mouth
      const tc = Math.floor(z.x - 1.1);
      let target = null;
      if (tc >= 0 && tc < COLS && z.x <= tc + 2.25) target = S.plants[z.row][tc];

      if (target) {
        z.biting = true;
        z.el.classList.add('biting');
        target.hp -= BITE_DPS * TICK;
        flashPlantHurt(target);
        refreshPlantHp(target);
        if (target.hp <= 0) {
          removePlant(target.row, target.col);
          z.biting = false;
          z.el.classList.remove('biting');
        }
      } else {
        if (z.biting) { z.biting = false; z.el.classList.remove('biting'); }
        const slowed = S.time < z.slowUntil;
        if (!slowed) z.el.classList.remove('slowed');
        z.x -= z.speed * (slowed ? 0.5 : 1) * TICK;
      }

      if (z.x <= 0.95) { mowerCheck(z); if (S.over) return; continue; }
      positionZombie(z);
    }
  }

  /* ── Mowers ──────────────────────────────────────────────── */
  function mowerCheck(z) {
    const r = z.row;
    if (S.mowers[r]) {
      S.mowers[r] = false;
      fireMower(r);
    } else {
      gameOver();
    }
  }

  function fireMower(r) {
    for (const z of [...S.zombies]) if (z.row === r) killZombie(z, false);
    const m = $('bloom-mower-' + r);
    if (m) {
      const travel = m.closest('.bloom-row').offsetWidth + 80;
      m.classList.add('firing');
      m.style.transform = `translateX(${travel}px)`;
      setTimeout(() => { m.style.visibility = 'hidden'; }, 950);
    }
    setStatus(`Phew! The mower saved row ${r + 1} 🚜💨`);
  }

  /* ── Peas ────────────────────────────────────────────────── */
  function firePea(plant) {
    const el = document.createElement('div');
    el.className = 'bloom-pea' + (plant.type === 'snowpea' ? ' frozen' : '');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i></i>';
    fx.appendChild(el);
    const pea = { x: plant.col + 2, row: plant.row, frozen: plant.type === 'snowpea', el: el };
    S.peas.push(pea);
    positionPea(pea);
  }

  function positionPea(pea) {
    pea.el.style.left = (pea.x / XMAX * 100).toFixed(2) + '%';
    pea.el.style.top = ((pea.row + 0.5) / ROWS * 100).toFixed(2) + '%';
  }

  function removePea(pea) {
    const i = S.peas.indexOf(pea);
    if (i >= 0) S.peas.splice(i, 1);
    pea.el.remove();
  }

  function splatAt(pea) {
    const s = document.createElement('div');
    s.className = 'bloom-splat';
    s.style.left = pea.el.style.left;
    s.style.top = pea.el.style.top;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 340);
  }

  function updatePeas() {
    for (const pea of [...S.peas]) {
      pea.x += PEA_SPEED * TICK;
      let hit = null;
      for (const z of S.zombies) {
        if (z.row !== pea.row) continue;
        if (Math.abs(pea.x - (z.x - 0.15)) < 0.4) { hit = z; break; }
      }
      if (hit) {
        damageZombie(hit, PEA_DMG, pea.frozen);
        splatAt(pea);
        removePea(pea);
        continue;
      }
      if (pea.x > XMAX + 0.2) { removePea(pea); continue; }
      positionPea(pea);
    }
  }

  /* ── Plants tick ─────────────────────────────────────────── */
  function zombieAhead(row, colX) {
    for (const z of S.zombies) {
      if (z.row === row && z.x > colX && z.x < XMAX + 0.2) return true;
    }
    return false;
  }

  function updatePlants() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const plant = S.plants[r][c];
        if (!plant) continue;
        if (plant.type === 'cherry') {
          plant.fuseT -= TICK;
          if (plant.fuseT <= 0) { explodeCherry(plant); }
          continue;
        }
        if (plant.type === 'sunflower') {
          if (S.time - plant.lastSun >= SUNFLOWER_EVERY) {
            plant.lastSun = S.time;
            spawnPlantSun(plant);
          }
          continue;
        }
        if (plant.type === 'peashooter' || plant.type === 'snowpea') {
          if (S.time - plant.lastShot >= PEA_EVERY && zombieAhead(r, c + 1.6)) {
            plant.lastShot = S.time;
            firePea(plant);
          }
        }
      }
    }
  }

  function explodeCherry(plant) {
    const r = plant.row, c = plant.col;
    removePlant(r, c);
    // visuals: flash + ring + shake
    const flash = document.createElement('div');
    flash.className = 'bloom-flash';
    fx.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
    const ring = document.createElement('div');
    ring.className = 'bloom-ring';
    ring.style.left = ((c + 1.5) / XMAX * 100).toFixed(2) + '%';
    ring.style.top = ((r + 0.5) / ROWS * 100).toFixed(2) + '%';
    fx.appendChild(ring);
    setTimeout(() => ring.remove(), 600);
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
    setTimeout(() => stage.classList.remove('shake'), 450);
    // damage 3x3
    for (const z of [...S.zombies]) {
      if (Math.abs(z.row - r) <= 1 && Math.abs(z.x - (c + 1.5)) <= 1.7) {
        damageZombie(z, 1800, false);
      }
    }
    // crater: unplantable for a while
    const k = tileKey(r, c);
    S.craters.set(k, S.time + CRATER_SECS);
    const t = tileEl(r, c);
    if (t) t.classList.add('crater');
    setStatus('Cherry bomb! 🍒💥');
  }

  function clearCrater(r, c) {
    const t = tileEl(r, c);
    if (t) t.classList.remove('crater');
  }

  /* ── Sun tokens ──────────────────────────────────────────── */
  function spawnSun(xPct, yPct, fallsTo) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bloom-sun-token';
    b.setAttribute('aria-label', `Collect ${SUN_VALUE} sun`);
    b.innerHTML = '<span class="ss" aria-hidden="true">☀️</span>';
    b.style.left = xPct.toFixed(1) + '%';
    b.style.top = yPct.toFixed(1) + '%';
    b.addEventListener('click', (e) => { e.stopPropagation(); collectSun(sun); });
    fx.appendChild(b);
    const sun = { el: b, y: yPct, targetY: fallsTo, born: S.time, xPct: xPct };
    S.suns.push(sun);
    return sun;
  }

  function spawnSkySun() {
    spawnSun(rnd(10, 90), 3, rnd(28, 58));
  }

  function spawnPlantSun(plant) {
    const xPct = ((plant.col + 1.5) / XMAX * 100) + rnd(-2.5, 2.5);
    const yPct = ((plant.row + 0.5) / ROWS * 100) + rnd(-5, 5);
    spawnSun(clamp(xPct, 6, 94), clamp(yPct, 8, 92), clamp(yPct, 8, 92));
  }

  function collectSun(sun) {
    const i = S.suns.indexOf(sun);
    if (i === -1) return;
    S.suns.splice(i, 1);
    S.sun += SUN_VALUE;
    floatText('+' + SUN_VALUE, sun.el.style.left, sun.el.style.top);
    sun.el.remove();
    bumpBank();
    updateTopbar(); updatePackets();
  }

  function floatText(text, left, top) {
    const d = document.createElement('div');
    d.className = 'bloom-float';
    d.setAttribute('aria-hidden', 'true');
    d.textContent = text;
    d.style.left = left; d.style.top = top;
    fx.appendChild(d);
    setTimeout(() => d.remove(), 1050);
  }

  function updateSuns() {
    for (const sun of [...S.suns]) {
      const age = S.time - sun.born;
      if (age > SUN_DESPAWN) {
        const i = S.suns.indexOf(sun);
        if (i >= 0) S.suns.splice(i, 1);
        sun.el.remove();
        continue;
      }
      // gentle fall for sky suns
      if (sun.targetY > sun.y) {
        sun.y = Math.min(sun.targetY, sun.y + (sun.targetY - 3) * (TICK / 4));
        sun.el.style.top = sun.y.toFixed(2) + '%';
      }
      sun.el.classList.toggle('dying', age > SUN_DESPAWN - 2);
    }
  }

  /* ── Waves ───────────────────────────────────────────────── */
  function startWave(n) {
    const def = WAVES[n - 1];
    S.wave = n;
    S.spawnQueue = def.queue.slice();
    S.spawnGap = def.gap;
    S.spawnT = 1.4;
    S.waveTotal = def.queue.length;
    S.waveKilled = 0;
    S.waveActive = true;
    S.overlayKind = null;
    hideOverlay();
    updateTopbar(); updateWavebar();
    if (def.huge) {
      showBanner('🌊 HUGE WAVE! 🌊');
      setStatus(`Wave ${n} — a huge wave approaches! Hold the line! 🧟`);
    } else {
      showBanner(`Wave ${n}`);
      setStatus(`Wave ${n} of ${WAVES.length} — zombies incoming 🧟`);
    }
  }

  function updateSpawner() {
    if (!S.waveActive || S.over) return;
    if (S.spawnQueue.length > 0) {
      S.spawnT -= TICK;
      if (S.spawnT <= 0) {
        S.spawnT = S.spawnGap * rnd(0.7, 1.25);
        spawnZombie(S.spawnQueue.shift(), drawRow());
      }
    } else if (S.zombies.length === 0) {
      waveCleared();
    }
  }

  function waveCleared() {
    S.waveActive = false;
    updateWavebar();
    if (S.wave >= WAVES.length) { victory(); return; }
    showBreakOverlay();
    setStatus(`Wave ${S.wave} cleared! Take a breather, then start wave ${S.wave + 1}.`);
  }

  function showBreakOverlay() {
    S.overlayKind = 'break';
    showOverlay(
      `<div class="bloom-panel" role="dialog" aria-label="Wave ${S.wave} cleared">` +
      `<h3 class="bloom-title">Wave ${S.wave} cleared! 🎉</h3>` +
      `<p class="bloom-sub">The garden holds… for now. Catch your breath.</p>` +
      `<p class="bloom-stat">Score: <strong>${S.score}</strong> &nbsp;·&nbsp; ☀️ ${S.sun}</p>` +
      `<button type="button" class="bloom-bigbtn" data-act="next">Wave ${S.wave + 1} →</button>` +
      (WAVES[S.wave].huge ? `<p class="bloom-tip">Careful — scouts report a huge wave next 🌊</p>` : '') +
      `</div>`
    );
  }

  function showBanner(text) {
    banner.textContent = text;
    banner.classList.remove('show');
    void banner.offsetWidth;
    banner.classList.add('show');
  }

  /* ── Overlays ────────────────────────────────────────────── */
  function showOverlay(html) {
    overlay.innerHTML = html;
    overlay.hidden = false;
  }
  function hideOverlay() {
    overlay.hidden = true;
    overlay.innerHTML = '';
  }

  function startPanelHTML() {
    return (
      `<div class="bloom-panel" role="dialog" aria-label="Bloom Defense — how to play">` +
      `<h3 class="bloom-title">Bloom Defense 🌻🧟</h3>` +
      `<ul class="bloom-howto">` +
      `<li>🌱 Pick a seed packet, then tap the lawn to plant it.</li>` +
      `<li>☀️ Tap falling sun to collect it — sunflowers grow more.</li>` +
      `<li>🚜 Don't let zombies shuffle past your mower. Survive 10 waves!</li>` +
      `</ul>` +
      `<button type="button" class="bloom-bigbtn" data-act="start">Start 🌷</button>` +
      (S.best > 0 ? `<p class="bloom-tip">Best score so far: ${S.best} ⭐</p>` : '') +
      `</div>`
    );
  }

  function victory() {
    S.over = true;
    stopTick();
    if (S.score > S.best) {
      S.best = S.score;
      try { localStorage.setItem(BEST_KEY, String(S.best)); } catch (e) { /* private mode */ }
    }
    showOverlay(
      `<div class="bloom-panel" role="dialog" aria-label="Victory">` +
      `<h3 class="bloom-title">Garden Saved! 🌻🏆</h3>` +
      `<p class="bloom-sub">Ten waves, zero zombies past the fence.<br>Brandon's garden blooms on.</p>` +
      `<p class="bloom-stat">Score: <strong>${S.score}</strong></p>` +
      `<p class="bloom-stat">Best: <strong>${S.best}</strong> ⭐</p>` +
      `<button type="button" class="bloom-bigbtn" data-act="retry">Play Again 🌷</button>` +
      `</div>`
    );
    setStatus(`Victory! Final score ${S.score}. Best ${S.best}.`);
  }

  function gameOver() {
    if (S.over) return;
    S.over = true;
    stopTick();
    if (S.score > S.best) {
      S.best = S.score;
      try { localStorage.setItem(BEST_KEY, String(S.best)); } catch (e) { /* private mode */ }
    }
    showOverlay(
      `<div class="bloom-panel" role="dialog" aria-label="Game over">` +
      `<h3 class="bloom-title">The zombies got through… 🧟</h3>` +
      `<p class="bloom-sub">The garden put up a good fight.<br>Shake it off and try again 💜</p>` +
      `<p class="bloom-stat">Score: <strong>${S.score}</strong> &nbsp;·&nbsp; reached wave ${S.wave}</p>` +
      `<p class="bloom-stat">Best: <strong>${S.best}</strong> ⭐</p>` +
      `<button type="button" class="bloom-bigbtn" data-act="retry">Try Again 🌱</button>` +
      `</div>`
    );
    setStatus(`Game over on wave ${S.wave}. Score ${S.score}.`);
  }

  function togglePause(force) {
    if (!S.running || S.over) return;
    const want = typeof force === 'boolean' ? force : !S.paused;
    if (want === S.paused) return;
    S.paused = want;
    pauseBtn.setAttribute('aria-label', S.paused ? 'Resume game' : 'Pause game');
    pauseBtn.textContent = S.paused ? '▶️' : '⏸️';
    if (S.paused) {
      showOverlay(
        `<div class="bloom-panel" role="dialog" aria-label="Paused">` +
        `<h3 class="bloom-title">Paused 🌙</h3>` +
        `<p class="bloom-sub">Take your time. The zombies will wait.</p>` +
        `<button type="button" class="bloom-bigbtn" data-act="resume">Resume 🌷</button>` +
        `</div>`
      );
      setStatus('Game paused.');
    } else {
      if (S.overlayKind === 'start') showOverlay(startPanelHTML());
      else if (S.overlayKind === 'break') showBreakOverlay();
      else hideOverlay();
      setStatus('Back to the garden 🌱');
    }
  }

  /* ── Game lifecycle ──────────────────────────────────────── */
  function resetState() {
    S.running = false; S.paused = false; S.over = false;
    S.sun = 250; S.score = 0;
    S.wave = 0; S.waveActive = false; S.waveTotal = 0; S.waveKilled = 0;
    S.zombies = []; S.peas = []; S.suns = [];
    S.rowDeck = [];
    S.craters = new Map(); S.cooldowns = {};
    S.selected = null; S.time = 0; S.skyT = 3;
    S.spawnQueue = []; S.spawnT = 0;
    S.overlayKind = null;
    S.plants = [];
    for (let r = 0; r < ROWS; r++) {
      S.plants.push(new Array(COLS).fill(null));
      S.mowers[r] = true;
      const m = $('bloom-mower-' + r);
      if (m) { m.classList.remove('firing'); m.style.visibility = 'visible'; m.style.transform = ''; }
    }
  }

  function clearBoard() {
    fx.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = tileEl(r, c);
        if (t) {
          t.classList.remove('has-plant', 'crater');
          t.innerHTML = '';
          t.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}, empty`);
        }
      }
    }
    lawn.classList.remove('placing');
  }

  function stopTick() {
    if (S.tickId !== null) { clearInterval(S.tickId); S.tickId = null; }
  }

  function startTick() {
    stopTick();
    S.tickId = setInterval(tick, TICK * 1000);
  }

  function newGame() {
    stopTick();
    resetState();
    clearBoard();
    try { S.best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; }
    catch (e) { S.best = 0; }
    S.running = true;
    pauseBtn.textContent = '⏸️';
    pauseBtn.setAttribute('aria-label', 'Pause game');
    updateTopbar(); updateWavebar(); updatePackets();
    showOverlay(startPanelHTML());
    S.overlayKind = 'start';
    setStatus('Welcome to Bloom Defense! Press Start when ready 🌷');
  }

  function beginPlay() {
    startTick();
    startWave(1);
  }

  /* ── Main tick ───────────────────────────────────────────── */
  function tick() {
    if (!S.running || S.paused || S.over) return;
    S.time += TICK;

    S.skyT -= TICK;
    if (S.skyT <= 0) { S.skyT = SKY_SUN_EVERY; spawnSkySun(); }

    for (const p of PLANTS) {
      if (S.cooldowns[p.id] > 0) S.cooldowns[p.id] = Math.max(0, S.cooldowns[p.id] - TICK);
    }

    for (const [k, exp] of [...S.craters]) {
      if (S.time >= exp) {
        S.craters.delete(k);
        const [r, c] = k.split(',').map(Number);
        clearCrater(r, c);
      }
    }

    updatePlants();
    if (S.over) return;
    updateZombies();
    if (S.over) return;
    updatePeas();
    updateSuns();
    updateSpawner();
    updatePackets();
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    stage = $('bloom-stage');
    if (!stage) return; // section not on this page
    lawn = $('bloom-lawn');
    fx = $('bloom-fx');
    overlay = $('bloom-overlay');
    banner = $('bloom-banner');
    statusEl = $('bloom-status');
    sunEl = $('bloom-sun');
    waveNumEl = $('bloom-wave-num');
    waveFillEl = $('bloom-wavebar-fill');
    scoreEl = $('bloom-score');
    pauseBtn = $('bloom-pause');
    packetsEl = $('bloom-packets');
    bankEl = document.querySelector('.bloom-bank');

    buildPackets();
    buildLawn();

    pauseBtn.addEventListener('click', () => togglePause());

    overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'start') beginPlay();
      else if (act === 'next') startWave(S.wave + 1);
      else if (act === 'resume') togglePause(false);
      else if (act === 'retry') newGame();
    });

    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        if (S.selected) select(S.selected); // toggles off
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= PLANTS.length && S.running && !S.paused && !S.over) {
        const p = PLANTS[n - 1];
        const cdLeft = S.cooldowns[p.id] || 0;
        if (S.sun >= p.cost && cdLeft <= 0) select(p.id);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && S.running && !S.paused && !S.over) togglePause(true);
    });

    newGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
