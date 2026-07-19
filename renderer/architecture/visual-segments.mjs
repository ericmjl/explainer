/**
 * Pure helpers for declarative standard-block phase enclosures. Segments own
 * no algorithm facts; they group already-compiled visual nodes to expose a
 * reading order such as logits first, value extraction second.
 */

export function visualSegments(board = {}) {
  return (Array.isArray(board.segments) ? board.segments : [])
    .filter((segment) => {
      const nodeIds = segment?.node_ids || segment?.nodeIds;
      return Array.isArray(nodeIds) && nodeIds.length > 0;
    });
}

export function visualSegmentBounds(boxes = [], padding = {}) {
  if (!Array.isArray(boxes) || !boxes.length || boxes.some((box) => !box)) return null;
  const left = Number(padding.left ?? 14);
  const right = Number(padding.right ?? 14);
  const top = Number(padding.top ?? 32);
  const bottom = Number(padding.bottom ?? 14);
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return {
    x: minX - left,
    y: minY - top,
    width: maxX - minX + left + right,
    height: maxY - minY + top + bottom,
  };
}

export function visualSegmentAccessibleLabel(segment = {}) {
  const order = Number(segment.order);
  const prefix = Number.isFinite(order) && order > 0 ? `Phase ${order}: ` : "";
  const label = segment.label || "Algorithm phase";
  const description = String(segment.description || "").trim();
  return `${prefix}${label}${description ? `. ${description}` : ""}`;
}

function normalizedIdPart(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

export function visualSegmentDescriptionId(surfaceKey, segmentId) {
  return `board-${normalizedIdPart(surfaceKey, "surface")}-phase-${normalizedIdPart(segmentId, "segment")}`;
}

function updateDescribedBy(element, descriptionId, add) {
  const ids = String(element.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((id) => id !== descriptionId);
  if (add) ids.push(descriptionId);
  if (ids.length) element.setAttribute("aria-describedby", ids.join(" "));
  else element.removeAttribute("aria-describedby");
}

function descriptionTargets(member) {
  const focusTarget = member?.matches?.("button, [href], input, select, textarea, [tabindex]")
    ? member
    : member?.querySelector?.("button, [href], input, select, textarea, [tabindex]");
  return Array.from(new Set([member, focusTarget].filter(Boolean)));
}

function escapedNodeId(nodeId) {
  return globalThis.CSS?.escape
    ? globalThis.CSS.escape(String(nodeId))
    : String(nodeId).replace(/["\\]/g, "\\$&");
}

function clearVisualSegmentAccessibility(moduleLayer) {
  moduleLayer.querySelectorAll(".visual-segment-description").forEach((description) => {
    if (description.id) {
      moduleLayer.querySelectorAll("[data-node-id]").forEach((node) => {
        descriptionTargets(node).forEach((target) => updateDescribedBy(target, description.id, false));
      });
    }
    description.remove();
  });
}

// Phase enclosures are visual backgrounds, so they live in the dedicated
// region layer. Their accessible descriptions remain beside the member nodes
// in the module layer and are referenced with aria-describedby.
export function renderVisualSegmentRegions({
  regionLayer,
  moduleLayer,
  board = {},
  surfaceKey = "primary",
} = {}) {
  if (!regionLayer || !moduleLayer) return [];
  regionLayer.querySelectorAll(".visual-segment-region").forEach((element) => element.remove());
  clearVisualSegmentAccessibility(moduleLayer);
  const documentRef = regionLayer.ownerDocument || globalThis.document;
  const rendered = [];

  visualSegments(board).forEach((segment) => {
    const members = (segment.node_ids || segment.nodeIds || []).map((nodeId) => (
      moduleLayer.querySelector(`[data-node-id="${escapedNodeId(nodeId)}"]`)
    ));
    const boxes = members.map((element) => element && ({
      x: element.offsetLeft,
      y: element.offsetTop,
      width: element.offsetWidth,
      height: element.offsetHeight,
    }));
    const bounds = visualSegmentBounds(boxes);
    if (!bounds) return;

    const accessibleLabel = visualSegmentAccessibleLabel(segment);
    const descriptionId = visualSegmentDescriptionId(surfaceKey, segment.id);
    const description = documentRef.createElement("span");
    description.id = descriptionId;
    description.className = "sr-only visual-segment-description";
    description.textContent = accessibleLabel;
    moduleLayer.appendChild(description);
    members.forEach((member) => {
      descriptionTargets(member).forEach((target) => updateDescribedBy(target, descriptionId, true));
    });

    const enclosure = documentRef.createElement("div");
    enclosure.className = "board-region visual-segment-region";
    enclosure.dataset.segmentId = segment.id;
    enclosure.dataset.segmentOrder = String(segment.order || "");
    enclosure.setAttribute("aria-hidden", "true");
    enclosure.style.left = `${Math.round(bounds.x)}px`;
    enclosure.style.top = `${Math.round(bounds.y)}px`;
    enclosure.style.width = `${Math.round(bounds.width)}px`;
    enclosure.style.height = `${Math.round(bounds.height)}px`;

    const header = documentRef.createElement("div");
    header.className = "visual-segment-header";
    if (segment.order) {
      const order = documentRef.createElement("span");
      order.className = "visual-segment-order";
      order.textContent = `Phase ${segment.order}`;
      header.appendChild(order);
    }
    const label = documentRef.createElement("span");
    label.className = "visual-segment-label";
    label.textContent = segment.label || "algorithm phase";
    header.appendChild(label);
    enclosure.appendChild(header);
    regionLayer.appendChild(enclosure);
    rendered.push(enclosure);
  });
  return rendered;
}
