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

function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
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
