(() => {
  const API_URL = "http://localhost:3000";

  const tbody = document.getElementById("auditoriaTbody");
  const empty = document.getElementById("auditoriaEmpty");
  const pagination = document.getElementById("auditoriaPagination");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  const headerName = document.querySelector(".user-info strong");
  const headerRole = document.querySelector(".user-info span");

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

  function badge(accion) {
    const normalized = String(accion || "").toUpperCase();
    let type = "default";
    if (normalized === "REGISTRO_ENCOMIENDA") type = "registro";
    else if (normalized === "RETIRO_ENCOMIENDA") type = "retiro";
    else if (normalized === "REGENERAR_OTP") type = "otp";
    return `<span class="badge ${type}">${accion || "-"}</span>`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("es-CL");
    }
    return value;
  }

  function renderTabla(registros) {
    tbody.innerHTML = "";

    if (!registros.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    registros.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDate(r.fecha_hora)}</td>
        <td>${r.usuario}</td>
        <td>${r.rol}</td>
        <td>${badge(r.accion)}</td>
        <td>${r.detalle}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  let allRecords = [];
  let currentPage = 1;
  const perPage = 10;

  function renderPage() {
    const totalPages = Math.max(1, Math.ceil(allRecords.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageRows = allRecords.slice(start, end);
    renderTabla(pageRows);

    if (pagination && pageInfo && prevPageBtn && nextPageBtn) {
      pageInfo.textContent = `${currentPage} / ${totalPages}`;
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
      pagination.classList.toggle("hidden", allRecords.length === 0);
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

  async function init() {
    await setUserHeader();
    const data = await fetchJson("/admin/auditoria");
    allRecords = Array.isArray(data) ? data : [];
    currentPage = 1;
    renderPage();
  }

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
      const totalPages = Math.max(1, Math.ceil(allRecords.length / perPage));
      if (currentPage < totalPages) {
        currentPage += 1;
        renderPage();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
