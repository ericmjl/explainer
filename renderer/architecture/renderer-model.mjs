/**
 * Pure adapter between generated architecture manifests and the browser UI.
 *
 * The manifest builder emits the current camel-case contract. A narrow set of
 * aliases remains here for older projected fixtures and manifests so drawing
 * and interaction code can consume one stable shape.
 */

export function collectionValues(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

export function untypedRef(ref, namespace = null) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  if (separator < 0) return value;
  if (namespace && value.slice(0, separator) !== namespace) return value;
  return value.slice(separator + 1);
}

export function refNamespace(ref) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  return separator < 0 ? null : value.slice(0, separator);
}

export function humanizeRef(ref) {
  return untypedRef(ref).replaceAll("_", " ");
}

export function relationRefsForEdge(edge = {}) {
  const path = edge.relation_path || edge.relationPath;
  if (Array.isArray(path) && path.length) return path;
  const hops = edge.provenance_hops || edge.provenanceHops;
  if (Array.isArray(hops)) {
    const refs = hops.map((hop) => hop?.relation_ref || hop?.relationRef).filter(Boolean);
    if (refs.length) return refs;
  }
  const direct = edge.relation_ref || edge.relationRef;
  return direct ? [direct] : [];
}

function normalizeConnection(edge, presentation, relationRefs) {
  const connection = edge.connection || presentation.connection || {};
  const flowName = edge.label
    || presentation.label
    || humanizeRef(relationRefs.at(-1) || edge.id || "flow");
  return {
    title: connection.title || presentation.title || flowName,
    role: connection.role || presentation.role || humanizeRef(edge.kind || "information flow"),
    inside: connection.inside
      || presentation.inside
      || `${humanizeRef(edge.from)} flows into ${humanizeRef(edge.to)}.`,
  };
}

function normalizeProjectedSegments(edge, relationRefs, relationsById, localIdsByRef) {
  if (Array.isArray(edge.segments) && edge.segments.length) {
    return edge.segments.map((segment) => {
      const relationRef = segment.relation_ref || segment.relationRef;
      const relation = relationsById.get(relationRef)
        || relationsById.get(untypedRef(relationRef));
      const presentation = segment.presentation || {};
      const normalized = { ...presentation, ...segment, relation_ref: relationRef };
      normalized.connection = normalizeConnection(
        normalized,
        presentation,
        relationRef ? [relationRef] : [],
      );
      normalized.label ||= relation?.label || relation?.summary || relation?.operation;
      normalized.kind ||= relation?.kind;
      normalized.carries ||= Array.isArray(relation?.carries)
        ? [...relation.carries]
        : [];
      normalized.tone ||= relation?.kind === "conditioning" ? "conditioning" : undefined;
      return normalized;
    });
  }

  const isProjectedEdge = edge.projection
    || edge.origin
    || edge.presentation
    || edge.relation_path
    || edge.relationPath
    || edge.provenance_hops
    || edge.provenanceHops;
  if (!isProjectedEdge || !relationRefs.length) return null;

  const localId = (ref, fallback) => {
    const ids = localIdsByRef.get(ref) || localIdsByRef.get(untypedRef(ref));
    return ids?.length === 1 ? ids[0] : fallback;
  };

  return relationRefs.map((relationRef, index) => {
    const relation = relationsById.get(relationRef)
      || relationsById.get(untypedRef(relationRef));
    const fromRef = relation?.from || relation?.source;
    const toRef = relation?.to || relation?.target;
    const from = index === 0
      ? edge.from
      : localId(fromRef, fromRef || `${edge.id || "flow"}:hop-${index}`);
    const to = index === relationRefs.length - 1
      ? edge.to
      : localId(toRef, toRef || `${edge.id || "flow"}:hop-${index + 1}`);
    const relationLabel = relation?.summary
      || relation?.operation
      || humanizeRef(relationRef);
    return {
      from,
      to,
      relation_ref: relationRef,
      kind: relation?.kind,
      carries: Array.isArray(relation?.carries) ? [...relation.carries] : [],
      label: relation?.label || relationLabel,
      tone: relation?.kind === "conditioning" ? "conditioning" : undefined,
      connection: {
        title: relation?.summary || relationLabel,
        role: humanizeRef(relation?.kind || relation?.operation || "information flow"),
        inside: relation?.summary
          || `${humanizeRef(fromRef || from)} flows into ${humanizeRef(toRef || to)}.`,
      },
    };
  });
}

