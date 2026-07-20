import assert from "node:assert/strict";
import test from "node:test";

import {
  KEYBOARD_ZOOM_STEP,
  NAV_DIRECTIONS,
  neighborsOf,
  nextKeyboardZoomScale,
  nextMenuIndex,
  resolveKeyAction,
} from "../renderer/architecture/keyboard-navigation.mjs";

function keyEvent(overrides = {}) {
  return {
    key: "",
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    target: { tagName: "DIV" },
    ...overrides,
  };
}

test("resolveKeyAction returns null when there is no event", () => {
  assert.equal(resolveKeyAction(null), null);
  assert.equal(resolveKeyAction(undefined), null);
});

test("resolveKeyAction ignores events targeting form fields", () => {
  for (const tagName of ["INPUT", "TEXTAREA", "SELECT"]) {
    const event = keyEvent({ key: "z", target: { tagName } });
    assert.equal(resolveKeyAction(event), null);
  }
  const editable = keyEvent({ key: "z", target: { tagName: "DIV", isContentEditable: true } });
  assert.equal(resolveKeyAction(editable), null);
});

test("resolveKeyAction ignores Ctrl/Meta/Alt modifiers so OS shortcuts win", () => {
  assert.equal(resolveKeyAction(keyEvent({ key: "z", ctrlKey: true })), null);
  assert.equal(resolveKeyAction(keyEvent({ key: "z", metaKey: true })), null);
  assert.equal(resolveKeyAction(keyEvent({ key: "z", altKey: true })), null);
  assert.equal(resolveKeyAction(keyEvent({ key: "Z", shiftKey: true, metaKey: true })), null);
});

test("resolveKeyAction maps plain z to zoom-in and Shift+Z to zoom-out", () => {
  assert.equal(resolveKeyAction(keyEvent({ key: "z" })), "zoom-in");
  assert.equal(resolveKeyAction(keyEvent({ key: "Z", shiftKey: true })), "zoom-out");
  // Defensive: a lowercase "z" with shiftKey true (rare layout) should not
  // trigger zoom-out, and an uppercase "Z" without shiftKey should not either.
  assert.equal(resolveKeyAction(keyEvent({ key: "z", shiftKey: true })), null);
  assert.equal(resolveKeyAction(keyEvent({ key: "Z", shiftKey: false })), null);
});

test("resolveKeyAction maps j/k to parent/child navigation", () => {
  assert.equal(resolveKeyAction(keyEvent({ key: "j" })), "nav-parent");
  assert.equal(resolveKeyAction(keyEvent({ key: "k" })), "nav-child");
});

test("resolveKeyAction ignores unrelated keys", () => {
  for (const key of ["a", " ", "Enter", "Tab", "1", "/", "ArrowLeft"]) {
    assert.equal(resolveKeyAction(keyEvent({ key })), null, `unexpected action for key ${key}`);
  }
});

test("resolveKeyAction routes j/k/arrows/Enter/Escape through the menu when one is open", () => {
  const menu = { menuOpen: true };
  assert.equal(resolveKeyAction(keyEvent({ key: "j" }), menu), "menu-up");
  assert.equal(resolveKeyAction(keyEvent({ key: "ArrowUp" }), menu), "menu-up");
  assert.equal(resolveKeyAction(keyEvent({ key: "k" }), menu), "menu-down");
  assert.equal(resolveKeyAction(keyEvent({ key: "ArrowDown" }), menu), "menu-down");
  assert.equal(resolveKeyAction(keyEvent({ key: "Enter" }), menu), "menu-confirm");
  assert.equal(resolveKeyAction(keyEvent({ key: "Escape" }), menu), "menu-cancel");
});

test("resolveKeyAction suppresses zoom/navigation keys while the menu is open", () => {
  const menu = { menuOpen: true };
  assert.equal(resolveKeyAction(keyEvent({ key: "z" }), menu), null);
  assert.equal(resolveKeyAction(keyEvent({ key: "Z", shiftKey: true }), menu), null);
});

