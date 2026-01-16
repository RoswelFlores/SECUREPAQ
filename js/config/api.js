(() => {
  if (typeof window.SECUREPAQ_API_URL !== "string" || !window.SECUREPAQ_API_URL.trim()) {
    window.SECUREPAQ_API_URL = "http://localhost:3000";
  }
})();
