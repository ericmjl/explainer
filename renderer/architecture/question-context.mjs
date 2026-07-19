export const QUESTION_CONTEXT_SCHEMA_VERSION = "architecture-question-context-v0.1";

function values(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function untypedRef(ref, namespace = null) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  if (separator < 0) return value;
  if (namespace && value.slice(0, separator) !== namespace) return value;
  return value.slice(separator + 1);
}

function namespaceFor(ref) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  return separator < 0 ? null : value.slice(0, separator);
}

function compact(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function sortedUnique(items) {
  return [...new Set(items.filter(Boolean))].sort();
}

function sourcePath(path) {
  return path ? String(path).replace(/^(\.\.\/)+/, "") : undefined;
}

function architectureCollections(manifest) {
  const architecture = manifest.architecture || {};
  return {
    architecture,
    modules: values(architecture.modules),
    representations: values(architecture.representations),
    valueSites: values(architecture.valueSites || architecture.value_sites),
    relations: values(architecture.relations),
    claims: values(architecture.claims),
    conditioning: values(architecture.conditioning),
    scaleTransitions: values(architecture.scaleTransitions || architecture.scale_transitions),
    openQuestions: values(architecture.openQuestions || architecture.open_questions),
    blockInstances: values(architecture.blockInstances || architecture.block_instances),
  };
}

function byId(items, ref, namespace = null) {
  const id = untypedRef(ref, namespace);
  return items.find((item) => item.id === id) || null;
}

export function canonicalNodeRef(node = {}) {
  const direct = node.ref || node.canonical_ref || node.canonicalRef;
  if (direct) return direct;
  const valueSite = node.value_site_ref || node.valueSiteRef;
  if (valueSite) return `value_sites.${untypedRef(valueSite, "value_sites")}`;
  const module = node.module_ref || node.moduleRef;
  if (module) return `modules.${untypedRef(module, "modules")}`;
  const representation = node.rep_ref || node.repRef;
  if (representation) return `representations.${untypedRef(representation, "representations")}`;
  return null;
}

function directRelationPath(edge = {}) {
  const path = edge.relation_path || edge.relationPath;
  if (Array.isArray(path) && path.length) return path.filter(Boolean);
  const hops = edge.provenance_hops || edge.provenanceHops;
  if (Array.isArray(hops) && hops.length) {
    const refs = hops.map((hop) => hop?.relation_ref || hop?.relationRef).filter(Boolean);
    if (refs.length) return refs;
  }
  const direct = edge.relation_ref || edge.relationRef;
  return direct ? [direct] : [];
}

export function edgeRelationPath(edge = {}) {
  const direct = directRelationPath(edge);
  if (direct.length) return direct;
  return values(edge.segments).flatMap((segment) => directRelationPath(segment));
}

function entityForNode(node, collections) {
  const canonicalRef = canonicalNodeRef(node);
  const namespace = namespaceFor(canonicalRef);
  if (namespace === "modules") return byId(collections.modules, canonicalRef, "modules");
  if (namespace === "value_sites") return byId(collections.valueSites, canonicalRef, "value_sites");
  if (namespace === "representations") {
    return byId(collections.representations, canonicalRef, "representations");
  }
  return null;
}

function representationForNode(node, entity, collections) {
  const representationRef = entity?.representation_ref || entity?.representationRef
    || node.rep_ref || node.repRef;
  return representationRef
    ? byId(collections.representations, representationRef, "representations")
    : null;
}

function labelForNode(node, entity, representation) {
  return node.label || entity?.display_label || entity?.label || representation?.display_label
    || representation?.label || entity?.id || node.id;
}

function boardNode(board, occurrenceId) {
  return values(board.nodes).find((node) => node.id === occurrenceId) || null;
}

function endpointDescriptor(board, occurrenceId, collections) {
  const node = boardNode(board, occurrenceId);
  if (node) {
    const entity = entityForNode(node, collections);
    const representation = representationForNode(node, entity, collections);
    return compact({
      occurrence_id: occurrenceId,
      canonical_ref: canonicalNodeRef(node),
      template_fact_ref: node.template_fact_ref || node.templateFactRef,
      block_instance_ref: node.block_instance_ref || node.blockInstanceRef,
      label: labelForNode(node, entity, representation),
    });
  }
  return compact({
    occurrence_id: occurrenceId,
    canonical_ref: ["modules", "value_sites", "representations"].includes(namespaceFor(occurrenceId))
      ? occurrenceId
      : undefined,
    label: untypedRef(occurrenceId).replaceAll("_", " "),
  });
}

function evidenceEntry(factRef, entity) {
  if (!entity?.evidence) return null;
  return {
    fact_ref: factRef,
    status: entity.evidence.status || "unknown",
    refs: values(entity.evidence.refs).map((ref) => compact({
      source_ref: ref.source_ref || ref.sourceRef,
      role: ref.role,
      locator: ref.locator || ref.lines,
      note: ref.note,
    })),
  };
}

function relationIndex(collections) {
  return new Map(collections.relations.flatMap((relation) => {
    const bare = untypedRef(relation.id, "relations");
    return [[relation.id, relation], [bare, relation], [`relations.${bare}`, relation]];
  }));
}

function relationDescriptor(relationRef, relationsByRef) {
  const relation = relationsByRef.get(relationRef)
    || relationsByRef.get(untypedRef(relationRef, "relations"));
  if (!relation) return { relation_ref: relationRef };
  return compact({
    relation_ref: relationRef,
    from: relation.from,
    to: relation.to,
    kind: relation.kind,
    operation: relation.operation,
    carries: values(relation.carries),
    summary: relation.summary,
  });
}

function hiddenRefsForEdge(edge, board, collections) {
  const explicit = values(edge.hidden_refs || edge.hiddenRefs);
  if (explicit.length) return sortedUnique(explicit);
  const endpointIds = new Set([edge.from, edge.to]);
  return sortedUnique(values(edge.segments).flatMap((segment) => [segment.from, segment.to])
    .filter((id) => id && !endpointIds.has(id))
    .map((id) => endpointDescriptor(board, id, collections).canonical_ref || id));
}

function carriesForEdge(edge, relationPath, relationsByRef) {
  const direct = values(edge.carries);
  if (direct.length) return sortedUnique(direct);
  return sortedUnique(relationPath.flatMap((ref) => {
    const relation = relationsByRef.get(ref) || relationsByRef.get(untypedRef(ref, "relations"));
    return values(relation?.carries);
  }));
}

function edgeDescriptor(edge, board, collections, relationsByRef) {
  const relationPath = edgeRelationPath(edge);
  const connection = edge.connection || edge.presentation?.connection || {};
  return compact({
    kind: "projected_edge",
    projected_id: edge.id,
    grounding: edge.grounding || (relationPath.length ? "canonical_relation_path" : "ungrounded"),
    standard_block_ref: edge.standard_block_ref || edge.standardBlockRef,
    block_instance_ref: edge.block_instance_ref || edge.blockInstanceRef,
    template_fact_ref: edge.template_fact_ref || edge.templateFactRef,
    template_data_ref: edge.template_data_ref || edge.templateDataRef,
    from: endpointDescriptor(board, edge.from, collections),
    to: endpointDescriptor(board, edge.to, collections),
    projection: edge.projection,
    flow_kind: edge.kind,
    relation_path: relationPath,
    hidden_refs: hiddenRefsForEdge(edge, board, collections),
    carries: carriesForEdge(edge, relationPath, relationsByRef),
    presentation: compact({
      label: edge.label || edge.presentation?.label,
      tone: edge.tone || edge.presentation?.tone,
      connection: compact({
        title: connection.title,
        role: connection.role,
        inside: connection.inside,
      }),
    }),
    resolved_relation_path: relationPath.map((ref) => relationDescriptor(ref, relationsByRef)),
  });
}

function edgeSortKey(edge) {
  return [
    edge.from?.occurrence_id,
    edge.to?.occurrence_id,
    edge.flow_kind,
    values(edge.relation_path).join("\u0000"),
    edge.projected_id,
  ].map((value) => String(value || "")).join("\u0001");
}

function sortedEdges(edges) {
  return [...edges].sort((left, right) => edgeSortKey(left).localeCompare(edgeSortKey(right)));
}

function evidenceForFacts(facts) {
  const seen = new Set();
  return facts.filter(Boolean).filter((entry) => {
    if (seen.has(entry.fact_ref)) return false;
    seen.add(entry.fact_ref);
    return true;
  });
}

function relationEvidence(relationRefs, relationsByRef) {
  return relationRefs.map((ref) => {
    const relation = relationsByRef.get(ref) || relationsByRef.get(untypedRef(ref, "relations"));
    return evidenceEntry(ref, relation);
  });
}

function sourceCatalog(manifest, evidence) {
  const wanted = new Set(evidence.flatMap((entry) => entry.refs.map((ref) => ref.source_ref)).filter(Boolean));
  return values(manifest.bibliography?.sources)
    .filter((source) => wanted.has(source.id))
    .sort((left, right) => String(left.id).localeCompare(String(right.id)))
    .map((source) => compact({
      source_ref: source.id,
      kind: source.kind,
      title: source.title,
      url: source.url,
      path: source.path,
      revision: source.revision,
    }));
}

function semanticLinks(manifest, collections, canonicalRefs, relationRefs) {
  const canonical = new Set(canonicalRefs.filter(Boolean));
  const relations = new Set(relationRefs);
  const claimRefs = collections.claims.filter((claim) => {
    const scopeRefs = values(claim.scope?.refs || claim.affected_refs || claim.affectedRefs);
    const scopedModule = claim.scope?.module_ref || claim.scope?.moduleRef;
    return canonical.has(scopedModule) || scopeRefs.some((ref) => canonical.has(ref));
  }).map((claim) => `claims.${claim.id}`);
  const openQuestionRefs = collections.openQuestions.filter((question) =>
    values(question.affected_refs || question.affectedRefs).some((ref) => canonical.has(ref)))
    .map((question) => `open_questions.${question.id}`);
  const conditioningRefs = collections.conditioning.filter((conditioning) => {
    const relationRef = conditioning.relation_ref || conditioning.relationRef;
    return relations.has(relationRef) || canonical.has(conditioning.source) || canonical.has(conditioning.target);
  }).map((conditioning) => `conditioning.${conditioning.id}`);
  const scaleTransitionRefs = collections.scaleTransitions.filter((transition) =>
    values(transition.relation_path || transition.relationPath).some((ref) => relations.has(ref)))
    .map((transition) => `scale_transitions.${transition.id}`);
  const pseudocodeLineRefs = Object.entries(manifest.pseudocode || {}).flatMap(([programId, program]) =>
    values(program.lines).filter((line) =>
      values(line.architectureRefs || line.architecture_refs).some((ref) => canonical.has(ref)))
      .map((line) => `${program.id || programId}.${line.id}`));
  const stateGroupRefs = canonicalRefs.filter((ref) => namespaceFor(ref) === "value_sites")
    .map((ref) => untypedRef(ref, "value_sites"))
    .map((siteId) => manifest.architecture?.stateSemanticsBySite?.[siteId]
      || manifest.architecture?.state_semantics_by_site?.[siteId])
    .map((semantics) => semantics?.groupId || semantics?.group_id)
    .filter(Boolean)
    .map((id) => `state_semantics.${id}`);
  return {
    claim_refs: sortedUnique(claimRefs),
    open_question_refs: sortedUnique(openQuestionRefs),
    pseudocode_line_refs: sortedUnique(pseudocodeLineRefs),
    conditioning_refs: sortedUnique(conditioningRefs),
    scale_transition_refs: sortedUnique(scaleTransitionRefs),
    state_group_refs: sortedUnique(stateGroupRefs),
  };
}

function revision(manifest) {
  const digests = manifest.build?.inputDigests || manifest.build?.input_digests || {};
  return compact({
    generator: manifest.build?.generator,
    input_digests: Object.fromEntries(Object.entries(digests).sort(([left], [right]) => left.localeCompare(right))),
  });
}

function boardDescriptor(manifest, board, breadcrumbs) {
  return compact({
    id: board.id,
    title: board.title,
    summary: board.summary,
    subject_ref: board.subject_ref || board.subjectRef,
    expansion_depth: board.expansion_depth ?? board.expansionDepth,
    source: sourcePath(manifest.boards?.sourceYaml || manifest.boards?.source_yaml),
    breadcrumb: values(breadcrumbs).map((entry) => compact({ id: entry.id, title: entry.title })),
  });
}

function packetBase({ sourceSet, manifest, board, breadcrumbs }) {
  return {
    schema_version: QUESTION_CONTEXT_SCHEMA_VERSION,
    source_set: sourceSet,
    revision: revision(manifest),
    architecture: compact({
      id: manifest.architecture?.id,
      name: manifest.architecture?.name,
      source: sourcePath(manifest.architecture?.sourceYaml || manifest.architecture?.source_yaml),
    }),
    board: boardDescriptor(manifest, board, breadcrumbs),
  };
}

function nodeSelection(node, collections) {
  const canonicalRef = canonicalNodeRef(node);
  const entity = entityForNode(node, collections);
  const representation = representationForNode(node, entity, collections);
  const module = namespaceFor(canonicalRef) === "modules" ? entity : null;
  const representationRef = entity?.representation_ref || entity?.representationRef
    || node.rep_ref || node.repRef;
  const childRefs = module
    ? collections.modules.filter((candidate) => candidate.parent_ref === canonicalRef)
      .map((candidate) => `modules.${candidate.id}`)
    : [];
  return compact({
    kind: "node_occurrence",
    occurrence_id: node.id,
    canonical_ref: canonicalRef,
    grounding: node.template_fact_ref || node.templateFactRef
      ? "standard_block_template"
      : "canonical_architecture",
    standard_block_ref: node.standard_block_ref || node.standardBlockRef,
    block_instance_ref: node.block_instance_ref || node.blockInstanceRef,
    template_fact_ref: node.template_fact_ref || node.templateFactRef,
    node_kind: node.kind || namespaceFor(canonicalRef),
    display: compact({
      label: labelForNode(node, entity, representation),
      notation: node.notation,
      role: node.role || entity?.role || entity?.semantic_role || representation?.semantic_role,
    }),
    shape: node.shape || entity?.shape || representation?.shape,
    glyph: node.glyph || representation?.glyph,
    scale: node.scale || entity?.scale || representation?.scale,
    drilldown_board_ref: node.board_ref || node.boardRef,
    decomposition_status: module?.decomposition?.status,
    related_refs: compact({
      parent_ref: module?.parent_ref,
      child_refs: sortedUnique(childRefs),
      representation_ref: representationRef,
      scope_ref: entity?.scope_ref || entity?.scopeRef,
    }),
  });
}

export function buildNodeQuestionContext({
  sourceSet,
  manifest,
  board,
  breadcrumbs = [],
  node,
  edges = [],
}) {
  const collections = architectureCollections(manifest);
  const relationsByRef = relationIndex(collections);
  const selection = nodeSelection(node, collections);
  const incoming = sortedEdges(values(edges).filter((edge) => edge.to === node.id)
    .map((edge) => edgeDescriptor(edge, board, collections, relationsByRef)));
  const outgoing = sortedEdges(values(edges).filter((edge) => edge.from === node.id)
    .map((edge) => edgeDescriptor(edge, board, collections, relationsByRef)));
  const relationRefs = [...incoming, ...outgoing].flatMap((edge) => edge.relation_path);
  const entity = entityForNode(node, collections);
  const representation = representationForNode(node, entity, collections);
  const representationRef = selection.related_refs?.representation_ref;
  const blockInstance = selection.block_instance_ref
    ? byId(collections.blockInstances, selection.block_instance_ref, "block_instances")
    : null;
  const evidence = evidenceForFacts([
    evidenceEntry(selection.canonical_ref, entity),
    representationRef ? evidenceEntry(representationRef, representation) : null,
    blockInstance ? evidenceEntry(selection.block_instance_ref, blockInstance) : null,
    ...relationEvidence(relationRefs, relationsByRef),
  ]);
  return {
    ...packetBase({ sourceSet, manifest, board, breadcrumbs }),
    selection,
    neighborhood: { incoming, outgoing },
    evidence,
    source_catalog: sourceCatalog(manifest, evidence),
    semantic_links: semanticLinks(
      manifest,
      collections,
      [selection.canonical_ref, representationRef],
      relationRefs,
    ),
    reusable_component: blockInstance ? compact({
      block_instance_ref: selection.block_instance_ref,
      standard_block_ref: blockInstance.standardBlockRef || blockInstance.standard_block_ref,
      variant: blockInstance.variant,
      conformance: blockInstance.conformance,
      use_scope: blockInstance.useScope || blockInstance.use_scope,
      difference_summary: blockInstance.differenceSummary || blockInstance.difference_summary,
      port_bindings: blockInstance.portBindings || blockInstance.port_bindings,
      template_fact_ref: selection.template_fact_ref,
    }) : undefined,
  };
}

export function buildEdgeQuestionContext({
  sourceSet,
  manifest,
  board,
  breadcrumbs = [],
  edge,
  edges = [],
}) {
  const collections = architectureCollections(manifest);
  const relationsByRef = relationIndex(collections);
  const selection = edgeDescriptor(edge, board, collections, relationsByRef);
  const endpointIds = new Set([edge.from, edge.to]);
  const adjacent = sortedEdges(values(edges).filter((candidate) => candidate !== edge
    && [candidate.from, candidate.to].some((id) => endpointIds.has(id)))
    .map((candidate) => edgeDescriptor(candidate, board, collections, relationsByRef)));
  const relationRefs = selection.relation_path;
  const canonicalRefs = [
    selection.from?.canonical_ref,
    selection.to?.canonical_ref,
    ...selection.hidden_refs,
  ];
  const evidence = evidenceForFacts(relationEvidence(relationRefs, relationsByRef));
  const blockInstanceRef = selection.block_instance_ref;
  const blockInstance = blockInstanceRef
    ? byId(collections.blockInstances, blockInstanceRef, "block_instances")
    : null;
  const combinedEvidence = evidenceForFacts([
    ...evidence,
    blockInstance ? evidenceEntry(blockInstanceRef, blockInstance) : null,
  ]);
  return {
    ...packetBase({ sourceSet, manifest, board, breadcrumbs }),
    selection,
    neighborhood: { adjacent },
    evidence: combinedEvidence,
    source_catalog: sourceCatalog(manifest, combinedEvidence),
    semantic_links: semanticLinks(manifest, collections, canonicalRefs, relationRefs),
    reusable_component: blockInstance ? compact({
      block_instance_ref: blockInstanceRef,
      standard_block_ref: selection.standard_block_ref,
      variant: blockInstance.variant,
      conformance: blockInstance.conformance,
      use_scope: blockInstance.useScope || blockInstance.use_scope,
      difference_summary: blockInstance.differenceSummary || blockInstance.difference_summary,
      port_bindings: blockInstance.portBindings || blockInstance.port_bindings,
      template_fact_ref: selection.template_fact_ref,
    }) : undefined,
  };
}

export function questionContextReference(context) {
  const prefix = [context.source_set, context.board?.id].filter(Boolean).join(" / ");
  if (context.selection?.kind === "node_occurrence") {
    const ref = context.selection.canonical_ref
      || context.selection.template_fact_ref
      || context.selection.occurrence_id;
    const occurrence = context.selection.occurrence_id;
    return `${prefix} / ${ref}${occurrence ? ` (occurrence: ${occurrence})` : ""}`;
  }
  const relationPath = values(context.selection?.relation_path);
  const ref = relationPath.length
    ? relationPath.join(" -> ")
    : context.selection?.template_fact_ref
      || `${context.selection?.from?.occurrence_id || "?"}->${context.selection?.to?.occurrence_id || "?"}`;
  return `${prefix} / ${ref}`;
}

export function formatQuestionContext(context) {
  return [
    "Please help me understand this architecture element.",
    "Use the canonical identifiers to inspect the source-first YAML when available, and keep evidence certainty explicit.",
    "",
    "```json",
    JSON.stringify(context, null, 2),
    "```",
    "",
    "Question:",
  ].join("\n");
}
