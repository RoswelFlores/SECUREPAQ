(() => {
  const API_URL = "http://localhost:3000";

  const form = document.getElementById("estructuraForm");
  const deptosContainer = document.getElementById("deptosContainer");
  const btnAgregarDepto = document.getElementById("btnAgregarDepto");
  const btnCancelar = document.getElementById("btnCancelar");
  const messageBox = document.getElementById("estructuraMessage");

  const headerName = document.querySelector(".user-info strong");
  const headerRole = document.querySelector(".user-info span");

  let deptos = [];

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

  function showMessage(text, type) {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.classList.remove("hidden");
    messageBox.classList.remove("success");
    messageBox.classList.remove("error");
    if (type) messageBox.classList.add(type);
    messageBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function buildDeptoCard(index, data) {
    const card = document.createElement("div");
    card.className = "depto-card";
    card.dataset.index = index;
    if (data.id_departamento) {
      card.dataset.id = String(data.id_departamento);
    }

    card.innerHTML = `
      <div class="depto-head">
        <div class="depto-title">Departamento #${index + 1}</div>
        <button type="button" class="btn btn-danger btn-sm-remove" aria-label="Eliminar departamento">Eliminar</button>
      </div>

      <div class="grid-2">
        <label class="field">
          <span class="field-label">Numero <span class="req">*</span></span>
          <input name="numero" type="text" value="${data.numero || ""}" required />
        </label>

        <label class="field">
          <span class="field-label">Piso <span class="req">*</span></span>
          <input name="piso" type="number" min="1" value="${data.piso || ""}" required />
        </label>
      </div>
    `;

    card.querySelector(".btn-sm-remove").addEventListener("click", () => {
      removeDepto(index);
    });

    return card;
  }

  function renderDeptos() {
    deptosContainer.innerHTML = "";
    if (!deptos.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No hay departamentos. Agrega al menos uno.";
      deptosContainer.appendChild(empty);
      return;
    }

    deptos.forEach((d, idx) => {
      const card = buildDeptoCard(idx, d);
      deptosContainer.appendChild(card);
    });
  }

  function addDepto() {
    deptos.push({ numero: "", piso: "1" });
    renderDeptos();
  }

  function removeDepto(index) {
    deptos.splice(index, 1);
    renderDeptos();
  }

  function collectDeptos() {
    const cards = Array.from(deptosContainer.querySelectorAll(".depto-card"));
    return cards.map((card) => {
      const numero = card.querySelector('input[name="numero"]').value.trim();
      const piso = card.querySelector('input[name="piso"]').value.trim();
      const idDepartamento = card.dataset.id ? Number(card.dataset.id) : null;
      return {
        id_departamento: Number.isNaN(idDepartamento) ? null : idDepartamento,
        numero,
        piso
      };
    });
  }

  function validateContacto() {
    const telefonoInput = document.getElementById("edificioTelefono");
    const emailInput = document.getElementById("edificioEmail");
    const phoneValue = telefonoInput ? telefonoInput.value.trim() : "";
    const emailValue = emailInput ? emailInput.value.trim() : "";

    if (telefonoInput) {
      const okPhone = /^\+56 ?9\d{8}$/.test(phoneValue);
      telefonoInput.setCustomValidity(okPhone ? "" : "Formato requerido: +56 9XXXXXXXX");
    }

    if (emailInput) {
      const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
      emailInput.setCustomValidity(okEmail ? "" : "Email invalido");
    }
  }

  async function setUserHeader() {
    const user = getUser();
    if (!user) return;
    if (headerName) headerName.textContent = user.email || "Usuario";
    if (headerRole) headerRole.textContent = "Administrador";

    if (!user.id) return;
    const resumen = await fetchJson(`/admin/usuarios/${user.id}/resumen`);
    if (resumen) {
      if (resumen.usuario && headerName) headerName.textContent = resumen.usuario;
      if (resumen.rol && headerRole) headerRole.textContent = resumen.rol;
    }
  }

  btnAgregarDepto.addEventListener("click", addDepto);
  btnCancelar.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.back();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    showMessage("Validando datos...", "");
    validateContacto();
    if (!form.reportValidity()) return;

    const payload = {
      edificio: {
        nombre: document.getElementById("edificioNombre").value.trim(),
        direccion: document.getElementById("edificioDireccion").value.trim(),
        comuna: document.getElementById("edificioComuna").value.trim(),
        ciudad: document.getElementById("edificioCiudad").value.trim(),
        telefono: document.getElementById("edificioTelefono").value.trim(),
        email: document.getElementById("edificioEmail").value.trim()
      },
      departamentos: collectDeptos()
    };

    try {
      await fetchJson("/admin/estructura", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      showMessage("Estructura guardada correctamente.", "success");
      await loadEstructura();
    } catch (err) {
      showMessage(err.message || "No se pudo guardar la estructura", "error");
    }
  });

  async function loadEstructura() {
    try {
      const data = await fetchJson("/admin/estructura");
      const edificio = data && data.edificio ? data.edificio : null;
      const departamentos = data && Array.isArray(data.departamentos)
        ? data.departamentos
        : [];

      if (edificio) {
        document.getElementById("edificioNombre").value = edificio.nombre || "";
        document.getElementById("edificioDireccion").value = edificio.direccion || "";
        document.getElementById("edificioComuna").value = edificio.comuna || "";
        document.getElementById("edificioCiudad").value = edificio.ciudad || "";
      }

      deptos = departamentos.map((d) => ({
        id_departamento: d.id_departamento,
        numero: d.numero || "",
        piso: String(d.piso || "")
      }));
      renderDeptos();
    } catch (err) {
      renderDeptos();
    }
  }

  renderDeptos();
  setUserHeader();
  loadEstructura();
})();
