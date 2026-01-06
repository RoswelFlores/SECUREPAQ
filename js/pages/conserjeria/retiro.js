const otpInput = document.getElementById('otp');
const validarBtn = document.getElementById('validar');
const confirmarBtn = document.getElementById('confirmar');

const otpSection = document.querySelector('.otp-section');
const encomiendaSection = document.getElementById('encomienda');
const finalSection = document.getElementById('final');

const errInvalid = document.getElementById('otp-invalid');
const errExpired = document.getElementById('otp-expired');

// VALIDAR OTP
validarBtn.onclick = () => {
  errInvalid.classList.add('hidden');
  errExpired.classList.add('hidden');

  if (otpInput.value === '111111') {
    errExpired.classList.remove('hidden');
    return;
  }

  if (otpInput.value !== '743921') {
    errInvalid.classList.remove('hidden');
    return;
  }

  // OTP válido
  otpSection.classList.add('hidden');
  encomiendaSection.classList.remove('hidden');
};

// CONFIRMAR RETIRO
confirmarBtn.onclick = () => {
  encomiendaSection.classList.add('hidden');
  finalSection.classList.remove('hidden');

  // 🔜 Backend real:
  // POST /api/encomiendas/{id}/retiro
};