function normalizeBoardNode(node, valueSitesById) {
  const presentation = node.presentation || {};
  const ref = node.ref || node.canonical_ref || node.canonicalRef;
  const namespace = refNamespace(ref);
  const normalized = { ...presentation, ...node };

  if (namespace === "modules") {
    normalized.kind ||= "module";
    normalized.module_ref ||= untypedRef(ref, "modules");
  } else if (namespace === "value_sites") {
    const siteId = untypedRef(ref, "value_sites");
    const site = valueSitesById.get(siteId) || {};
    const representationRef = site.representation_ref
      || site.representationRef
      || site.rep_ref;
    normalized.kind ||= "representation";
    normalized.value_site_ref ||= siteId;
    normalized.rep_ref ||= untypedRef(representationRef, "representations");
    normalized.label ||= site.display_label || site.label || humanizeRef(node.id);
    normalized.role ||= site.role || site.semantic_role;
    normalized.shape ||= site.shape;
    normalized.scale ||= site.scale;
  } else if (namespace === "representations") {
    // Tolerant reading for early projector fixtures. Visualization v0.4 binds
    // concrete tensor occurrences through value_sites.* instead.
    normalized.kind ||= "representation";
    normalized.rep_ref ||= untypedRef(ref, "representations");
  }

  if (normalized.moduleRef && !normalized.module_ref) normalized.module_ref = normalized.moduleRef;
  if (normalized.repRef && !normalized.rep_ref) normalized.rep_ref = normalized.repRef;
  if (normalized.boardRef && !normalized.board_ref) normalized.board_ref = normalized.boardRef;
  if (normalized.valueSiteRef && !normalized.value_site_ref) {
    normalized.value_site_ref = untypedRef(normalized.valueSiteRef, "value_sites");
  }
  return normalized;
}

function normalizeBoardEdge(edge, relationsById, localIdsByRef) {
  const presentation = edge.presentation || {};
  const relationRefs = relationRefsForEdge(edge);
  const normalized = {
    ...presentation,
    ...edge,
    label: edge.label ?? presentation.label,
    tone: edge.tone
      ?? presentation.tone
      ?? (edge.kind === "conditioning" ? "conditioning" : undefined),
    route_side: edge.route_side
      ?? edge.routeSide
      ?? presentation.route_side
      ?? presentation.routeSide,
    route_clearance: edge.route_clearance
      ?? edge.routeClearance
      ?? presentation.route_clearance
      ?? presentation.routeClearance,
  };
  normalized.relation_ref ||= relationRefs.length === 1 ? relationRefs[0] : undefined;
  if (relationRefs.length) normalized.relation_path ||= relationRefs;
  normalized.connection = normalizeConnection(normalized, presentation, relationRefs);
  normalized.segments = normalizeProjectedSegments(
    normalized,
    relationRefs,
    relationsById,
    localIdsByRef,
  );
  return normalized;
}

function normalizeBoard(board, architecture) {
  const projectedGraph = board.projected_graph || board.projectedGraph || board.graph;
  const graph = projectedGraph && typeof projectedGraph === "object" ? projectedGraph : board;
  const valueSites = collectionValues(architecture.valueSites || architecture.value_sites);
  const valueSitesById = new Map(valueSites.map((site) => [site.id, site]));
  const nodes = collectionValues(graph.nodes).map((node) => normalizeBoardNode(node, valueSitesById));
  const localIdsByRef = new Map();
  for (const node of nodes) {
    const refs = [
      node.ref,
      node.canonical_ref,
      node.canonicalRef,
      node.module_ref,
      node.rep_ref,
    ].filter(Boolean);
    for (const ref of refs) {
      for (const key of [ref, untypedRef(ref)]) {
        const ids = localIdsByRef.get(key) || [];
        ids.push(node.id);
        localIdsByRef.set(key, ids);
      }
    }
  }

  const relations = collectionValues(architecture.relations);
  const relationsById = new Map();
  for (const relation of relations) {
    relationsById.set(relation.id, relation);
    relationsById.set(untypedRef(relation.id, "relations"), relation);
    relationsById.set(`relations.${relation.id}`, relation);
  }
  const edges = collectionValues(graph.edges).map((edge) => (
    normalizeBoardEdge(edge, relationsById, localIdsByRef)
  ));
  return { ...graph, ...board, nodes, edges };
}

