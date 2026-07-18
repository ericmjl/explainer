export const DEFAULT_ARROW_LANDING = 32;

function clonePoints(points = []) {
  return points.map((point) => ({ x: Number(point.x), y: Number(point.y) }));
}

function compactOrthogonalPoints(points) {
  const compact = [];
  points.forEach((point) => {
    const last = compact.at(-1);
    if (last && last.x === point.x && last.y === point.y) return;
    compact.push(point);
  });
  for (let index = compact.length - 2; index > 0; index -= 1) {
    const before = compact[index - 1];
    const point = compact[index];
    const after = compact[index + 1];
    const vertical = before.x === point.x && point.x === after.x;
    const horizontal = before.y === point.y && point.y === after.y;
    const between = vertical
      ? point.y >= Math.min(before.y, after.y) && point.y <= Math.max(before.y, after.y)
      : point.x >= Math.min(before.x, after.x) && point.x <= Math.max(before.x, after.x);
    if ((vertical || horizontal) && between) compact.splice(index, 1);
  }
  return compact;
}

export function endpointRunLength(points = [], endpoint = "end") {
  if (points.length < 2) return 0;
  const first = endpoint === "start" ? points[0] : points.at(-2);
  const second = endpoint === "start" ? points[1] : points.at(-1);
  return Math.abs(Number(second.x) - Number(first.x))
    + Math.abs(Number(second.y) - Number(first.y));
}

// Reserve a straight shaft before the arrow marker. The helper moves the last
// orthogonal rail outward while preserving both endpoints; straight two-point
// edges need no repair because they have no bend for the marker to collide with.
export function ensureMinimumLanding(input = [], minimum = DEFAULT_ARROW_LANDING) {
  const points = clonePoints(input);
  if (points.length < 3 || endpointRunLength(points) >= minimum) return points;

  const end = points.at(-1);
  const dock = points.at(-2);
  const anchorIndex = points.length - 3;
  const anchor = points[anchorIndex];
  const horizontal = end.y === dock.y && end.x !== dock.x;
  const vertical = end.x === dock.x && end.y !== dock.y;
  if (!horizontal && !vertical) return points;

  const oldDock = { ...dock };
  const direction = Math.sign(horizontal ? end.x - dock.x : end.y - dock.y);
  const railCoordinate = (horizontal ? end.x : end.y) - direction * minimum;

  if (anchorIndex === 0) {
    const source = points[0];
    const firstCorner = horizontal
      ? { x: railCoordinate, y: source.y }
      : { x: source.x, y: railCoordinate };
    const landingCorner = horizontal
      ? { x: railCoordinate, y: end.y }
      : { x: end.x, y: railCoordinate };
    return compactOrthogonalPoints([source, firstCorner, landingCorner, end]);
  }

  if (horizontal) {
    dock.x = railCoordinate;
    if (anchor.x === oldDock.x) anchor.x = railCoordinate;
    else points.splice(anchorIndex + 1, 0, { x: railCoordinate, y: anchor.y });
  } else {
    dock.y = railCoordinate;
    if (anchor.y === oldDock.y) anchor.y = railCoordinate;
    else points.splice(anchorIndex + 1, 0, { x: anchor.x, y: railCoordinate });
  }
  return compactOrthogonalPoints(points);
}

export function fitEndpointStubLengths(gap, departure, arrival) {
  if (!Number.isFinite(gap) || gap < 0) return [departure, arrival];
  if (gap >= departure + arrival) return [departure, arrival];
  const fittedDeparture = Math.min(departure, gap / 2);
  return [fittedDeparture, Math.min(arrival, Math.max(0, gap - fittedDeparture))];
}

