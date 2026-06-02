const API = 'api';
let currentUser = null;
let entries = [];
let currentView = 'list';
let selectedCalendarDate = new Date();
let editingEntryId = null;

const MOODS = {
  happy:   { emoji: '😊', label: 'Happy',   color: '#F59E0B' },
  calm:    { emoji: '😌', label: 'Calm',    color: '#10B981' },
  sad:     { emoji: '😢', label: 'Sad',     color: '#6366F1' },
  angry:   { emoji: '😠', label: 'Angry',   color: '#EF4444' },
  anxious: { emoji: '😰', label: 'Anxious', color: '#8B5CF6' },
  grateful:{ emoji: '🙏', label: 'Grateful',color: '#EC4899' },
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  createParticles();

  const saved = localStorage.getItem('user_id');
  if (saved) {
    currentUser = saved;
    unlock();
  }

  document.getElementById('unlockBtn').addEventListener('click', handleUnlock);
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  document.getElementById('fab').addEventListener('click', () => openEditor());
  document.getElementById('modalCancel').addEventListener('click', hideModal);
  document.getElementById('modalConfirm').addEventListener('click', confirmModal);

  const searchToggle = document.getElementById('searchToggle');
  const searchWrap = document.getElementById('searchWrap');
  if (searchToggle && searchWrap) {
    searchToggle.addEventListener('click', () => {
      searchWrap.classList.toggle('mobile-open');
      if (searchWrap.classList.contains('mobile-open')) {
        searchWrap.querySelector('input').focus();
      }
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => renderEntries(searchInput.value.trim().toLowerCase()), 200);
    });
  }
});

// ── Particles ──
function createParticles() {
  const container = document.getElementById('lockParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 60 + 20;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(p);
  }
}

// ── Auth ──
function handleUnlock() {
  const btn = document.getElementById('unlockBtn');
  btn.disabled = true;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Authenticating...`;

  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem('device_id', deviceId);
  }

  fetch(`${API}/auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.user_id) {
        currentUser = data.user_id;
        localStorage.setItem('user_id', currentUser);
        unlock();
      }
    })
    .catch(() => {
      showToast('Connection failed. Is the server running?', true);
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Unlock Journal`;
    });
}

function unlock() {
  document.getElementById('lockScreen').classList.add('hidden');
  document.getElementById('app').classList.add('visible');
  loadEntries();
}

function lock() {
  document.getElementById('lockScreen').classList.remove('hidden');
  document.getElementById('app').classList.remove('visible');
  document.getElementById('detailView').classList.remove('active');
  document.getElementById('unlockBtn').disabled = false;
  document.getElementById('unlockBtn').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Unlock Journal`;
}

// ── Navigation ──
function switchTab(tab) {
  if (tab === 'new') {
    openEditor();
    return;
  }
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`${tab}Section`).classList.add('active');
  document.getElementById('detailView').classList.remove('active');
  document.getElementById('fab').style.display = tab === 'list' ? 'flex' : 'none';
  currentView = tab;

  if (tab === 'list') renderEntries();
  if (tab === 'calendar') renderCalendar();
  if (tab === 'settings') renderSettings();
}

// ── Entries ──
function loadEntries() {
  if (!currentUser) return;

  fetch(`${API}/entries.php?user_id=${currentUser}`)
    .then(r => r.json())
    .then(data => {
      entries = Array.isArray(data) ? data : [];
      renderEntries();
    })
    .catch(() => {});
}

function renderEntries(query = '') {
  const container = document.getElementById('entriesList');
  let filtered = entries;
  if (query) {
    filtered = entries.filter(e =>
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.body && e.body.toLowerCase().includes(query)) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(query)))
    );
  }
  const groups = groupByMonth(filtered);

  if (filtered.length === 0) {
    container.innerHTML = query
      ? `<div class="empty-state"><div class="empty-icon">🔍</div><h2>No results found</h2><p>Try a different search term.</p></div>`
      : `<div class="empty-state"><div class="empty-icon">📖</div><h2>Your journal is empty</h2><p>Start writing your first entry.</p><button class="btn-primary" onclick="openEditor()">Write Today's Entry</button></div>`;
    return;
  }

  let html = '';
  for (const [monthKey, monthEntries] of Object.entries(groups)) {
    html += `<div class="section-title">${monthEntries[0]._sectionTitle}</div>`;
    for (const entry of monthEntries) {
      const mood = MOODS[entry.mood] || MOODS.calm;
      const bodyPreview = entry.body.length > 100 ? entry.body.slice(0, 100) + '...' : entry.body;
      const tags = Array.isArray(entry.tags) ? entry.tags : [];
      html += `
        <div class="entry-card" onclick="viewEntry('${entry.id}')">
          <div class="mood-strip" style="background:${mood.color}"></div>
          <div class="entry-content">
            <div class="entry-meta">
              <span class="entry-mood">${mood.emoji} ${mood.label}</span>
              <span class="entry-date">${formatShortDate(entry.created_at)}</span>
            </div>
            <div class="entry-title">${esc(entry.title)}</div>
            <div class="entry-body-preview">${esc(bodyPreview)}</div>
            <div class="entry-footer">
              <span>${entry.word_count} words</span>
              <div class="entry-tags">
                ${tags.slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
                ${tags.length > 2 ? `<span class="tag">+${tags.length - 2}</span>` : ''}
              </div>
            </div>
          </div>
        </div>`;
    }
  }
  container.innerHTML = html;
}

