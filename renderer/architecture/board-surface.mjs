const DEFAULT_SELECTORS = Object.freeze({
  canvas: '[data-board-surface-role="canvas"], .architecture-canvas',
  modules: '[data-board-surface-role="modules"], .module-layer',
  regions: '[data-board-surface-role="regions"], .board-region-layer',
  edges: '[data-board-surface-role="edges"], .edge-layer',
  representationLanes: '[data-board-surface-role="representation-lanes"], .representation-lane-layer',
  scaleLanes: '[data-board-surface-role="scale-lanes"], .scale-lane-layer',
  controls: '[data-board-surface-role="controls"], .canvas-controls',
  zoomValue: '[data-board-surface-role="zoom-value"], .canvas-zoom-value',
});

export const DEFAULT_BOARD_SURFACE_GESTURE = Object.freeze({
  wheelLinePixels: 16,
  maxWheelDelta: 160,
  wheelZoomSensitivity: 0.0015,
  zoomStep: 1.18,
});

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createViewportState({
  x = 0,
  y = 0,
  scale = 1,
  minScale = 0.42,
  maxScale = 2.2,
} = {}) {
  const lower = Math.max(0.01, finiteNumber(minScale, 0.42));
  const upper = Math.max(lower, finiteNumber(maxScale, 2.2));
  return {
    x: finiteNumber(x, 0),
    y: finiteNumber(y, 0),
    scale: clamp(finiteNumber(scale, 1), lower, upper),
    minScale: lower,
    maxScale: upper,
  };
}

