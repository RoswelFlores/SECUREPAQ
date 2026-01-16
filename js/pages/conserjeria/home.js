(() => {
  const API_URL = window.SECUREPAQ_API_URL;

  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');

  const headerRight = document.querySelector('.header-right');
  const headerName = headerRight ? headerRight.querySelector('strong') : null;
  const headerRole = headerRight ? headerRight.querySelector('span') : null;

  const kpiValues = document.querySelectorAll('.kpi-card .kpi-value');

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

    if (headerName) {
      headerName.textContent = user.email || 'Usuario';
    }
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

  function renderRows(rows) {
    if (!tableBody || !emptyState) return;
    const data = Array.isArray(rows) ? rows : [];

    tableBody.innerHTML = '';

    if (!data.length) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    data.forEach((item) => {
      const tr = document.createElement('tr');

      const estado = String(item.estado || '').toUpperCase();
      const isPending = estado === 'PENDIENTE' || estado === 'RECIBIDA';

      const otp = displayValue(item.otp, '-');
      const tracking = displayValue(item.tracking, '-');
      const courier = displayValue(item.courier, '-');
      const residente = displayValue(item.residente, '-');
      const departamento = displayValue(item.departamento || item.depto, '-');
      const recepcion = formatDateTime(item.fecha_recepcion || item.recepcion);
      const retiro = formatDateTime(item.fecha_retiro || item.retiro);
      const statusText = displayValue(item.estado, '-');
      const hasOtp = /[0-9]/.test(String(item.otp || ''));
      const actionButton = isPending && hasOtp
        ? '<a href="retiro.html" class="btn-secondary">Retiro</a>'
        : '';

      tr.innerHTML = `
        <td class="otp">${otp}</td>
        <td>${tracking}</td>
        <td>${courier}</td>
        <td>${residente}</td>
        <td>${departamento}</td>
        <td>${recepcion}</td>
        <td>${retiro}</td>
        <td>
          <span class="status ${isPending ? 'pending' : 'done'}">
            ${statusText}
          </span>
        </td>
        <td>${actionButton}</td>
      `;

      tableBody.appendChild(tr);
    });
  }

  async function loadDashboard() {
    if (!kpiValues.length) return;
    try {
      const data = await fetchJson('/conserjeria/dashboard');
      if (kpiValues[0]) {
        kpiValues[0].textContent = String(data.pendientes_hoy ?? 0);
      }
      if (kpiValues[1]) {
        kpiValues[1].textContent = String(data.retiradas_hoy ?? 0);
      }
    } catch (err) {
      if (kpiValues[0]) kpiValues[0].textContent = '-';
      if (kpiValues[1]) kpiValues[1].textContent = '-';
    }
  }

  async function loadListado() {
    try {
      const data = await fetchJson('/conserjeria/encomiendas');
      renderRows(data);
    } catch (err) {
      renderRows([]);
    }
  }

  async function init() {
    await setUserHeader();
    await loadDashboard();
    await loadListado();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
