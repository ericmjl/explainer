const REFRESH_PARAM = "review_refresh";
const LOCATION_PARAMS = Object.freeze(["board", "node", "layout"]);
const NON_SHAREABLE_PARAMS = Object.freeze([REFRESH_PARAM, "ui", "edit", "tune"]);

function absoluteUrl(value, fallback = null) {
  try {
    return new URL(value, fallback || undefined);
  } catch {
    return fallback ? new URL(fallback) : null;
  }
}

// A source-set switch is intentional navigation to a different architecture.
// It must not carry a board or occurrence ID whose meaning belongs to the
// previous source set.
export function rootAudienceUrl(baseUrl, sourceSet) {
  const url = absoluteUrl(baseUrl);
  if (!url) throw new TypeError("A valid audience renderer URL is required.");
  url.search = "";
  url.hash = "";
  url.searchParams.set("arch", sourceSet);
  return url.href;
}

// Applying source edits reloads the same audience location. Only renderer
// location parameters are carried across the cache-busting navigation.
export function refreshAudienceUrl(currentUrl, {
  baseUrl,
  sourceSet,
  refreshToken,
} = {}) {
  const target = new URL(rootAudienceUrl(baseUrl, sourceSet));
  const current = absoluteUrl(currentUrl, target.href);
  for (const name of LOCATION_PARAMS) {
    const value = current?.searchParams.get(name);
    if (value) target.searchParams.set(name, value);
  }
  target.searchParams.set(REFRESH_PARAM, String(refreshToken));
  return target.href;
}

// The external audience link mirrors the iframe's board/node location while
// dropping review-only cache busting and retired UI parameters.
export function shareableAudienceUrl(currentUrl, { baseUrl, sourceSet } = {}) {
  const fallback = rootAudienceUrl(baseUrl, sourceSet);
  const url = absoluteUrl(currentUrl, fallback) || new URL(fallback);
  if (!url.searchParams.get("arch")) url.searchParams.set("arch", sourceSet);
  for (const name of NON_SHAREABLE_PARAMS) url.searchParams.delete(name);
  return url.href;
}
