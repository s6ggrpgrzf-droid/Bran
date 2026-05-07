'use strict';

const STORAGE_KEY = 'bran_mood_log';
const WATER_KEY   = 'bran_water_log';
const DUMP_KEY    = 'bran_brain_dump';

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great', color: '#fbbf24' },
  { value: 'good',  emoji: '🙂', label: 'Good',  color: '#a7f3d0' },
  { value: 'okay',  emoji: '😐', label: 'Okay',  color: '#7dd3fc' },
  { value: 'low',   emoji: '😔', label: 'Low',   color: '#a78bfa' },
  { value: 'rough', emoji: '😢', label: 'Rough', color: '#f472b6' },
];

const ENCOURAGEMENT = {
  great: [
    "Glad you're soaring today, Brandon. Ride this one a while. ✨",
    "A great day is a gift — soak it in.",
  ],
  good: [
    "Good is good. Let's keep it steady today.",
    "Solid baseline. That's a win on its own.",
  ],
  okay: [
    "Okay is allowed. Not every day has to be a peak.",
    "Holding steady is its own kind of strength.",
  ],
  low: [
    "Low days pass. Be soft with yourself today, Brandon.",
    "One small reset at a time — that's all today asks of you. 💜",
  ],
  rough: [
    "Tough one. Mom would say: take it one breath at a time. 💜",
    "Rough days are real. You don't have to fix it — just get through it.",
  ],
};

const WISDOM_FALLBACK = {
  series: 'inuyasha',
  badge: '📿 Inuyasha',
  text: "Even the smallest light cuts through the darkest night. Carry yours, and others will see by it.",
  cite: '— Miroku',
};

// ── Storage ──────────────────────────────────────────────
function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveLog(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Date helpers ─────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateStr(date) {
  return date.toISOString().split('T')[0];
}

function formatDate(isoDate) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

// ── Entry operations ─────────────────────────────────────
function addOrReplaceEntry(mood, note) {
  const today = todayStr();
  const log = loadLog();
  const idx = log.findIndex(e => e.date === today);
  const moodObj = MOODS.find(m => m.value === mood);

  const entry = {
    id: (idx >= 0 ? log[idx].id : null) ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now())),
    date: today,
    mood,
    moodEmoji: moodObj.emoji,
    note: note.trim().slice(0, 300),
    timestamp: Date.now(),
  };

  if (idx >= 0) {
    log[idx] = entry;
  } else {
    log.unshift(entry);
  }

  saveLog(log);
  return log;
}

function deleteEntry(id) {
  const log = loadLog().filter(e => e.id !== id);
  saveLog(log);
  return log;
}

// ── Utility ──────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Hero greeting ────────────────────────────────────────
function greet() {
  const hours = new Date().getHours();
  let salutation = 'Welcome back', icon = '✨';
  if (hours < 5)        { salutation = 'Late night'; icon = '🌙'; }
  else if (hours < 12)  { salutation = 'Good morning'; icon = '☀️'; }
  else if (hours < 17)  { salutation = 'Good afternoon'; icon = '🌤️'; }
  else if (hours < 21)  { salutation = 'Good evening'; icon = '🌆'; }
  else                  { salutation = 'Welcome back tonight'; icon = '🌙'; }

  const streak = streakDays(loadLog());
  const target = document.getElementById('hero-greeting');
  if (!target) return;

  const streakChip = streak >= 1
    ? `<span class="streak-chip${streak >= 3 ? ' streak-chip--hot' : ''}" aria-label="${streak} day streak">
         ${streak >= 3 ? '🔥' : '🌟'} ${streak}-day streak
       </span>`
    : '';

  target.innerHTML = `
    <span class="greeting-text">${icon} ${salutation}, Brandon</span>
    ${streakChip}
  `;
}

