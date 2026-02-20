// admin.js
if (!requireAuth('admin')) { /* redirected */ }

let allInterviews = [];

// ── Load stats + interviews ────────────────────────────────────────────────
async function loadData() {
  try {
    const [statsRes, intRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/interviews'),
    ]);

    const s = statsRes.stats;
    document.getElementById('sTotalCand').textContent = s.totalCandidates;
    document.getElementById('sTotalInt').textContent  = s.totalInterviews;
    document.getElementById('sCompleted').textContent  = s.completedInterviews;
    document.getElementById('sAvgScore').textContent   = s.avgScore + '%';

    allInterviews = intRes.interviews || [];
    renderTable(allInterviews);
  } catch (err) {
    document.getElementById('tableBody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:30px;">${err.message}</td></tr>`;
  }
}

// ── Render table ──────────────────────────────────────────────────────────
function renderTable(interviews) {
  const tbody = document.getElementById('tableBody');
  if (!interviews.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted);">No interviews found.</td></tr>';
    return;
  }

  const recClass = (r) => ({
    'Highly Recommended': 'badge-green',
    'Recommended':        'badge-green',
    'Needs Improvement':  'badge-purple',
    'Not Recommended':    'badge-red',
  }[r] || 'badge-gray');

  const statusClass = (s) => s === 'completed' ? 'badge-green' : s === 'in_progress' ? 'badge-purple' : 'badge-gray';

  tbody.innerHTML = interviews.map((iv) => {
    const cand  = iv.candidate || {};
    const ev    = iv.evaluation || {};
    const date  = new Date(iv.createdAt).toLocaleDateString();
    return `<tr>
      <td>
        <strong>${cand.name || '—'}</strong><br>
        <span style="font-size:.78rem;color:var(--muted);">${cand.email || ''}</span>
      </td>
      <td>${iv.jobRole}</td>
      <td><span class="badge ${statusClass(iv.status)}">${iv.status}</span></td>
      <td>${ev.overallScore != null ? ev.overallScore + '/100' : '—'}</td>
      <td>${ev.recommendation ? `<span class="badge ${recClass(ev.recommendation)}">${ev.recommendation}</span>` : '—'}</td>
      <td>${date}</td>
      <td><button class="btn btn-ghost" style="padding:5px 12px;font-size:.8rem;" onclick="viewDetail('${iv._id}')">View</button></td>
    </tr>`;
  }).join('');
}

// ── Filter ────────────────────────────────────────────────────────────────
function filterTable() {
  const q  = document.getElementById('searchInput').value.toLowerCase();
  const st = document.getElementById('filterStatus').value;
  const filtered = allInterviews.filter(iv => {
    const nameMatch  = (iv.candidate?.name  || '').toLowerCase().includes(q);
    const roleMatch  = (iv.jobRole || '').toLowerCase().includes(q);
    const statMatch  = !st || iv.status === st;
    return (nameMatch || roleMatch) && statMatch;
  });
  renderTable(filtered);
}

// ── Detail panel ──────────────────────────────────────────────────────────
function viewDetail(id) {
  const iv  = allInterviews.find(i => i._id === id);
  if (!iv) return;

  const ev  = iv.evaluation || {};
  const qs  = iv.questions  || [];

  const qHtml = qs.map((q, i) => {
    const score = q.aiScore != null ? q.aiScore : '—';
    const sc = score >= 7 ? 'badge-green' : score >= 4 ? 'badge-purple' : 'badge-red';
    return `
      <div class="q-block">
        <div class="flex items-center justify-between mb-4">
          <strong style="font-size:.88rem;">Q${i+1}. ${q.questionText}</strong>
          <span class="badge ${sc}">${score}/10</span>
        </div>
        <p style="font-size:.83rem;color:var(--muted);margin-bottom:6px;">
          <em>${q.answerText || '(no answer)'}</em>
        </p>
        <p style="font-size:.82rem;color:var(--text);">${q.summary || ''}</p>
      </div>`;
  }).join('');

  document.getElementById('detailTitle').textContent =
    `${iv.candidate?.name || 'Candidate'} — ${iv.jobRole}`;

  document.getElementById('detailContent').innerHTML = `
    <div class="flex" style="gap:12px;flex-wrap:wrap;margin-bottom:20px;">
      <span class="badge badge-purple">Score: ${ev.overallScore ?? '—'}/100</span>
      <span class="badge ${ev.recommendation === 'Recommended' || ev.recommendation === 'Highly Recommended' ? 'badge-green' : 'badge-red'}">${ev.recommendation || 'Pending'}</span>
      <span class="badge badge-gray">${iv.durationMinutes ?? 0} min</span>
    </div>
    <p style="margin-bottom:20px;font-size:.9rem;">${ev.summary || ''}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div>
        <h4 style="color:var(--accent2);font-size:.8rem;margin-bottom:8px;">✅ Strengths</h4>
        <ul style="list-style:disc;padding-left:16px;font-size:.85rem;display:flex;flex-direction:column;gap:4px;">
          ${(ev.strengths    || []).map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4 style="color:var(--danger);font-size:.8rem;margin-bottom:8px;">⚠️ Areas to Improve</h4>
        <ul style="list-style:disc;padding-left:16px;font-size:.85rem;display:flex;flex-direction:column;gap:4px;">
          ${(ev.improvements || []).map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    </div>
    <hr class="divider"/>
    <h4 style="margin-bottom:12px;font-size:.88rem;color:var(--muted);">Question Breakdown</h4>
    ${qHtml}`;

  document.getElementById('detailPanel').classList.add('show');
  document.getElementById('detailPanel').scrollIntoView({ behavior: 'smooth' });
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('show');
}

// ── Boot ─────────────────────────────────────────────────────────────────
loadData();
