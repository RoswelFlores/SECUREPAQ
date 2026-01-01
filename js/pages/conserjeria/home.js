const data = [
  {
    otp: '743921',
    tracking: 'FDX-8829-4421-MX',
    courier: 'FedEx',
    residente: 'Juan Pérez',
    depto: '304-A',
    recepcion: '22/12/2025 14:30',
    retiro: null,
    estado: 'PENDIENTE'
  },
  {
    otp: null,
    tracking: 'STK-9921-3345-CL',
    courier: 'Starken',
    residente: 'Pedro Silva',
    depto: '102-A',
    recepcion: '15/12/2025 16:45',
    retiro: '18/12/2025 19:20',
    estado: 'RETIRADO'
  }
];

const body = document.getElementById('tableBody');
const empty = document.getElementById('emptyState');

if (data.length === 0) {
  empty.classList.remove('hidden');
} else {
  data.forEach(e => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="otp">${e.otp ?? '—'}</td>
      <td>${e.tracking}</td>
      <td>${e.courier}</td>
      <td>${e.residente}</td>
      <td>${e.depto}</td>
      <td>${e.recepcion}</td>
      <td>${e.retiro ?? '—'}</td>
      <td>
        <span class="status ${e.estado === 'PENDIENTE' ? 'pending' : 'done'}">
          ${e.estado}
        </span>
      </td>
    `;
    body.appendChild(tr);
  });
}
