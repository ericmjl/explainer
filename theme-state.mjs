export const THEME_STORAGE_KEY = "explainer.theme";

export const THEME_OPTIONS = Object.freeze([
  Object.freeze({ id: "atlas", label: "Atlas" }),
  Object.freeze({ id: "ramith", label: "Ramith paper" }),
  Object.freeze({ id: "dark", label: "Dark" }),
]);

const THEME_IDS = new Set(THEME_OPTIONS.map(({ id }) => id));

function browserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function normalizeTheme(theme) {
  return THEME_IDS.has(theme) ? theme : "atlas";
}

export function applyTheme(
  theme,
  {
    root = globalThis.document?.documentElement,
    storage = browserStorage(),
    persist = true,
  } = {},
) {
  const normalized = normalizeTheme(theme);
  if (root?.dataset) root.dataset.theme = normalized;
  if (persist && storage?.setItem) {
    try {
      storage.setItem(THEME_STORAGE_KEY, normalized);
    } catch {
      // The theme still applies for this page when persistence is unavailable.
    }
  }
  return normalized;
}

export function initialTheme({
  root = globalThis.document?.documentElement,
  storage = browserStorage(),
} = {}) {
  if (root?.dataset?.theme) return normalizeTheme(root.dataset.theme);
  if (storage?.getItem) {
    try {
      return normalizeTheme(storage.getItem(THEME_STORAGE_KEY));
    } catch {
      // Fall through to the canonical default.
    }
  }
  return "atlas";
}

export function installThemeSwitcher(
  select,
  {
    root = globalThis.document?.documentElement,
    storage = browserStorage(),
  } = {},
) {
  if (!select || select.dataset.themeReady === "true") return null;
  select.dataset.themeReady = "true";
  const documentRef = select.ownerDocument || globalThis.document;
  select.replaceChildren(...THEME_OPTIONS.map(({ id, label }) => {
    const option = documentRef.createElement("option");
    option.value = id;
    option.textContent = label;
    return option;
  }));

  const active = applyTheme(initialTheme({ root, storage }), { root, storage, persist: false });
  select.value = active;
  select.addEventListener("change", () => {
    select.value = applyTheme(select.value, { root, storage });
  });
  return active;
}
