const DEFAULTS = Object.freeze({
  labelHeight: 14,
  badgeLineHeight: 12,
  badgeLineGap: 0,
  groupGap: 4,
  paddingX: 4,
  paddingY: 2,
  segmentPadding: 10,
  crossAxisGap: 8,
  obstaclePadding: 8,
  occupiedPadding: 6,
});

const DEFAULT_SIDE_ORDER = Object.freeze({
  horizontal: Object.freeze(["above", "below"]),
  vertical: Object.freeze(["right", "left"]),
});

function finiteNonnegative(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function visibleWidths(values = []) {
  return values
    .map((value) => finiteNonnegative(value))
    .filter((value) => value > 0);
}

// Text measurement remains the renderer's responsibility. This helper only
// combines already-measured line widths into one collision box.
export function measureEdgeAnnotation({
  labelWidth = 0,
  badgeLineWidths = [],
  labelHeight = DEFAULTS.labelHeight,
  badgeLineHeight = DEFAULTS.badgeLineHeight,
  badgeLineGap = DEFAULTS.badgeLineGap,
  groupGap = DEFAULTS.groupGap,
  paddingX = DEFAULTS.paddingX,
  paddingY = DEFAULTS.paddingY,
} = {}) {
  const measuredLabelWidth = finiteNonnegative(labelWidth);
  const measuredBadgeWidths = visibleWidths(badgeLineWidths);
  const hasLabel = measuredLabelWidth > 0;
  const badgeCount = measuredBadgeWidths.length;
  const horizontalPadding = finiteNonnegative(paddingX);
  const verticalPadding = finiteNonnegative(paddingY);

  const contentWidth = Math.max(
    hasLabel ? measuredLabelWidth : 0,
    ...measuredBadgeWidths,
    0,
  );
  const badgeHeight = badgeCount
    ? badgeCount * finiteNonnegative(badgeLineHeight)
      + (badgeCount - 1) * finiteNonnegative(badgeLineGap)
    : 0;
  const contentHeight = (hasLabel ? finiteNonnegative(labelHeight) : 0)
    + (hasLabel && badgeCount ? finiteNonnegative(groupGap) : 0)
    + badgeHeight;

  if (!contentWidth || !contentHeight) return { width: 0, height: 0 };
  return {
    width: contentWidth + horizontalPadding * 2,
    height: contentHeight + verticalPadding * 2,
  };
}

function finitePoint(point) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

// Indices refer to the original point-pair so callers can associate a chosen
// annotation with the route that produced it. Degenerate and diagonal pairs
// are ignored; valid pairs retain their authored direction.
export function enumerateOrthogonalSegments(points = []) {
  const segments = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = finitePoint(points[index]);
    const to = finitePoint(points[index + 1]);
    if (!from || !to) continue;
    const horizontal = from.y === to.y && from.x !== to.x;
    const vertical = from.x === to.x && from.y !== to.y;
    if (!horizontal && !vertical) continue;
    const orientation = horizontal ? "horizontal" : "vertical";
    const length = horizontal
      ? Math.abs(to.x - from.x)
      : Math.abs(to.y - from.y);
    segments.push({
      index,
      from,
      to,
      orientation,
      length,
      midpoint: {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
      },
      interior: index > 0 && index < points.length - 2,
    });
  }
  return segments;
}

function normalizeBox(box) {
  const x = Number(box?.x);
  const y = Number(box?.y);
  const width = Number(box?.width);
  const height = Number(box?.height);
  if (![x, y, width, height].every(Number.isFinite)) return null;
  return {
    x: width < 0 ? x + width : x,
    y: height < 0 ? y + height : y,
    width: Math.abs(width),
    height: Math.abs(height),
  };
}

function inflateBox(input, padding) {
  const box = normalizeBox(input);
  if (!box) return null;
  const amount = finiteNonnegative(padding);
  return {
    x: box.x - amount,
    y: box.y - amount,
    width: box.width + amount * 2,
    height: box.height + amount * 2,
  };
}

// Boundary contact is allowed: the caller-supplied inflation is the explicit
// clearance contract, while a positive-area overlap is a collision.
function boxesIntersect(first, second) {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

function candidateBox(segment, size, side, gap) {
  const { midpoint } = segment;
  if (segment.orientation === "horizontal") {
    return {
      x: midpoint.x - size.width / 2,
      y: side === "above"
        ? midpoint.y - gap - size.height
        : midpoint.y + gap,
      width: size.width,
      height: size.height,
    };
  }
  return {
    x: side === "left"
      ? midpoint.x - gap - size.width
      : midpoint.x + gap,
    y: midpoint.y - size.height / 2,
    width: size.width,
    height: size.height,
  };
}

function requiredAxisLength(segment, size, padding) {
  const extent = segment.orientation === "horizontal" ? size.width : size.height;
  return extent + padding * 2;
}

function rankedSegments(route) {
  return enumerateOrthogonalSegments(route).sort((first, second) => (
    Number(second.interior) - Number(first.interior)
    || second.length - first.length
    || first.index - second.index
  ));
}

// Find one deterministic, collision-free home for a combined edge annotation.
// Horizontal segments try above then below; vertical segments try right then
// left. Interior rails outrank endpoint runs even when an endpoint is longer.
export function placeEdgeAnnotation({
  route = [],
  size,
  obstacles = [],
  occupied = [],
  segmentPadding = DEFAULTS.segmentPadding,
  crossAxisGap = DEFAULTS.crossAxisGap,
  obstaclePadding = DEFAULTS.obstaclePadding,
  occupiedPadding = DEFAULTS.occupiedPadding,
  sideOrder = DEFAULT_SIDE_ORDER,
} = {}) {
  const measuredSize = normalizeBox({ x: 0, y: 0, ...size });
  if (!measuredSize?.width || !measuredSize?.height) return null;

  const alongAxisPadding = finiteNonnegative(segmentPadding);
  const gap = finiteNonnegative(crossAxisGap);
  const blocked = [
    ...obstacles.map((box) => inflateBox(box, obstaclePadding)),
    ...occupied.map((box) => inflateBox(box, occupiedPadding)),
  ].filter(Boolean);

  for (const segment of rankedSegments(route)) {
    if (segment.length < requiredAxisLength(segment, measuredSize, alongAxisPadding)) continue;
    const sides = sideOrder?.[segment.orientation] || DEFAULT_SIDE_ORDER[segment.orientation];
    for (const side of sides) {
      if (!DEFAULT_SIDE_ORDER[segment.orientation].includes(side)) continue;
      const box = candidateBox(segment, measuredSize, side, gap);
      if (blocked.some((obstacle) => boxesIntersect(box, obstacle))) continue;
      return { box, segment, side };
    }
  }
  return null;
}
