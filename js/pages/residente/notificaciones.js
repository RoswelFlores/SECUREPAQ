(() => {
  const API_URL = 'http://localhost:3000';

  const status = document.getElementById('jsStatus');
  const list = document.getElementById('notificationsList');
  const empty = document.getElementById('emptyState');

  const headerName = document.querySelector('.header-right .user strong');
  const headerRole = document.querySelector('.header-right .user span');

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

  function isRead(value) {
    return Boolean(Number(value));
  }

  function setReadState(card, read) {
    if (!card) return;
    card.classList.toggle('is-read', read);
    const badge = card.querySelector('.type');
    if (badge) {
      badge.classList.toggle('type-read', read);
      badge.classList.toggle('type-unread', !read);
      badge.textContent = read ? 'Leida' : 'Nueva';
    }
    const btn = card.querySelector('.btn-read');
    if (btn) btn.remove();
  }

  function render(items) {
    if (!status || !list || !empty) return;
    status.classList.add('hidden');
    list.innerHTML = '';

    if (!items.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    items.forEach((n) => {
      const item = document.createElement('article');
      item.className = 'notif';

      const leida = isRead(n.leida);
      item.classList.toggle('is-read', leida);

      item.innerHTML = `
        <div class="notif-top">
          <div class="type ${leida ? 'type-read' : 'type-unread'}">${leida ? 'Leida' : 'Nueva'}</div>
          <div class="meta">${formatDateTime(n.fecha_hora)}</div>
        </div>

        <div class="notif-body">
          <h3>Notificacion</h3>
          <p>${displayValue(n.mensaje, '-')}</p>
        </div>
        ${leida ? '' : `
          <div class="notif-actions">
            <button class="btn-read" type="button" data-id="${n.id_notificacion}">Marcar como leida</button>
          </div>
        `}
      `;

      list.appendChild(item);
    });
  }

  async function init() {
    if (!status || !list || !empty) return;
    status.classList.remove('hidden');
    status.textContent = 'Cargando notificaciones...';

    await setUserHeader();

    try {
      const data = await fetchJson('/residente/notificaciones');
      render(Array.isArray(data) ? data : []);
    } catch (err) {
      status.textContent = err.message || 'No se pudieron cargar las notificaciones.';
    }
  }

  if (list) {
    list.addEventListener('click', async (event) => {
      const btn = event.target.closest('.btn-read');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (!id) return;

      btn.disabled = true;
      try {
        await fetchJson('/residente/notificaciones/marcar-como-leida', {
          method: 'POST',
          body: JSON.stringify({ id_notificacion: id })
        });
        const card = btn.closest('.notif');
        setReadState(card, true);
      } catch (err) {
        btn.disabled = false;
        if (status) {
          status.textContent = err.message || 'No se pudo marcar la notificacion.';
          status.classList.remove('hidden');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
