const email = document.getElementById('email');
const phone = document.getElementById('telefono');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');

const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');
const strengthError = document.getElementById('password-strength-error');
const matchError = document.getElementById('password-match-error');
const backBtn = document.getElementById('backBtn');

const backRoutes = {
  admin: '../admin/home.html',
  conserjeria: '../conserjeria/home.html',
  residente: '../residente/home.html'
};

const API_URL = 'http://localhost:3000';

function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

async function fetchJson(path, options = {}) {
  const token = getToken();
  if (!token) {
    return null;
  }

  const headers = Object.assign({}, options.headers || {});
  headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return null;
  }

  return data;
}

function setInfoBox(nombre, rol) {
  const box = document.querySelector('.info-box');
  if (!box) return;
  const paragraphs = box.querySelectorAll('p');
  if (paragraphs[0]) {
    paragraphs[0].innerHTML = `<strong>Usuario:</strong> ${nombre || 'Usuario'}`;
  }
  if (paragraphs[1]) {
    paragraphs[1].innerHTML = `<strong>Rol:</strong> ${rol || 'Rol'}`;
  }
}

async function prefillProfile() {
  const user = getUser();
  if (!user) return;

  if (user.email && email) {
    email.value = user.email;
  }

  let telefono = '';
  let nombre = '';
  let rol = '';

  if (user.id) {
    const resumen = await fetchJson(`/admin/usuarios/${user.id}/resumen`);
    if (resumen) {
      telefono = resumen.telefono || '';
      nombre = resumen.usuario || '';
      rol = resumen.rol || '';
      if (resumen.correo && email) {
        email.value = resumen.correo;
      }
    }
  }

  if (!rol && Array.isArray(user.roles)) {
    rol = user.roles[0] || '';
  }

  if (phone) {
    phone.value = telefono || phone.value || '';
  }

  setInfoBox(nombre || user.email, rol);
}

function resolveBackRoute() {
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  if (from && backRoutes[from]) return backRoutes[from];

  const user = getUser();
  const roles = (user && Array.isArray(user.roles)) ? user.roles : [];
  if (roles.includes('ADMIN')) return backRoutes.admin;
  if (roles.includes('CONSERJERIA')) return backRoutes.conserjeria;
  if (roles.includes('RESIDENTE')) return backRoutes.residente;

  return null;
}

if (backBtn) {
  backBtn.addEventListener('click', () => {
    const target = resolveBackRoute();

    if (target) {
      window.location.href = target;
      return;
    }

    if (document.referrer) {
      window.history.back();
      return;
    }

    window.location.href = '../../index.html';
  });
}

prefillProfile();

const saveBtn = document.getElementById('saveBtn');
if (saveBtn) saveBtn.onclick = () => {
  let valid = true;

  // Email
  if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    emailError.classList.remove('hidden');
    valid = false;
  } else emailError.classList.add('hidden');

  // Teléfono
  if (!/^\+\d{11,15}$/.test(phone.value)) {
    phoneError.classList.remove('hidden');
    valid = false;
  } else phoneError.classList.add('hidden');

  // Password
  if (newPassword.value || confirmPassword.value) {
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(newPassword.value)) {
      strengthError.classList.remove('hidden');
      valid = false;
    } else strengthError.classList.add('hidden');

    if (newPassword.value !== confirmPassword.value) {
      matchError.classList.remove('hidden');
      valid = false;
    } else matchError.classList.add('hidden');
  }

  if (!valid) return;

  // 🔜 FUTURO: fetch('/api/user/profile')
  alert('Cambios guardados (mock)');
};
