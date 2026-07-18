import { glyphKindForShape } from "./representation-glyphs.mjs";

/**
 * Payload families are a disposable rendering projection of canonical
 * representation facts. They are intentionally not authored in view YAML.
 */
export const PAYLOAD_FLOW_FAMILIES = Object.freeze([
  "single",
  "pair",
  "coordinates",
  "frames",
]);

const PAYLOAD_FLOW_FAMILY_SET = new Set(PAYLOAD_FLOW_FAMILIES);
const CONTEXT_FLOW_KINDS = new Set(["conditioning", "control", "index_flow"]);

function values(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function untypedRef(ref, namespace = null) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  if (separator < 0) return value;
  if (namespace && value.slice(0, separator) !== namespace) return value;
  return value.slice(separator + 1);
}

function lookup(collection, ref, namespace) {
  if (!ref) return null;
  const bare = untypedRef(ref, namespace);
  if (collection instanceof Map) {
    return collection.get(ref)
      || collection.get(bare)
      || collection.get(`${namespace}.${bare}`)
      || null;
  }
  return values(collection).find((item) => (
    item?.id === ref || item?.id === bare || `${namespace}.${item?.id}` === ref
  )) || null;
}

function orderedUnique(items) {
  return [...new Set(items.filter(Boolean))];
}

function profileForFamilies(families, extra = {}) {
  const recognized = orderedUnique(families)
    .filter((family) => PAYLOAD_FLOW_FAMILY_SET.has(family));
  return {
    ...extra,
    family: recognized.length === 0
      ? "default"
      : recognized.length === 1
        ? recognized[0]
        : "mixed",
    families: recognized,
  };
}

/**
 * Return a color-worthy family only when the canonical representation proves
 * one. Shape inference can establish single/pair rank, but never geometric
 * meaning: N x 3 remains an ordinary matrix unless the representation owns a
 * coordinates/frames glyph.
 */
export function representationFlowFamily(representation = {}) {
  const glyph = representation.glyph || glyphKindForShape(representation.shape || "");
  return PAYLOAD_FLOW_FAMILY_SET.has(glyph) ? glyph : null;
}

function relationRefsForEdge(edge = {}) {
  const path = edge.relation_path || edge.relationPath;
  if (Array.isArray(path) && path.length) return path;
  const hops = edge.provenance_hops || edge.provenanceHops;
  if (Array.isArray(hops) && hops.length) {
    const refs = hops
      .map((hop) => hop?.relation_ref || hop?.relationRef)
      .filter(Boolean);
    if (refs.length) return refs;
  }
  const direct = edge.relation_ref || edge.relationRef;
  return direct ? [direct] : [];
}

function carriesForRelationRef(ref, relations) {
  const relation = lookup(relations, ref, "relations");
  return values(relation?.carries);
}

/**
 * Preserve the ordered canonical payload set across direct and contracted
 * edges. Projected edges normally own the union in `carries`; segment and
 * relation fallbacks keep compatibility fixtures and runtime contractions
 * equally classifiable.
 */
export function carriedRepresentationRefs(edge = {}, indexes = {}) {
  const relations = indexes.relationsById || indexes.relations;
  const segmentCarries = values(edge.segments).flatMap((segment) => {
    const direct = values(segment?.carries);
    if (direct.length) return direct;
    return carriesForRelationRef(
      segment?.relation_ref || segment?.relationRef,
      relations,
    );
  });
  const relationCarries = relationRefsForEdge(edge)
    .flatMap((ref) => carriesForRelationRef(ref, relations));
  return orderedUnique([
    ...segmentCarries,
    ...values(edge.carries),
    ...relationCarries,
  ]);
}

export function edgeFlowProfile(edge = {}, indexes = {}) {
  const representations = indexes.repsById
    || indexes.representationsById
    || indexes.representations;
  const representationRefs = carriedRepresentationRefs(edge, indexes);
  const families = representationRefs.map((ref) => (
    representationFlowFamily(lookup(representations, ref, "representations") || {})
  ));
  return profileForFamilies(families, {
    representation_refs: representationRefs,
  });
}

function primaryEdge(edge) {
  return !CONTEXT_FLOW_KINDS.has(edge?.kind) && edge?.tone !== "conditioning";
}

function familiesForEdges(edges, indexes) {
  return edges.flatMap((edge) => edgeFlowProfile(edge, indexes).families);
}

/**
 * A compute card follows the payload it produces. When it has no recognized
 * output, its ordinary input is the fallback. Conditioning/control/index
 * inputs never recolor an otherwise single- or pair-producing block.
 */
function canonicalNodeProfile(node, indexes) {
  if (!node || typeof node !== "object") return null;
  const representationRef = node.rep_ref || node.repRef;
  if (!representationRef) return null;
  const representations = indexes.repsById
    || indexes.representationsById
    || indexes.representations;
  const family = representationFlowFamily(
    lookup(representations, representationRef, "representations") || {},
  );
  return family
    ? profileForFamilies([family], { source: "representation" })
    : profileForFamilies([], { source: "representation" });
}

export function nodeFlowProfile(nodeOrId, edges = [], indexes = {}) {
  const canonical = canonicalNodeProfile(nodeOrId, indexes);
  if (canonical) return canonical;

  const nodeId = typeof nodeOrId === "object" ? nodeOrId?.id : nodeOrId;
  const outgoing = edges.filter((edge) => edge?.from === nodeId && primaryEdge(edge));
  const outgoingFamilies = familiesForEdges(outgoing, indexes);
  if (outgoingFamilies.length) {
    return profileForFamilies(outgoingFamilies, { source: "outgoing" });
  }

  const incoming = edges.filter((edge) => edge?.to === nodeId && primaryEdge(edge));
  const incomingFamilies = familiesForEdges(incoming, indexes);
  if (incomingFamilies.length) {
    return profileForFamilies(incomingFamilies, { source: "incoming" });
  }

  return profileForFamilies([], { source: "none" });
}

export function nodeFlowProfiles(nodes = [], edges = [], indexes = {}) {
  return new Map(values(nodes).map((node) => [
    node.id,
    nodeFlowProfile(node, edges, indexes),
  ]));
}