function groupByMonth(list) {
  const groups = {};
  for (const e of list) {
    const d = new Date(e.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  for (const key of Object.keys(groups)) {
    groups[key][0]._sectionTitle = formatSectionTitle(groups[key][0].date_key);
  }
  return groups;
}

// ── View Entry Detail ──
function viewEntry(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  const mood = MOODS[entry.mood] || MOODS.calm;
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  let html = `
    <div class="detail-header">
      <button class="btn-back" onclick="closeDetail()">← Back</button>
      <h2>Entry</h2>
      <div class="detail-actions">
        <button onclick="openEditor('${entry.id}')" title="Edit">✏️</button>
        <button onclick="deleteEntry('${entry.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;

  if (entry.image_url) {
    html += `<img class="detail-hero" src="${entry.image_url}" alt="Entry image">`;
  }

  html += `
    <div class="detail-body">
      <div class="detail-meta">
        <span class="detail-date">${formatFullDate(entry.created_at)}</span>
        <span class="detail-mood" style="background:${mood.color}20;color:${mood.color}">
          ${mood.emoji} ${mood.label}
        </span>
      </div>
      <div class="detail-title">${esc(entry.title)}</div>
      <div class="detail-stats">
        <span>${entry.word_count} words</span>
        <span>·</span>
        <span>${readTime(entry.word_count)}</span>
      </div>
      <div class="detail-text">${esc(entry.body)}</div>
      ${tags.length ? `<div class="detail-tags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </div>`;

  document.getElementById('detailView').innerHTML = html;
  document.getElementById('detailView').classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('fab').style.display = 'none';
}

function closeDetail() {
  document.getElementById('detailView').classList.remove('active');
  document.getElementById(`${currentView}Section`).classList.add('active');
  if (currentView === 'list') document.getElementById('fab').style.display = 'flex';
}

// ── Editor ──
function openEditor(entryId = null) {
  editingEntryId = entryId;
  const isEdit = !!entryId;
  const entry = isEdit ? entries.find(e => e.id === entryId) : null;

  const tags = entry ? (Array.isArray(entry.tags) ? entry.tags : []) : [];
  let selectedMood = entry ? entry.mood : 'calm';

  let moodHtml = '';
  for (const [key, val] of Object.entries(MOODS)) {
    moodHtml += `
      <button class="mood-pill ${key === selectedMood ? 'active' : ''}"
              style="--mood-color:${val.color}"
              data-mood="${key}" onclick="selectMood(this)">
        <span class="emoji">${val.emoji}</span> ${val.label}
      </button>`;
  }

  const html = `
    <div class="detail-header">
      <button class="btn-back" onclick="closeEditor()">← Back</button>
      <h2>${isEdit ? 'Edit Entry' : 'New Entry'}</h2>
      <div class="editor-actions">
        <button class="btn-save" onclick="saveEntry()" id="saveBtn">Save</button>
      </div>
    </div>
    <div class="section active" style="max-width:800px;margin:0 auto;padding:1.5rem;">
      <div class="editor-date">${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>

      <div class="form-group">
        <label>How are you feeling?</label>
        <div class="mood-selector" id="moodSelector">${moodHtml}</div>
      </div>

      <div class="form-group">
        <input type="text" class="form-input title-input" id="entryTitle"
               placeholder="What's on your mind?"
               value="${isEdit ? esc(entry.title) : ''}" maxlength="80">
      </div>

      <div class="form-group">
        <textarea class="form-input" id="entryBody"
                  placeholder="Write your entry...">${isEdit ? esc(entry.body) : ''}</textarea>
        <div class="word-count" id="wordCount">0 words</div>
      </div>

      <div class="form-group">
        <label>Photo</label>
        <div id="imageSection">
          ${entry && entry.image_url
            ? `<div class="image-preview">
                <img src="${entry.image_url}" alt="Preview">
                <button class="remove-btn" onclick="removeImage()">×</button>
               </div>`
            : `<div class="image-attachment" onclick="document.getElementById('imageInput').click()">
                <div class="icon">📷</div>
                <p>Add Photo</p>
               </div>`
          }
        </div>
        <input type="file" id="imageInput" accept="image/*" style="display:none" onchange="handleImage(event)">
      </div>

      <div class="form-group">
        <label>Tags</label>
        <div class="tags-input" id="tagsContainer">
          ${tags.map(t => `<span class="tag">${esc(t)} <span class="remove-tag" onclick="removeTag(this,'${esc(t)}')">×</span></span>`).join('')}
          <input type="text" id="tagInput" placeholder="Add tag..."
                 onkeydown="handleTagKey(event)">
        </div>
      </div>
    </div>`;

  document.getElementById('detailView').innerHTML = html;
  document.getElementById('detailView').classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('fab').style.display = 'none';

  document.getElementById('entryBody').addEventListener('input', updateWordCount);
  updateWordCount();
}

function closeEditor() {
  editingEntryId = null;
  document.getElementById('detailView').classList.remove('active');
  document.getElementById(`${currentView}Section`).classList.add('active');
  if (currentView === 'list') document.getElementById('fab').style.display = 'flex';
  else if (currentView === 'new') switchTab('list');
}

function selectMood(el) {
  document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function getSelectedMood() {
  const active = document.querySelector('.mood-pill.active');
  return active ? active.dataset.mood : 'calm';
}

function updateWordCount() {
  const body = document.getElementById('entryBody')?.value || '';
  const count = body.trim() ? body.trim().split(/\s+/).length : 0;
  const el = document.getElementById('wordCount');
  if (el) el.textContent = `${count} word${count !== 1 ? 's' : ''}`;
}

function handleTagKey(e) {
  if (e.key === ',' || e.key === 'Enter') {
    e.preventDefault();
    const input = e.target;
    const val = input.value.replace(',', '').trim();
    if (val) {
      const container = document.getElementById('tagsContainer');
      const span = document.createElement('span');
      span.className = 'tag';
      span.innerHTML = `${esc(val)} <span class="remove-tag" onclick="removeTag(this,'${esc(val)}')">×</span>`;
      container.insertBefore(span, input);
      input.value = '';
    }
  }
}

function removeTag(el) {
  el.parentElement.remove();
}

function getTags() {
  return Array.from(document.querySelectorAll('#tagsContainer .tag'))
    .map(el => el.textContent.replace('×', '').trim());
}

let pendingImage = null;

function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = file;
    document.getElementById('imageSection').innerHTML = `
      <div class="image-preview">
        <img src="${reader.result}" alt="Preview">
        <button class="remove-btn" onclick="removeImage()">×</button>
      </div>`;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  pendingImage = null;
  document.getElementById('imageSection').innerHTML = `
    <div class="image-attachment" onclick="document.getElementById('imageInput').click()">
      <div class="icon">📷</div>
      <p>Add Photo</p>
    </div>`;
}

// ── Save Entry ──
function saveEntry() {
  const title = document.getElementById('entryTitle').value.trim();
  const body = document.getElementById('entryBody').value.trim();
  const mood = getSelectedMood();
  const tags = getTags();

  if (!title) { showToast('Please enter a title', true); return; }
  if (body.length < 10) { showToast('Write at least 10 characters', true); return; }

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const data = { title, body, mood, tags, user_id: currentUser };

  const url = editingEntryId
    ? `${API}/entries.php?id=${editingEntryId}&user_id=${currentUser}`
    : `${API}/entries.php`;

  fetch(url, {
    method: editingEntryId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(r => r.json())
    .then(async result => {
      if (result.error) throw new Error(result.error);

      const entryId = editingEntryId || result.id;

      if (pendingImage) {
        const fd = new FormData();
        fd.append('image', pendingImage);
        fd.append('user_id', currentUser);
        fd.append('entry_id', entryId);

        const uploadRes = await fetch(`${API}/upload.php`, { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          await fetch(`${API}/entries.php?id=${entryId}&user_id=${currentUser}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: uploadData.url }),
          });
        }
      }

      showToast(editingEntryId ? 'Entry updated!' : 'Entry saved!');
      editingEntryId = null;
      pendingImage = null;
      loadEntries();
      switchTab('list');
    })
    .catch(err => {
      showToast(err.message || 'Failed to save', true);
      btn.disabled = false;
      btn.textContent = 'Save';
    });
}

// ── Delete ──
function deleteEntry(id) {
  showModal(
    'Delete Entry',
    'Are you sure? This cannot be undone.',
    () => {
      fetch(`${API}/entries.php?id=${id}&user_id=${currentUser}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(() => {
          showToast('Entry deleted');
          loadEntries();
          closeDetail();
          switchTab('list');
        });
    },
    true
  );
}

function deleteAllData() {
  showModal(
    'Clear All Data',
    'This will permanently delete ALL your journal entries. This action cannot be undone.',
    () => {
      fetch(`${API}/entries.php?user_id=${currentUser}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(() => {
          localStorage.clear();
          showToast('All data cleared');
          lock();
        });
    },
    true
  );
}

// ── Calendar ──
function renderCalendar() {
  const year = selectedCalendarDate.getFullYear();
  const month = selectedCalendarDate.getMonth();

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const markedDates = {};
  for (const e of entries) {
    markedDates[e.date_key] = true;
  }

  let daysHtml = '';
  for (let i = 0; i < firstDay; i++) {
    daysHtml += '<div class="calendar-day empty-day"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayStr;
    const hasMark = markedDates[dateStr];
    const isSelected = dateStr === selectedDate;

    daysHtml += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
           onclick="selectCalendarDate('${dateStr}')">
        ${d}
        ${hasMark ? '<div class="dot"></div>' : ''}
      </div>`;
  }

  document.getElementById('calendarGrid').innerHTML = `
    <div class="calendar-header">
      <button onclick="changeMonth(-1)">◀</button>
      <h3>${monthNames[month]} ${year}</h3>
      <button onclick="changeMonth(1)">▶</button>
    </div>
    <div class="calendar-weekdays">${dayNames.map(d => `<div>${d}</div>`).join('')}</div>
    <div class="calendar-days">${daysHtml}</div>`;

  renderCalendarEntries();
}

let selectedDate = null;

function selectCalendarDate(dateStr) {
  selectedDate = dateStr;
  renderCalendar();
}

function changeMonth(delta) {
  selectedCalendarDate.setMonth(selectedCalendarDate.getMonth() + delta);
  selectedDate = null;
  renderCalendar();
}

function renderCalendarEntries() {
  const container = document.getElementById('calendarEntries');
  if (!selectedDate) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:1rem;text-align:center">Select a date to view entries</p>';
    return;
  }

  const dayEntries = entries.filter(e => e.date_key === selectedDate);
  if (dayEntries.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:2rem">
        <p>No entries for this day</p>
        <button class="btn-primary" onclick="openEditor()" style="margin-top:1rem">Write Entry</button>
      </div>`;
    return;
  }

  let html = '';
  for (const entry of dayEntries) {
    const mood = MOODS[entry.mood] || MOODS.calm;
    html += `
      <div class="entry-card" onclick="viewEntry('${entry.id}')">
        <div class="mood-strip" style="background:${mood.color}"></div>
        <div class="entry-content">
          <div class="entry-meta">
            <span class="entry-mood">${mood.emoji} ${mood.label}</span>
          </div>
          <div class="entry-title">${esc(entry.title)}</div>
          <div class="entry-footer">
            <span>${entry.word_count} words</span>
          </div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

// ── Settings ──
function renderSettings() {
  const totalWords = entries.reduce((s, e) => s + (e.word_count || 0), 0);
  document.getElementById('statsEntries').textContent = entries.length;
  document.getElementById('statsWords').textContent = totalWords.toLocaleString();
}

function exportJournal() {
  const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let text = 'MY JOURNAL\n===========\n\n';
  for (const e of sorted) {
    text += `${formatFullDate(e.created_at)}\nMood: ${e.mood}\n${e.title}\n${'─'.repeat(40)}\n${e.body}\n`;
    if (e.tags?.length) text += `Tags: ${e.tags.join(', ')}\n`;
    text += '\n';
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'journal_export.txt';
  a.click();
}

// ── Modal ──
let modalCallback = null;

function showModal(title, message, onConfirm, destructive = false) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  const confirmBtn = document.getElementById('modalConfirm');
  confirmBtn.textContent = destructive ? 'Delete' : 'Confirm';
  confirmBtn.className = destructive ? 'btn-confirm destructive' : 'btn-confirm';
  modalCallback = onConfirm;
  document.getElementById('modal').classList.add('visible');
}

function hideModal() {
  document.getElementById('modal').classList.remove('visible');
  modalCallback = null;
}

function confirmModal() {
  if (modalCallback) modalCallback();
  hideModal();
}

// ── Toast ──
function showToast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (isError ? ' error' : '');
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3000);
}

// ── Helpers ──
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function formatShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function formatSectionTitle(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function readTime(wc) {
  const m = Math.ceil(wc / 200);
  return m < 1 ? 'Less than 1 min read' : `${m} min read`;
}
