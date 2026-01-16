const API_URL = window.SECUREPAQ_API_URL;

const recovery = document.getElementById('recovery');
const errorBox = document.getElementById('error-box');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('login-form');
const recoverySubmit = document.getElementById('recovery-submit');
const recoveryEmail = document.getElementById('recovery-email');

function showError(message) {
  if (!errorBox) {
    alert(message);
    return;
  }
  errorBox.classList.add('alert');
  errorBox.textContent = message;
  errorBox.classList.remove('success');
  errorBox.classList.add('error');
  errorBox.style.background = '#FEE2E2';
  errorBox.style.color = 'var(--error)';
  errorBox.classList.remove('hidden');
  errorBox.style.display = 'block';
}

function showSuccess(message) {
  if (!errorBox) {
    alert(message);
    return;
  }
  errorBox.classList.add('alert');
  errorBox.textContent = message;
  errorBox.classList.remove('error');
  errorBox.classList.add('success');
  errorBox.style.background = '#DCFCE7';
  errorBox.style.color = '#166534';
  errorBox.classList.remove('hidden');
  errorBox.style.display = 'block';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  if (errorBox) {
    errorBox.classList.add('hidden');
    errorBox.style.display = 'none';
  }
};

recoverySubmit.addEventListener('click', async () => {
  errorBox.classList.add('hidden');
  const email = recoveryEmail.value.trim();
  if (!email) {
    showError('Email requerido');
    return;
  }
  if (!isValidEmail(email)) {
    showError('Email invalido');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'No se pudo enviar el correo');
    }

    showSuccess('Enviaremos un enlace de recuperacion. Revisa tu bandeja de entrada y spam.');
  } catch (err) {
    showError(err.message || 'No se pudo enviar el correo');
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('hidden');

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!isValidEmail(email)) {
    showError('Email invalido');
    return;
  }

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
