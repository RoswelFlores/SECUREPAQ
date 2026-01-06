(() => {
  console.log("admin/auditoria.js cargado");

  const tbody = document.getElementById("auditoriaTbody");
  const empty = document.getElementById("auditoriaEmpty");

  const registros = [
    {
      fecha: "27/12/2025 15:45",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "RETIRO",
      detalle: "Retiro encomienda #TRK-458921 - Juan Perez (304-A)",
    },
    {
      fecha: "27/12/2025 14:30",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "REGISTRO",
      detalle: "Registro encomienda FedEx - Juan Perez (304-A)",
    },
    {
      fecha: "27/12/2025 12:15",
      usuario: "Juan Perez",
      rol: "Residente",
      accion: "REGENERAR OTP",
      detalle: "Regeneracion OTP encomienda #TRK-458920",
    },
    {
      fecha: "26/12/2025 18:30",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "RETIRO",
      detalle: "Retiro encomienda #TRK-458919 - Maria Gonzalez (205-B)",
    },
    {
      fecha: "26/12/2025 14:45",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "REGISTRO",
      detalle: "Registro encomienda Starken - Pedro Silva (102-A)",
    },
    {
      fecha: "26/12/2025 11:20",
      usuario: "Juan Perez",
      rol: "Residente",
      accion: "REGENERAR OTP",
      detalle: "Regeneracion OTP encomienda #TRK-458918",
    },
    {
      fecha: "25/12/2025 17:50",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "RETIRO",
      detalle: "Retiro encomienda #TRK-458915 - Roberto Torres (508-B)",
    },
    {
      fecha: "25/12/2025 10:30",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "REGISTRO",
      detalle: "Registro encomienda DHL - Ana Martinez (401-C)",
    },
    {
      fecha: "24/12/2025 16:20",
      usuario: "Maria Gonzalez",
      rol: "Residente",
      accion: "REGENERAR OTP",
      detalle: "Regeneracion OTP encomienda #TRK-458912",
    },
    {
      fecha: "24/12/2025 14:15",
      usuario: "Carlos Ramirez",
      rol: "Conserjeria",
      accion: "RETIRO",
      detalle: "Retiro encomienda #TRK-458910 - Laura Rojas (603-C)",
    },
  ];

  function badge(accion) {
    const type = accion === "RETIRO" ? "retiro" : accion === "REGISTRO" ? "registro" : "otp";
    return `<span class="badge ${type}">${accion}</span>`;
  }

  function renderTabla() {
    tbody.innerHTML = "";

    if (!registros.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    registros.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.fecha}</td>
        <td>${r.usuario}</td>
        <td>${r.rol}</td>
        <td>${badge(r.accion)}</td>
        <td>${r.detalle}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderTabla();
})();
