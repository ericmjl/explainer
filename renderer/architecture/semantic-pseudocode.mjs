/**
 * DOM-free helpers for joining semantic pseudocode to a projected board.
 *
 * Pseudocode and boards are deliberately treated as projections of canonical
 * facts. The browser never tries to infer architecture from arbitrary source
 * text: authored/compiler-provided character offsets only decide which
 * characters are interactive, while stable fact refs decide what they mean.
 */

function values(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function compactUnique(items) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function bareRef(ref, namespace = null) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  if (separator < 0) return value;
  if (namespace && value.slice(0, separator) !== namespace) return value;
  return value.slice(separator + 1);
}

function canonicalNodeRef(node = {}) {
  if (node.ref || node.canonical_ref || node.canonicalRef) {
    return node.ref || node.canonical_ref || node.canonicalRef;
  }
  if (node.module_ref || node.moduleRef) {
    return `modules.${bareRef(node.module_ref || node.moduleRef, "modules")}`;
  }
  if (node.value_site_ref || node.valueSiteRef) {
    return `value_sites.${bareRef(node.value_site_ref || node.valueSiteRef, "value_sites")}`;
  }
  if (node.rep_ref || node.repRef) {
    return `representations.${bareRef(node.rep_ref || node.repRef, "representations")}`;
  }
  return null;
}

export function semanticRefsForNode(node = {}) {
  const moduleRef = node.module_ref || node.moduleRef;
  const valueSiteRef = node.value_site_ref || node.valueSiteRef;
  const representationRef = node.rep_ref || node.repRef;
  return compactUnique([
    canonicalNodeRef(node),
    node.ref,
    node.canonical_ref,
    node.canonicalRef,
    node.template_fact_ref,
    node.templateFactRef,
    node.instance_fact_ref,
    node.instanceFactRef,
    node.port_ref,
    node.portRef,
    node.value_ref,
    node.valueRef,
    moduleRef && `modules.${bareRef(moduleRef, "modules")}`,
    valueSiteRef && `value_sites.${bareRef(valueSiteRef, "value_sites")}`,
    representationRef && `representations.${bareRef(representationRef, "representations")}`,
  ]);
}

export function semanticRefsForBinding(binding = {}, symbolsById = new Map()) {
  const symbolId = binding.symbolId || binding.symbol_id;
  const symbol = symbolsById.get(symbolId) || {};
  return compactUnique([
    binding.instanceFactRef,
    binding.instance_fact_ref,
    binding.templateFactRef,
    binding.template_fact_ref,
    binding.architectureRef,
    binding.architecture_ref,
    symbol.architectureRef,
    symbol.architecture_ref,
    binding.representationRef,
    binding.representation_ref,
    symbol.representationRef,
    symbol.representation_ref,
    binding.localRef,
    binding.local_ref,
  ]);
}

export function semanticTexForBinding(binding = {}, symbolsById = new Map()) {
  const symbolId = binding.symbolId || binding.symbol_id;
  const symbol = symbolsById.get(symbolId) || {};
  return binding.tex || symbol.tex || null;
}

function semanticMathAtom(value) {
  const atoms = {
    "\\epsilon": "ε",
    "\\ell": "ℓ",
    "\\theta": "θ",
  };
  return atoms[value] || String(value || "");
}

function semanticSubscript(value) {
  const unwrapped = String(value || "").replace(/^\{(.*)\}$/, "$1");
  return semanticMathAtom(unwrapped).replaceAll("-", "−");
}

/** Immediate readable fallback while the optional MathJax runtime starts. */
export function semanticTexFallbackParts(texValue) {
  const tex = String(texValue || "").trim();
  if (!tex) return null;

  const hat = tex.match(/^\\hat\{([^}]+)\}(?:_(\{[^}]+\}|\\[A-Za-z]+|[A-Za-z0-9+\-]+))?$/);
  if (hat) {
    return {
      base: `${semanticMathAtom(hat[1])}\u0302`,
      subscript: hat[2] ? semanticSubscript(hat[2]) : null,
    };
  }

  const indexed = tex.match(/^(\\[A-Za-z]+|[A-Za-z]+)(?:_(\{[^}]+\}|\\[A-Za-z]+|[A-Za-z0-9+\-]+))?$/);
  if (!indexed) return null;
  return {
    base: semanticMathAtom(indexed[1]),
    subscript: indexed[2] ? semanticSubscript(indexed[2]) : null,
  };
}

