(() => {
  try {
    const theme = window.localStorage.getItem("explainer.theme");
    if (theme) document.documentElement.dataset.theme = theme;
  } catch {
    // Storage can be unavailable in privacy-restricted or embedded contexts.
  }
})();
