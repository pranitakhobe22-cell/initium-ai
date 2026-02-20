// login.js
let selectedRole = 'candidate';

function setRole(role) {
  selectedRole = role;
  document.getElementById('roleCand').className  = role === 'candidate' ? 'btn btn-primary' : 'btn btn-ghost';
  document.getElementById('roleCand').style.flex = '1';
  document.getElementById('roleAdmin').className  = role === 'admin'     ? 'btn btn-primary' : 'btn btn-ghost';
  document.getElementById('roleAdmin').style.flex = '1';
}

function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}

// Redirect if already logged in
if (api.getToken() && api.getUser()) {
  const u = api.getUser();
  window.location.href = u.role === 'admin' ? 'admin.html' : 'profile.html';
}

// ── Login ──────────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Signing in...';

  try {
    const data = await api.post('/auth/login', {
      email:    document.getElementById('email').value,
      password: document.getElementById('password').value,
    });

    if (data.user.role !== selectedRole) {
      showAlert('alert', `This account is registered as "${data.user.role}", not "${selectedRole}".`);
      btn.disabled = false; btn.textContent = 'Sign In';
      return;
    }

    api.setToken(data.token);
    api.setUser(data.user);
    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'profile.html';
  } catch (err) {
    showAlert('alert', err.message);
    btn.disabled = false; btn.textContent = 'Sign In';
  }
});

// ── Register toggle ────────────────────────────────────────────────────────
document.getElementById('registerLink').addEventListener('click', (e) => {
  e.preventDefault();
  const p = document.getElementById('registerPanel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api.post('/auth/register', {
      name:     document.getElementById('regName').value,
      email:    document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
    });
    api.setToken(data.token);
    api.setUser(data.user);
    window.location.href = 'profile.html';
  } catch (err) {
    showAlert('alertReg', err.message);
  }
});
