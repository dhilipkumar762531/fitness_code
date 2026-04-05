/* ================================================
   APEX FIT — app.js
   Full CRUD: Programs, Workouts, Goals
   + Navbar scroll, modal system, toast, filters
================================================ */

'use strict';

/* ══════════════════════════════════════
   DATA STORE (localStorage-backed)
══════════════════════════════════════ */
const Store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

/* ══════════════════════════════════════
   SEED DATA
══════════════════════════════════════ */
const DEFAULT_PROGRAMS = [
  { id: 1, title: 'Fat Burn Kickstart', level: 'beginner', duration: '4 weeks', sessions: '3x/week', price: '₹999', color: '#e8f5e9', emoji: '🔥', desc: 'A gentle but effective intro to cardio and bodyweight training. Perfect for those just starting out.' },
  { id: 2, title: 'Core Power Pro', level: 'intermediate', duration: '6 weeks', sessions: '4x/week', price: '₹1,499', color: '#fff3e0', emoji: '💪', desc: 'Targeted core and strength training to build a solid foundation and improve posture.' },
  { id: 3, title: 'Elite Athlete HIIT', level: 'advanced', duration: '8 weeks', sessions: '5x/week', price: '₹2,499', color: '#fce4ec', emoji: '⚡', desc: 'High-intensity interval training designed for serious athletes seeking peak performance.' },
  { id: 4, title: 'Yoga & Flexibility', level: 'beginner', duration: '4 weeks', sessions: '5x/week', price: '₹799', color: '#e3f2fd', emoji: '🧘', desc: 'Improve mobility, reduce stress, and build body awareness with guided yoga flows.' },
  { id: 5, title: 'Strength Builder', level: 'intermediate', duration: '8 weeks', sessions: '4x/week', price: '₹1,799', color: '#ede7f6', emoji: '🏋️', desc: 'Progressive overload strength program focused on compound movements and muscle growth.' },
  { id: 6, title: 'Marathon Prep', level: 'advanced', duration: '12 weeks', sessions: '6x/week', price: '₹2,999', color: '#e0f2f1', emoji: '🏃', desc: 'A complete 12-week plan to get you race-ready with structured runs and recovery sessions.' }
];

const DEFAULT_WORKOUTS = [
  { id: 1, date: '2026-04-03', name: 'Morning Run', duration: 40, calories: 380 },
  { id: 2, date: '2026-04-04', name: 'Upper Body Blast', duration: 50, calories: 420 },
  { id: 3, date: '2026-04-05', name: 'Core & Stretch', duration: 30, calories: 220 }
];

const DEFAULT_GOALS = [
  { id: 1, text: 'Complete 3 workouts this week', done: false },
  { id: 2, text: 'Drink 2.5L water daily', done: true },
  { id: 3, text: 'Sleep 7+ hours each night', done: false }
];

const TRAINERS = [
  { name: 'Priya Sharma', spec: 'Yoga & Mindfulness', bio: 'Certified RYT-500 with 8 years of teaching experience across India and internationally.', rating: '4.9', initials: 'PS', bg: '#e8f5e9', color: '#2e7d32' },
  { name: 'Arjun Nair', spec: 'Strength & Conditioning', bio: 'Former national powerlifter and NSCA-certified trainer with a passion for functional fitness.', rating: '4.8', initials: 'AN', bg: '#e3f2fd', color: '#1565c0' },
  { name: 'Meera Reddy', spec: 'HIIT & Fat Loss', bio: 'Helped 1,000+ clients achieve sustainable fat loss through science-backed interval training.', rating: '5.0', initials: 'MR', bg: '#fce4ec', color: '#c62828' },
  { name: 'Kiran Patel', spec: 'Running & Endurance', bio: 'Ultramarathon finisher and certified running coach. Specialises in beginner-to-race programs.', rating: '4.7', initials: 'KP', bg: '#fff3e0', color: '#e65100' }
];

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let programs  = Store.get('programs').length  ? Store.get('programs')  : DEFAULT_PROGRAMS;
let workouts  = Store.get('workouts').length  ? Store.get('workouts')  : DEFAULT_WORKOUTS;
let goals     = Store.get('goals').length     ? Store.get('goals')     : DEFAULT_GOALS;
let activeLevel = 'all';
let editingWorkoutId = null;
let editingProgramId = null;

function savePrograms() { Store.set('programs', programs); }
function saveWorkouts() { Store.set('workouts', workouts); }
function saveGoals()    { Store.set('goals', goals); }

function genId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════
   MODAL SYSTEM
