(() => {
  console.log("admin/usuarios.js cargado");

  const tbody = document.getElementById("usuariosTbody");
  const empty = document.getElementById("tablaEmpty");

  const btnCrear = document.getElementById("btnCrear");
  const overlay = document.getElementById("modalOverlay");
  const btnClose = document.getElementById("btnCloseModal");
  const btnCancelar = document.getElementById("btnCancelar");
  const modalTitle = document.getElementById("modalTitle");

  const form = document.getElementById("formUsuario");
  const editId = document.getElementById("editId");

  const nombre = document.getElementById("nombre");
  const rut = document.getElementById("rut");
  const telefono = document.getElementById("telefono");
  const email = document.getElementById("email");
  const rol = document.getElementById("rol");

  const deptoSection = document.getElementById("deptoSection");
  const torre = document.getElementById("torre");
  const depto = document.getElementById("depto");

  // Mock data
  let usuarios = [
    {
      id: 1,
      nombre: "Juan Perez",
      email: "juan.perez@ejemplo.com",
      rut: "12.345.678-9",
      rol: "Residente",
      depto: "304-A",
      estado: "ACTIVO",
    },
    {
      id: 2,
      nombre: "Carlos Ramirez",
      email: "carlos.ramirez@ejemplo.com",
      rut: "98.765.432-1",
      rol: "Conserjeria",
      depto: "-",
      estado: "ACTIVO",
    },
    {
      id: 3,
      nombre: "Maria Gonzalez",
      email: "maria.gonzalez@ejemplo.com",
      rut: "15.678.943-2",
      rol: "Residente",
      depto: "205-B",
      estado: "ACTIVO",
    },
    {
      id: 4,
      nombre: "Pedro Silva",
      email: "pedro.silva@ejemplo.com",
      rut: "22.334.556-7",
      rol: "Residente",
      depto: "102-A",
      estado: "INACTIVO",
    },
  ];

  function badgeEstado(estado) {
    const cls = estado === "ACTIVO" ? "ok" : "off";
    return `<span class="badge ${cls}">${estado}</span>`;
  }

  function accionesHTML(u) {
    const toggleText = u.estado === "ACTIVO" ? "Desactivar" : "Activar";
    const toggleClass = u.estado === "ACTIVO" ? "danger" : "";
    return `
      <div class="actions">
        <button class="btn-sm" data-action="editar" data-id="${u.id}">Editar</button>
        <button class="btn-sm ${toggleClass}" data-action="toggle" data-id="${u.id}">${toggleText}</button>
        <button class="btn-sm" data-action="reset" data-id="${u.id}">Reset pass</button>
      </div>
    `;
  }

  function renderTabla() {
    tbody.innerHTML = "";

    if (!usuarios.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    usuarios.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${u.rut}</td>
        <td>${u.rol}</td>
        <td>${u.depto || "-"}</td>
        <td>${badgeEstado(u.estado)}</td>
        <td>${accionesHTML(u)}</td>
      `;
      tbody.appendChild(tr);
    });

    // Bind acciones
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

  function openModal() {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    form.reset();
    editId.value = "";
    // por defecto: residente muestra seccion
    rol.value = "Residente";
    syncDeptoVisibility();
  }

  function syncDeptoVisibility() {
    const isResidente = rol.value === "Residente";
    deptoSection.classList.toggle("hidden", !isResidente);

    if (!isResidente) {
      torre.value = "Torre A";
      depto.value = "";
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

    nombre.value = u.nombre;
    rut.value = u.rut;
    telefono.value = u.telefono || "+56912345678";
    email.value = u.email;
    rol.value = u.rol;

    syncDeptoVisibility();

    if (u.rol === "Residente") {
      const match = String(u.depto || "").match(/^(\d+)-([A-Z])$/);
      if (match) {
        depto.value = match[1];
        torre.value = `Torre ${match[2]}`;
      } else {
        depto.value = "";
        torre.value = "Torre A";
      }
    }

    openModal();
  }

  function toggleEstado(id) {
    usuarios = usuarios.map((u) => {
      if (u.id !== id) return u;
      return { ...u, estado: u.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO" };
    });
    renderTabla();
  }

  function resetPass(id) {
    const u = usuarios.find((x) => x.id === id);
    if (!u) return;
    alert("Reset de contrasena (mock) enviado a: " + u.email);
  }

  // Eventos
  btnCrear.addEventListener("click", openCrear);
  btnClose.addEventListener("click", closeModal);
  btnCancelar.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  rol.addEventListener("change", syncDeptoVisibility);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      nombre: nombre.value.trim(),
      rut: rut.value.trim(),
      telefono: telefono.value.trim(),
      email: email.value.trim(),
      rol: rol.value,
      estado: "ACTIVO",
      depto: "-",
    };

    if (data.rol === "Residente") {
      const deptoNum = depto.value.trim();
      const torreVal = torre.value.trim(); // "Torre A"
      const letra = torreVal.split(" ").pop(); // "A"
      data.depto = deptoNum ? `${deptoNum}-${letra}` : "-";
    }

    const id = editId.value ? Number(editId.value) : null;

    if (id) {
      usuarios = usuarios.map((u) => (u.id === id ? { ...u, ...data, id } : u));
    } else {
      const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      usuarios = [{ id: newId, ...data }, ...usuarios];
    }

    closeModal();
    renderTabla();
  });

  syncDeptoVisibility();
  renderTabla();
})();
