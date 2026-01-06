(() => {
  console.log("✅ residente/home.js cargado");

  const status = document.getElementById("jsStatus");
  const pendientesList = document.getElementById("pendientesList");
  const historialList = document.getElementById("historialList");

  const pendientesEmpty = document.getElementById("pendientesEmpty");
  const historialEmpty = document.getElementById("historialEmpty");

  // Validación DOM
  if (!status || !pendientesList || !historialList || !pendientesEmpty || !historialEmpty) {
    console.error("❌ Faltan elementos en el DOM. Revisa ids en el HTML.");
    if (status) status.textContent = "Error: faltan elementos en el HTML (ids).";
    return;
  }

  // Mock data
  const pendientes = [
    {
      id: 1,
      courier: "FedEx",
      trackingId: "#TRK-458921",
      recepcion: "22/12/2025 - 14:30",
      tracking: "FDX-8829-4421-MX",
      otp: "743921",
      expira: "27/12/2025 18:00",
    },
    {
      id: 2,
      courier: "DHL Express",
      trackingId: "#TRK-458922",
      recepcion: "20/12/2025 - 10:15",
      tracking: "DHL-2234-8891-CL",
      otp: "582046",
      expira: "25/12/2025 10:15",
    },
  ];

  const historial = [
    {
      id: 10,
      courier: "Starken",
      trackingId: "#TRK-458919",
      recepcion: "15/12/2025 - 16:45",
      retiro: "18/12/2025 - 19:20",
      tracking: "STK-9921-3345-CL",
    },
    {
      id: 11,
      courier: "Correos de Chile",
      trackingId: "#TRK-458915",
      recepcion: "10/12/2025 - 11:30",
      retiro: "12/12/2025 - 20:15",
      tracking: "COR-4421-8832-CL",
    },
  ];

  // Tabs
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.tab;
      panels.forEach((p) => p.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  function renderPendientes() {
    pendientesList.innerHTML = "";

    if (pendientes.length === 0) {
      pendientesEmpty.classList.remove("hidden");
      return;
    }
    pendientesEmpty.classList.add("hidden");

    pendientes.forEach((item) => {
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <div class="card-head">
          <div class="courier">${item.courier}</div>
          <div class="tag">${item.trackingId}</div>
        </div>

        <div class="grid">
          <div class="label">Recepción:</div>
          <div class="value">${item.recepcion}</div>

          <div class="label">Tracking:</div>
          <div class="value">${item.tracking}</div>
        </div>

        <div class="otp-box">
          <div>
            <div class="otp-code">${item.otp}</div>
            <div class="otp-meta">Expira: ${item.expira}</div>
          </div>

          <button class="btn btn-regenerar" data-id="${item.id}">
            Regenerar OTP
          </button>
        </div>
      `;
      pendientesList.appendChild(el);
    });

    document.querySelectorAll(".btn-regenerar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        alert("OTP regenerado (mock) para encomienda ID: " + id);
      });
    });
  }

  function renderHistorial() {
    historialList.innerHTML = "";

    if (historial.length === 0) {
      historialEmpty.classList.remove("hidden");
      return;
    }
    historialEmpty.classList.add("hidden");

    historial.forEach((item) => {
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <div class="card-head">
          <div class="courier">${item.courier}</div>
          <div class="tag">${item.trackingId}</div>
        </div>

        <div class="grid">
          <div class="label">Recepción:</div>
          <div class="value">${item.recepcion}</div>

          <div class="label">Retiro:</div>
          <div class="value">${item.retiro}</div>

          <div class="label">Tracking:</div>
          <div class="value">${item.tracking}</div>
        </div>
      `;
      historialList.appendChild(el);
    });
  }

  // Render final
  status.classList.add("hidden");
  renderPendientes();
  renderHistorial();

  console.log("✅ Residente Home renderizado");
})();