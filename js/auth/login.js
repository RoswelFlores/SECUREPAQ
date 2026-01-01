const recovery = document.getElementById('recovery');
const errorBox = document.getElementById('error-box');

document.getElementById('show-recovery').onclick = () => {
  recovery.classList.remove('hidden');
};

document.getElementById('back-login').onclick = () => {
  recovery.classList.add('hidden');
};

document.getElementById('login-form').onsubmit = e => {
  e.preventDefault();
  errorBox.classList.remove('hidden');
};
