(() => {
  const API_URL = window.SECUREPAQ_API_URL;

  const status = document.getElementById('jsStatus');
  const pendientesList = document.getElementById('pendientesList');
  const historialList = document.getElementById('historialList');
  const pendientesEmpty = document.getElementById('pendientesEmpty');
  const historialEmpty = document.getElementById('historialEmpty');

  const otpModalOverlay = document.getElementById('otpModalOverlay');
  const otpModalTitle = document.getElementById('otpModalTitle');
  const otpModalMessage = document.getElementById('otpModalMessage');
  const otpModalClose = document.getElementById('otpModalClose');
  const otpModalOk = document.getElementById('otpModalOk');

  const headerName = document.querySelector('.user-info strong');
  const headerRole = document.querySelector('.user-info span');

  function getToken() {
    return localStorage.getItem('token');
  }

  function getUser() {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
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

  function formatDateTime(value) {
    const text = displayValue(value, '');
    if (!text) return '-';
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('es-CL');
    }
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

  async function setUserHeader() {
    const user = getUser();
    if (!user) return;

    if (headerName) headerName.textContent = user.email || 'Usuario';
    if (headerRole) {
      headerRole.textContent = Array.isArray(user.roles)
        ? user.roles.join(' | ')
        : 'Rol';
    }

    if (!user.id) return;
    try {
      const resumen = await fetchJson(`/admin/usuarios/${user.id}/resumen`);
      if (resumen && resumen.usuario && headerName) {
        headerName.textContent = resumen.usuario;
      }
      if (resumen && resumen.rol && headerRole) {
        headerRole.textContent = resumen.rol;
      }
    } catch (err) {
      return;
    }
  }

  function openOtpModal(text, type) {
    if (!otpModalOverlay || !otpModalMessage) return;
    otpModalMessage.textContent = text;
    otpModalMessage.classList.remove('hidden');
    otpModalMessage.classList.remove('error');
    if (type === 'error') otpModalMessage.classList.add('error');
    if (otpModalTitle) {
      otpModalTitle.textContent = type === 'error' ? 'Error' : 'Success';
    }
    otpModalOverlay.classList.remove('hidden');
    otpModalOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeOtpModal() {
    if (!otpModalOverlay || !otpModalMessage) return;
    otpModalOverlay.classList.add('hidden');
    otpModalOverlay.setAttribute('aria-hidden', 'true');
    otpModalMessage.textContent = '';
    otpModalMessage.classList.add('hidden');
    otpModalMessage.classList.remove('error');
  }

  function renderPendientes(pendientes) {
    if (!pendientesList || !pendientesEmpty) return;
    pendientesList.innerHTML = '';

    if (!pendientes.length) {
      pendientesEmpty.classList.remove('hidden');
      return;
    }
    pendientesEmpty.classList.add('hidden');

    pendientes.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'card';

      const recepcion = formatDateTime(item.fecha_recepcion);
      const expira = formatDateTime(item.fecha_expiracion);
      const tracking = displayValue(item.tracking, '-');
      const otp = displayValue(item.otp, '-');

      el.innerHTML = `
        <div class="card-head">
          <div class="courier">${displayValue(item.courier, '-')}</div>
          <div class="tag">${tracking}</div>
        </div>

        <div class="grid">
          <div class="label">Recepcion:</div>
          <div class="value">${recepcion}</div>

          <div class="label">Tracking:</div>
          <div class="value">${tracking}</div>
        </div>

        <div class="otp-box">
          <div>
            <div class="otp-code">${otp}</div>
            <div class="otp-meta">Expira: ${expira}</div>
          </div>

          <button class="btn btn-regenerar" data-id="${item.id_encomienda}">
            Regenerar OTP
          </button>
        </div>
      `;
      pendientesList.appendChild(el);
    });

    document.querySelectorAll('.btn-regenerar').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        if (!id) return;
        try {
          await fetchJson('/residente/regenerar-otp', {
            method: 'POST',
            body: JSON.stringify({ id_encomienda: id })
          });
          openOtpModal('OTP regenerado. Revisa tu correo.', 'success');
          await loadPendientes();
        } catch (err) {
          openOtpModal(err.message || 'No se pudo regenerar el OTP', 'error');
        }
      });
    });
  }

  function renderHistorial(historial) {
    if (!historialList || !historialEmpty) return;
    historialList.innerHTML = '';

    if (!historial.length) {
      historialEmpty.classList.remove('hidden');
      return;
    }
    historialEmpty.classList.add('hidden');

    historial.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'card';

      const recepcion = formatDateTime(item.fecha_recepcion);
      const retiro = formatDateTime(item.fecha_retiro);
      const tracking = displayValue(item.tracking, '-');
      const observacion = displayValue(item.observacion, '-');

      el.innerHTML = `
        <div class="card-head">
          <div class="courier">${displayValue(item.courier, '-')}</div>
          <div class="tag">${tracking}</div>
        </div>

        <div class="grid">
          <div class="label">Recepcion:</div>
          <div class="value">${recepcion}</div>

          <div class="label">Retiro:</div>
          <div class="value">${retiro}</div>

          <div class="label">Tracking:</div>
          <div class="value">${tracking}</div>

          <div class="label">Observacion:</div>
          <div class="value">${observacion}</div>
        </div>
      `;
      historialList.appendChild(el);
    });
  }

  async function loadPendientes() {
    const data = await fetchJson('/residente/pendientes');
    renderPendientes(Array.isArray(data) ? data : []);
  }

  async function loadHistorial() {
    const data = await fetchJson('/residente/historial');
    renderHistorial(Array.isArray(data) ? data : []);
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.tab;
        panels.forEach((p) => p.classList.remove('active'));
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  async function init() {
    if (!status || !pendientesList || !historialList || !pendientesEmpty || !historialEmpty) {
      return;
    }

    status.classList.remove('hidden');
    status.textContent = 'Cargando datos...';

    await setUserHeader();
    initTabs();

    try {
      await loadPendientes();
      await loadHistorial();
      status.classList.add('hidden');
    } catch (err) {
      status.textContent = err.message || 'No se pudieron cargar los datos.';
    }
  }

  if (otpModalClose) {
    otpModalClose.addEventListener('click', closeOtpModal);
  }
  if (otpModalOk) {
    otpModalOk.addEventListener('click', closeOtpModal);
  }
  if (otpModalOverlay) {
    otpModalOverlay.addEventListener('click', (event) => {
      if (event.target === otpModalOverlay) closeOtpModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