export function semanticRefsForStatement(statement = {}) {
  return compactUnique([
    statement.statementRef,
    statement.statement_ref,
    statement.instanceFactRef,
    statement.instance_fact_ref,
    statement.templateFactRef,
    statement.template_fact_ref,
    statement.architectureRef,
    statement.architecture_ref,
    ...values(statement.architectureRefs || statement.architecture_refs),
  ]);
}

/** Resolve the semantic program scope represented by one board level. */
export function semanticScopeForBoard({ program = {}, board = {}, rootBoardId = null } = {}) {
  const scopes = values(program.scopes);
  if (!scopes.length) return null;
  const refFor = (scope) => scope.ref || `scopes.${scope.id}`;
  const subjectRef = board.subject_ref || board.subjectRef;
  const direct = scopes.find((scope) => (scope.subjectRef || scope.subject_ref) === subjectRef);
  if (direct) return direct;

  const caller = values(program.lines).find((line) =>
    (line.statementRef || line.statement_ref) === subjectRef
      && (line.calleeScopeRef || line.callee_scope_ref),
  );
  if (caller) {
    const calleeRef = caller.calleeScopeRef || caller.callee_scope_ref;
    const callee = scopes.find((scope) => refFor(scope) === calleeRef);
    if (callee) return callee;
  }

  if (board.id === rootBoardId) {
    const rootRef = program.rootScope || program.root_scope;
    return scopes.find((scope) => refFor(scope) === rootRef) || null;
  }

  // Some architecture boards expand a wrapper whose semantic scope begins at
  // its visible child call. The parent of that child scope is the board-level
  // program slice (for example a sampler board containing ReverseStep).
  const visibleRefs = new Set(values(board.nodes)
    .filter((node) => !node.elide && node.prominence !== "hidden" && node.treatment !== "hidden")
    .map(canonicalNodeRef)
    .filter(Boolean));
  const visibleChild = scopes.find((scope) =>
    visibleRefs.has(scope.subjectRef || scope.subject_ref),
  );
  const parentRef = visibleChild?.parentRef || visibleChild?.parent_ref;
  return parentRef ? scopes.find((scope) => refFor(scope) === parentRef) || null : null;
}

function indexPush(index, ref, nodeId) {
  if (!ref || !nodeId) return;
  const matches = index.get(ref) || [];
  if (!matches.includes(nodeId)) matches.push(nodeId);
  index.set(ref, matches);
}

function architecture(manifest = {}) {
  return manifest.architecture || {};
}

function valueSiteInterfaces(manifest = {}) {
  const source = architecture(manifest).valueSiteInterfaces
    || architecture(manifest).value_site_interfaces
    || {};
  if (Array.isArray(source)) return new Map(source.map((entry) => [entry.id, entry]));
  return new Map(Object.entries(source));
}

/**
 * Create a resolver scoped to exactly one rendered board surface.
 *
 * Exact node-owned facts win. A value site that is outside this board may
 * resolve to its nearest visible producer/consumer boundary. A representation
 * type resolves only when the board has one unambiguous occurrence.
 */
