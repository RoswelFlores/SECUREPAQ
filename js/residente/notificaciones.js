(() => {
  console.log("✅ notificaciones.js cargado");

  const status = document.getElementById("jsStatus");
  const list = document.getElementById("notificationsList");
  const empty = document.getElementById("emptyState");

  if (!status || !list || !empty) {
    console.error("❌ Faltan contenedores en HTML (ids).");
    return;
  }

  // 🔜 Luego reemplazar por: GET /api/notificaciones?residenteId=...
  const notifications = [
    {
      id: 1,
      tipo: "LLEGADA",
      fecha: "Hoy, 14:30",
      titulo: "Nueva encomienda recibida",
      descripcion: "Tu paquete de FedEx ha llegado y está disponible para retiro.",
      tracking: "FDX-8829-4421-MX",
    },
    {
      id: 2,
      tipo: "RECORDATORIO",
      fecha: "25/12/2025, 10:00",
      titulo: "Recordatorio: Encomienda pendiente",
      descripcion: "Tienes una encomienda de DHL Express esperando hace 5 días.",
      tracking: "DHL-2234-8891-CL",
    },
    {
      id: 3,
      tipo: "CONFIRMACION",
      fecha: "18/12/2025, 19:20",
      titulo: "Retiro confirmado",
      descripcion: "Has retirado exitosamente tu encomienda de Starken.",
      tracking: "STK-9921-3345-CL",
    },
    {
      id: 4,
      tipo: "LLEGADA",
      fecha: "10/12/2025, 11:30",
      titulo: "Nueva encomienda recibida",
      descripcion: "Tu paquete de Correos de Chile ha llegado y está disponible para retiro.",
      tracking: "COR-4421-8832-CL",
    },
  ];

  const typeClass = (tipo) => {
    const t = (tipo || "").toUpperCase();
    if (t === "LLEGADA") return "type-arrival";
    if (t === "RECORDATORIO") return "type-reminder";
    return "type-confirm";
  };

  const typeText = (tipo) => {
    const t = (tipo || "").toUpperCase();
    if (t === "CONFIRMACION") return "Confirmación";
    return t.charAt(0) + t.slice(1).toLowerCase();
  };

  function render() {
    status.classList.add("hidden");
    list.innerHTML = "";

    if (!notifications.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    notifications.forEach((n) => {
      const item = document.createElement("article");
      item.className = "notif";

      // 🔜 Por ahora no existe pantalla detalle. Dejamos la ruta lista.
      const detailHref = `detalle-encomienda.html?tracking=${encodeURIComponent(n.tracking)}`;

      item.innerHTML = `
        <div class="notif-top">
          <div class="type ${typeClass(n.tipo)}">${typeText(n.tipo)}</div>
          <div class="meta">${n.fecha}</div>
        </div>

        <div class="notif-body">
          <h3>${n.titulo}</h3>
          <p>${n.descripcion}</p>
          <div class="tracking">Tracking: <span>${n.tracking}</span></div>
        </div>

        <div class="notif-actions">
          <a class="btn-detail" href="${detailHref}">Ver detalle</a>
        </div>
      `;

      list.appendChild(item);
    });
  }

  render();
})();
