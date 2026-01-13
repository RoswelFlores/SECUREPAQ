(function () {
  function getToken() {
    return localStorage.getItem('token');
  }

  function getUser() {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function redirectToLogin() {
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.replace(isInPages ? '../../index.html' : 'index.html');
  }

  function logout() {
    localStorage.clear();
    redirectToLogin();
  }

  function protectRoute(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [];
    const token = getToken();
    if (!token) {
      redirectToLogin();
      return;
    }

    if (roles.length > 0) {
      const user = getUser();
      const userRoles = (user && user.roles) || [];
      const autorizado = roles.some(function (rol) {
        return userRoles.indexOf(rol) !== -1;
      });
      if (!autorizado) {
        alert('No tienes permiso para acceder');
        logout();
      }
    }
  }

  function bindLogoutButtons() {
    var nodes = document.querySelectorAll('[data-logout]');
    nodes.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    bindLogoutButtons();
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted && !getToken()) {
      redirectToLogin();
    }
  });

  window.protectRoute = protectRoute;
  window.logout = logout;
})();
