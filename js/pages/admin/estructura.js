(() => {
  console.log("admin/estructura.js cargado");

  const form = document.getElementById("estructuraForm");
  const deptosContainer = document.getElementById("deptosContainer");
  const btnAgregarDepto = document.getElementById("btnAgregarDepto");
  const btnCancelar = document.getElementById("btnCancelar");

  // Mock inicial
  let deptos = [
    { numero: "101", piso: "1", cupo: "1", estado: "Activo" },
    { numero: "102", piso: "1", cupo: "1", estado: "Activo" },
    { numero: "201", piso: "2", cupo: "1", estado: "Activo" },
  ];

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

      <div class="grid-2">
        <label class="field">
          <span class="field-label">Cupo resid. <span class="req">*</span></span>
          <input name="cupo" type="number" min="1" value="${data.cupo || ""}" required />
        </label>

        <label class="field">
          <span class="field-label">Estado <span class="req">*</span></span>
          <select name="estado" required>
            <option value="Activo" ${data.estado === "Activo" ? "selected" : ""}>Activo</option>
            <option value="Inactivo" ${data.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
          </select>
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
    deptos.push({ numero: "", piso: "1", cupo: "1", estado: "Activo" });
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
      const cupo = card.querySelector('input[name="cupo"]').value.trim();
      const estado = card.querySelector('select[name="estado"]').value;
      return { numero, piso, cupo, estado };
    });
  }

  btnAgregarDepto.addEventListener("click", addDepto);
  btnCancelar.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.back();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // simple validacion HTML5
    if (!form.reportValidity()) return;

    const payload = {
      edificio: {
        nombre: document.getElementById("edificioNombre").value.trim(),
        direccion: document.getElementById("edificioDireccion").value.trim(),
        comuna: document.getElementById("edificioComuna").value.trim(),
        ciudad: document.getElementById("edificioCiudad").value.trim(),
        telefono: document.getElementById("edificioTelefono").value.trim(),
        email: document.getElementById("edificioEmail").value.trim(),
        estado: document.getElementById("edificioEstado").value,
      },
      deptos: collectDeptos(),
    };

    console.log("Payload estructura", payload);
    alert("Datos de estructura guardados (mock). Revisa la consola para ver el payload.");
  });

  renderDeptos();
})();
