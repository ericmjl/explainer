/**
 * Pure helpers for rendering repeated execution regions.
 *
 * A repeat region is presentation, not a second owner of execution facts:
 * its execution_ref resolves the canonical loop count, while
 * iteration_relation_refs identify recurrence relations represented by the
 * indexed boundary values and enclosure instead of long feedback wires.
 */

export function repeatRegions(board = {}) {
  return (Array.isArray(board.regions) ? board.regions : [])
    .filter((region) => region?.kind === "repeat");
}

export function executionLoopForRef(execution = {}, executionRef = "") {
  const prefix = "execution.loops.";
  if (!String(executionRef).startsWith(prefix)) return null;
  const loopId = String(executionRef).slice(prefix.length);
  const loops = Array.isArray(execution.loops)
    ? execution.loops
    : Object.values(execution.loops || {});
  return loops.find((loop) => loop?.id === loopId) || null;
}

export function representedIterationRelationRefs(board = {}) {
  return new Set(
    repeatRegions(board)
      .flatMap((region) => region.iteration_relation_refs || region.iterationRelationRefs || [])
      .filter(Boolean),
  );
}

export function edgeIsRepresentedByRepeatRegion(edge = {}, relationRefs = new Set()) {
  const path = edge.relation_path || edge.relationPath || [];
  const refs = Array.isArray(path) && path.length
    ? path
    : [edge.relation_ref || edge.relationRef].filter(Boolean);
  return refs.length === 1 && relationRefs.has(refs[0]);
}

export function repeatRegionBounds(boxes = [], padding = {}) {
  if (!Array.isArray(boxes) || !boxes.length || boxes.some((box) => !box)) return null;
  const members = boxes;
  const left = Number(padding.left ?? 18);
  const right = Number(padding.right ?? 18);
  const top = Number(padding.top ?? 42);
  const bottom = Number(padding.bottom ?? 18);
  const minX = Math.min(...members.map((box) => box.x));
  const minY = Math.min(...members.map((box) => box.y));
  const maxX = Math.max(...members.map((box) => box.x + box.width));
  const maxY = Math.max(...members.map((box) => box.y + box.height));
  return {
    x: minX - left,
    y: minY - top,
    width: maxX - minX + left + right,
    height: maxY - minY + top + bottom,
  };
}

function normalizedBox(input = {}) {
  const box = {
    x: Number(input.x),
    y: Number(input.y),
    width: Number(input.width),
    height: Number(input.height),
  };
  return Object.values(box).every(Number.isFinite) ? box : null;
}

function boxesOverlap(firstInput, secondInput, padding = 0) {
  const first = normalizedBox(firstInput);
  const second = normalizedBox(secondInput);
  if (!first || !second) return false;
  return first.x - padding < second.x + second.width
    && first.x + first.width + padding > second.x
    && first.y - padding < second.y + second.height
    && first.y + first.height + padding > second.y;
}

function segmentIntersectsBox(start, end, input, padding = 0) {
  const box = normalizedBox(input);
  if (!box || !start || !end) return false;
  const left = box.x - padding;
  const right = box.x + box.width + padding;
  const top = box.y - padding;
  const bottom = box.y + box.height + padding;
  return Math.min(Number(start.x), Number(end.x)) <= right
    && Math.max(Number(start.x), Number(end.x)) >= left
    && Math.min(Number(start.y), Number(end.y)) <= bottom
    && Math.max(Number(start.y), Number(end.y)) >= top;
}

function routeIntersections(box, routes = [], padding = 0) {
  let intersections = 0;
  for (const points of routes || []) {
    for (let index = 1; index < (points || []).length; index += 1) {
      if (segmentIntersectsBox(points[index - 1], points[index], box, padding)) {
        intersections += 1;
      }
    }
  }
  return intersections;
}

/**
 * Keep the repeat caption in the quiet header band while moving it away from
 * wires and annotations that cross the enclosure boundary. Coordinates in the
 * returned object are local to the repeat-region element.
 */
export function repeatRegionHeaderPlacement(
  boundsInput,
  headerInput,
  routes = [],
  annotations = [],
  options = {},
) {
  const bounds = normalizedBox(boundsInput);
  const header = normalizedBox({ x: 0, y: 0, ...headerInput });
  if (!bounds || !header) return { left: 14, top: 7, side: "top" };

  const inset = Math.max(0, Number(options.inset ?? 14));
  const top = Math.max(0, Number(options.top ?? 7));
  const step = Math.max(4, Number(options.step ?? 12));
  const clearance = Math.max(0, Number(options.clearance ?? 5));
  const maximumLeft = Math.max(inset, bounds.width - header.width - inset);
  const positions = new Set([inset, maximumLeft]);
  for (let left = inset; left <= maximumLeft; left += step) positions.add(left);

  return [...positions]
    .map((left) => {
      const localLeft = Math.min(maximumLeft, Math.max(inset, left));
      const box = {
        x: bounds.x + localLeft,
        y: bounds.y + top,
        width: header.width,
        height: header.height,
      };
      const wireCrossings = routeIntersections(box, routes, clearance);
      const annotationCrossings = (annotations || [])
        .filter((annotation) => boxesOverlap(box, annotation, clearance)).length;
      return {
        left: localLeft,
        top,
        side: "top",
        // A clear position always wins; among clear positions, preserve the
        // familiar left-to-right reading order.
        score: wireCrossings * 10_000 + annotationCrossings * 20_000 + localLeft,
      };
    })
    .sort((first, second) => first.score - second.score)[0];
}

export function repeatRegionDisplay(region = {}, loop = null) {
  const repeats = Number(loop?.repeats);
  const hasCount = Number.isFinite(repeats) && repeats > 0;
  const authoredLabel = String(region.label || "repeated block").trim();
  return {
    label: hasCount ? authoredLabel.replace(/^one\s+/i, "") : authoredLabel,
    count: hasCount ? `×${repeats}` : null,
  };
}

export function repeatRegionAccessibleLabel(region = {}, loop = null) {
  const label = region.label || "Repeated block";
  const repeats = Number(loop?.repeats);
  const count = Number.isFinite(repeats) && repeats > 0 ? repeats : null;
  return count
    ? `${label}. Repeated ${count} times; indexed outputs become the next iteration's inputs.`
    : `${label}. Indexed outputs become the next iteration's inputs.`;
}