export function viewportTransform(viewport) {
  const state = createViewportState(viewport);
  return `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
}

export function panViewport(viewport, { x = 0, y = 0 } = {}) {
  const state = createViewportState(viewport);
  return {
    ...state,
    x: state.x + finiteNumber(x, 0),
    y: state.y + finiteNumber(y, 0),
  };
}

// The point and origin are expressed in local canvas coordinates. Keeping
// them explicit makes the same math usable by a full-page board and a nested
// comparison board whose layers begin below its local header.
export function zoomViewportAt(
  viewport,
  point,
  factor,
  { x: originX = 0, y: originY = 0 } = {},
) {
  const state = createViewportState(viewport);
  const multiplier = finiteNumber(factor, 1);
  if (multiplier <= 0) return state;

  const pointX = finiteNumber(point?.x, 0);
  const pointY = finiteNumber(point?.y, 0);
  const nextScale = clamp(state.scale * multiplier, state.minScale, state.maxScale);
  const localX = (pointX - originX - state.x) / state.scale;
  const localY = (pointY - originY - state.y) / state.scale;
  return {
    ...state,
    x: pointX - originX - localX * nextScale,
    y: pointY - originY - localY * nextScale,
    scale: nextScale,
  };
}

export function fitViewportToBounds(
  viewport,
  bounds,
  available,
  {
    padding = 12,
    maxFitScale = 1,
    readableFloor = null,
  } = {},
) {
  const state = createViewportState(viewport);
  const width = finiteNumber(bounds?.width, 0);
  const height = finiteNumber(bounds?.height, 0);
  const availableWidth = finiteNumber(available?.width, 0);
  const availableHeight = finiteNumber(available?.height, 0);
  if (width <= 0 || height <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return {
      ...state,
      x: 0,
      y: 0,
      scale: clamp(1, state.minScale, state.maxScale),
    };
  }

  const inset = Math.max(0, finiteNumber(padding, 12));
  const innerWidth = Math.max(1, availableWidth - inset * 2);
  const innerHeight = Math.max(1, availableHeight - inset * 2);
  const ceiling = clamp(
    finiteNumber(maxFitScale, 1),
    state.minScale,
    state.maxScale,
  );
  let requestedScale = Math.min(ceiling, innerWidth / width, innerHeight / height);
  if (readableFloor != null) {
    requestedScale = Math.max(requestedScale, finiteNumber(readableFloor, requestedScale));
  }
  const scale = clamp(requestedScale, state.minScale, ceiling);
  const minX = finiteNumber(bounds?.minX ?? bounds?.x, 0);
  const minY = finiteNumber(bounds?.minY ?? bounds?.y, 0);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  return {
    ...state,
    x: scaledWidth <= innerWidth
      ? inset + (innerWidth - scaledWidth) / 2 - minX * scale
      : inset - minX * scale,
    y: scaledHeight <= innerHeight
      ? inset + (innerHeight - scaledHeight) / 2 - minY * scale
      : inset - minY * scale,
    scale,
  };
}

export function normalizedWheelDelta(
  event,
  {
    linePixels = DEFAULT_BOARD_SURFACE_GESTURE.wheelLinePixels,
    pagePixels = 1,
    maxDelta = DEFAULT_BOARD_SURFACE_GESTURE.maxWheelDelta,
  } = {},
) {
  let unit = 1;
  if (event?.deltaMode === 1) unit = Math.max(1, finiteNumber(linePixels, 16));
  if (event?.deltaMode === 2) unit = Math.max(1, finiteNumber(pagePixels, 1));
  const limit = Math.max(1, finiteNumber(maxDelta, 160));
  return clamp(finiteNumber(event?.deltaY, 0) * unit, -limit, limit);
}

function normalizedResourcePart(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

// SVG fragment identifiers are document-wide in browsers. Prefixing them by
// surface avoids the easy-to-miss marker collision that otherwise appears as
// soon as a comparison board renders a second <defs> block.
export function surfaceResourceId(surfaceKey, localId) {
  return `board-${normalizedResourcePart(surfaceKey, "surface")}-${normalizedResourcePart(localId, "resource")}`;
}

export function surfaceResourceUrl(surfaceKey, localId) {
  return `url(#${surfaceResourceId(surfaceKey, localId)})`;
}

function queryWithin(root, selector) {
  return root?.querySelector?.(selector) || null;
}

export function resolveBoardSurfaceElements(root, overrides = {}) {
  if (!root) throw new TypeError("A board-surface root is required.");
  const selectors = { ...DEFAULT_SELECTORS, ...(overrides.selectors || {}) };
  const canvas = overrides.canvas
    || (root.matches?.(selectors.canvas) ? root : queryWithin(root, selectors.canvas))
    || root;
  const elements = {
    root,
    canvas,
    moduleLayer: overrides.moduleLayer || queryWithin(canvas, selectors.modules),
    regionLayer: overrides.regionLayer || queryWithin(canvas, selectors.regions),
    edgeLayer: overrides.edgeLayer || queryWithin(canvas, selectors.edges),
    representationLaneLayer: overrides.representationLaneLayer
      || queryWithin(canvas, selectors.representationLanes),
    scaleLaneLayer: overrides.scaleLaneLayer || queryWithin(canvas, selectors.scaleLanes),
    controls: overrides.controls || queryWithin(canvas, selectors.controls),
    zoomValue: overrides.zoomValue || queryWithin(canvas, selectors.zoomValue),
  };
  if (!elements.moduleLayer || !elements.regionLayer || !elements.edgeLayer) {
    throw new TypeError("A board surface requires module, region, and edge layers.");
  }
  return elements;
}

function uniqueLayers(elements) {
  return Array.from(new Set([
    elements.regionLayer,
    elements.representationLaneLayer,
    elements.moduleLayer,
    elements.edgeLayer,
  ].filter(Boolean)));
}

function defaultRequestFrame(callback) {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }
  return globalThis.setTimeout(callback, 0);
}

function defaultCancelFrame(frame) {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(frame);
  } else {
    globalThis.clearTimeout(frame);
  }
}

function closestMatch(target, selector) {
  return target?.closest?.(selector) || null;
}