export function createSemanticBoardResolver({ manifest = {}, board = {} } = {}) {
  const nodes = values(board.nodes).filter(
    (node) => !node.elide && node.prominence !== "hidden" && node.treatment !== "hidden",
  );
  const exactIndex = new Map();
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const representationIndex = new Map();

  for (const node of nodes) {
    for (const ref of semanticRefsForNode(node)) {
      if (!ref.startsWith("representations.")) indexPush(exactIndex, ref, node.id);
    }
    const rep = node.rep_ref || node.repRef;
    if (rep) indexPush(representationIndex, bareRef(rep, "representations"), node.id);
  }

  const interfaces = valueSiteInterfaces(manifest);

  function exact(ref) {
    return exactIndex.get(ref) || [];
  }

  function interfaceFor(ref) {
    const id = bareRef(ref, "value_sites");
    return interfaces.get(ref) || interfaces.get(id) || null;
  }

  function boundaryNodeIds(ref) {
    const site = interfaceFor(ref);
    if (!site) return [];
    const refs = [
      ...values(site.producerRefs || site.producer_refs),
      ...values(site.consumerRefs || site.consumer_refs),
    ];
    return compactUnique(refs.flatMap((candidate) => exact(candidate)));
  }

  function resolve(refs) {
    const requestedRefs = compactUnique(values(refs));
    const exactNodeIds = compactUnique(requestedRefs.flatMap((ref) => exact(ref)));
    if (exactNodeIds.length) {
      return { nodeIds: exactNodeIds, requestedRefs, resolution: "exact", message: null };
    }

    const boundaryIds = compactUnique(
      requestedRefs
        .filter((ref) => ref.startsWith("value_sites."))
        .flatMap((ref) => boundaryNodeIds(ref)),
    );
    if (boundaryIds.length) {
      return {
        nodeIds: boundaryIds,
        requestedRefs,
        resolution: "boundary",
        message: "This value is outside the current board, so its nearest visible producer or consumer is highlighted.",
      };
    }

    const representationIds = compactUnique(requestedRefs.flatMap((ref) => {
      if (!ref.startsWith("representations.")) return [];
      const matches = representationIndex.get(bareRef(ref, "representations")) || [];
      return matches.length === 1 ? matches : [];
    }));
    if (representationIds.length) {
      return {
        nodeIds: representationIds,
        requestedRefs,
        resolution: "representation",
        message: "The canonical representation has one visible occurrence on this board.",
      };
    }

    return {
      nodeIds: [],
      requestedRefs,
      resolution: "unavailable",
      message: "This fact is not visible at the current board level. Open a related detail board to follow it.",
    };
  }

  return { board, nodesById, exactIndex, resolve };
}

function validOccurrence(code, binding, occurrence) {
  const start = Number(occurrence?.start);
  const end = Number(occurrence?.end);
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
  if (start < 0 || end <= start || end > code.length) return null;
  const lexeme = String(binding.lexeme || "");
  if (lexeme && code.slice(start, end) !== lexeme) return null;
  return { start, end };
}

/** Split exact source text into plain and semantic spans without reparsing it. */
export function semanticCodeSegments(codeValue, bindings = []) {
  const code = String(codeValue || "");
  const occurrences = [];
  values(bindings).forEach((binding, bindingIndex) => {
    values(binding.occurrences).forEach((occurrence) => {
      const valid = validOccurrence(code, binding, occurrence);
      if (valid) occurrences.push({ ...valid, binding, bindingIndex });
    });
  });
  occurrences.sort((left, right) => left.start - right.start || right.end - left.end);

  const segments = [];
  let cursor = 0;
  for (const occurrence of occurrences) {
    if (occurrence.start < cursor) continue;
    if (occurrence.start > cursor) {
      segments.push({ text: code.slice(cursor, occurrence.start), binding: null });
    }
    segments.push({
      text: code.slice(occurrence.start, occurrence.end),
      binding: occurrence.binding,
      bindingIndex: occurrence.bindingIndex,
    });
    cursor = occurrence.end;
  }
  if (cursor < code.length || !segments.length) {
    segments.push({ text: code.slice(cursor), binding: null });
  }
  return segments;
}

export function semanticStatementCode(statement = {}) {
  return String(statement.code ?? statement.text ?? "");
}

/**
 * Keep executable-looking pseudocode separate from its explanatory note.
 * New semantic sources author `comment` explicitly. The conservative inline
 * fallback exists only for legacy lines that use the conventional `  # `
 * separator; it does not participate in semantic fact resolution.
 */
export function semanticStatementTextParts(statement = {}) {
  const source = semanticStatementCode(statement);
  const authoredComment = String(statement.comment || "").trim();
  if (authoredComment) return { code: source.trimEnd(), comment: authoredComment };

  const marker = source.match(/\s{2,}#\s*/);
  if (!marker || marker.index === undefined) return { code: source, comment: null };
  return {
    code: source.slice(0, marker.index).trimEnd(),
    comment: source.slice(marker.index + marker[0].length).trim() || null,
  };
}

export function semanticStatementBindings(statement = {}) {
  return values(statement.codeBindings || statement.code_bindings);
}

function relationRefsForSemanticEdge(edge = {}) {
  const path = edge.relation_path || edge.relationPath;
  if (Array.isArray(path) && path.length) return path;
  const direct = edge.relation_ref || edge.relationRef;
  if (direct) return [direct];
  return values(edge.segments).flatMap((segment) => relationRefsForSemanticEdge(segment));
}

export function semanticEdgeForRefs(edges = [], refs = []) {
  const requested = new Set(values(refs));
  return values(edges).find((edge) =>
    relationRefsForSemanticEdge(edge).some((ref) => requested.has(ref)),
  ) || null;
}
