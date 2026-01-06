(() => {
  console.log("admin home JS cargado");

  const status = document.getElementById("adminStatus");
  const kpiPendientes = document.getElementById("kpiPendientes");
  const kpiRetiradasHoy = document.getElementById("kpiRetiradasHoy");
  const kpiTotalUsuarios = document.getElementById("kpiTotalUsuarios");

  if (!kpiPendientes || !kpiRetiradasHoy || !kpiTotalUsuarios || !status) {
    console.error("Faltan elementos en el DOM. Revisa ids del HTML.");
    return;
  }

  // Datos mock (reemplazar por fetch al backend cuando esté disponible)
  const metrics = {
    pendientes: 24,
    retiradasHoy: 15,
    totalUsuarios: 128,
  };

  status.classList.remove("hidden");

  // Render
  kpiPendientes.textContent = metrics.pendientes;
  kpiRetiradasHoy.textContent = metrics.retiradasHoy;
  kpiTotalUsuarios.textContent = metrics.totalUsuarios;

  status.classList.add("hidden");
  console.log("Admin Home renderizado");
})();
