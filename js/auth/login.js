const API_URL = 'http://localhost:3000';

const recovery = document.getElementById('recovery');
const errorBox = document.getElementById('error-box');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('login-form');

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function redirectByRole(roles) {
  if (roles.includes('ADMIN')) {
    window.location.replace('pages/admin/home.html');
    return;
  }
  if (roles.includes('CONSERJERIA')) {
    window.location.replace('pages/conserjeria/home.html');
    return;
  }
  if (roles.includes('RESIDENTE')) {
    window.location.replace('pages/residente/home.html');
    return;
  }
  showError('Rol no reconocido');
}

document.getElementById('show-recovery').onclick = () => {
  recovery.classList.remove('hidden');
};

document.getElementById('back-login').onclick = () => {
  recovery.classList.add('hidden');
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('hidden');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Credenciales invalidas');
    }

    const data = await response.json();
    const user = data.usuario || data.user;

    if (!user || !Array.isArray(user.roles)) {
      throw new Error('Respuesta de usuario invalida');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    redirectByRole(user.roles);
  } catch (err) {
    showError(err.message || 'No se pudo iniciar sesion');
  }
});

(function () {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  if (!token || !raw) {
    return;
  }
  try {
    const user = JSON.parse(raw);
    if (user && Array.isArray(user.roles)) {
      redirectByRole(user.roles);
    }
  } catch (err) {
    return;
  }
})();