══════════════════════════════════════ */
function openModal(type, data = {}) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = getModalContent(type, data);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  editingWorkoutId = null;
  editingProgramId = null;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function getModalContent(type, data) {
  switch (type) {
    case 'signup':     return modalSignup();
    case 'addWorkout': return modalWorkout(data);
    case 'addGoal':    return modalGoal();
    case 'addProgram': return modalAddProgram(data);
    default: return '';
  }
}

/* Signup Modal */
function modalSignup() {
  return `
    <h2>Start Your Free Trial</h2>
    <div class="form-group"><label>Full Name</label><input type="text" id="su-name" placeholder="Your full name" required></div>
    <div class="form-group"><label>Email</label><input type="email" id="su-email" placeholder="your@email.com" required></div>
    <div class="form-group"><label>Password</label><input type="password" id="su-pass" placeholder="Create a password" required></div>
    <div class="form-group"><label>Goal</label>
      <select id="su-goal">
        <option>Lose weight</option><option>Build muscle</option>
        <option>Improve endurance</option><option>General fitness</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="handleSignup()">Create Account</button>
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
    </div>`;
}

function handleSignup() {
  const name = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass = document.getElementById('su-pass').value;
  if (!name || !email || !pass) { showToast('Please fill in all fields', 'error'); return; }
  if (!email.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  closeModal();
  showToast(`Welcome to ApexFit, ${name}! 🎉`);
}

/* ══════════════════════════════════════
   PROGRAMS CRUD
══════════════════════════════════════ */
function renderPrograms() {
  const grid = document.getElementById('programsGrid');
  const query = (document.getElementById('programSearch')?.value || '').toLowerCase();
  const filtered = programs.filter(p =>
    (activeLevel === 'all' || p.level === activeLevel) &&
    (p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query))
  );

  if (!filtered.length) {
    grid.innerHTML = '<div class="no-results">No programs match your search.</div>';
    return;
  }

  grid.innerHTML = filtered.map((p, i) => `
    <div class="prog-card" style="animation-delay:${i * 0.06}s">
      <div class="prog-card-img" style="background:${p.color}">
        <span>${p.emoji}</span>
      </div>
      <div class="prog-card-body">
        <span class="prog-card-level level-${p.level}">${cap(p.level)}</span>
        <div class="prog-card-title">${p.title}</div>
        <div class="prog-card-desc">${p.desc}</div>
        <div class="prog-card-meta">
          <span><strong>${p.duration}</strong></span>
          <span><strong>${p.sessions}</strong></span>
        </div>
        <div class="prog-card-price">
          <div class="prog-price">${p.price}<span style="font-size:14px;color:var(--gray-400)">/plan</span></div>
          <div class="prog-actions">
            <button class="btn-enroll" onclick="enrollProgram(${p.id})">Enroll</button>
            <button class="btn-edit-prog" onclick="editProgram(${p.id})">✏</button>
            <button class="btn-delete-prog" onclick="deleteProgram(${p.id})">✕</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterByLevel(btn, level) {
  activeLevel = level;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPrograms();
}

function filterPrograms() { renderPrograms(); }

function enrollProgram(id) {
  const p = programs.find(x => x.id === id);
  showToast(`Enrolled in "${p.title}"! Check your email. ✉`);
}

/* CREATE / EDIT program modal */
function modalAddProgram(data = {}) {
  const editing = !!data.id;
  return `
    <h2>${editing ? 'Edit Program' : 'Add New Program'}</h2>
    <div class="form-group"><label>Title</label><input type="text" id="pm-title" value="${data.title||''}" placeholder="Program name" required></div>
    <div class="form-group"><label>Level</label>
      <select id="pm-level">
        <option value="beginner" ${data.level==='beginner'?'selected':''}>Beginner</option>
        <option value="intermediate" ${data.level==='intermediate'?'selected':''}>Intermediate</option>
        <option value="advanced" ${data.level==='advanced'?'selected':''}>Advanced</option>
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Duration</label><input type="text" id="pm-duration" value="${data.duration||''}" placeholder="e.g. 4 weeks"></div>
      <div class="form-group"><label>Sessions</label><input type="text" id="pm-sessions" value="${data.sessions||''}" placeholder="e.g. 3x/week"></div>
    </div>
    <div class="form-group"><label>Price</label><input type="text" id="pm-price" value="${data.price||''}" placeholder="₹999"></div>
    <div class="form-group"><label>Description</label><textarea id="pm-desc" rows="3" placeholder="Short description">${data.desc||''}</textarea></div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="${editing ? `updateProgram(${data.id})` : 'createProgram()'}">${editing ? 'Save Changes' : 'Add Program'}</button>
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
    </div>`;
}

function createProgram() {
  const title = document.getElementById('pm-title').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }
  const emojis = ['💥','🏅','🎯','🔥','⚡','💪'];
  const colors = ['#e8f5e9','#fff3e0','#fce4ec','#e3f2fd','#ede7f6','#e0f2f1'];
  const idx = programs.length % emojis.length;
  programs.push({
    id: genId(programs),
    title,
    level: document.getElementById('pm-level').value,
    duration: document.getElementById('pm-duration').value || 'TBD',
    sessions: document.getElementById('pm-sessions').value || 'TBD',
    price: document.getElementById('pm-price').value || 'Free',
    desc: document.getElementById('pm-desc').value,
    emoji: emojis[idx], color: colors[idx]
  });
  savePrograms();
  closeModal();
  renderPrograms();
  showToast('Program added successfully!');
}

function editProgram(id) {
  editingProgramId = id;
  openModal('addProgram', programs.find(p => p.id === id));
}

function updateProgram(id) {
  const title = document.getElementById('pm-title').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }
  programs = programs.map(p => p.id === id ? {
    ...p,
    title,
    level: document.getElementById('pm-level').value,
    duration: document.getElementById('pm-duration').value,
    sessions: document.getElementById('pm-sessions').value,
    price: document.getElementById('pm-price').value,
    desc: document.getElementById('pm-desc').value
  } : p);
  savePrograms();
  closeModal();
  renderPrograms();
  showToast('Program updated!');
}

function deleteProgram(id) {
  if (!confirm('Delete this program? This cannot be undone.')) return;
  programs = programs.filter(p => p.id !== id);
  savePrograms();
  renderPrograms();
  showToast('Program deleted.', 'error');
}

/* ══════════════════════════════════════
   TRAINERS RENDER
══════════════════════════════════════ */
function renderTrainers() {
  document.getElementById('trainersGrid').innerHTML = TRAINERS.map(t => `
    <div class="trainer-card">
      <div class="trainer-avatar" style="background:${t.bg};color:${t.color}">${t.initials}</div>
      <div class="trainer-name">${t.name}</div>
      <div class="trainer-spec">${t.spec}</div>
      <div class="trainer-bio">${t.bio}</div>
      <div class="trainer-rating">
        <span class="stars">★★★★★</span>
        <span>${t.rating}</span>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════
   WORKOUTS CRUD
══════════════════════════════════════ */
function renderWorkouts() {
  const tbody = document.getElementById('workoutTableBody');
  if (!workouts.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray-400);padding:2rem">No workouts logged yet. Start today!</td></tr>';
    return;
  }
  const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  tbody.innerHTML = sorted.map(w => `
    <tr>
      <td>${formatDate(w.date)}</td>
      <td><strong>${w.name}</strong></td>
      <td>${w.duration} min</td>
      <td>${w.calories} kcal</td>
      <td>
        <button class="action-btn edit" onclick="editWorkout(${w.id})">✏ Edit</button>
        <button class="action-btn delete" onclick="deleteWorkout(${w.id})">✕</button>
      </td>
    </tr>
  `).join('');
  renderDashboardStats();
}

function modalWorkout(data = {}) {
  const editing = !!data.id;
  return `
    <h2>${editing ? 'Edit Workout' : 'Log a Workout'}</h2>
    <div class="form-group"><label>Date</label><input type="date" id="wk-date" value="${data.date || today()}" required></div>
    <div class="form-group"><label>Workout Name</label>
      <input type="text" id="wk-name" value="${data.name||''}" placeholder="e.g. Morning Run, HIIT Session" required>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Duration (minutes)</label><input type="number" id="wk-dur" value="${data.duration||''}" min="1" max="300" placeholder="45"></div>
      <div class="form-group"><label>Calories Burned</label><input type="number" id="wk-cal" value="${data.calories||''}" min="0" placeholder="320"></div>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="${editing ? `updateWorkout(${data.id})` : 'createWorkout()'}">${editing ? 'Save Changes' : 'Log Workout'}</button>
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
    </div>`;
}

function createWorkout() {
  const name = document.getElementById('wk-name').value.trim();
  const date = document.getElementById('wk-date').value;
  const duration = parseInt(document.getElementById('wk-dur').value) || 0;
  const calories = parseInt(document.getElementById('wk-cal').value) || 0;
  if (!name || !date) { showToast('Name and date are required', 'error'); return; }
  workouts.push({ id: genId(workouts), date, name, duration, calories });
  saveWorkouts();
  closeModal();
  renderWorkouts();
  showToast('Workout logged! Great work 🔥');
}

function editWorkout(id) {
  editingWorkoutId = id;
  openModal('addWorkout', workouts.find(w => w.id === id));
}

function updateWorkout(id) {
  const name = document.getElementById('wk-name').value.trim();
  const date = document.getElementById('wk-date').value;
  if (!name || !date) { showToast('Name and date are required', 'error'); return; }
  workouts = workouts.map(w => w.id === id ? {
    ...w, date, name,
    duration: parseInt(document.getElementById('wk-dur').value) || 0,
    calories: parseInt(document.getElementById('wk-cal').value) || 0
  } : w);
  saveWorkouts();
  closeModal();
  renderWorkouts();
  showToast('Workout updated!');
}

function deleteWorkout(id) {
  if (!confirm('Delete this workout entry?')) return;
  workouts = workouts.filter(w => w.id !== id);
  saveWorkouts();
  renderWorkouts();
  showToast('Workout removed.', 'error');
}

/* ══════════════════════════════════════
   GOALS CRUD
══════════════════════════════════════ */
function renderGoals() {
  const list = document.getElementById('goalsList');
  if (!goals.length) {
    list.innerHTML = '<p style="color:var(--gray-400);font-size:14px;padding:1rem 0">No goals yet. Add one to stay focused!</p>';
    return;
  }
  list.innerHTML = goals.map(g => `
    <div class="goal-item" id="goal-${g.id}">
      <div class="goal-checkbox ${g.done ? 'checked' : ''}" onclick="toggleGoal(${g.id})">${g.done ? '✓' : ''}</div>
      <div class="goal-text ${g.done ? 'done' : ''}">${g.text}</div>
      <button class="goal-del" onclick="deleteGoal(${g.id})" title="Remove goal">✕</button>
    </div>
  `).join('');
}

function modalGoal() {
  return `
    <h2>Add a Goal</h2>
    <div class="form-group"><label>Goal</label><input type="text" id="gl-text" placeholder="e.g. Exercise 4 times this week" required></div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="createGoal()">Add Goal</button>
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
    </div>`;
}

function createGoal() {
  const text = document.getElementById('gl-text').value.trim();
  if (!text) { showToast('Please enter a goal', 'error'); return; }
  goals.push({ id: genId(goals), text, done: false });
  saveGoals();
  closeModal();
  renderGoals();
  showToast('Goal added! You got this 🎯');
}

function toggleGoal(id) {
  goals = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
  saveGoals();
  renderGoals();
}

function deleteGoal(id) {
  goals = goals.filter(g => g.id !== id);
  saveGoals();
  renderGoals();
  showToast('Goal removed.', 'error');
}

/* ══════════════════════════════════════
   DASHBOARD STATS
══════════════════════════════════════ */
function renderDashboardStats() {
  const thisWeek = workouts.filter(w => isThisWeek(w.date));
  const totalMin = thisWeek.reduce((s, w) => s + (w.duration || 0), 0);
  const totalCal = thisWeek.reduce((s, w) => s + (w.calories || 0), 0);
  const weeklyGoal = 5;
  const pct = Math.min(100, Math.round((thisWeek.length / weeklyGoal) * 100));

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card"><div class="stat-card-num">${thisWeek.length}</div><div class="stat-card-label">Workouts this week</div></div>
    <div class="stat-card"><div class="stat-card-num">${totalMin}</div><div class="stat-card-label">Minutes trained</div></div>
    <div class="stat-card"><div class="stat-card-num">${totalCal.toLocaleString()}</div><div class="stat-card-label">Calories burned</div></div>
    <div class="stat-card"><div class="stat-card-num">${workouts.length}</div><div class="stat-card-label">Total sessions logged</div></div>
  `;

  document.getElementById('weeklyPct').textContent = pct + '%';
  requestAnimationFrame(() => {
    document.getElementById('weeklyBar').style.width = pct + '%';
  });
}

/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
function submitContact(e) {
  e.preventDefault();
  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const message = document.getElementById('cMessage').value.trim();
  const fb      = document.getElementById('contactMsg');

  if (!name || !email || !message) {
    fb.className = 'form-feedback error';
    fb.textContent = 'Please fill in all required fields.';
    return;
  }

  fb.className = 'form-feedback success';
  fb.textContent = `Thanks, ${name}! We'll be in touch within 24 hours. ✓`;
  document.getElementById('contactForm').reset();
  showToast('Message sent successfully!');
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function today() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isThisWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderPrograms();
  renderTrainers();
  renderWorkouts();
  renderGoals();
  renderDashboardStats();

  // Animate hero fill bar
  setTimeout(() => {
    const fill = document.querySelector('.hcard-fill');
    if (fill) fill.style.width = '68%';
  }, 600);
});