(() => {
  console.log("✅ SECUREPAQ home.js cargado");

  const data = [
    {
      otp: "743921",
      tracking: "FDX-8829-4421-MX",
      courier: "FedEx",
      residente: "Juan Pérez",
      depto: "304-A",
      recepcion: "22/12/2025 14:30",
      retiro: null,
      estado: "PENDIENTE",
    },
    {
      otp: null,
      tracking: "STK-9921-3345-CL",
      courier: "Starken",
      residente: "Pedro Silva",
      depto: "102-A",
      recepcion: "15/12/2025 16:45",
      retiro: "18/12/2025 19:20",
      estado: "RETIRADO",
    },
  ];

  function render() {
    const body = document.getElementById("tableBody");
    const empty = document.getElementById("emptyState");

    if (!body) {
      console.error("❌ No se encontró #tableBody. Revisa el id en el HTML.");
      return;
    }
    if (!empty) {
      console.error("❌ No se encontró #emptyState. Revisa el id en el HTML.");
      return;
    }

    // Limpia por si recargas / vuelves a renderizar
    body.innerHTML = "";

    if (data.length === 0) {
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");

    data.forEach((e) => {
      const tr = document.createElement("tr");

      const isPending = (e.estado || "").toUpperCase() === "PENDIENTE";
      const actionButton = isPending
        ? `<a href="retiro.html?otp=${encodeURIComponent(e.otp)}" class="btn-secondary">Retiro</a>`
        : "—";

      tr.innerHTML = `
        <td class="otp">${e.otp ?? "—"}</td>
        <td>${e.tracking}</td>
        <td>${e.courier}</td>
        <td>${e.residente}</td>
        <td>${e.depto}</td>
        <td>${e.recepcion}</td>
        <td>${e.retiro ?? "—"}</td>
        <td>
          <span class="status ${isPending ? "pending" : "done"}">
            ${e.estado}
          </span>
        </td>
        <td>${actionButton}</td>
      `;

      body.appendChild(tr);
    });

    console.log("✅ Tabla renderizada. Filas:", data.length);
  }

  // Ejecuta cuando el DOM está listo (evita body=null)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
