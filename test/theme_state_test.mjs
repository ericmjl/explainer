import assert from "node:assert/strict";
import test from "node:test";

import {
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  applyTheme,
  initialTheme,
  installThemeSwitcher,
  normalizeTheme,
} from "../theme-state.mjs";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test("theme IDs normalize to the canonical Atlas fallback", () => {
  assert.deepEqual(THEME_OPTIONS.map(({ id }) => id), ["atlas", "ramith", "dark"]);
  assert.equal(normalizeTheme("ramith"), "ramith");
  assert.equal(normalizeTheme("unknown"), "atlas");
  assert.equal(normalizeTheme(null), "atlas");
});

test("theme application updates the root and persists without URL state", () => {
  const root = { dataset: {} };
  const storage = memoryStorage();
  assert.equal(applyTheme("ramith", { root, storage }), "ramith");
  assert.equal(root.dataset.theme, "ramith");
  assert.equal(storage.getItem(THEME_STORAGE_KEY), "ramith");
  assert.equal(initialTheme({ root: { dataset: {} }, storage }), "ramith");
});

test("the shared switcher exposes every theme and applies changes", () => {
  const root = { dataset: { theme: "ramith" } };
  const storage = memoryStorage();
  let change = null;
  const documentRef = {
    createElement() {
      return { value: "", textContent: "" };
    },
  };
  const select = {
    dataset: {},
    ownerDocument: documentRef,
    value: "",
    options: [],
    replaceChildren(...options) {
      this.options = options;
    },
    addEventListener(type, listener) {
      if (type === "change") change = listener;
    },
  };

  assert.equal(installThemeSwitcher(select, { root, storage }), "ramith");
  assert.equal(select.value, "ramith");
  assert.deepEqual(select.options.map(({ value }) => value), ["atlas", "ramith", "dark"]);

  select.value = "dark";
  change();
  assert.equal(root.dataset.theme, "dark");
  assert.equal(storage.getItem(THEME_STORAGE_KEY), "dark");
});
