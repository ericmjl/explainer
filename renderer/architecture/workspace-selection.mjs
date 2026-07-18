import {
  canonicalNodeRef,
  edgeRelationPath,
} from "./question-context.mjs";

export function edgeSelectionKey(edge) {
  const relationPath = edgeRelationPath(edge);
  return relationPath.length
    ? relationPath.join(">")
    : edge.id || `${edge.from}->${edge.to}`;
}

export function createWorkspaceSelection(target, boardId) {
  if (target?.kind === "node") {
    return {
      kind: "node",
      boardId,
      occurrenceId: target.node.id,
      canonicalRef: canonicalNodeRef(target.node),
      node: target.node,
    };
  }
  if (target?.kind === "edge") {
    return {
      kind: "edge",
      boardId,
      edgeId: edgeSelectionKey(target.edge),
      relationPath: edgeRelationPath(target.edge),
      edge: target.edge,
    };
  }
  return null;
}

export function targetFromSelection(selection) {
  if (selection?.kind === "node") return { kind: "node", node: selection.node };
  if (selection?.kind === "edge") return { kind: "edge", edge: selection.edge };
  return null;
}

export function selectionMatchesEdge(selection, boardId, edge) {
  return selection?.kind === "edge"
    && selection.boardId === boardId
    && selection.edgeId === edgeSelectionKey(edge);
}

export function selectionMessageProjection(selection) {
  if (selection?.kind === "node") {
    return {
      kind: "node",
      boardId: selection.boardId,
      occurrenceId: selection.occurrenceId,
      canonicalRef: selection.canonicalRef,
    };
  }
  if (selection?.kind === "edge") {
    return {
      kind: "edge",
      boardId: selection.boardId,
      edgeId: selection.edgeId,
      relationPath: selection.relationPath,
    };
  }
  return null;
}