export function normalizeRendererManifest(source = {}) {
  const sourceArchitecture = source.architecture || {};
  const architecture = {
    ...sourceArchitecture,
    sourceYaml: sourceArchitecture.sourceYaml || sourceArchitecture.source_yaml,
    modules: collectionValues(sourceArchitecture.modules),
    blockInstances: collectionValues(
      sourceArchitecture.blockInstances || sourceArchitecture.block_instances,
    ),
    representations: collectionValues(sourceArchitecture.representations),
    valueSites: collectionValues(sourceArchitecture.valueSites || sourceArchitecture.value_sites),
    relations: collectionValues(sourceArchitecture.relations),
    stateSemantics: sourceArchitecture.stateSemantics || sourceArchitecture.state_semantics || {},
    stateSemanticsBySite: sourceArchitecture.stateSemanticsBySite
      || sourceArchitecture.state_semantics_by_site
      || {},
    valueSiteInterfaces: sourceArchitecture.valueSiteInterfaces
      || sourceArchitecture.value_site_interfaces
      || {},
    scaleTransitions: collectionValues(
      sourceArchitecture.scaleTransitions || sourceArchitecture.scale_transitions,
    ),
    trainingInference: sourceArchitecture.trainingInference
      || sourceArchitecture.training_inference
      || {},
    claims: collectionValues(sourceArchitecture.claims),
  };
  const sourceBoards = source.boards || {};
  const boardItems = collectionValues(
    sourceBoards.items
      || sourceBoards.projected
      || source.projectedBoards
      || source.projected_boards,
  ).map((board) => normalizeBoard(board, architecture));
  return {
    ...source,
    architecture,
    boards: {
      ...sourceBoards,
      rootBoard: sourceBoards.rootBoard || sourceBoards.root_board,
      items: boardItems,
    },
  };
}

export function buildRendererIndexes(manifest) {
  const architecture = manifest.architecture;
  const modulesById = new Map(architecture.modules.map((module) => [module.id, module]));
  const repsById = new Map(architecture.representations.map((rep) => [rep.id, rep]));
  const valueSitesById = new Map(
    (architecture.valueSites || []).map((site) => [site.id, site]),
  );
  const valueSiteInterfacesById = new Map(
    Object.entries(architecture.valueSiteInterfaces || {}),
  );
  const relationsById = new Map(
    (architecture.relations || []).flatMap((relation) => {
      const bare = untypedRef(relation.id, "relations");
      return [
        [relation.id, relation],
        [bare, relation],
        [`relations.${bare}`, relation],
      ];
    }),
  );
  const boardsById = new Map(manifest.boards.items.map((board) => [board.id, board]));
  const standardBlocksById = new Map(
    collectionValues(manifest.standardBlocks || manifest.standard_blocks)
      .map((block) => [block.id, block]),
  );
  const blockInstancesById = new Map(
    (architecture.blockInstances || []).map((instance) => [instance.id, instance]),
  );
  const blockInstancesBySubject = new Map();
  for (const instance of architecture.blockInstances || []) {
    const key = instance.subjectRef || instance.subject_ref;
    const matches = blockInstancesBySubject.get(key) || [];
    matches.push(instance);
    blockInstancesBySubject.set(key, matches);
  }
  const conditioningByPair = new Map(
    (architecture.conditioning || []).map((conditioning) => [
      `${conditioning.source}->${String(conditioning.target || "").split(".")[0]}`,
      conditioning,
    ]),
  );
  const conditioningByRelation = new Map(
    (architecture.conditioning || []).flatMap((conditioning) => {
      const ref = conditioning.relation_ref || conditioning.relationRef;
      if (!ref) return [];
      const bare = untypedRef(ref, "relations");
      return [[ref, conditioning], [bare, conditioning], [`relations.${bare}`, conditioning]];
    }),
  );

  return {
    modulesById,
    repsById,
    valueSitesById,
    valueSiteInterfacesById,
    relationsById,
    boardsById,
    standardBlocksById,
    blockInstancesById,
    blockInstancesBySubject,
    conditioningByPair,
    conditioningByRelation,
  };
}

function lookupByRef(index, ref, namespace) {
  return index.get(ref) || index.get(untypedRef(ref, namespace)) || null;
}

export function createRendererModel(source = {}) {
  const manifest = normalizeRendererManifest(source);
  const indexes = buildRendererIndexes(manifest);

  return {
    manifest,
    indexes,
    entity(ref) {
      const namespace = refNamespace(ref);
      if (namespace === "modules") {
        return lookupByRef(indexes.modulesById, ref, "modules");
      }
      if (namespace === "representations") {
        return lookupByRef(indexes.repsById, ref, "representations");
      }
      if (namespace === "value_sites") {
        return lookupByRef(indexes.valueSitesById, ref, "value_sites");
      }
      if (namespace === "relations") {
        return lookupByRef(indexes.relationsById, ref, "relations");
      }
      return null;
    },
    board(ref) {
      return lookupByRef(indexes.boardsById, ref, "boards");
    },
    relation(ref) {
      return lookupByRef(indexes.relationsById, ref, "relations");
    },
    conditioningForRelation(ref) {
      return lookupByRef(indexes.conditioningByRelation, ref, "relations");
    },
  };
}
