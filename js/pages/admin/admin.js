(() => {
  const API_URL = "http://localhost:3000";

  const status = document.getElementById("adminStatus");
  const kpiPendientes = document.getElementById("kpiPendientes");
  const kpiRetiradasHoy = document.getElementById("kpiRetiradasHoy");
  const kpiTotalUsuarios = document.getElementById("kpiTotalUsuarios");

  const headerName = document.querySelector(".user-info strong");
  const headerRole = document.querySelector(".user-info span");

  if (!kpiPendientes || !kpiRetiradasHoy || !kpiTotalUsuarios || !status) {
    return;
  }

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
      return null;
    }

    return data;
  }

  async function setUserHeader() {
    const user = getUser();
    if (!user) return;

    if (headerName) headerName.textContent = user.email || "Usuario";
    if (headerRole) {
      headerRole.textContent = Array.isArray(user.roles)
        ? user.roles.join(" | ")
        : "Rol";
    }

    if (!user.id) return;
    const resumen = await fetchJson(`/admin/usuarios/${user.id}/resumen`);
    if (resumen) {
      if (resumen.usuario && headerName) headerName.textContent = resumen.usuario;
      if (resumen.rol && headerRole) headerRole.textContent = resumen.rol;
    }
  }

  async function loadMetrics() {
    status.classList.remove("hidden");
    const dashboard = await fetchJson("/conserjeria/dashboard");
    const usuarios = await fetchJson("/admin/countAllUsers");

    kpiPendientes.textContent = dashboard ? String(dashboard.pendientes_hoy ?? 0) : "--";
    kpiRetiradasHoy.textContent = dashboard ? String(dashboard.retiradas_hoy ?? 0) : "--";
    kpiTotalUsuarios.textContent = usuarios ? String(usuarios.totalUsuarios ?? 0) : "--";
    status.classList.add("hidden");
  }

  async function init() {
    await setUserHeader();
    await loadMetrics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