// ── Streak ──────────────────────────────────────────────
function streakDays(log) {
  if (!log.length) return 0;
  const dates = new Set(log.map(e => e.date));
  let count = 0;
  const cursor = new Date();
  // If today not logged, streak can still extend from yesterday backward
  if (!dates.has(dateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(dateStr(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

// ── Weekly chart ────────────────────────────────────────
function renderStats(log) {
  const streakEl = document.getElementById('stat-streak');
  const totalEl  = document.getElementById('stat-total');
  if (streakEl) streakEl.textContent = streakDays(log);
  if (totalEl)  totalEl.textContent  = log.length;
  renderWeeklyChart(log);
}

function renderWeeklyChart(log) {
  const container = document.getElementById('weekly-chart');
  if (!container) return;

  const byDate = Object.fromEntries(log.map(e => [e.date, e]));
  const heights = { great: 100, good: 80, okay: 55, low: 35, rough: 22 };
  const today = new Date();
  const bars = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = dateStr(d);
    const entry = byDate[iso];
    const moodObj = entry ? MOODS.find(m => m.value === entry.mood) : null;
    const height = entry ? heights[entry.mood] : 8;
    const color  = moodObj ? moodObj.color : 'rgba(167,139,250,0.15)';
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const fullLabel = entry
      ? `${formatDate(iso)}: ${capitalize(entry.mood)}`
      : `${formatDate(iso)}: no entry`;
    bars.push(`
      <div class="bar-wrap" title="${escapeHtml(fullLabel)}">
        <div class="bar" style="height:${height}%; background:${color};"></div>
        <span class="bar-day">${dayLabel}</span>
      </div>
    `);
  }
  container.innerHTML = bars.join('');
}

// ── Render history ───────────────────────────────────────
function renderHistory(log) {
  const container = document.getElementById('mood-history');
  if (!container) return;

  if (!log.length) {
    container.innerHTML = '<p class="empty-state">No entries yet. Log your first mood to start a streak. 🌱</p>';
    return;
  }

  const heading = '<h3 class="history-heading">Past entries</h3>';

  const entries = log.map(entry => `
    <div class="history-entry" data-id="${escapeHtml(entry.id)}" role="article"
         aria-label="Mood entry for ${escapeHtml(formatDate(entry.date))}">
      <div class="entry-header">
        <span class="entry-emoji" aria-hidden="true">${entry.moodEmoji}</span>
        <div>
          <span class="entry-mood">${capitalize(entry.mood)}</span>
          <time class="entry-date" datetime="${entry.date}">${formatDate(entry.date)}</time>
        </div>
        <button class="delete-btn" aria-label="Delete entry for ${escapeHtml(formatDate(entry.date))}"
                data-id="${escapeHtml(entry.id)}">✕</button>
      </div>
      ${entry.note ? `<p class="entry-note">${escapeHtml(entry.note)}</p>` : ''}
    </div>
  `).join('');

  container.innerHTML = heading + entries;

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const updated = deleteEntry(btn.dataset.id);
      renderHistory(updated);
      renderStats(updated);
      greet();
    });
  });
}

// ── Build mood radio buttons ──────────────────────────────
function buildMoodOptions() {
  const group = document.querySelector('.mood-options');
  if (!group) return;
  MOODS.forEach(m => {
    const label = document.createElement('label');
    label.className = 'mood-option';
    label.innerHTML = `
      <input type="radio" name="mood" value="${m.value}">
      <span class="mood-visual">${m.emoji}</span>
      <span class="mood-label">${m.label}</span>
    `;
    group.appendChild(label);
  });
  group.addEventListener('change', e => {
    if (e.target?.name === 'mood') showEncouragement(e.target.value);
  });
}

function showEncouragement(mood) {
  const el = document.getElementById('mood-encouragement');
  if (!el) return;
  const lines = ENCOURAGEMENT[mood];
  if (!lines) { el.textContent = ''; return; }
  el.classList.remove('is-visible');
  void el.offsetWidth;
  el.textContent = pickRandom(lines);
  el.classList.add('is-visible');
}

// ── Pre-fill today's entry if it exists ───────────────────
function prefillTodayIfExists() {
  const today = loadLog().find(e => e.date === todayStr());
  if (!today) return;
  const radio = document.querySelector(`input[name="mood"][value="${today.mood}"]`);
  if (radio) radio.checked = true;
  document.getElementById('mood-note').value = today.note;
  showEncouragement(today.mood);
}

