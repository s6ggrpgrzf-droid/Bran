'use strict';

const STORAGE_KEY = 'bran_mood_log';

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good',  emoji: '🙂', label: 'Good'  },
  { value: 'okay',  emoji: '😐', label: 'Okay'  },
  { value: 'low',   emoji: '😔', label: 'Low'   },
  { value: 'rough', emoji: '😢', label: 'Rough' },
];

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

// ── Date helpers ─────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(isoDate) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
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

// ── Render history ───────────────────────────────────────
function renderHistory(log) {
  const container = document.getElementById('mood-history');

  if (!log.length) {
    container.innerHTML = '<p class="empty-state">No entries yet. Log your first mood above.</p>';
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
    });
  });
}

// ── Build mood radio buttons ──────────────────────────────
function buildMoodOptions() {
  const group = document.querySelector('.mood-options');
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
}

// ── Pre-fill today's entry if it exists ───────────────────
function prefillTodayIfExists() {
  const today = loadLog().find(e => e.date === todayStr());
  if (!today) return;
  const radio = document.querySelector(`input[name="mood"][value="${today.mood}"]`);
  if (radio) radio.checked = true;
  document.getElementById('mood-note').value = today.note;
}

// ── Form submission ──────────────────────────────────────
function initForm() {
  document.getElementById('mood-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const mood = form.elements['mood'].value;
    const note = form.elements['note'].value;

    if (!mood) {
      alert('Please select a mood before logging.');
      return;
    }

    const updated = addOrReplaceEntry(mood, note);
    renderHistory(updated);

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Logged!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Log Mood';
      btn.disabled = false;
    }, 2000);
  });
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildMoodOptions();
  prefillTodayIfExists();
  initForm();
  renderHistory(loadLog());
});
