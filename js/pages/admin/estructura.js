(() => {
  const API_URL = "http://localhost:3000";

  const form = document.getElementById("estructuraForm");
  const deptosContainer = document.getElementById("deptosContainer");
  const btnAgregarDepto = document.getElementById("btnAgregarDepto");
  const btnCancelar = document.getElementById("btnCancelar");

  const headerName = document.querySelector(".user-info strong");
  const headerRole = document.querySelector(".user-info span");

  let deptos = [
    { numero: "101", piso: "1" },
    { numero: "102", piso: "1" },
    { numero: "201", piso: "2" }
  ];

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

  function buildDeptoCard(index, data) {
    const card = document.createElement("div");
    card.className = "depto-card";
    card.dataset.index = index;

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
      return { numero, piso };
    });
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
      alert("Estructura guardada correctamente.");
    } catch (err) {
      alert(err.message || "No se pudo guardar la estructura");
    }
  });

  renderDeptos();
  setUserHeader();
})();
