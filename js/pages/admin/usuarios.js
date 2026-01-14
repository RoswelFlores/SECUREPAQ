(() => {
  const API_URL = "http://localhost:3000";

  const tbody = document.getElementById("usuariosTbody");
  const empty = document.getElementById("tablaEmpty");

  const btnCrear = document.getElementById("btnCrear");
  const overlay = document.getElementById("modalOverlay");
  const btnClose = document.getElementById("btnCloseModal");
  const btnCancelar = document.getElementById("btnCancelar");
  const modalTitle = document.getElementById("modalTitle");

  const resetOverlay = document.getElementById("resetModalOverlay");
  const resetModalTitle = document.getElementById("resetModalTitle");
  const resetModalMessage = document.getElementById("resetModalMessage");
  const btnResetClose = document.getElementById("btnResetClose");
  const btnResetOk = document.getElementById("btnResetOk");

  const form = document.getElementById("formUsuario");
  const editId = document.getElementById("editId");
  const modalMessage = document.getElementById("modalMessage");

  const nombre = document.getElementById("nombre");
  const rut = document.getElementById("rut");
  const telefono = document.getElementById("telefono");
  const email = document.getElementById("email");
  const rol = document.getElementById("rol");

  const deptoSection = document.getElementById("deptoSection");
  const torre = document.getElementById("torre");
  const depto = document.getElementById("depto");

  const headerName = document.querySelector(".user-info strong");
  const headerRole = document.querySelector(".user-info span");

  const pagination = document.getElementById("usuariosPagination");
  const prevPageBtn = document.getElementById("usuariosPrev");
  const nextPageBtn = document.getElementById("usuariosNext");
  const pageInfo = document.getElementById("usuariosPageInfo");

  let usuarios = [];
  let currentPage = 1;
  const perPage = 10;
  let departamentos = [];
  let edificioNombre = "";

  function getToken() {
    return localStorage.getItem("token");
  }

  function getUser() {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  async function fetchJson(path, options = {}) {
    const token = getToken();
    if (!token) {
      return null;
    }

    const headers = Object.assign({}, options.headers || {});
    headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || "Error de servidor");
    }

    return data;
  }

  function roleToApi(value) {
    if (value === "Administrador") return "ADMIN";
    if (value === "Conserjeria") return "CONSERJERIA";
    return "RESIDENTE";
  }

  function roleFromApi(value) {
    if (value === "ADMIN") return "Administrador";
    if (value === "CONSERJERIA") return "Conserjeria";
    if (value === "RESIDENTE") return "Residente";
    return value || "-";
  }

  function showModalMessage(text, type) {
    if (!modalMessage) return;
    modalMessage.textContent = text;
    modalMessage.classList.remove("hidden");
    modalMessage.classList.remove("success");
    modalMessage.classList.remove("error");
    if (type) modalMessage.classList.add(type);
  }

  function openResetModal(text, type) {
    if (!resetOverlay || !resetModalMessage) return;
    resetModalMessage.textContent = text;
    resetModalMessage.classList.remove("hidden");
    resetModalMessage.classList.remove("success");
    resetModalMessage.classList.remove("error");
    if (type) resetModalMessage.classList.add(type);
    if (resetModalTitle) {
      resetModalTitle.textContent = type === "error" ? "Error" : "Success";
    }
    resetOverlay.classList.remove("hidden");
    resetOverlay.setAttribute("aria-hidden", "false");
  }

  function closeResetModal() {
    if (!resetOverlay || !resetModalMessage) return;
    resetOverlay.classList.add("hidden");
    resetOverlay.setAttribute("aria-hidden", "true");
    resetModalMessage.textContent = "";
    resetModalMessage.classList.add("hidden");
  }

  function normalizeRut(value) {
    return String(value || "")
      .replace(/[^0-9Kk]/g, "")
      .toUpperCase();
  }

  function formatRut(value) {
    const clean = normalizeRut(value);
    if (clean.length < 2) return value || "";
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);
    const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${cuerpoConPuntos}-${dv}`;
  }

  function isValidRut(value) {
    const clean = normalizeRut(value);
    if (clean.length < 2) return false;

    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
      suma += Number(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);
    let dvEsperado = "";
    if (resto === 11) dvEsperado = "0";
    else if (resto === 10) dvEsperado = "K";
    else dvEsperado = String(resto);

    return dvEsperado === dv;
  }

  function hasValidRutFormat(value) {
    const text = String(value || "").trim();
    const withDots = /^\d{1,2}(\.\d{3}){2}-[0-9Kk]$/;
    return withDots.test(text);
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  function isValidChilePhone(value) {
    const phone = normalizePhone(value);
    return /^\+56\s?9\d{8}$/.test(phone);
  }

  function badgeEstado(activo) {
    const estado = activo ? "ACTIVO" : "INACTIVO";
    const cls = activo ? "ok" : "off";
    return `<span class="badge ${cls}">${estado}</span>`;
  }

  function accionesHTML(u) {
    const activo = Boolean(u.activo);
    const toggleText = activo ? "Desactivar" : "Activar";
    const toggleClass = activo ? "danger" : "";
    return `
      <div class="actions">
        <button class="btn-sm" data-action="editar" data-id="${u.id}">Editar</button>
        <button class="btn-sm ${toggleClass}" data-action="toggle" data-id="${u.id}">${toggleText}</button>
        <button class="btn-sm" data-action="reset" data-id="${u.id}">Reset pass</button>
      </div>
    `;
  }

  function renderTabla(rows) {
    tbody.innerHTML = "";

    if (!rows.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    rows.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.nombre || "-"}</td>
        <td>${u.email || "-"}</td>
        <td>${u.rut || "-"}</td>
        <td>${roleFromApi(u.rol)}</td>
        <td>${u.departamento || "-"}</td>
        <td>${badgeEstado(u.activo)}</td>
        <td>${accionesHTML(u)}</td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);

        if (action === "editar") openEditar(id);
        if (action === "toggle") toggleEstado(id);
        if (action === "reset") resetPass(id);
      });
    });
  }

  function renderPage() {
    const totalPages = Math.max(1, Math.ceil(usuarios.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageRows = usuarios.slice(start, end);
    renderTabla(pageRows);

    if (pagination && pageInfo && prevPageBtn && nextPageBtn) {
      pageInfo.textContent = `${currentPage} / ${totalPages}`;
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
      pagination.classList.toggle("hidden", usuarios.length === 0);
    }
  }

  function openModal() {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    if (modalMessage) {
      modalMessage.classList.add("hidden");
      modalMessage.textContent = "";
    }
  }

  function closeModal() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    form.reset();
    editId.value = "";
    rol.value = "Residente";
    syncDeptoVisibility();
    if (modalMessage) {
      modalMessage.classList.add("hidden");
      modalMessage.textContent = "";
    }
  }

  function syncDeptoVisibility() {
    const isResidente = rol.value === "Residente";
    deptoSection.classList.toggle("hidden", !isResidente);

    if (!isResidente) {
      if (torre) {
        torre.value = edificioNombre || "Edificio";
      }
      if (depto) depto.value = "";
    }
  }

  function openCrear() {
    modalTitle.textContent = "Crear usuario";
    editId.value = "";
    form.reset();
    rol.value = "Residente";
    syncDeptoVisibility();
    openModal();
  }

  function openEditar(id) {
    const u = usuarios.find((x) => x.id === id);
    if (!u) return;

    modalTitle.textContent = "Editar usuario";
    editId.value = String(u.id);

    nombre.value = u.nombre || "";
    rut.value = formatRut(u.rut || "");
    telefono.value = u.telefono || "";
    email.value = u.email || "";
    rol.value = roleFromApi(u.rol);

    syncDeptoVisibility();

    if (rol.value === "Residente" && depto) {
      if (torre) torre.value = edificioNombre || "Edificio";
      const match = departamentos.find((d) => d.numero === u.departamento);
      depto.value = match ? String(match.id_departamento) : "";
    }

    openModal();
  }

  async function toggleEstado(id) {
    const u = usuarios.find((x) => x.id === id);
    if (!u) return;
    const nuevoEstado = !Boolean(u.activo);
    try {
      await fetchJson(`/admin/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: nuevoEstado })
      });
      await loadUsuarios();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el estado");
    }
  }

  async function resetPass(id) {
    const u = usuarios.find((x) => x.id === id);
    if (!u) return;
    try {
      const data = await fetchJson(`/admin/usuarios/${id}/reset-password`, {
        method: "POST"
      });
      openResetModal(data.message || "Contrasena reseteada correctamente.", "success");
    } catch (err) {
      openResetModal(err.message || "No se pudo resetear la contrasena", "error");
    }
  }

  async function loadUsuarios() {
    try {
      const data = await fetchJson("/admin/usuarios");
      usuarios = (Array.isArray(data) ? data : []).map((u) => ({
        id: u.id_usuario,
        nombre: u.nombre,
        rut: u.rut,
        telefono: u.telefono,
        email: u.email,
        rol: u.rol,
        departamento: u.departamento,
        activo: !!u.activo
      }));
      currentPage = 1;
      renderPage();
    } catch (err) {
      usuarios = [];
      renderPage();
    }
  }

  function renderDepartamentos() {
    if (!depto) return;
    depto.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Seleccionar...";
    depto.appendChild(placeholder);

    departamentos.forEach((d) => {
      const option = document.createElement("option");
      option.value = String(d.id_departamento);
      option.textContent = d.numero;
      depto.appendChild(option);
    });
  }

  async function loadDepartamentos() {
    try {
      const data = await fetchJson("/admin/departamentos");
      const lista = data && Array.isArray(data.departamentos) ? data.departamentos : [];
      const edificio = data && data.edificio ? data.edificio : null;
      edificioNombre = edificio && edificio.nombre ? edificio.nombre : "Edificio";
      departamentos = lista.map((d) => ({
        id_departamento: d.id_departamento,
        numero: d.numero,
        piso: d.piso
      }));
      renderDepartamentos();
      if (torre) {
        torre.innerHTML = "";
        const option = document.createElement("option");
        option.value = edificioNombre;
        option.textContent = edificioNombre;
        torre.appendChild(option);
        torre.value = edificioNombre;
        torre.disabled = true;
      }
    } catch (err) {
      departamentos = [];
      renderDepartamentos();
    }
  }

  async function setUserHeader() {
    const user = getUser();
    if (!user) return;
    if (headerName) headerName.textContent = user.email || "Usuario";
    if (headerRole) headerRole.textContent = "Administrador";

    if (!user.id) return;
    try {
      const resumen = await fetchJson(`/admin/usuarios/${user.id}/resumen`);
      if (resumen) {
        if (resumen.usuario && headerName) headerName.textContent = resumen.usuario;
        if (resumen.rol && headerRole) headerRole.textContent = resumen.rol;
      }
    } catch (err) {
      return;
    }
  }

  btnCrear.addEventListener("click", openCrear);
  btnClose.addEventListener("click", closeModal);
  btnCancelar.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  if (btnResetClose) btnResetClose.addEventListener("click", closeResetModal);
  if (btnResetOk) btnResetOk.addEventListener("click", closeResetModal);
  if (resetOverlay) {
    resetOverlay.addEventListener("click", (e) => {
      if (e.target === resetOverlay) closeResetModal();
    });
  }

  rol.addEventListener("change", syncDeptoVisibility);
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderPage();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      const totalPages = Math.max(1, Math.ceil(usuarios.length / perPage));
      if (currentPage < totalPages) {
        currentPage += 1;
        renderPage();
      }
    });
  }
  if (rut) {
    rut.addEventListener("blur", () => {
      rut.value = formatRut(rut.value);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;
    rut.value = formatRut(rut.value);
    if (!hasValidRutFormat(rut.value)) {
      showModalMessage("RUT invalido. Formato requerido: 12.345.678-9.", "error");
      return;
    }
    if (!isValidRut(rut.value)) {
      showModalMessage("RUT invalido. Digito verificador no corresponde.", "error");
      return;
    }
    if (!isValidChilePhone(telefono.value)) {
      showModalMessage("Telefono invalido. Formato requerido: +56 9XXXXXXXX.", "error");
      return;
    }

    const data = {
      nombre: nombre.value.trim(),
      rut: rut.value.trim(),
      telefono: telefono.value.trim(),
      email: email.value.trim(),
      rol: roleToApi(rol.value)
    };

    if (rol.value === "Residente") {
      data.id_departamento = depto && depto.value ? Number(depto.value) : null;
      if (!data.id_departamento) {
        showModalMessage("Selecciona un departamento valido.", "error");
        return;
      }
    }

    const id = editId.value ? Number(editId.value) : null;

    try {
      if (id) {
        await fetchJson(`/admin/editar-usuarios/${id}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });
      } else {
        await fetchJson("/admin/usuarios", {
          method: "POST",
          body: JSON.stringify(data)
        });
      }

      showModalMessage("Usuario guardado correctamente.", "success");
      setTimeout(() => {
        closeModal();
        loadUsuarios();
      }, 1000);
    } catch (err) {
      showModalMessage(err.message || "No se pudo guardar el usuario", "error");
    }
  });

  syncDeptoVisibility();
  setUserHeader();
  loadDepartamentos().then(loadUsuarios);
})();
