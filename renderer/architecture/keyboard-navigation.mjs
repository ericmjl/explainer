// Pure helpers for keyboard-driven graph navigation on the audience board.
//
// The dispatch logic lives here so it can be unit-tested without a DOM. The
// renderer wires it through one document-level keydown listener that calls
// resolveKeyAction() and then invokes the existing zoom/fit/selection helpers.
//
// Key semantics (match canvas-chat's mapping; visual treatment is explainer's):
//   z      -> "zoom-in"     Zoom in on the currently selected node
//   Z      -> "zoom-out"    Zoom out / fit the whole board
//   j      -> "nav-parent"  Move up the graph to a parent of the selection
//   k      -> "nav-child"   Move down the graph to a child of the selection
//   Enter  -> "board-enter" Drill into the selected block's detail board
//   Escape -> "board-exit"  Return to the current board's parent
//
// When a disambiguation menu is open (menuOpen=true), the same j/k plus arrow
// keys move the highlight, Enter confirms, and Escape cancels.
//
// Browser/OS shortcuts that include Ctrl/Meta/Alt are always ignored so they
// keep working as the user expects.

export const NAV_DIRECTIONS = Object.freeze({ PARENT: "parent", CHILD: "child" });
export const KEYBOARD_ZOOM_STEP = 1.18;

const TEXT_INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTextInput(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  return TEXT_INPUT_TAGS.has(target.tagName);
}

// event.key is the uppercase letter when Shift is held with a letter key, so
// "z" and "Z" already distinguish plain vs Shift without consulting shiftKey.
// shiftKey is checked defensively in case of an odd keyboard layout.
export function resolveKeyAction(event, { menuOpen = false } = {}) {
  if (!event || isTextInput(event.target)) return null;
  if (event.ctrlKey || event.metaKey || event.altKey) return null;

  if (menuOpen) {
    switch (event.key) {
      case "Escape":    return "menu-cancel";
      case "Enter":     return "menu-confirm";
      case "j":
      case "ArrowUp":   return "menu-up";
      case "k":
      case "ArrowDown": return "menu-down";
      default:          return null;
    }
  }

  const key = event.key;
  if (key === "Z" && event.shiftKey) return "zoom-out";
  if (key === "z" && !event.shiftKey) return "zoom-in";
  if (key === "j") return "nav-parent";
  if (key === "k") return "nav-child";
  if (key === "Enter") return "board-enter";
  if (key === "Escape") return "board-exit";
  return null;
}

// Keyboard zoom is intentionally incremental. A single keypress should move
// one readable step rather than resizing the selected node to fill the board.
export function nextKeyboardZoomScale(
  currentScale,
  minScale,
  maxScale,
  step = KEYBOARD_ZOOM_STEP,
) {
  return Math.min(maxScale, Math.max(minScale, currentScale * step));
}

// Ordered list of visible neighbor ids in the requested direction. Parents are
// upstream (edges flowing INTO id); children are downstream (edges flowing OUT
// of id). Order follows the board's projected edge order so the disambiguation
// menu is deterministic. Self-loops, duplicate ids, and ids that are not
// currently visible are filtered out.
export function neighborsOf(id, direction, edges, visibleIds) {
  if (!id || !Array.isArray(edges)) return [];
  const visible = visibleIds instanceof Set ? visibleIds : new Set(visibleIds || []);
  const matches = direction === NAV_DIRECTIONS.PARENT
    ? edges.filter((e) => e && e.to === id && e.from !== id).map((e) => e.from)
    : edges.filter((e) => e && e.from === id && e.to !== id).map((e) => e.to);
  const seen = new Set();
  const out = [];
  for (const nid of matches) {
    if (!nid || seen.has(nid) || !visible.has(nid)) continue;
    seen.add(nid);
    out.push(nid);
  }
  return out;
}

// Wrap-around menu index used when cycling through candidates. The renderer
// always passes an integer currentIndex (highlightNavMenuItem) and a positive
// length (openNavMenu only fires when candidates.length > 1).
export function nextMenuIndex(currentIndex, delta, length) {
  if (!length) return 0;
  return ((((currentIndex + delta) % length) + length) % length);
}