// ── Form submission ──────────────────────────────────────
function initForm() {
  const form = document.getElementById('mood-form');
  if (!form) return;
  const errorEl = document.getElementById('form-error');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const mood = form.elements['mood'].value;
    const note = form.elements['note'].value;

    if (!mood) {
      if (errorEl) {
        errorEl.textContent = 'Pick a mood first — even "okay" counts.';
        errorEl.hidden = false;
      }
      return;
    }
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

    const updated = addOrReplaceEntry(mood, note);
    renderHistory(updated);
    renderStats(updated);
    greet();

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Logged ✨';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Log Mood';
      btn.disabled = false;
    }, 2000);
  });
}

// ── Tip of the moment ────────────────────────────────────
function rotateTipOfMoment() {
  const featured = document.getElementById('tip-featured');
  if (!featured) return;
  const tipCards = Array.from(document.querySelectorAll('.tip-card[data-tip-id]'));
  if (!tipCards.length) return;

  const pick = tipCards[dayOfYear() % tipCards.length];
  const id   = pick.dataset.tipId;
  const icon = pick.querySelector('.tip-icon')?.textContent || '🌸';
  const title = pick.querySelector('h3')?.textContent || 'Take a moment';
  const body  = pick.querySelector('p')?.textContent || '';

  featured.innerHTML = `
    <div class="tip-featured-icon" aria-hidden="true">${icon}</div>
    <div class="tip-featured-body">
      <span class="tip-featured-tag">Try this now</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      <button type="button" class="btn-soft tip-featured-jump" data-target="${escapeHtml(id)}">
        Show it in the list ↓
      </button>
    </div>
  `;

  featured.querySelector('.tip-featured-jump')?.addEventListener('click', () => {
    const target = document.querySelector(`.tip-card[data-tip-id="${id}"]`);
    if (!target) return;
    // Open the <details> if the card is hidden inside it
    const details = target.closest('details.more-tips');
    if (details && !details.open) details.open = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('tip-card--pulse');
    setTimeout(() => target.classList.remove('tip-card--pulse'), 1800);
  });
}

// ── Quote of the day ─────────────────────────────────────
function quoteOfTheDay() {
  const featured = document.getElementById('wisdom-featured');
  if (!featured) return;
  const cards = Array.from(document.querySelectorAll('.wisdom-card'));
  const pick = cards[dayOfYear() % cards.length];
  if (!pick) {
    featured.innerHTML = renderFeaturedQuote(WISDOM_FALLBACK);
    return;
  }
  const series = pick.dataset.series || 'inuyasha';
  const badge  = pick.querySelector('.wisdom-badge')?.textContent.trim() || '';
  const text   = pick.querySelector('.wisdom-quote')?.textContent.trim() || '';
  const cite   = pick.querySelector('.wisdom-cite')?.textContent.trim() || '';
  featured.dataset.series = series;
  featured.className = `wisdom-featured wisdom-${series}`;
  featured.innerHTML = renderFeaturedQuote({ badge, text, cite });
}

function renderFeaturedQuote({ badge, text, cite }) {
  return `
    <span class="wisdom-featured-corner wisdom-featured-corner--tl" aria-hidden="true">✦</span>
    <span class="wisdom-featured-corner wisdom-featured-corner--br" aria-hidden="true">✧</span>
    <span class="wisdom-featured-tag">Quote of the Day</span>
    <div class="wisdom-badge">${escapeHtml(badge)}</div>
    <p class="wisdom-featured-quote">${escapeHtml(text)}</p>
    <p class="wisdom-cite">${escapeHtml(cite)}</p>
  `;
}

// ── Wisdom filters ───────────────────────────────────────
function wireWisdomFilters() {
  const chips = document.querySelectorAll('.wisdom-filter .filter-chip');
  const cards = document.querySelectorAll('.wisdom-card');
  if (!chips.length || !cards.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach(c => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.series === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });
}

