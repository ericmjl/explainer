import assert from "node:assert/strict";
import test from "node:test";

import {
  renderVisualSegmentRegions,
  visualSegmentAccessibleLabel,
  visualSegmentBounds,
  visualSegmentDescriptionId,
  visualSegments,
} from "../renderer/architecture/visual-segments.mjs";

class FakeElement {
  constructor(tagName = "div", ownerDocument = null) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.dataset = {};
    this.style = {};
    this.className = "";
    this.textContent = "";
    this.id = "";
    this.offsetLeft = 0;
    this.offsetTop = 0;
    this.offsetWidth = 0;
    this.offsetHeight = 0;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  matches(selector) {
    return selector.split(",").some((part) => {
      const normalized = part.trim();
      if (normalized === "button") return this.tagName === "BUTTON";
      if (normalized === "[tabindex]") return this.attributes.has("tabindex");
      return false;
    });
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (element) => {
      element.children.forEach((child) => {
        if (child.matchesSelector(selector)) matches.push(child);
        visit(child);
      });
    };
    visit(this);
    return matches;
  }

  matchesSelector(selector) {
    if (selector === ".visual-segment-region") {
      return this.className.split(/\s+/).includes("visual-segment-region");
    }
    if (selector === ".visual-segment-description") {
      return this.className.split(/\s+/).includes("visual-segment-description");
    }
    if (selector === "[data-node-id]") return Boolean(this.dataset.nodeId);
    const nodeId = selector.match(/^\[data-node-id="(.*)"\]$/);
    if (nodeId) return this.dataset.nodeId === nodeId[1].replace(/\\(["\\])/g, "$1");
    if (selector.includes(",")) return this.matches(selector);
    return false;
  }
}

class FakeDocument {
  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

test("visual segments preserve authored phase order and ignore empty groups", () => {
  const board = {
    segments: [
      { id: "logits", order: 1, node_ids: ["qk", "softmax"] },
      { id: "empty", order: 2, node_ids: [] },
      { id: "values", order: 2, node_ids: ["aggregate"] },
    ],
  };

  assert.deepEqual(visualSegments(board).map((segment) => segment.id), ["logits", "values"]);
  assert.deepEqual(visualSegments({}), []);
});

test("segment bounds reserve a header without changing member geometry", () => {
  const bounds = visualSegmentBounds([
    { x: 100, y: 80, width: 40, height: 30 },
    { x: 180, y: 120, width: 60, height: 50 },
  ]);

  assert.deepEqual(bounds, { x: 86, y: 48, width: 168, height: 136 });
  assert.equal(visualSegmentBounds([]), null);
});

test("segment accessibility names expose sequence, label, and explanation", () => {
  assert.equal(
    visualSegmentAccessibleLabel({
      order: 2,
      label: "Extract values and update state",
      description: "Reuse the shared weights for all value streams.",
    }),
    "Phase 2: Extract values and update state. Reuse the shared weights for all value streams.",
  );
});

test("rendered phase backgrounds stay decorative while member controls receive the phase description", () => {
  const documentRef = new FakeDocument();
  const moduleLayer = new FakeElement("div", documentRef);
  const regionLayer = new FakeElement("div", documentRef);
  const operation = new FakeElement("article", documentRef);
  operation.dataset.nodeId = "normalize";
  operation.offsetLeft = 100;
  operation.offsetTop = 80;
  operation.offsetWidth = 120;
  operation.offsetHeight = 70;
  const operationButton = new FakeElement("button", documentRef);
  operation.appendChild(operationButton);
  const representation = new FakeElement("button", documentRef);
  representation.dataset.nodeId = "weights";
  representation.offsetLeft = 250;
  representation.offsetTop = 80;
  representation.offsetWidth = 80;
  representation.offsetHeight = 90;
  moduleLayer.appendChild(operation);
  moduleLayer.appendChild(representation);
  const board = {
    segments: [{
      id: "attention_weights",
      order: 1,
      label: "Compute attention weights",
      description: "Normalize the composed logits.",
      node_ids: ["normalize", "weights"],
    }],
  };

  renderVisualSegmentRegions({ regionLayer, moduleLayer, board, surfaceKey: "comparison" });
  renderVisualSegmentRegions({ regionLayer, moduleLayer, board, surfaceKey: "comparison" });

  const descriptionId = visualSegmentDescriptionId("comparison", "attention_weights");
  assert.equal(regionLayer.querySelectorAll(".visual-segment-region").length, 1);
  assert.equal(moduleLayer.querySelectorAll(".visual-segment-description").length, 1);
  assert.equal(regionLayer.children[0].getAttribute("aria-hidden"), "true");
  assert.equal(operation.getAttribute("aria-describedby"), descriptionId);
  assert.equal(operationButton.getAttribute("aria-describedby"), descriptionId);
  assert.equal(representation.getAttribute("aria-describedby"), descriptionId);
  assert.equal(
    moduleLayer.querySelector(".visual-segment-description").textContent,
    "Phase 1: Compute attention weights. Normalize the composed logits.",
  );
});
