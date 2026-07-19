import assert from "node:assert/strict";
import test from "node:test";

import {
  createBoardSurface,
  createViewportState,
  fitViewportToBounds,
  normalizedWheelDelta,
  surfaceResourceId,
  surfaceResourceUrl,
  zoomViewportAt,
} from "../renderer/architecture/board-surface.mjs";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }
}

class FakeElement {
  constructor({ left = 0, top = 0, width = 800, height = 500 } = {}) {
    this.rect = { left, top, width, height };
    this.clientHeight = height;
    this.clientWidth = width;
    this.offsetLeft = 0;
    this.offsetTop = 0;
    this.style = {};
    this.dataset = {};
    this.textContent = "";
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.captured = new Set();
  }

  getBoundingClientRect() {
    return this.rect;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter((item) => item !== listener));
  }

  emit(type, event) {
    (this.listeners.get(type) || []).forEach((listener) => listener(event));
  }

  setPointerCapture(pointerId) {
    this.captured.add(pointerId);
  }

  hasPointerCapture(pointerId) {
    return this.captured.has(pointerId);
  }

  releasePointerCapture(pointerId) {
    this.captured.delete(pointerId);
  }
}

function fakeSurface(key, scheduler) {
  const canvas = new FakeElement();
  const moduleLayer = new FakeElement();
  const regionLayer = new FakeElement();
  const edgeLayer = new FakeElement();
  const representationLaneLayer = new FakeElement();
  const controls = new FakeElement();
  const zoomValue = new FakeElement();
  const surface = createBoardSurface({
    surfaceKey: key,
    elements: {
      root: canvas,
      canvas,
      moduleLayer,
      regionLayer,
      edgeLayer,
      representationLaneLayer,
      controls,
      zoomValue,
    },
    requestFrame: scheduler.request,
    cancelFrame: scheduler.cancel,
  });
  return { surface, canvas, moduleLayer, regionLayer, edgeLayer, representationLaneLayer, controls, zoomValue };
}

function manualScheduler() {
  let sequence = 0;
  const callbacks = new Map();
  return {
    request(callback) {
      const id = ++sequence;
      callbacks.set(id, callback);
      return id;
    },
    cancel(id) {
      callbacks.delete(id);
    },
    flush() {
      const pending = Array.from(callbacks.values());
      callbacks.clear();
      pending.forEach((callback) => callback());
    },
  };
}

test("zoom keeps the architecture point beneath the pointer fixed", () => {
  const viewport = createViewportState({ x: 10, y: -20, scale: 1 });
  const point = { x: 240, y: 120 };
  const origin = { x: 40, y: 30 };
  const localBefore = {
    x: (point.x - origin.x - viewport.x) / viewport.scale,
    y: (point.y - origin.y - viewport.y) / viewport.scale,
  };
  const zoomed = zoomViewportAt(viewport, point, 1.5, origin);

  assert.equal(zoomed.scale, 1.5);
  assert.equal(origin.x + zoomed.x + localBefore.x * zoomed.scale, point.x);
  assert.equal(origin.y + zoomed.y + localBefore.y * zoomed.scale, point.y);
});

test("fit centers small content and respects explicit bounds origin", () => {
  const fitted = fitViewportToBounds(
    createViewportState(),
    { minX: 100, minY: 50, width: 400, height: 200 },
    { width: 1000, height: 600 },
    { padding: 20 },
  );

  assert.equal(fitted.scale, 1);
  assert.equal(fitted.x, 200);
  assert.equal(fitted.y, 150);
});

test("wheel normalization is deterministic across pixel, line, and page modes", () => {
  assert.equal(normalizedWheelDelta({ deltaY: 5, deltaMode: 0 }), 5);
  assert.equal(normalizedWheelDelta({ deltaY: 5, deltaMode: 1 }), 80);
  assert.equal(normalizedWheelDelta({ deltaY: 1, deltaMode: 2 }, { pagePixels: 600 }), 160);
});

test("two surfaces keep viewport scheduling, transforms, and zoom labels independent", () => {
  const firstScheduler = manualScheduler();
  const secondScheduler = manualScheduler();
  const first = fakeSurface("primary", firstScheduler);
  const second = fakeSurface("comparison", secondScheduler);

  first.surface.zoomAt(400, 250, 2, { userInitiated: true });
  firstScheduler.flush();

  assert.equal(first.surface.getViewport().scale, 2);
  assert.equal(second.surface.getViewport().scale, 1);
  assert.match(first.moduleLayer.style.transform, /scale\(2\)$/);
  assert.match(first.regionLayer.style.transform, /scale\(2\)$/);
  assert.match(first.edgeLayer.style.transform, /scale\(2\)$/);
  assert.match(first.representationLaneLayer.style.transform, /scale\(2\)$/);
  assert.match(second.moduleLayer.style.transform, /scale\(1\)$/);
  assert.match(second.regionLayer.style.transform, /scale\(1\)$/);
  assert.equal(first.zoomValue.textContent, "200%");
  assert.equal(second.zoomValue.textContent, "100%");
  assert(first.surface.userMovedViewport);
  assert(!second.surface.userMovedViewport);
});

test("each bound canvas handles only its own wheel and pointer gestures", () => {
  const firstScheduler = manualScheduler();
  const secondScheduler = manualScheduler();
  const first = fakeSurface("primary", firstScheduler);
  const second = fakeSurface("comparison", secondScheduler);
  const target = { closest: () => null };
  let prevented = false;

  second.canvas.emit("wheel", {
    target,
    clientX: 400,
    clientY: 250,
    deltaY: -100,
    deltaMode: 0,
    preventDefault() { prevented = true; },
  });
  secondScheduler.flush();
  assert(prevented);
  assert.equal(first.surface.getViewport().scale, 1);
  assert(second.surface.getViewport().scale > 1);
  const beforePan = second.surface.getViewport();

  second.canvas.emit("pointerdown", {
    target,
    button: 0,
    pointerId: 7,
    clientX: 100,
    clientY: 100,
  });
  second.canvas.emit("pointermove", {
    pointerId: 7,
    clientX: 130,
    clientY: 145,
    preventDefault() {},
  });
  second.canvas.emit("pointerup", { pointerId: 7 });
  secondScheduler.flush();
  assert.equal(second.surface.getViewport().x, beforePan.x + 30);
  assert.equal(second.surface.getViewport().y, beforePan.y + 45);
  assert(!second.canvas.classList.values.has("is-panning"));
});

test("surface-scoped SVG resources never duplicate marker identifiers", () => {
  assert.equal(surfaceResourceId("primary", "edge-arrow-pair"), "board-primary-edge-arrow-pair");
  assert.equal(surfaceResourceId("comparison", "edge-arrow-pair"), "board-comparison-edge-arrow-pair");
  assert.equal(surfaceResourceUrl("comparison", "edge-arrow-pair"), "url(#board-comparison-edge-arrow-pair)");
  assert.notEqual(
    surfaceResourceId("primary", "edge-arrow-pair"),
    surfaceResourceId("comparison", "edge-arrow-pair"),
  );
});