function normalizedBox(box) {
  if (!box) return null;
  const x = Number(box.x);
  const y = Number(box.y);
  const width = Number(box.width);
  const height = Number(box.height);
  if (![x, y, width, height].every(Number.isFinite) || width < 0 || height < 0) return null;
  return {
    x,
    y,
    width,
    height,
    cx: Number.isFinite(Number(box.cx)) ? Number(box.cx) : x + width / 2,
    cy: Number.isFinite(Number(box.cy)) ? Number(box.cy) : y + height / 2,
  };
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function segmentIntersectsBox(start, end, input) {
  const box = normalizedBox(input);
  if (!box) return false;
  return Math.min(start.x, end.x) <= box.x + box.width
    && Math.max(start.x, end.x) >= box.x
    && Math.min(start.y, end.y) <= box.y + box.height
    && Math.max(start.y, end.y) >= box.y;
}

// A clear corridor between overlapping box faces should always beat a
// top/bottom U-turn. Besides being shorter, the direct route remains legible
// when wires paint behind cards: no middle segment can disappear under a node
// and leave two apparently disconnected hooks.
export function clearFacingPortPlan(
  fromInput,
  toInput,
  obstacles = [],
  { dockPadding = 6 } = {},
) {
  const fromBox = normalizedBox(fromInput);
  const toBox = normalizedBox(toInput);
  if (!fromBox || !toBox) return null;
  const padding = Math.max(0, Number(dockPadding) || 0);
  let exitSide;
  let enterSide;
  let start;
  let end;

  const overlapTop = Math.max(fromBox.y, toBox.y);
  const overlapBottom = Math.min(
    fromBox.y + fromBox.height,
    toBox.y + toBox.height,
  );
  if (overlapBottom - overlapTop >= padding * 2) {
    const y = clamp(
      (fromBox.cy + toBox.cy) / 2,
      overlapTop + padding,
      overlapBottom - padding,
    );
    if (fromBox.x + fromBox.width < toBox.x) {
      exitSide = "right";
      enterSide = "left";
      start = { x: fromBox.x + fromBox.width, y };
      end = { x: toBox.x, y };
    } else if (toBox.x + toBox.width < fromBox.x) {
      exitSide = "left";
      enterSide = "right";
      start = { x: fromBox.x, y };
      end = { x: toBox.x + toBox.width, y };
    }
  }

  if (!start) {
    const overlapLeft = Math.max(fromBox.x, toBox.x);
    const overlapRight = Math.min(
      fromBox.x + fromBox.width,
      toBox.x + toBox.width,
    );
    if (overlapRight - overlapLeft < padding * 2) return null;
    const x = clamp(
      (fromBox.cx + toBox.cx) / 2,
      overlapLeft + padding,
      overlapRight - padding,
    );
    if (fromBox.y + fromBox.height < toBox.y) {
      exitSide = "bottom";
      enterSide = "top";
      start = { x, y: fromBox.y + fromBox.height };
      end = { x, y: toBox.y };
    } else if (toBox.y + toBox.height < fromBox.y) {
      exitSide = "top";
      enterSide = "bottom";
      start = { x, y: fromBox.y };
      end = { x, y: toBox.y + toBox.height };
    } else {
      return null;
    }
  }

  if (obstacles.some((box) => segmentIntersectsBox(start, end, box))) return null;
  return { exitSide, enterSide, start, end };
}

function shiftPreference(points, index, vertical) {
  if (index === points.length - 3) {
    const dock = points.at(-2);
    const end = points.at(-1);
    const towardTarget = Math.sign(vertical ? end.x - dock.x : end.y - dock.y);
    if (towardTarget) return -towardTarget;
  }
  if (index === 1) {
    const source = points[0];
    const departure = points[1];
    const awayFromSource = Math.sign(vertical
      ? departure.x - source.x
      : departure.y - source.y);
    if (awayFromSource) return awayFromSource;
  }
  return 1;
}

function shiftedEndpointRunsAreReadable(
  points,
  index,
  vertical,
  shifted,
  minimumDeparture,
  minimumArrival,
) {
  if (index === 1) {
    const source = points[0];
    const departureRun = Math.abs(shifted - (vertical ? source.x : source.y));
    if (departureRun < minimumDeparture) return false;
  }
  if (index === points.length - 3) {
    const end = points.at(-1);
    const arrivalRun = Math.abs((vertical ? end.x : end.y) - shifted);
    if (arrivalRun < minimumArrival) return false;
  }
  return true;
}

// Parallel rails are separated without letting a nudge consume the protected
// departure or arrival shaft. The route map is updated in place to match the
// renderer's existing allocation pipeline, while input point objects are not
// mutated.
export function separateParallelSegments(
  routes,
  {
    nudge = 10,
    minimumDeparture = 20,
    minimumArrival = DEFAULT_ARROW_LANDING,
    maxAttempts = 8,
  } = {},
) {
  const used = [];
  routes.forEach((input, routeIndex) => {
    const points = ensureMinimumLanding(input, minimumArrival);
    const requiredDeparture = Math.min(minimumDeparture, endpointRunLength(points, "start"));
    const requiredArrival = Math.min(minimumArrival, endpointRunLength(points, "end"));
    for (let index = 1; index < points.length - 2; index += 1) {
      const first = points[index];
      const second = points[index + 1];
      const vertical = first.x === second.x;
      const horizontal = first.y === second.y;
      if (!vertical && !horizontal) continue;
      const coordinate = vertical ? first.x : first.y;
      const low = vertical ? Math.min(first.y, second.y) : Math.min(first.x, second.x);
      const high = vertical ? Math.max(first.y, second.y) : Math.max(first.x, second.x);
      if (high - low < 1) continue;
      const blocked = (candidate) => used.some((segment) => (
        segment.vertical === vertical
        && Math.abs(segment.coordinate - candidate) < nudge
        && segment.low < high
        && segment.high > low
      ));

      let shifted = coordinate;
      if (blocked(coordinate)) {
        const preferred = shiftPreference(points, index, vertical);
        const candidates = [];
        for (let attempt = 1; attempt <= Math.ceil(maxAttempts / 2); attempt += 1) {
          candidates.push(
            coordinate + preferred * attempt * nudge,
            coordinate - preferred * attempt * nudge,
          );
        }
        const clear = candidates.find((candidate) => (
          !blocked(candidate)
          && shiftedEndpointRunsAreReadable(
            points,
            index,
            vertical,
            candidate,
            requiredDeparture,
            requiredArrival,
          )
        ));
        if (clear != null) shifted = clear;
      }
      if (shifted !== coordinate) {
        if (vertical) {
          first.x = shifted;
          second.x = shifted;
        } else {
          first.y = shifted;
          second.y = shifted;
        }
      }
      used.push({ vertical, coordinate: shifted, low, high });
    }
    routes.set(routeIndex, ensureMinimumLanding(points, minimumArrival));
  });
  return routes;
}