// ── Quick Reset: shared wiring ───────────────────────────
function wireQuickReset() {
  document.querySelectorAll('.reset-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.reset;
      if (kind === 'breath') startBreathOverlay();
      else if (kind === 'walk')  startWalkTimer();
      else if (kind === 'water') logWaterSip();
      else if (kind === 'dump')  toggleDumpPanel();
    });
  });
  initWaterCount();
  initDumpPanel();
}

// ── 60s breath overlay ───────────────────────────────────
let breathState = null;

function startBreathOverlay() {
  const overlay = document.getElementById('breath-overlay');
  if (!overlay || breathState) return;
  overlay.hidden = false;
  document.body.classList.add('no-scroll');

  const phaseEl = document.getElementById('breath-phase');
  const timerEl = document.getElementById('breath-timer');
  const ring    = overlay.querySelector('.breath-ring');
  const closeBtn = document.getElementById('breath-close');

  const phases = [
    { name: 'Breathe in', ms: 4000, scale: 1.55 },
    { name: 'Hold',       ms: 4000, scale: 1.55 },
    { name: 'Breathe out',ms: 4000, scale: 1.0  },
    { name: 'Hold',       ms: 4000, scale: 1.0  },
  ];

  let elapsed = 0;
  let phaseIdx = 0;
  const total = 60;

  function applyPhase() {
    const p = phases[phaseIdx % phases.length];
    if (phaseEl) phaseEl.textContent = p.name;
    if (ring) {
      ring.style.transition = `transform ${p.ms}ms ease-in-out`;
      ring.style.transform = `scale(${p.scale})`;
    }
  }

  applyPhase();

  breathState = {
    phaseTimer: setInterval(() => {
      phaseIdx += 1;
      applyPhase();
    }, 4000),
    countdown: setInterval(() => {
      elapsed += 1;
      const remaining = Math.max(total - elapsed, 0);
      if (timerEl) timerEl.textContent = `${remaining}s`;
      if (remaining <= 0) endBreathOverlay();
    }, 1000),
    keyHandler: (e) => { if (e.key === 'Escape') endBreathOverlay(); },
  };

  document.addEventListener('keydown', breathState.keyHandler);
  closeBtn?.addEventListener('click', endBreathOverlay, { once: true });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) endBreathOverlay();
  }, { once: true });
}

function endBreathOverlay() {
  const overlay = document.getElementById('breath-overlay');
  if (!overlay || !breathState) return;
  clearInterval(breathState.phaseTimer);
  clearInterval(breathState.countdown);
  document.removeEventListener('keydown', breathState.keyHandler);
  breathState = null;
  overlay.hidden = true;
  document.body.classList.remove('no-scroll');
  const ring = overlay.querySelector('.breath-ring');
  if (ring) { ring.style.transition = 'none'; ring.style.transform = 'scale(1)'; }
  const timerEl = document.getElementById('breath-timer');
  if (timerEl) timerEl.textContent = '60s';
}

// ── 5-minute walk timer ──────────────────────────────────
let walkState = null;

function startWalkTimer() {
  const chip = document.getElementById('walk-chip');
  if (!chip || walkState) return;
  chip.hidden = false;

  const timeEl = document.getElementById('walk-chip-time');
  const cancelBtn = document.getElementById('walk-chip-cancel');
  let remaining = 5 * 60;

  function format(s) {
    const m = Math.floor(s / 60);
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }
  if (timeEl) timeEl.textContent = format(remaining);

  walkState = setInterval(() => {
    remaining -= 1;
    if (timeEl) timeEl.textContent = format(remaining);
    if (remaining <= 0) {
      stopWalkTimer();
      celebrate();
    }
  }, 1000);

  cancelBtn?.addEventListener('click', stopWalkTimer, { once: true });
}

function stopWalkTimer() {
  if (walkState) { clearInterval(walkState); walkState = null; }
  const chip = document.getElementById('walk-chip');
  if (chip) chip.hidden = true;
}

