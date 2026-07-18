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
  const top = Number(padding.top ?? 34);
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

export function repeatRegionAccessibleLabel(region = {}, loop = null) {
  const label = region.label || "Repeated block";
  const repeats = Number(loop?.repeats);
  const count = Number.isFinite(repeats) && repeats > 0 ? repeats : null;
  return count
    ? `${label}. Repeated ${count} times; indexed outputs become the next iteration's inputs.`
    : `${label}. Indexed outputs become the next iteration's inputs.`;
}
