(() => {
  const API_URL = 'http://localhost:3000';

  const otpInput = document.getElementById('otp');
  const validarBtn = document.getElementById('validar');
  const confirmarBtn = document.getElementById('confirmar');
  const obsInput = document.getElementById('obs');

  const otpSection = document.querySelector('.otp-section');
  const encomiendaSection = document.getElementById('encomienda');
  const finalSection = document.getElementById('final');
  const infoGrid = document.querySelector('.info-grid');

  const errInvalid = document.getElementById('otp-invalid');
  const errExpired = document.getElementById('otp-expired');

  let encomiendaId = null;

  function getToken() {
    return localStorage.getItem('token');
  }

  function redirectToLogin() {
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.replace(isInPages ? '../../index.html' : 'index.html');
  }

  function displayValue(value, fallback = '-') {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    if (!text) return fallback;
    if (!/[A-Za-z0-9]/.test(text)) return fallback;
    return text;
  }

  async function fetchJson(path, options = {}) {
    const token = getToken();
    if (!token) {
      redirectToLogin();
      throw new Error('Sin token');
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

    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      redirectToLogin();
      throw new Error('No autorizado');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Error de servidor');
    }

    return data;
  }

  function clearErrors() {
    if (errInvalid) errInvalid.classList.add('hidden');
    if (errExpired) errExpired.classList.add('hidden');
  }

  function showError(message) {
    if (!message) return;
    if (message.toLowerCase().includes('expir')) {
      if (errExpired) errExpired.classList.remove('hidden');
      return;
    }
    if (errInvalid) errInvalid.classList.remove('hidden');
  }

  function renderDetalle(detalle) {
    if (!infoGrid) return;

    const tracking = displayValue(detalle.tracking, '-');
    const courier = displayValue(detalle.courier, '-');
    const residente = displayValue(detalle.residente, '-');
    const departamento = displayValue(detalle.departamento, '-');
    const estado = 'Pendiente';

    infoGrid.innerHTML = `
      <div><strong>Tracking:</strong> ${tracking}</div>
      <div><strong>Courier:</strong> ${courier}</div>
      <div><strong>Residente:</strong> ${residente}</div>
      <div><strong>Depto:</strong> ${departamento}</div>
      <div><strong>Estado:</strong> ${estado}</div>
    `;
  }

  async function validarOtp() {
    clearErrors();
    const otp = otpInput ? otpInput.value.trim() : '';
    if (!otp) {
      showError('OTP obligatorio');
      return;
    }

    try {
      const detalle = await fetchJson('/otp/validar-otp', {
        method: 'POST',
        body: JSON.stringify({ otp })
      });

      encomiendaId = detalle.id_encomienda;
      renderDetalle(detalle);

      if (otpSection) otpSection.classList.add('hidden');
      if (encomiendaSection) encomiendaSection.classList.remove('hidden');
    } catch (err) {
      showError(err.message || 'OTP invalido');
    }
  }

  async function confirmarRetiro() {
    clearErrors();
    if (!encomiendaId) {
      showError('Encomienda invalida');
      return;
    }

    try {
      await fetchJson('/encomiendas/confirmar-retiro', {
        method: 'POST',
        body: JSON.stringify({
          id_encomienda: encomiendaId,
          observacion: obsInput ? obsInput.value.trim() : ''
        })
      });

      if (encomiendaSection) encomiendaSection.classList.add('hidden');
      if (finalSection) finalSection.classList.remove('hidden');
    } catch (err) {
      showError(err.message || 'No se pudo confirmar el retiro');
    }
  }

  if (validarBtn) {
    validarBtn.addEventListener('click', validarOtp);
  }
  if (confirmarBtn) {
    confirmarBtn.addEventListener('click', confirmarRetiro);
  }

  const params = new URLSearchParams(window.location.search);
  const presetOtp = params.get('otp');
  if (presetOtp && otpInput) {
    otpInput.value = presetOtp;
  }
})();
