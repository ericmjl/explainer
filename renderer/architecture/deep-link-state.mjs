export const DEEP_LINK_PARAMS = Object.freeze({
  board: "board",
  node: "node",
});

function collectionValues(collection) {
  if (collection instanceof Map) return [...collection.values()];
  if (Array.isArray(collection)) return collection;
  if (collection?.items) return collectionValues(collection.items);
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function nodesFor(board) {
  return collectionValues(board?.nodes);
}

function visibleNode(node) {
  return Boolean(node)
    && !node.elide
    && node.prominence !== "hidden"
    && node.treatment !== "hidden";
}

function boardRefFor(node) {
  const explicit = node?.board_ref || node?.boardRef;
  if (explicit) return String(explicit);
  if (!node?.expandable) return null;
  return String(node.module_ref || node.moduleRef || node.id || "") || null;
}

function boardIndex(boards) {
  return new Map(
    collectionValues(boards)
      .filter((board) => board?.id)
      .map((board) => [String(board.id), board]),
  );
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

export function parseDeepLink(search = "") {
  const params = searchParams(search);
  const issues = [];
  const board = readOwnedParam(params, DEEP_LINK_PARAMS.board, issues);
  const node = readOwnedParam(params, DEEP_LINK_PARAMS.node, issues);
  return {
    boardId: board.value,
    nodeId: node.value,
    hasBoard: board.present,
    hasNode: node.present,
    issues,
  };
}

// Board URLs name only the terminal board. Breadcrumbs and return-focus
// origins are recovered from stable board_ref occurrences, keeping links
// compact and preventing a serialized path from going stale after a reflow.
export function reconstructBoardPath({ boards, rootBoardId, targetBoardId }) {
  const boardsById = boardIndex(boards);
  const rootId = String(rootBoardId || "");
  const targetId = String(targetBoardId || rootId);
  if (!rootId || !boardsById.has(rootId) || !boardsById.has(targetId)) return null;
  if (targetId === rootId) {
    return { boardStack: [rootId], boardOrigins: [null] };
  }

  const queue = [{ boardStack: [rootId], boardOrigins: [null] }];
  const visited = new Set([rootId]);
  while (queue.length) {
    const path = queue.shift();
    const parentId = path.boardStack.at(-1);
    const parent = boardsById.get(parentId);
    const children = nodesFor(parent)
      .filter(visibleNode)
      .map((node) => ({
        boardId: boardRefFor(node),
        originNodeId: node.id ? String(node.id) : null,
      }))
      .filter(({ boardId, originNodeId }) => (
        boardId && originNodeId && boardsById.has(boardId)
      ))
      .sort((left, right) => (
        `${left.boardId}\u0000${left.originNodeId}`
          .localeCompare(`${right.boardId}\u0000${right.originNodeId}`)
      ));

    for (const child of children) {
      if (visited.has(child.boardId)) continue;
      visited.add(child.boardId);
      const next = {
        boardStack: [...path.boardStack, child.boardId],
        boardOrigins: [...path.boardOrigins, child.originNodeId],
      };
      if (child.boardId === targetId) return next;
      queue.push(next);
    }
  }
  return null;
}

export function writeDeepLink(
  search = "",
  { rootBoardId = null, boardId = null, nodeId = null } = {},
) {
  const params = searchParams(search);
  const resolvedBoardId = String(boardId || "").trim();
  const rootId = String(rootBoardId || "").trim();
  const resolvedNodeId = String(nodeId || "").trim();

  if (resolvedBoardId && resolvedBoardId !== rootId) {
    params.set(DEEP_LINK_PARAMS.board, resolvedBoardId);
  } else {
    params.delete(DEEP_LINK_PARAMS.board);
  }
  if (resolvedNodeId) {
    params.set(DEEP_LINK_PARAMS.node, resolvedNodeId);
  } else {
    params.delete(DEEP_LINK_PARAMS.node);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function ownedParamValues(search) {
  const params = searchParams(search);
  return [
    params.getAll(DEEP_LINK_PARAMS.board),
    params.getAll(DEEP_LINK_PARAMS.node),
  ];
}

export function resolveDeepLink({ boards, rootBoardId, search = "" }) {
  const boardsById = boardIndex(boards);
  const rootId = String(rootBoardId || "");
  const parsed = parseDeepLink(search);
  const issues = [...parsed.issues];
  const rootBoard = boardsById.get(rootId) || null;

  if (!rootBoard) {
    issues.push({ code: "missing_root_board", param: "board", value: rootId });
    const canonicalSearch = writeDeepLink(search);
    return {
      requested: { boardId: parsed.boardId, nodeId: parsed.nodeId },
      boardId: null,
      nodeId: null,
      boardStack: [],
      boardOrigins: [],
      selectedNode: null,
      issues,
      sanitized: true,
      canonicalSearch,
    };
  }

  let path = { boardStack: [rootId], boardOrigins: [null] };
  let requestedBoardValid = !parsed.hasBoard;
  if (parsed.hasBoard && parsed.boardId) {
    if (parsed.boardId === rootId) {
      requestedBoardValid = true;
      issues.push({
        code: "redundant_root_board",
        param: DEEP_LINK_PARAMS.board,
        value: parsed.boardId,
      });
    } else if (!boardsById.has(parsed.boardId)) {
      issues.push({
        code: "unknown_board",
        param: DEEP_LINK_PARAMS.board,
        value: parsed.boardId,
      });
    } else {
      const reconstructed = reconstructBoardPath({
        boards: boardsById,
        rootBoardId: rootId,
        targetBoardId: parsed.boardId,
      });
      if (reconstructed) {
        path = reconstructed;
        requestedBoardValid = true;
      } else {
        issues.push({
          code: "unreachable_board",
          param: DEEP_LINK_PARAMS.board,
          value: parsed.boardId,
        });
      }
    }
  }

  const resolvedBoardId = path.boardStack.at(-1);
  const resolvedBoard = boardsById.get(resolvedBoardId);
  let selectedNode = null;
  if (parsed.hasNode && parsed.nodeId) {
    if (!requestedBoardValid) {
      issues.push({
        code: "discarded_node_for_invalid_board",
        param: DEEP_LINK_PARAMS.node,
        value: parsed.nodeId,
      });
    } else {
      selectedNode = nodesFor(resolvedBoard).find(
        (node) => visibleNode(node) && String(node.id) === parsed.nodeId,
      ) || null;
      if (!selectedNode) {
        issues.push({
          code: "unknown_node",
          param: DEEP_LINK_PARAMS.node,
          value: parsed.nodeId,
        });
      }
    }
  }

  const canonicalSearch = writeDeepLink(search, {
    rootBoardId: rootId,
    boardId: resolvedBoardId,
    nodeId: selectedNode?.id,
  });
  const sanitized = issues.length > 0
    || JSON.stringify(ownedParamValues(search)) !== JSON.stringify(ownedParamValues(canonicalSearch));
  return {
    requested: { boardId: parsed.boardId, nodeId: parsed.nodeId },
    boardId: resolvedBoardId,
    nodeId: selectedNode?.id || null,
    boardStack: path.boardStack,
    boardOrigins: path.boardOrigins,
    selectedNode,
    issues,
    sanitized,
    canonicalSearch,
  };
}

// Board changes deserve browser-history entries so Back follows semantic zoom.
// Selection changes replace the current entry, keeping exploratory clicks from
// flooding history while still leaving the address bar shareable.
export function deepLinkHistoryMode(previous, next) {
  const previousBoardId = previous?.boardId || previous?.boardStack?.at?.(-1) || null;
  const nextBoardId = next?.boardId || next?.boardStack?.at?.(-1) || null;
  const previousNodeId = previous?.nodeId || null;
  const nextNodeId = next?.nodeId || null;
  if (previousBoardId === nextBoardId && previousNodeId === nextNodeId) return "none";
  if (!previousBoardId) return "replace";
  return previousBoardId === nextBoardId ? "replace" : "push";
}
