export function edgeMatchForPath(relationPath) {
  if (!Array.isArray(relationPath) || relationPath.length === 0) return null;
  return relationPath.length === 1
    ? { relation_ref: relationPath[0] }
    : { relation_path: [...relationPath] };
}

export function matchesPath(match, relationPath) {
  if (match?.relation_ref) return relationPath.length === 1 && match.relation_ref === relationPath[0];
  return Array.isArray(match?.relation_path)
    && match.relation_path.length === relationPath.length
    && match.relation_path.every((ref, index) => ref === relationPath[index]);
}

export function buildNodeReviewOperations({
  selection,
  board,
  occurrence,
  module,
  scope,
  nextRole,
  decision = "visible",
  reason = "",
}) {
  const operations = [];
  const globalRole = module?.role || "";
  const localRole = occurrence.role || "";
  const beforeRole = scope === "global" ? globalRole : localRole;
  const normalizedRole = String(nextRole || "").trim();
  if (normalizedRole && normalizedRole !== beforeRole) {
    if (scope === "global") {
      if (!module || !selection.canonicalRef?.startsWith("modules.")) {
        throw new Error("Only modules have an everywhere explanation.");
      }
      operations.push({
        op: "update_entity",
        ref: selection.canonicalRef,
        ...(globalRole ? { expect: { role: globalRole } } : {}),
        set: { role: normalizedRole },
      });
    } else {
      operations.push({
        op: "update_view_entity",
        ref: `boards.${board.id}.nodes.${occurrence.id}`,
        ...(localRole ? { expect: { role: localRole } } : {}),
        set: { role: normalizedRole },
      });
    }
  }
  if (decision !== "visible") {
    const normalizedReason = String(reason || "").trim();
    if (decision === "excluded" && !normalizedReason) {
      throw new Error("Explain why this component is outside the board before staging it.");
    }
    operations.push({
      op: "set_board_visibility",
      board_id: board.id,
      occurrence_id: occurrence.id,
      ref: occurrence.ref,
      decision,
      ...(normalizedReason ? { reason: normalizedReason } : {}),
    });
  }
  return operations;
}

export function buildEdgeReviewOperation({ boardId, relationPath, remove = false, label, connection }) {
  const match = edgeMatchForPath(relationPath);
  if (!match) throw new Error("This arrow has no canonical relation provenance.");
  if (remove) return { op: "set_edge_override", board_id: boardId, match, remove: true };
  return {
    op: "set_edge_override",
    board_id: boardId,
    match,
    set: {
      label: String(label || "").trim(),
      connection: {
        title: String(connection?.title || "").trim(),
        role: String(connection?.role || "").trim(),
        inside: String(connection?.inside || "").trim(),
      },
    },
  };
}

export function operationKey(operation) {
  if (operation.op === "update_entity" || operation.op === "update_view_entity") {
    return `${operation.op}:${operation.ref}`;
  }
  if (operation.op === "set_edge_override") {
    return `${operation.op}:${operation.board_id}:${JSON.stringify(operation.match)}`;
  }
  if (operation.op === "set_board_visibility") {
    return `${operation.op}:${operation.board_id}:${operation.occurrence_id}`;
  }
  return JSON.stringify(operation);
}

export function operationLabel(operation) {
  if (operation.op === "update_entity") return ["Clarify component everywhere", operation.ref];
  if (operation.op === "update_view_entity") return ["Clarify this board occurrence", operation.ref];
  if (operation.op === "set_edge_override") {
    return [operation.remove ? "Remove connection override" : "Clarify connection", operation.board_id];
  }
  if (operation.op === "set_board_visibility") {
    return [operation.decision === "elided" ? "Collapse pass-through step" : "Exclude from board", operation.ref];
  }
  return [String(operation.op || "operation").replaceAll("_", " "), "typed edit operation"];
}

export function createReviewPlan({ sourceSet, intent, operations, timestamp = Date.now() }) {
  return {
    schema_version: "architecture-edit-v0.2",
    id: `review_${sourceSet}_${Math.floor(timestamp / 1000)}`,
    target: { source_set: sourceSet },
    intent: String(intent || "").trim() || "Clarify the architecture after human review.",
    operations,
  };
}
