export const REPRESENTATION_GLYPH_KINDS = Object.freeze([
  "scalar",
  "vector",
  "single",
  "matrix",
  "pair",
  "volume",
  "dictionary",
  "coordinates",
  "frames",
]);

export const GEOMETRY_GLYPH_KINDS = Object.freeze([
  "coordinates",
  "frames",
]);

export function primaryShapeAxes(shape = "") {
  const source = String(shape).trim();
  if (!source) return [];

  let depth = 0;
  let clauseEnd = source.length;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "(") depth += 1;
    if (character === ")") depth = Math.max(0, depth - 1);
    const isTopLevelAlternative = depth === 0
      && source.slice(index, index + 3) === " + ";
    if (depth === 0 && (character === "," || character === ";" || isTopLevelAlternative)) {
      clauseEnd = index;
      break;
    }
  }

  const clause = source.slice(0, clauseEnd);
  const axes = [];
  let axisStart = 0;
  depth = 0;
  for (let index = 0; index < clause.length; index += 1) {
    const character = clause[index];
    if (character === "(") depth += 1;
    if (character === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && clause.slice(index, index + 3) === " x ") {
      axes.push(clause.slice(axisStart, index).trim());
      axisStart = index + 3;
      index += 2;
    }
  }
  axes.push(clause.slice(axisStart).trim());
  return axes.filter(Boolean);
}

function isFeatureAxis(axis = "") {
  const normalized = String(axis).trim().toLowerCase();
  if (/^\d+$/.test(normalized)) return Number(normalized) > 4;
  return /(?:^|[^a-z0-9])d(?:_[a-z0-9]+)?(?:$|[^a-z0-9])/.test(normalized)
    || /(?:^|[^a-z0-9])c_out(?:$|[^a-z0-9])/.test(normalized)
    || /fields?|channels?/.test(normalized);
}

export function glyphKindForShape(shape = "") {
  const dims = primaryShapeAxes(shape);
  if (!dims.length) return null;
  const rest = dims[0].toLowerCase() === "b" ? dims.slice(1) : dims;
  if (rest.length === 0) return "scalar";
  if (rest.length === 1) return "vector";
  if (rest.length === 2) return isFeatureAxis(rest[1]) ? "single" : "matrix";
  return rest[0] === rest[1] ? "pair" : "volume";
}

export function shapeDimsLabel(shape = "") {
  const dims = primaryShapeAxes(shape);
  const rest = dims[0]?.toLowerCase() === "b" ? dims.slice(1) : dims;
  return rest.map((axis) => axis.replaceAll(" x ", " × ")).join(" × ");
}

function gridCellsSvg(kind) {
  const grids = {
    scalar: [1, 1],
    vector: [10, 1],
    single: [14, 1],
    matrix: [8, 6],
    pair: [6, 6],
    volume: [8, 6],
  };
  const [cols, rows] = grids[kind] || grids.vector;
  let cells = "";
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const jitter = ((((index + 1) * 2654435761) >>> 16) % 1000) / 1000;
      const opacity = (0.18 + jitter * 0.38).toFixed(2);
      const inset = cols * rows === 1 ? 0 : 0.04;
      cells += `<rect x="${col + inset}" y="${row + inset}" width="${1 - 2 * inset}" height="${1 - 2 * inset}" fill="var(--glyph-color)" opacity="${opacity}"></rect>`;
    }
  }
  return `<svg class="tensor-cells" viewBox="0 0 ${cols} ${rows}" preserveAspectRatio="none" aria-hidden="true">${cells}</svg>`;
}

function coordinateGlyphSvg() {
  return `
    <svg class="tensor-geometry tensor-coordinate-geometry" viewBox="0 0 112 76" aria-hidden="true">
      <circle class="geometry-point geometry-point-muted" cx="14" cy="34" r="3.1"></circle>
      <circle class="geometry-point" cx="31" cy="21" r="4"></circle>
      <circle class="geometry-point" cx="48" cy="42" r="4.4"></circle>
      <circle class="geometry-point geometry-point-muted" cx="63" cy="27" r="3.3"></circle>
      <circle class="geometry-point" cx="81" cy="38" r="4.1"></circle>
      <circle class="geometry-point geometry-point-muted" cx="99" cy="20" r="3"></circle>
      <g class="geometry-coordinate-axes" transform="translate(92 50)">
        <circle class="geometry-origin" cx="0" cy="0" r="2.2"></circle>
        <path class="geometry-axis axis-x" d="M0 0 L12 0"></path>
        <path class="geometry-axis axis-y" d="M0 0 L0 -11"></path>
        <path class="geometry-axis axis-z" d="M0 0 L-7 7"></path>
        <text class="geometry-axis-label axis-x-label" x="14" y="3">x</text>
        <text class="geometry-axis-label axis-y-label" x="2" y="-12">y</text>
        <text class="geometry-axis-label axis-z-label" x="-12" y="11">z</text>
      </g>
    </svg>`;
}

function frameGlyphSvg() {
  return `
    <svg class="tensor-geometry tensor-frame-geometry" viewBox="0 0 116 80" aria-hidden="true">
      <g class="geometry-frame geometry-frame-muted" transform="translate(23 44)">
        <circle class="geometry-origin" cx="0" cy="0" r="2.6"></circle>
        <path class="geometry-axis axis-x" d="M0 0 L15 0"></path>
        <path class="geometry-axis axis-y" d="M0 0 L0 -14"></path>
        <path class="geometry-axis axis-z" d="M0 0 L-8 8"></path>
      </g>
      <g class="geometry-frame" transform="translate(58 36)">
        <circle class="geometry-origin" cx="0" cy="0" r="3"></circle>
        <path class="geometry-axis axis-x" d="M0 0 L20 0"></path>
        <path class="geometry-axis axis-y" d="M0 0 L0 -19"></path>
        <path class="geometry-axis axis-z" d="M0 0 L-11 11"></path>
        <text class="geometry-axis-label axis-x-label" x="22" y="3">x</text>
        <text class="geometry-axis-label axis-y-label" x="2" y="-20">y</text>
        <text class="geometry-axis-label axis-z-label" x="-16" y="15">z</text>
      </g>
      <g class="geometry-frame geometry-frame-muted" transform="translate(94 31)">
        <circle class="geometry-origin" cx="0" cy="0" r="2.6"></circle>
        <path class="geometry-axis axis-x" d="M0 0 L13 0"></path>
        <path class="geometry-axis axis-y" d="M0 0 L0 -12"></path>
        <path class="geometry-axis axis-z" d="M0 0 L-7 7"></path>
      </g>
    </svg>`;
}

function escapeSvgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function dictionaryGlyphSvg(fieldNames = []) {
  const labels = [...fieldNames, "…"].slice(0, 4);
  const rows = labels.map((label, index) => {
    const y = 16 + index * 13;
    const rendered = label === "…" ? label : `${label}: tensor`;
    return `<text class="dictionary-glyph-row" x="17" y="${y}">${escapeSvgText(rendered)}</text>`;
  }).join("");
  return `
    <svg class="tensor-geometry dictionary-glyph" viewBox="0 0 142 64" aria-hidden="true">
      <text class="dictionary-glyph-brace" x="4" y="41">{</text>
      ${rows}
      <text class="dictionary-glyph-brace" x="130" y="41">}</text>
    </svg>`;
}

export function tensorGlyphSvg(kind, fieldNames = []) {
  if (kind === "dictionary") return dictionaryGlyphSvg(fieldNames);
  if (kind === "coordinates") return coordinateGlyphSvg();
  if (kind === "frames") return frameGlyphSvg();
  return gridCellsSvg(kind);
}
