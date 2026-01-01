const guardar = document.getElementById('guardar');
const confirmacion = document.getElementById('confirmacion');
const descripcion = document.getElementById('descripcion');
const count = document.getElementById('count');

descripcion.oninput = () => {
  count.textContent = descripcion.value.length;
};

guardar.onclick = () => {
  let ok = true;

  ['residente','courier','tracking','tipo','tamano'].forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(id + '-error');
    if (el && !el.value) {
      err?.classList.remove('hidden');
      ok = false;
    } else {
      err?.classList.add('hidden');
    }
  });

  if (!ok) return;

  // MOCK OTP
  confirmacion.classList.remove('hidden');

  // 🔜 FUTURO:
  // fetch('/api/encomiendas', { method: 'POST' })
};