export function createBoardSurface({
  root = null,
  elements: explicitElements = null,
  surfaceKey = "primary",
  viewport: initialViewport = {},
  gesture = {},
  excludeGestureSelector = ".board-chrome",
  panBlockSelector = ".arch-node, .arch-rep, .edge-hit, .board-chrome",
  getContentBounds = null,
  getAvailableSize = null,
  fitOptions = {},
  onBeforeGesture = null,
  onUserMoved = null,
  onViewportChange = null,
  requestFrame = defaultRequestFrame,
  cancelFrame = defaultCancelFrame,
  autoBind = true,
} = {}) {
  const elements = explicitElements
    ? resolveBoardSurfaceElements(explicitElements.root || root || explicitElements.canvas, explicitElements)
    : resolveBoardSurfaceElements(root);
  const layers = uniqueLayers(elements);
  const gestureRules = { ...DEFAULT_BOARD_SURFACE_GESTURE, ...gesture };
  let viewport = createViewportState(initialViewport);
  let renderedTransform = null;
  let renderedZoomPercent = null;
  let viewportFrame = null;
  let bound = false;
  let destroyed = false;
  let userMovedViewport = false;
  let pan = null;

  function snapshot() {
    return { ...viewport };
  }

  function origin() {
    return {
      x: finiteNumber(elements.moduleLayer.offsetLeft, 0),
      y: finiteNumber(elements.moduleLayer.offsetTop, 0),
    };
  }

  function availableSize() {
    const rect = elements.canvas.getBoundingClientRect?.() || {
      width: elements.canvas.clientWidth,
      height: elements.canvas.clientHeight,
    };
    const layerOrigin = origin();
    if (getAvailableSize) {
      return getAvailableSize({ rect, origin: layerOrigin, elements, surfaceKey });
    }
    return {
      width: Math.max(1, finiteNumber(rect.width, elements.canvas.clientWidth || 1) - layerOrigin.x * 2),
      height: Math.max(1, finiteNumber(rect.height, elements.canvas.clientHeight || 1) - layerOrigin.y),
    };
  }

  function flushViewport() {
    viewportFrame = null;
    if (destroyed) return;
    const transform = viewportTransform(viewport);
    if (transform !== renderedTransform) {
      layers.forEach((layer) => {
        layer.style.transform = transform;
      });
      renderedTransform = transform;
    }
    const zoomPercent = Math.round(viewport.scale * 100);
    if (elements.zoomValue && zoomPercent !== renderedZoomPercent) {
      elements.zoomValue.textContent = `${zoomPercent}%`;
      renderedZoomPercent = zoomPercent;
    }
    onViewportChange?.({
      surfaceKey,
      viewport: snapshot(),
      transform,
      zoomPercent,
    });
  }

  function apply({ immediate = false } = {}) {
    if (destroyed) return;
    if (immediate) {
      if (viewportFrame !== null) cancelFrame(viewportFrame);
      viewportFrame = null;
      flushViewport();
      return;
    }
    if (viewportFrame !== null) return;
    viewportFrame = requestFrame(flushViewport);
  }

  function replaceViewport(next, { immediate = false } = {}) {
    viewport = createViewportState({
      ...next,
      minScale: viewport.minScale,
      maxScale: viewport.maxScale,
    });
    apply({ immediate });
    return snapshot();
  }

  function markUserMoved(kind, event = null) {
    userMovedViewport = true;
    onUserMoved?.({ kind, event, surfaceKey, viewport: snapshot() });
  }

  function reset({ userInitiated = false, immediate = false } = {}) {
    if (userInitiated) markUserMoved("reset");
    return replaceViewport({ ...viewport, x: 0, y: 0, scale: 1 }, { immediate });
  }

  function zoomAt(clientX, clientY, factor, { userInitiated = false } = {}) {
    if (userInitiated) markUserMoved("zoom");
    const rect = elements.canvas.getBoundingClientRect();
    viewport = zoomViewportAt(
      viewport,
      { x: clientX - rect.left, y: clientY - rect.top },
      factor,
      origin(),
    );
    apply();
    return snapshot();
  }

  function zoomAtCenter(factor, options = {}) {
    const rect = elements.canvas.getBoundingClientRect();
    const layerOrigin = origin();
    const available = availableSize();
    return zoomAt(
      rect.left + layerOrigin.x + available.width / 2,
      rect.top + layerOrigin.y + available.height / 2,
      factor,
      options,
    );
  }

  function fit({ bounds = null, readable = false, immediate = false } = {}) {
    const contentBounds = bounds || getContentBounds?.({ elements, surfaceKey });
    if (!contentBounds) return reset({ immediate });
    userMovedViewport = false;
    viewport = fitViewportToBounds(viewport, contentBounds, availableSize(), {
      ...fitOptions,
      readableFloor: readable ? fitOptions.readableFloor : null,
    });
    apply({ immediate });
    return snapshot();
  }

  function onControlClick(event) {
    const control = closestMatch(event.target, "[data-board-zoom], [data-zoom]");
    const action = control?.dataset?.boardZoom || control?.dataset?.zoom;
    if (!action) return;
    onBeforeGesture?.({ kind: "control", action, event, surfaceKey });
    if (action === "reset") {
      reset({ userInitiated: true });
    } else if (action === "fit") {
      fit();
    } else {
      zoomAtCenter(action === "in" ? gestureRules.zoomStep : 1 / gestureRules.zoomStep, {
        userInitiated: true,
      });
    }
  }

  function onWheel(event) {
    if (excludeGestureSelector && closestMatch(event.target, excludeGestureSelector)) return;
    const delta = normalizedWheelDelta(event, {
      linePixels: gestureRules.wheelLinePixels,
      pagePixels: elements.canvas.clientHeight,
      maxDelta: gestureRules.maxWheelDelta,
    });
    event.preventDefault?.();
    if (Math.abs(delta) < 0.01) return;
    onBeforeGesture?.({ kind: "wheel", event, surfaceKey });
    markUserMoved("wheel", event);
    zoomAt(
      event.clientX,
      event.clientY,
      Math.exp(-delta * gestureRules.wheelZoomSensitivity),
    );
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.button !== 1) return;
    if (panBlockSelector && closestMatch(event.target, panBlockSelector)) return;
    onBeforeGesture?.({ kind: "pan", event, surfaceKey });
    markUserMoved("pan", event);
    pan = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: viewport.x,
      y: viewport.y,
    };
    elements.canvas.classList?.add("is-panning");
    elements.canvas.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!pan || (event.pointerId != null && event.pointerId !== pan.pointerId)) return;
    event.preventDefault?.();
    viewport = {
      ...viewport,
      x: pan.x + event.clientX - pan.clientX,
      y: pan.y + event.clientY - pan.clientY,
    };
    apply();
  }

  function endPan(event = null) {
    if (!pan) return;
    const pointerId = pan.pointerId;
    pan = null;
    elements.canvas.classList?.remove("is-panning");
    if (pointerId != null && elements.canvas.hasPointerCapture?.(pointerId)) {
      elements.canvas.releasePointerCapture?.(pointerId);
    }
  }

  function bind() {
    if (bound || destroyed) return api;
    bound = true;
    elements.controls?.addEventListener?.("click", onControlClick);
    elements.canvas.addEventListener("wheel", onWheel, { passive: false });
    elements.canvas.addEventListener("pointerdown", onPointerDown);
    elements.canvas.addEventListener("pointermove", onPointerMove);
    elements.canvas.addEventListener("pointerup", endPan);
    elements.canvas.addEventListener("pointercancel", endPan);
    return api;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (viewportFrame !== null) cancelFrame(viewportFrame);
    viewportFrame = null;
    if (!bound) return;
    bound = false;
    elements.controls?.removeEventListener?.("click", onControlClick);
    elements.canvas.removeEventListener("wheel", onWheel);
    elements.canvas.removeEventListener("pointerdown", onPointerDown);
    elements.canvas.removeEventListener("pointermove", onPointerMove);
    elements.canvas.removeEventListener("pointerup", endPan);
    elements.canvas.removeEventListener("pointercancel", endPan);
  }

  const api = {
    surfaceKey,
    elements,
    bind,
    destroy,
    apply,
    reset,
    fit,
    zoomAt,
    zoomAtCenter,
    setViewport: replaceViewport,
    getViewport: snapshot,
    get userMovedViewport() {
      return userMovedViewport;
    },
    setUserMovedViewport(value) {
      userMovedViewport = Boolean(value);
    },
  };

  apply({ immediate: true });
  if (autoBind) bind();
  return api;
}