function celebrate() {
  const burst = document.createElement('div');
  burst.className = 'reset-burst';
  const emojis = ['🌸','✨','💜','🌟','🌬️','💧'];
  for (let i = 0; i < 16; i++) {
    const piece = document.createElement('span');
    piece.textContent = emojis[i % emojis.length];
    piece.style.setProperty('--bx', `${(Math.random()*2-1) * 240}px`);
    piece.style.setProperty('--by', `${(Math.random()*-1 - 0.2) * 320}px`);
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    burst.appendChild(piece);
  }
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 1800);
}

// ── Water sips ───────────────────────────────────────────
function initWaterCount() { renderWaterCount(); }

function logWaterSip() {
  const today = todayStr();
  const log = loadJSON(WATER_KEY, {});
  log[today] = (log[today] || 0) + 1;
  saveJSON(WATER_KEY, log);
  renderWaterCount();
  const btn = document.querySelector('.reset-card[data-reset="water"]');
  if (btn) {
    btn.classList.remove('reset-card--ping');
    void btn.offsetWidth;
    btn.classList.add('reset-card--ping');
  }
}

function renderWaterCount() {
  const sub = document.getElementById('water-count');
  if (!sub) return;
  const log = loadJSON(WATER_KEY, {});
  const count = log[todayStr()] || 0;
  sub.textContent = count === 0
    ? 'Tap when you drink'
    : `💧 ${count} sip${count === 1 ? '' : 's'} today`;
}

// ── Brain dump ───────────────────────────────────────────
function toggleDumpPanel() {
  const panel = document.getElementById('dump-panel');
  if (!panel) return;
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    document.getElementById('dump-input')?.focus();
    renderDumpRecent();
  }
}

function initDumpPanel() {
  const saveBtn = document.getElementById('dump-save');
  const input   = document.getElementById('dump-input');
  const toggle  = document.getElementById('dump-toggle-recent');
  const list    = document.getElementById('dump-recent');

  saveBtn?.addEventListener('click', () => {
    const text = (input?.value || '').trim();
    if (!text) return;
    const log = loadJSON(DUMP_KEY, []);
    log.unshift({
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID() : String(Date.now()),
      text: text.slice(0, 500),
      ts: Date.now(),
    });
    saveJSON(DUMP_KEY, log.slice(0, 25));
    if (input) input.value = '';
    saveBtn.textContent = 'Saved ✨';
    saveBtn.disabled = true;
    setTimeout(() => { saveBtn.textContent = 'Save'; saveBtn.disabled = false; }, 1400);
    renderDumpRecent(true);
  });

  toggle?.addEventListener('click', () => {
    if (!list) return;
    const isHidden = list.hidden;
    list.hidden = !isHidden;
    toggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    toggle.textContent = isHidden ? 'Hide recent' : 'Show recent';
  });
}

function renderDumpRecent(forceShow = false) {
  const list = document.getElementById('dump-recent');
  const toggle = document.getElementById('dump-toggle-recent');
  if (!list) return;
  const log = loadJSON(DUMP_KEY, []);
  const recent = log.slice(0, 3);
  list.innerHTML = recent.length
    ? recent.map(d => `
        <li class="dump-entry">
          <span class="dump-entry-time">${escapeHtml(formatTime(d.ts))}</span>
          <span class="dump-entry-text">${escapeHtml(d.text)}</span>
          <button type="button" class="dump-entry-del" data-id="${escapeHtml(d.id)}" aria-label="Delete">✕</button>
        </li>`).join('')
    : '<li class="dump-empty">Nothing saved yet. The textarea is yours.</li>';

  list.querySelectorAll('.dump-entry-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtered = loadJSON(DUMP_KEY, []).filter(d => d.id !== btn.dataset.id);
      saveJSON(DUMP_KEY, filtered);
      renderDumpRecent(true);
    });
  });

  if (forceShow && list.hidden) {
    list.hidden = false;
    toggle?.setAttribute('aria-expanded', 'true');
    if (toggle) toggle.textContent = 'Hide recent';
  }
}

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildMoodOptions();
  prefillTodayIfExists();
  initForm();

  const log = loadLog();
  renderHistory(log);
  renderStats(log);

  greet();
  rotateTipOfMoment();
  quoteOfTheDay();
  wireWisdomFilters();
  wireQuickReset();
});
