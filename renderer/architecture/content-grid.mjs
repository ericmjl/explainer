function nonnegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function allocateBoundaryGutters({
  trackSizes,
  baseGap,
  edges,
  annotationExtent,
  availableExtent,
  padding,
}) {
  const sizes = Array.from(trackSizes || [], (size) => nonnegativeNumber(size));
  const minimum = nonnegativeNumber(baseGap);
  const safety = nonnegativeNumber(padding);
  const gutters = Array(Math.max(0, sizes.length - 1)).fill(minimum);

  for (const edge of edges || []) {
    const fromRank = Number(edge?.fromRank);
    const toRank = Number(edge?.toRank);
    const extent = nonnegativeNumber(edge?.[annotationExtent]);
    if (!Number.isInteger(fromRank) || !Number.isInteger(toRank) || !extent) continue;
    if (Math.abs(fromRank - toRank) !== 1) continue;
    if (!sizes[fromRank] || !sizes[toRank]) continue;

    const available = nonnegativeNumber(edge?.[availableExtent]);
    const deficit = Math.max(0, extent + safety - available);
    const requiredGutter = minimum + Math.ceil(deficit);
    const gutterIndex = Math.min(fromRank, toRank);
    gutters[gutterIndex] = Math.max(gutters[gutterIndex], requiredGutter);
  }

  return gutters.map((gutter) => Math.ceil(gutter));
}

// Allocate whitespace between content-sized tracks after a preliminary route
// pass. Only the measured label deficit grows a boundary; horizontal room
// already supplied by node widths, track slack, and routing remains useful.
export function allocateContentGridGutters({
  columnWidths,
  baseGap,
  edges = [],
  labelPadding = 16,
}) {
  return allocateBoundaryGutters({
    trackSizes: columnWidths,
    baseGap,
    edges,
    annotationExtent: "textWidth",
    availableExtent: "availableSpan",
    padding: labelPadding,
  });
}

// Content-sized rows use the same deficit accounting as columns, but reserve
// the complete vertical annotation stack (edge label plus derived badges).
// Only an adjacent authored boundary named by the caller can grow.
export function allocateContentGridRowGutters({
  rowHeights,
  baseGap,
  edges = [],
  annotationPadding = 24,
}) {
  return allocateBoundaryGutters({
    trackSizes: rowHeights,
    baseGap,
    edges,
    annotationExtent: "annotationHeight",
    availableExtent: "availableSpan",
    padding: annotationPadding,
  });
}

export function contentGridWidth(columnWidths, gutters) {
  return [...(columnWidths || []), ...(gutters || [])]
    .reduce((total, value) => total + nonnegativeNumber(value), 0);
}

export function edgeLabelFits({ span, textWidth, padding = 16, force = false }) {
  if (force) return true;
  return nonnegativeNumber(span) >= nonnegativeNumber(textWidth) + nonnegativeNumber(padding);
}

export function balancedTextLines(text, { measure, maxWidth = 160 } = {}) {
  const normalized = String(text || "").trim().replace(/\s+/g, " ");
  if (!normalized) return [];
  const words = normalized.split(" ");
  if (words.length < 2 || typeof measure !== "function") return [normalized];
  if (measure(normalized) <= nonnegativeNumber(maxWidth, 160)) return [normalized];

  let best = null;
  for (let index = 1; index < words.length; index += 1) {
    const lines = [words.slice(0, index).join(" "), words.slice(index).join(" ")];
    const widths = lines.map((line) => nonnegativeNumber(measure(line)));
    const score = [Math.max(...widths), Math.abs(widths[0] - widths[1]), index];
    if (!best || score[0] < best.score[0] ||
        (score[0] === best.score[0] && score[1] < best.score[1])) {
      best = { lines, score };
    }
  }
  return best?.lines || [normalized];
}
