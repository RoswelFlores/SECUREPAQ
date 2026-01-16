(() => {
  const API_URL = window.SECUREPAQ_API_URL;

  const guardar = document.getElementById('guardar');
  const cancelar = document.querySelector('.actions .btn-secondary');
  const confirmacion = document.getElementById('confirmacion');
  const descripcion = document.getElementById('descripcion');
  const count = document.getElementById('count');
  const formMessage = document.getElementById('form-message');

  const residenteSelect = document.getElementById('residente');
  const rutInput = document.getElementById('rut');
  const deptoInput = document.getElementById('depto');
  const courierSelect = document.getElementById('courier');
  const trackingInput = document.getElementById('tracking');
  const tipoSelect = document.getElementById('tipo');
  const tamanoSelect = document.getElementById('tamano');

  const COURIER_ID_MAP = {
    'FedEx': 1,
    'DHL Express': 2,
    'Starken': 3,
    'Correos de Chile': 4,
    'Otro': 5
  };

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

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function getFechaHora() {
    const now = new Date();
    const fecha = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    const hora = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    return { fecha, hora };
  }

  function getTimezoneOffsetMinutes(fecha, hora) {
    const [year, month, day] = String(fecha).split('-').map(Number);
    const [hour, minute] = String(hora).split(':').map(Number);
    if ([year, month, day, hour, minute].some(Number.isNaN)) return null;
    const localDate = new Date(year, month - 1, day, hour, minute, 0);
    if (Number.isNaN(localDate.getTime())) return null;
    return localDate.getTimezoneOffset();
  }

  function updateRecepcionFields() {
    const labels = Array.from(document.querySelectorAll('label'));
    const { fecha, hora } = getFechaHora();
    const user = getUser();
    const receptor = user && user.email ? user.email : 'Conserjeria';

    labels.forEach((label) => {
      const text = label.textContent.toLowerCase();
      if (text.includes('receptor')) {
        const input = label.parentElement ? label.parentElement.querySelector('input') : null;
        if (input) input.value = receptor;
      }
      if (text.includes('fecha') && text.includes('recep')) {
        const input = label.parentElement ? label.parentElement.querySelector('input') : null;
        if (input) input.value = fecha;
      }
      if (text.includes('hora') && text.includes('recep')) {
        const input = label.parentElement ? label.parentElement.querySelector('input') : null;
        if (input) input.value = hora;
      }
    });
  }

  let residentesCache = new Map();

  function clearResidenteFields() {
    if (rutInput) rutInput.value = '';
    if (deptoInput) deptoInput.value = '';
  }

  function setResidenteFields(residente) {
    if (!residente) {
      clearResidenteFields();
      return;
    }
    if (rutInput) rutInput.value = residente.rut || '';
    if (deptoInput) deptoInput.value = residente.departamento || '';
  }

  function renderResidentes(items) {
    if (!residenteSelect) return;
    residenteSelect.innerHTML = '<option value="">Seleccionar...</option>';
    residentesCache = new Map();

    items.forEach((item) => {
      const label = item.nombre || `Residente ${item.id_residente}`;
      const option = document.createElement('option');
      option.value = String(item.id_residente);
      option.textContent = label;
      residenteSelect.appendChild(option);
      residentesCache.set(String(item.id_residente), item);
    });
  }

  async function cargarResidentes() {
    try {
      const data = await fetchJson('/conserjeria/residentes-lista');
      renderResidentes(Array.isArray(data) ? data : []);
    } catch (err) {
      renderResidentes([]);
    }
  }

  async function cargarCouriers() {
    if (!courierSelect) return;
    try {
      const data = await fetchJson('/conserjeria/couriers');
      courierSelect.innerHTML = '<option value="">Seleccionar...</option>';
      (Array.isArray(data) ? data : []).forEach((item) => {
        const option = document.createElement('option');
        option.value = item.nombre;
        option.textContent = item.nombre;
        option.setAttribute('data-id', item.id_courier);
        courierSelect.appendChild(option);
      });
    } catch (err) {
      return;
    }
  }

  function getCourierId() {
    if (!courierSelect) return null;
    const option = courierSelect.options[courierSelect.selectedIndex];
    if (!option) return null;

    const dataId = option.getAttribute('data-id');
    if (dataId && !Number.isNaN(Number(dataId))) {
      return Number(dataId);
    }

    const fallback = COURIER_ID_MAP[option.value];
    if (fallback) return fallback;

    const numeric = Number(option.value);
    if (!Number.isNaN(numeric)) return numeric;

    return null;
  }

  function setConfirmValues(values) {
    if (!confirmacion) return;

    const otpBox = confirmacion.querySelector('.otp-box');
    const otpExpires = confirmacion.querySelector('.otp-expires');
    const detailValues = confirmacion.querySelectorAll('.details .details-row .value');

    if (otpBox) otpBox.textContent = 'Enviado por correo';
    if (otpExpires) otpExpires.textContent = 'Expira: revisar correo';

    if (detailValues.length >= 5) {
      detailValues[0].textContent = values.tracking || '-';
      detailValues[1].textContent = values.residente || '-';
      detailValues[2].textContent = values.courier || '-';
      detailValues[3].textContent = values.tipo || '-';
      detailValues[4].textContent = 'PENDIENTE';
    }
  }

  function validateRequired(id) {
    const el = document.getElementById(id);
    const err = document.getElementById(`${id}-error`);
    if (el && !el.value) {
      if (err) err.classList.remove('hidden');
      return false;
    }
    if (err) err.classList.add('hidden');
    return true;
  }

  function showFormMessage(text) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.classList.remove('hidden');
  }

  function clearFormMessage() {
    if (!formMessage) return;
    formMessage.textContent = '';
    formMessage.classList.add('hidden');
  }

  if (descripcion && count) {
    descripcion.addEventListener('input', () => {
      count.textContent = String(descripcion.value.length);
    });
  }

  if (residenteSelect) {
    residenteSelect.addEventListener('change', () => {
      const selected = residentesCache.get(residenteSelect.value);
      setResidenteFields(selected || null);
      const err = document.getElementById('residente-error');
      if (selected && err) err.classList.add('hidden');
    });
  }

  if (guardar) {
    guardar.addEventListener('click', async () => {
      clearFormMessage();
      const checks = [
        validateRequired('residente'),
        validateRequired('courier'),
        validateRequired('tracking'),
        validateRequired('tipo'),
        validateRequired('tamano')
      ];
      if (checks.includes(false)) return;

      const residenteId = Number(residenteSelect ? residenteSelect.value : '');
      if (Number.isNaN(residenteId)) {
        const err = document.getElementById('residente-error');
        if (err) err.classList.remove('hidden');
        return;
      }

      const courierId = getCourierId();
      if (!courierId) {
        const err = document.getElementById('courier-error');
        if (err) err.classList.remove('hidden');
        return;
      }

      const { fecha, hora } = getFechaHora();
      const timezoneOffset = getTimezoneOffsetMinutes(fecha, hora);

      try {
        await fetchJson('/encomiendas', {
          method: 'POST',
          body: JSON.stringify({
            id_residente: residenteId,
            id_courier: courierId,
            tracking: trackingInput ? trackingInput.value.trim() : '',
            tipo_paquete: tipoSelect ? tipoSelect.value : '',
            tamanio: tamanoSelect ? tamanoSelect.value : '',
            descripcion: descripcion ? descripcion.value.trim() : '',
            fecha_recepcion: fecha,
            hora_recepcion: hora,
            timezone_offset: timezoneOffset
          })
        });

        clearFormMessage();
        let residenteNombre = '';
        if (residenteSelect && residenteSelect.selectedIndex >= 0) {
          residenteNombre = residenteSelect.options[residenteSelect.selectedIndex].textContent || '';
        }

        setConfirmValues({
          tracking: trackingInput ? trackingInput.value.trim() : '',
          residente: residenteNombre,
          courier: courierSelect ? courierSelect.value : '',
          tipo: tipoSelect ? tipoSelect.value : ''
        });

        if (confirmacion) confirmacion.classList.remove('hidden');
      } catch (err) {
        const rawMessage = err && err.message ? err.message : '';
        const message = rawMessage.toLowerCase();
        if (message.includes('duplicate') || message.includes('duplicado')) {
          showFormMessage('El tracking ya esta registrado. Usa uno diferente.');
          return;
        }
        showFormMessage(rawMessage || 'No se pudo registrar la encomienda');
      }
    });
  }

  updateRecepcionFields();
  cargarResidentes();
  cargarCouriers();

  if (cancelar) {
    cancelar.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'home.html';
    });
  }
})();