test("keyboard zoom advances one gradual step and clamps to viewport bounds", () => {
  assert.equal(KEYBOARD_ZOOM_STEP, 1.18);
  assert.equal(nextKeyboardZoomScale(1, 0.25, 4), 1.18);
  assert.equal(nextKeyboardZoomScale(2, 0.25, 2.1), 2.1);
  assert.equal(nextKeyboardZoomScale(0.2, 0.25, 4), 0.25);
});

test("neighborsOf returns empty list for missing id or edges", () => {
  assert.deepEqual(neighborsOf(null, NAV_DIRECTIONS.PARENT, [], new Set()), []);
  assert.deepEqual(neighborsOf("a", NAV_DIRECTIONS.PARENT, null, new Set()), []);
});

test("neighborsOf returns upstream ids for parent direction", () => {
  const edges = [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
    { from: "d", to: "c" },
  ];
  const visible = new Set(["a", "b", "c", "d"]);
  assert.deepEqual(neighborsOf("c", NAV_DIRECTIONS.PARENT, edges, visible).sort(), ["b", "d"]);
});

test("neighborsOf returns downstream ids for child direction", () => {
  const edges = [
    { from: "a", to: "b" },
    { from: "a", to: "c" },
    { from: "b", to: "d" },
  ];
  const visible = new Set(["a", "b", "c", "d"]);
  assert.deepEqual(neighborsOf("a", NAV_DIRECTIONS.CHILD, edges, visible).sort(), ["b", "c"]);
});

test("neighborsOf preserves projected edge order for deterministic menus", () => {
  const edges = [
    { from: "first", to: "x" },
    { from: "second", to: "x" },
    { from: "third", to: "x" },
  ];
  const visible = new Set(["x", "first", "second", "third"]);
  assert.deepEqual(
    neighborsOf("x", NAV_DIRECTIONS.PARENT, edges, visible),
    ["first", "second", "third"],
  );
});

test("neighborsOf deduplicates ids reachable through multiple edges", () => {
  const edges = [
    { from: "dup", to: "x" },
    { from: "dup", to: "x" },
  ];
  const visible = new Set(["x", "dup"]);
  assert.deepEqual(neighborsOf("x", NAV_DIRECTIONS.PARENT, edges, visible), ["dup"]);
});

test("neighborsOf filters self-loops so a node is never its own neighbor", () => {
  const edges = [
    { from: "x", to: "x" },
    { from: "real", to: "x" },
  ];
  const visible = new Set(["x", "real"]);
  assert.deepEqual(neighborsOf("x", NAV_DIRECTIONS.PARENT, edges, visible), ["real"]);
});

test("neighborsOf tolerates malformed edge entries", () => {
  const edges = [null, {}, { from: "a" }, { to: "a" }, { from: "a", to: "b" }];
  const visible = new Set(["a", "b"]);
  assert.deepEqual(neighborsOf("b", NAV_DIRECTIONS.PARENT, edges, visible), ["a"]);
});

test("neighborsOf hides non-visible neighbors such as elided nodes", () => {
  const edges = [
    { from: "visible", to: "x" },
    { from: "hidden", to: "x" },
  ];
  const visible = new Set(["x", "visible"]);
  assert.deepEqual(neighborsOf("x", NAV_DIRECTIONS.PARENT, edges, visible), ["visible"]);
});

test("nextMenuIndex wraps in both directions", () => {
  assert.equal(nextMenuIndex(0, 1, 3), 1);
  assert.equal(nextMenuIndex(2, 1, 3), 0);
  assert.equal(nextMenuIndex(0, -1, 3), 2);
  assert.equal(nextMenuIndex(1, -1, 3), 0);
  assert.equal(nextMenuIndex(2, -1, 3), 1);
});

test("nextMenuIndex handles single-item and zero-delta inputs", () => {
  assert.equal(nextMenuIndex(0, 1, 1), 0);
  assert.equal(nextMenuIndex(0, -1, 1), 0);
  assert.equal(nextMenuIndex(2, 0, 5), 2);
  assert.equal(nextMenuIndex(0, 5, 3), 2);
});

test("nextMenuIndex returns 0 when there are no candidates", () => {
  assert.equal(nextMenuIndex(0, 1, 0), 0);
});
