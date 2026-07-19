import { resolveDeepLink } from "./deep-link-state.mjs";

export const COMPARISON_LINK_PARAMS = Object.freeze({
  primaryArchitecture: "arch",
  primaryBoard: "board",
  primaryNode: "node",
  comparisonArchitecture: "compare_arch",
  comparisonBoard: "compare_board",
  comparisonNode: "compare_node",
});

function collectionValues(collection) {
  if (collection instanceof Map) return [...collection.values()];
  if (Array.isArray(collection)) return collection;
  if (collection?.items) return collectionValues(collection.items);
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function searchParams(search) {
  if (search instanceof URLSearchParams) return new URLSearchParams(search);
  return new URLSearchParams(String(search || "").replace(/^\?/, ""));
}

function readOwnedParam(params, name, issues) {
  const values = params.getAll(name);
  if (values.length > 1) {
    issues.push({ code: `duplicate_${name}`, param: name, value: values[0] });
  }
  if (!values.length) return { present: false, value: null };

  const raw = String(values[0]);
  const value = raw.trim();
  if (!value) {
    issues.push({ code: `empty_${name}`, param: name, value: raw });
    return { present: true, value: null };
  }
  if (value !== raw) {
    issues.push({ code: `normalized_${name}`, param: name, value: raw });
  }
  return { present: true, value };
}

function architectureDescriptor(entry) {
  const manifest = entry?.manifest || entry;
  const architectureId = entry?.id
    || entry?.architectureId
    || manifest?.architecture?.id;
  const boardCollection = entry?.boards || manifest?.boards;
  const boards = boardCollection?.items || boardCollection;
  const rootBoardId = entry?.rootBoardId
    || entry?.root_board_id
    || entry?.rootBoard
    || entry?.root_board
    || boardCollection?.rootBoard
    || boardCollection?.root_board;
  if (!architectureId) return null;
  return {
    architectureId: String(architectureId),
    rootBoardId: rootBoardId ? String(rootBoardId) : null,
    boards,
    source: entry,
  };
}

function architectureIndex(architectures) {
  return new Map(
    collectionValues(architectures)
      .map(architectureDescriptor)
      .filter(Boolean)
      .map((entry) => [entry.architectureId, entry]),
  );
}

function sideParam(side, param) {
  if (side === "comparison") return `compare_${param}`;
  return param === "architecture" ? "arch" : param;
}

function mapDeepLinkIssue(issue, side) {
  if (side === "primary") return issue;
  const param = sideParam(side, issue.param);
  return {
    ...issue,
    code: issue.code
      .split("_")
      .map((part) => (part === "board" || part === "node" ? `compare_${part}` : part))
      .join("_"),
    param,
  };
}

function resolveSide({ descriptor, boardId, nodeId, side }) {
  const params = new URLSearchParams();
  if (boardId) params.set("board", boardId);
  if (nodeId) params.set("node", nodeId);
  const resolved = resolveDeepLink({
    boards: descriptor.boards,
    rootBoardId: descriptor.rootBoardId,
    search: params,
  });
  return {
    architectureId: descriptor.architectureId,
    rootBoardId: descriptor.rootBoardId,
    boardId: resolved.boardId,
    nodeId: resolved.nodeId,
    boardStack: resolved.boardStack,
    boardOrigins: resolved.boardOrigins,
    selectedNode: resolved.selectedNode,
    source: descriptor.source,
    issues: resolved.issues.map((issue) => mapDeepLinkIssue(issue, side)),
  };
}

function value(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function chosenSelectionSide(primaryNodeId, comparisonNodeId, requestedSide) {
  if (requestedSide === "primary" && primaryNodeId) return "primary";
  if (requestedSide === "comparison" && comparisonNodeId) return "comparison";
  if (primaryNodeId) return "primary";
  if (comparisonNodeId) return "comparison";
  return null;
}

function setOrDelete(params, name, nextValue) {
  if (nextValue) params.set(name, nextValue);
  else params.delete(name);
}

function ownedParamValues(search) {
  const params = searchParams(search);
  return Object.values(COMPARISON_LINK_PARAMS).map((name) => params.getAll(name));
}

export function parseComparisonLink(search = "") {
  const params = searchParams(search);
  const issues = [];
  const primaryArchitecture = readOwnedParam(
    params,
    COMPARISON_LINK_PARAMS.primaryArchitecture,
    issues,
  );
  const primaryBoard = readOwnedParam(params, COMPARISON_LINK_PARAMS.primaryBoard, issues);
  const primaryNode = readOwnedParam(params, COMPARISON_LINK_PARAMS.primaryNode, issues);
  const comparisonArchitecture = readOwnedParam(
    params,
    COMPARISON_LINK_PARAMS.comparisonArchitecture,
    issues,
  );
  const comparisonBoard = readOwnedParam(
    params,
    COMPARISON_LINK_PARAMS.comparisonBoard,
    issues,
  );
  const comparisonNode = readOwnedParam(
    params,
    COMPARISON_LINK_PARAMS.comparisonNode,
    issues,
  );

  return {
    primary: {
      architectureId: primaryArchitecture.value,
      boardId: primaryBoard.value,
      nodeId: primaryNode.value,
      hasArchitecture: primaryArchitecture.present,
      hasBoard: primaryBoard.present,
      hasNode: primaryNode.present,
    },
    comparison: {
      architectureId: comparisonArchitecture.value,
      boardId: comparisonBoard.value,
      nodeId: comparisonNode.value,
      hasArchitecture: comparisonArchitecture.present,
      hasBoard: comparisonBoard.present,
      hasNode: comparisonNode.present,
    },
    issues,
  };
}

// Comparison state owns only its six URL parameters. Layout, theme, review,
// and future renderer parameters survive every write unchanged.
export function writeComparisonLink(
  search = "",
  {
    defaultArchitectureId = null,
    primary = {},
    comparison = null,
    selectionSide,
  } = {},
) {
  const params = searchParams(search);
  const primaryArchitectureId = value(primary.architectureId);
  const defaultId = value(defaultArchitectureId);
  const primaryBoardId = value(primary.boardId);
  const primaryRootBoardId = value(primary.rootBoardId);
  const comparisonArchitectureId = value(comparison?.architectureId);
  const comparisonBoardId = value(comparison?.boardId);
  const comparisonRootBoardId = value(comparison?.rootBoardId);
  let primaryNodeId = value(primary.nodeId);
  let comparisonNodeId = value(comparison?.nodeId);
  const selectedSide = chosenSelectionSide(
    primaryNodeId,
    comparisonNodeId,
    selectionSide,
  );

  if (selectedSide !== "primary") primaryNodeId = null;
  if (selectedSide !== "comparison") comparisonNodeId = null;

  setOrDelete(
    params,
    COMPARISON_LINK_PARAMS.primaryArchitecture,
    primaryArchitectureId && primaryArchitectureId !== defaultId
      ? primaryArchitectureId
      : null,
  );
  setOrDelete(
    params,
    COMPARISON_LINK_PARAMS.primaryBoard,
    primaryBoardId && primaryBoardId !== primaryRootBoardId ? primaryBoardId : null,
  );
  setOrDelete(params, COMPARISON_LINK_PARAMS.primaryNode, primaryNodeId);

  if (comparisonArchitectureId) {
    params.set(COMPARISON_LINK_PARAMS.comparisonArchitecture, comparisonArchitectureId);
    setOrDelete(
      params,
      COMPARISON_LINK_PARAMS.comparisonBoard,
      comparisonBoardId && comparisonBoardId !== comparisonRootBoardId
        ? comparisonBoardId
        : null,
    );
    setOrDelete(params, COMPARISON_LINK_PARAMS.comparisonNode, comparisonNodeId);
  } else {
    params.delete(COMPARISON_LINK_PARAMS.comparisonArchitecture);
    params.delete(COMPARISON_LINK_PARAMS.comparisonBoard);
    params.delete(COMPARISON_LINK_PARAMS.comparisonNode);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function resolveComparisonState({
  architectures,
  defaultArchitectureId,
  search = "",
}) {
  const parsed = parseComparisonLink(search);
  const issues = [...parsed.issues];
  const byId = architectureIndex(architectures);
  const defaultId = value(defaultArchitectureId) || byId.keys().next().value || null;
  let primaryArchitectureId = parsed.primary.architectureId || defaultId;
  let primaryDescriptor = byId.get(primaryArchitectureId) || null;

  if (!primaryDescriptor) {
    if (parsed.primary.architectureId) {
      issues.push({
        code: "unknown_arch",
        param: COMPARISON_LINK_PARAMS.primaryArchitecture,
        value: parsed.primary.architectureId,
      });
    }
    primaryArchitectureId = defaultId;
    primaryDescriptor = byId.get(primaryArchitectureId) || null;
  }

  let primary = null;
  if (primaryDescriptor?.rootBoardId) {
    primary = resolveSide({
      descriptor: primaryDescriptor,
      boardId: parsed.primary.boardId,
      nodeId: parsed.primary.nodeId,
      side: "primary",
    });
    issues.push(...primary.issues);
  } else {
    issues.push({
      code: "missing_primary_architecture",
      param: COMPARISON_LINK_PARAMS.primaryArchitecture,
      value: primaryArchitectureId,
    });
  }

  let comparison = null;
  if (!parsed.comparison.architectureId) {
    if (parsed.comparison.hasBoard) {
      issues.push({
        code: "orphan_compare_board",
        param: COMPARISON_LINK_PARAMS.comparisonBoard,
        value: parsed.comparison.boardId,
      });
    }
    if (parsed.comparison.hasNode) {
      issues.push({
        code: "orphan_compare_node",
        param: COMPARISON_LINK_PARAMS.comparisonNode,
        value: parsed.comparison.nodeId,
      });
    }
  } else {
    const comparisonDescriptor = byId.get(parsed.comparison.architectureId) || null;
    if (!comparisonDescriptor) {
      issues.push({
        code: "unknown_compare_arch",
        param: COMPARISON_LINK_PARAMS.comparisonArchitecture,
        value: parsed.comparison.architectureId,
      });
    } else if (!comparisonDescriptor.rootBoardId) {
      issues.push({
        code: "missing_compare_root_board",
        param: COMPARISON_LINK_PARAMS.comparisonArchitecture,
        value: parsed.comparison.architectureId,
      });
    } else {
      comparison = resolveSide({
        descriptor: comparisonDescriptor,
        boardId: parsed.comparison.boardId,
        nodeId: parsed.comparison.nodeId,
        side: "comparison",
      });
      issues.push(...comparison.issues);
    }
  }

  let selectionSide = null;
  if (primary?.nodeId && comparison?.nodeId) {
    // A URL can carry one active inspector selection. Prefer the primary side
    // for malformed legacy/manual links and discard only the counterpart node.
    issues.push({
      code: "multiple_selected_sides",
      param: COMPARISON_LINK_PARAMS.comparisonNode,
      value: comparison.nodeId,
    });
    comparison = { ...comparison, nodeId: null, selectedNode: null };
    selectionSide = "primary";
  } else if (primary?.nodeId) {
    selectionSide = "primary";
  } else if (comparison?.nodeId) {
    selectionSide = "comparison";
  }

  const canonicalSearch = writeComparisonLink(search, {
    defaultArchitectureId: defaultId,
    primary,
    comparison,
    selectionSide,
  });
  const sanitized = issues.length > 0
    || JSON.stringify(ownedParamValues(search))
      !== JSON.stringify(ownedParamValues(canonicalSearch));

  return {
    requested: {
      primary: {
        architectureId: parsed.primary.architectureId,
        boardId: parsed.primary.boardId,
        nodeId: parsed.primary.nodeId,
      },
      comparison: {
        architectureId: parsed.comparison.architectureId,
        boardId: parsed.comparison.boardId,
        nodeId: parsed.comparison.nodeId,
      },
    },
    primary,
    comparison,
    selectionSide,
    issues,
    sanitized,
    canonicalSearch,
  };
}

// Selecting in one board clears the other board's inspector target while
// leaving both semantic locations intact.
export function setComparisonSelection(
  state,
  { side, nodeId = null, selectedNode = null } = {},
) {
  if (side !== "primary" && side !== "comparison") {
    throw new TypeError("comparison selection side must be primary or comparison");
  }
  if (side === "comparison" && !state?.comparison) {
    throw new TypeError("cannot select a node without a comparison board");
  }
  const selectedNodeId = value(nodeId || selectedNode?.id);
  return {
    ...state,
    primary: state?.primary
      ? {
        ...state.primary,
        nodeId: side === "primary" ? selectedNodeId : null,
        selectedNode: side === "primary" && selectedNodeId ? selectedNode : null,
      }
      : null,
    comparison: state?.comparison
      ? {
        ...state.comparison,
        nodeId: side === "comparison" ? selectedNodeId : null,
        selectedNode: side === "comparison" && selectedNodeId ? selectedNode : null,
      }
      : null,
    selectionSide: selectedNodeId ? side : null,
  };
}

// Opening, closing, or navigating either semantic board is history-worthy;
// moving the shared inspector selection only replaces the current entry.
export function comparisonHistoryMode(previous, next) {
  if (!previous) return "replace";
  const location = (state) => [
    state?.primary?.architectureId || null,
    state?.primary?.boardId || null,
    state?.comparison?.architectureId || null,
    state?.comparison?.boardId || null,
  ];
  const selection = (state) => [
    state?.selectionSide || null,
    state?.primary?.nodeId || null,
    state?.comparison?.nodeId || null,
  ];
  if (JSON.stringify(location(previous)) !== JSON.stringify(location(next))) return "push";
  if (JSON.stringify(selection(previous)) !== JSON.stringify(selection(next))) return "replace";
  return "none";
}
