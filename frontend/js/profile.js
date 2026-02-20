// profile.js
if (!requireAuth('candidate')) { /* redirected */ }

const user = api.getUser();
document.getElementById('navName').textContent = user?.name || 'Candidate';

function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = msg; el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ── Load existing profile ─────────────────────────────────────────────────
(async () => {
  try {
    const { user: u } = await api.get('/profile');
    if (u.profile) {
      document.getElementById('jobTitle').value   = u.profile.jobTitle   || '';
      document.getElementById('experience').value = u.profile.experience || '';
      document.getElementById('skills').value     = (u.profile.skills || []).join(', ');
      document.getElementById('linkedIn').value   = u.profile.linkedIn    || '';
    }
  } catch (e) { /* no profile yet, that's fine */ }
})();

// ── Save profile ───────────────────────────────────────────────────────────
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api.put('/profile', {
      jobTitle:   document.getElementById('jobTitle').value,
      experience: Number(document.getElementById('experience').value) || 0,
      skills:     document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
      linkedIn:   document.getElementById('linkedIn').value,
    });
    showAlert('alertOk', 'Profile saved!', 'success');
  } catch (err) {
    showAlert('alert', err.message);
  }
});

// ── Start interview ────────────────────────────────────────────────────────
async function startInterview() {
  const jobTitle = document.getElementById('jobTitle').value.trim();
  if (!jobTitle) {
    showAlert('alert', 'Please fill in your job title before starting.');
    return;
  }

  const btn = document.getElementById('startBtn');
  btn.disabled = true; btn.textContent = '⏳ Setting up interview...';

  // Auto-save profile first
  try {
    await api.put('/profile', {
      jobTitle,
      experience: Number(document.getElementById('experience').value) || 0,
      skills:     document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
      linkedIn:   document.getElementById('linkedIn').value,
    });
  } catch (_) { /* continue anyway */ }

  try {
    const data = await api.post('/interview/start', {
      jobRole:       jobTitle,
      interviewType: 'real',
    });
    // Persist interview state
    sessionStorage.setItem('interviewId',       data.interviewId);
    sessionStorage.setItem('totalQuestions',    data.totalQuestions);
    sessionStorage.setItem('currentIndex',      '0');
    sessionStorage.setItem('currentQuestion',   data.currentQuestion.text);
    sessionStorage.setItem('jobRole',           jobTitle);
    window.location.href = 'interview.html';
  } catch (err) {
    showAlert('alert', err.message);
    btn.disabled = false; btn.textContent = '🚀 Start Interview';
  }
}
