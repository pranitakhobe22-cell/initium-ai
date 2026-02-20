// summary.js
if (!requireAuth('candidate')) { /* redirected */ }

const raw = sessionStorage.getItem('interviewResult');
if (!raw) { window.location.href = 'profile.html'; }

const result = JSON.parse(raw);
const ev     = result.evaluation;

// ── Overall score + badge ─────────────────────────────────────────────────
document.getElementById('overallScore').textContent = ev.overallScore ?? '—';
document.getElementById('evalSummary').textContent   = ev.summary || '';

// Score ring colour
const ring = document.querySelector('.score-ring');
if (ev.overallScore >= 75)      ring.style.borderColor = 'var(--accent2)';
else if (ev.overallScore >= 50) ring.style.borderColor = 'var(--accent)';
else                            ring.style.borderColor = 'var(--danger)';

// Recommendation badge
const recEl = document.getElementById('recommendation');
recEl.textContent = ev.recommendation || '—';
const recMap = {
  'Highly Recommended': 'badge-green',
  'Recommended':        'badge-green',
  'Needs Improvement':  'badge-purple',
  'Not Recommended':    'badge-red',
};
recEl.className = `badge ${recMap[ev.recommendation] || 'badge-gray'}`;

// Meta line
document.getElementById('metaLine').textContent =
  `${result.jobRole} · ${result.totalQuestions} questions · ${result.durationMinutes ?? 0} min`;

// ── Strengths & Improvements ──────────────────────────────────────────────
const strengthsList = document.getElementById('strengthsList');
const improveList   = document.getElementById('improveList');
(ev.strengths    || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; strengthsList.appendChild(li); });
(ev.improvements || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; improveList.appendChild(li); });

// ── Per-question breakdown ─────────────────────────────────────────────────
const breakdown = document.getElementById('questionBreakdown');
(result.perQuestionScores || []).forEach((q, i) => {
  const scoreColor = q.score >= 7 ? 'badge-green' : q.score >= 4 ? 'badge-purple' : 'badge-red';
  const el = document.createElement('div');
  el.className = 'q-result fade-in';
  el.innerHTML = `
    <div class="q-result-header">
      <span class="q-text">Q${i + 1}. ${q.question}</span>
      <span class="badge ${scoreColor}">${q.score}/10</span>
    </div>
    <p class="a-text">${q.summary || ''}</p>
    <div class="chips">
      ${(q.strengths    || []).map(s => `<span class="chip" style="background:rgba(0,212,170,.1);color:var(--accent2);border-color:rgba(0,212,170,.3)">✅ ${s}</span>`).join('')}
      ${(q.improvements || []).map(s => `<span class="chip" style="background:rgba(255,77,109,.1);color:var(--danger);border-color:rgba(255,77,109,.3)">⚠️ ${s}</span>`).join('')}
    </div>`;
  breakdown.appendChild(el);
});

// Clean up session state
sessionStorage.removeItem('interviewResult');
sessionStorage.removeItem('interviewId');
sessionStorage.removeItem('currentIndex');
sessionStorage.removeItem('currentQuestion');
sessionStorage.removeItem('totalQuestions');
sessionStorage.removeItem('jobRole');
