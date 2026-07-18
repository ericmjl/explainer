import {
  buildEdgeReviewOperation,
  buildNodeReviewOperations,
  createReviewPlan,
  edgeMatchForPath,
  matchesPath,
  operationKey,
  operationLabel,
} from "./review-model.mjs";
import {
  refreshAudienceUrl,
  rootAudienceUrl,
  shareableAudienceUrl,
} from "./audience-location.mjs";

const elements = {
  sourceSetSelect: document.getElementById("sourceSetSelect"),
  audienceLink: document.getElementById("audienceLink"),
  audienceFrame: document.getElementById("audienceFrame"),
  workspace: document.querySelector(".review-workspace"),
  canvasPanel: document.querySelector(".review-canvas-panel"),
  inspector: document.querySelector(".review-inspector"),
  selectionPanel: document.getElementById("selectionPanel"),
  pendingPanel: document.querySelector(".pending-panel"),
  pendingCount: document.getElementById("pendingCount"),
  pendingList: document.getElementById("pendingList"),
  clearPending: document.getElementById("clearPending"),
  intentInput: document.getElementById("intentInput"),
  previewChanges: document.getElementById("previewChanges"),
  applyChanges: document.getElementById("applyChanges"),
  reviewStatus: document.getElementById("reviewStatus"),
  previewDetails: document.getElementById("previewDetails"),
  previewReport: document.getElementById("previewReport"),
};

const state = {
  token: null,
  sourceSet: null,
  snapshot: null,
  selection: null,
  staged: [],
  preparedPlan: null,
  transactionId: null,
  transactionRevision: 0,
  previewController: null,
  loadController: null,
  loadRevision: 0,
  busyAction: null,
  busy: false,
};

const BUTTON_LABELS = {
  preview: "Preview & validate",
  apply: "Apply to sources",
};
const audienceBaseUrl = new URL("../renderer/architecture/", window.location.href).href;
let busySpinnerTimer = null;

async function boot() {
  try {
    const session = await fetchJson("../api/review/source-sets");
    state.token = session.session_token;
    const requested = new URLSearchParams(window.location.search).get("arch");
    for (const sourceSet of session.source_sets) {
      const option = document.createElement("option");
      option.value = sourceSet.id;
      option.textContent = sourceSet.label;
      elements.sourceSetSelect.appendChild(option);
    }
    const defaultSource = session.source_sets.find((item) => item.id === requested)
      || session.source_sets.find((item) => item.directory_role === "architecture")
      || session.source_sets[0];
    if (!defaultSource) throw new Error("No registered architecture source sets were found.");
    elements.sourceSetSelect.value = defaultSource.id;
    await loadSourceSet(defaultSource.id);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function loadSourceSet(id) {
  const loadRevision = ++state.loadRevision;
  state.loadController?.abort();
  state.loadController = new AbortController();
  invalidateTransaction({ abortPreview: true });
  state.sourceSet = id;
  state.snapshot = null;
  state.selection = null;
  state.staged = [];
  setBusy(true, "Loading canonical sources…", "load");
  const frameLoaded = waitForAudienceFrame();
  const audienceUrl = rootAudienceUrl(audienceBaseUrl, id);
  elements.audienceFrame.src = audienceUrl;
  elements.audienceLink.href = audienceUrl;
  renderEmptySelection();
  renderPending();
  try {
    const [snapshot] = await Promise.all([
      fetchJson(
        `../api/review/source-set?id=${encodeURIComponent(id)}`,
        { signal: state.loadController.signal },
      ),
      frameLoaded,
    ]);
    if (loadRevision !== state.loadRevision) return;
    state.snapshot = snapshot;
    const params = new URLSearchParams(window.location.search);
    params.set("arch", id);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
    setStatus("Select a block or arrow in the published view.");
  } catch (error) {
    if (error.name !== "AbortError" && loadRevision === state.loadRevision) {
      setStatus(error.message, "error");
    }
  } finally {
    if (loadRevision === state.loadRevision) {
      state.loadController = null;
      setBusy(false);
    }
  }
}

function currentAudienceFrameUrl() {
  try {
    const url = new URL(elements.audienceFrame.contentWindow.location.href);
    if (url.origin === window.location.origin) return url.href;
  } catch {
    // The frame is same-origin in the review workspace. Fall back to its src
    // during a navigation handoff or if a browser temporarily blocks access.
  }
  return elements.audienceFrame.src || rootAudienceUrl(audienceBaseUrl, state.sourceSet);
}

function syncAudienceLinkFromFrame(url = null) {
  if (!state.sourceSet) return;
  elements.audienceLink.href = shareableAudienceUrl(url || currentAudienceFrameUrl(), {
    baseUrl: audienceBaseUrl,
    sourceSet: state.sourceSet,
  });
}

function waitForAudienceFrame() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      elements.audienceFrame.removeEventListener("load", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, 10_000);
    elements.audienceFrame.addEventListener("load", finish, { once: true });
  });
}

function onArchitectureSelection(event) {
  if (event.origin !== window.location.origin || event.source !== elements.audienceFrame.contentWindow) return;
  if (event.data?.type !== "architecture-selection-change") return;
  if (event.data.sourceSet !== state.sourceSet) return;
  syncAudienceLinkFromFrame();
  state.selection = event.data.selection;
  if (!state.snapshot) return;
  if (state.selection) renderSelection();
  else renderEmptySelection();
}

function renderEmptySelection() {
  elements.selectionPanel.innerHTML = `
    <div class="review-empty-state">
      <span aria-hidden="true">↖</span>
      <h2>Choose something in the diagram</h2>
      <p>Select a component to clarify its explanation, or an arrow to edit how the connection is described.</p>
    </div>
  `;
}

function renderSelection() {
  if (state.selection.kind === "node") renderNodeEditor(state.selection);
  else renderEdgeEditor(state.selection);
}

function renderNodeEditor(selection) {
  const board = boardById(selection.boardId);
  const occurrence = board?.nodes?.find((node) => node.id === selection.occurrenceId);
  if (!board || !occurrence) {
    renderSelectionError("This occurrence is no longer present in the canonical board.");
    return;
  }
  const module = selection.canonicalRef?.startsWith("modules.")
    ? moduleByRef(selection.canonicalRef)
    : null;
  const label = occurrence.label || module?.label || humanize(selection.canonicalRef || occurrence.id);
  const evidence = module?.evidence?.status?.replaceAll("_", " ") || "view presentation";
  const globalRole = module?.role || "";
  const localRole = occurrence.role || "";
  const canSimplify = !occurrence.board_ref;
  elements.selectionPanel.innerHTML = `
    <div class="review-target-heading">
      <div>
        <p class="eyebrow">Component · ${escapeHtml(board.title)}</p>
        <h2>${escapeHtml(label)}</h2>
        <code class="review-ref" title="${escapeHtml(selection.canonicalRef)}">${escapeHtml(selection.canonicalRef)}</code>
      </div>
      <span class="review-evidence">${escapeHtml(evidence)}</span>
    </div>
    <form id="nodeReviewForm" class="review-form">
      ${module ? `
        <label for="descriptionScope">
          Explanation scope
          <select id="descriptionScope">
            <option value="global">Everywhere this component appears</option>
            <option value="board">Only on this board</option>
          </select>
          <small>Names remain code-derived. Only the human-facing explanation changes.</small>
        </label>
      ` : `<input id="descriptionScope" type="hidden" value="board" />`}
      <label for="componentDescription">
        Published explanation
        <textarea id="componentDescription" required>${escapeHtml(module ? globalRole : localRole)}</textarea>
        <small id="descriptionScopeNote">${module
          ? "This edits the canonical module role and updates every board that uses it."
          : "This is a board-specific explanation for this value occurrence."}</small>
      </label>
      <fieldset>
        <legend>Simplify this board</legend>
        <label for="visibilityDecision">
          Presentation
          <select id="visibilityDecision" ${canSimplify ? "" : "disabled"}>
            <option value="visible">Keep this component visible</option>
            <option value="elided">Collapse this pass-through step into the flow</option>
            <option value="excluded">Remove it from this board’s explanation</option>
          </select>
          <small>${canSimplify
            ? "Collapse and remove are checked against the canonical flow before anything is written."
            : "This component owns a drill-down board, so it cannot be removed here without redesigning navigation."}</small>
        </label>
        <label id="exclusionReasonField" for="exclusionReason" hidden>
          Why is it outside this board’s scope?
          <textarea id="exclusionReason"></textarea>
        </label>
      </fieldset>
      <button type="submit">Stage component change</button>
    </form>
  `;

  const scope = document.getElementById("descriptionScope");
  const description = document.getElementById("componentDescription");
  const note = document.getElementById("descriptionScopeNote");
  scope?.addEventListener("change", () => {
    const isGlobal = scope.value === "global";
    description.value = isGlobal ? globalRole : localRole;
    note.textContent = isGlobal
      ? "This edits the canonical module role and updates every board that uses it."
      : "This adds or replaces an explanation only for this occurrence.";
  });
  document.getElementById("visibilityDecision")?.addEventListener("change", (event) => {
    document.getElementById("exclusionReasonField").hidden = event.target.value !== "excluded";
  });
  document.getElementById("nodeReviewForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const decision = document.getElementById("visibilityDecision")?.value || "visible";
    let operations;
    try {
      operations = buildNodeReviewOperations({
        selection,
        board,
        occurrence,
        module,
        scope: scope.value,
        nextRole: description.value,
        decision,
        reason: document.getElementById("exclusionReason")?.value,
      });
    } catch (error) {
      setStatus(error.message, "error");
      return;
    }
    if (!operations.length) {
      setStatus("Nothing changed for this component.");
      return;
    }
    operations.forEach(stageOperation);
    setStatus(`Staged ${operations.length} component change${operations.length === 1 ? "" : "s"}.`, "success");
  });
}

function renderEdgeEditor(selection) {
  const board = boardById(selection.boardId);
  const relationPath = selection.relationPath || [];
  if (!board || !relationPath.length) {
    renderSelectionError("This arrow has no canonical relation provenance and cannot be edited safely.");
    return;
  }
  const match = edgeMatchForPath(relationPath);
  const override = (board.edge_overrides || []).find((candidate) => matchesPath(candidate.match, relationPath));
  const connection = override?.connection || {};
  elements.selectionPanel.innerHTML = `
    <div class="review-target-heading">
      <div>
        <p class="eyebrow">Connection · ${escapeHtml(board.title)}</p>
        <h2>${escapeHtml(connection.title || "Architecture connection")}</h2>
        <code class="review-ref" title="${escapeHtml(relationPath.join(" → "))}">${escapeHtml(relationPath.join(" → "))}</code>
      </div>
      <span class="review-evidence">${relationPath.length} relation${relationPath.length === 1 ? "" : "s"}</span>
    </div>
    <form id="edgeReviewForm" class="review-form">
      <label for="edgeLabel">
        Short arrow label
        <input id="edgeLabel" value="${escapeHtml(override?.label || "")}" required />
      </label>
      <label for="edgeTitle">
        Inspector title
        <input id="edgeTitle" value="${escapeHtml(connection.title || "")}" required />
      </label>
      <label for="edgeRole">
        Connection role
        <input id="edgeRole" value="${escapeHtml(connection.role || "")}" required />
      </label>
      <label for="edgeInside">
        How the source is used inside the target
        <textarea id="edgeInside" class="long-copy" required>${escapeHtml(connection.inside || "")}</textarea>
        <small>Describe the use, not merely the fact that an arrow exists.</small>
      </label>
      ${override ? `
        <label>
          <span><input id="removeEdgeOverride" type="checkbox" /> Remove this board-specific explanation</span>
          <small>The canonical relation remains; only this board’s presentation override is removed.</small>
        </label>
      ` : ""}
      <button type="submit">Stage connection change</button>
    </form>
  `;
  document.getElementById("edgeReviewForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const remove = document.getElementById("removeEdgeOverride")?.checked;
    const operation = buildEdgeReviewOperation({
      boardId: board.id,
      relationPath,
      remove,
      label: document.getElementById("edgeLabel").value,
      connection: {
        title: document.getElementById("edgeTitle").value,
        role: document.getElementById("edgeRole").value,
        inside: document.getElementById("edgeInside").value,
      },
    });
    stageOperation(operation);
    setStatus("Staged the board-specific connection explanation.", "success");
  });
}

function renderSelectionError(message) {
  elements.selectionPanel.innerHTML = `
    <div class="review-empty-state">
      <h2>Selection cannot be edited</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function stageOperation(operation) {
  if (state.busy) return;
  const key = operationKey(operation);
  const existing = state.staged.findIndex((candidate) => operationKey(candidate) === key);
  if (existing >= 0) state.staged[existing] = operation;
  else state.staged.push(operation);
  invalidateTransaction({ abortPreview: true });
  renderPending();
}

function renderPending() {
  elements.pendingCount.textContent = String(state.staged.length);
  elements.clearPending.hidden = state.staged.length === 0;
  elements.clearPending.disabled = state.busy;
  elements.previewChanges.disabled = state.staged.length === 0 || state.busy;
  elements.pendingList.replaceChildren(...state.staged.map((operation, index) => {
    const [label, ref] = operationLabel(operation);
    const item = document.createElement("li");
    item.className = "pending-item";
    item.innerHTML = `
      <div><strong>${escapeHtml(label)}</strong><code>${escapeHtml(ref)}</code></div>
      <button type="button" data-remove-index="${index}" aria-label="Remove ${escapeHtml(label)}" ${state.busy ? "disabled" : ""}>×</button>
    `;
    return item;
  }));
}

function invalidateTransaction({ abortPreview = false } = {}) {
  state.transactionRevision += 1;
  if (abortPreview) {
    state.previewController?.abort();
    state.previewController = null;
  }
  state.preparedPlan = null;
  state.transactionId = null;
  elements.applyChanges.disabled = true;
  elements.previewDetails.hidden = true;
  elements.previewReport.textContent = "";
}

async function previewChanges() {
  if (!state.staged.length || state.busy) return;
  const revision = ++state.transactionRevision;
  const controller = new AbortController();
  state.previewController?.abort();
  state.previewController = controller;
  setBusy(true, "Preparing sources and validating the projected boards…", "preview");
  try {
    const plan = createReviewPlan({
      sourceSet: state.sourceSet,
      intent: elements.intentInput.value,
      operations: state.staged,
    });
    const response = await postJson("../api/review/preview", { plan }, { signal: controller.signal });
    if (controller.signal.aborted || revision !== state.transactionRevision) return;
    state.preparedPlan = response.prepared_plan;
    state.transactionId = response.transaction_id || null;
    elements.previewReport.textContent = response.report;
    elements.previewDetails.hidden = false;
    elements.previewDetails.open = true;
    elements.applyChanges.disabled = false;
    setStatus("Validation passed. Review the semantic diff, then apply when it matches your intent.", "success");
  } catch (error) {
    if (error.name !== "AbortError" && revision === state.transactionRevision) {
      invalidateTransaction();
      setStatus(error.message, "error");
    }
  } finally {
    if (state.previewController === controller) {
      state.previewController = null;
      setBusy(false);
    }
  }
}

async function applyChanges() {
  if ((!state.transactionId && !state.preparedPlan) || state.busy) return;
  const confirmed = window.confirm(
    "Apply this validated transaction to canonical YAML and regenerate the affected manifests?",
  );
  if (!confirmed) return;
  const sourceSet = state.sourceSet;
  let applied = false;
  setBusy(true, "Applying the validated transaction…", "apply");
  try {
    const payload = state.transactionId
      ? { transaction_id: state.transactionId }
      : { prepared_plan: state.preparedPlan };
    const response = await postJson("../api/review/apply", payload);
    applied = true;
    const audienceLocation = currentAudienceFrameUrl();
    elements.previewReport.textContent = response.report;
    state.staged = [];
    state.preparedPlan = null;
    state.transactionId = null;
    state.selection = null;
    state.snapshot = null;
    state.transactionRevision += 1;
    renderPending();
    renderEmptySelection();
    elements.applyChanges.disabled = true;
    const frameLoaded = waitForAudienceFrame();
    const refreshUrl = refreshAudienceUrl(audienceLocation, {
      baseUrl: audienceBaseUrl,
      sourceSet,
      refreshToken: Date.now(),
    });
    elements.audienceFrame.src = refreshUrl;
    syncAudienceLinkFromFrame(refreshUrl);
    const [snapshot] = await Promise.all([
      fetchJson(`../api/review/source-set?id=${encodeURIComponent(sourceSet)}`),
      frameLoaded,
    ]);
    state.snapshot = snapshot;
    if (state.selection) renderSelection();
    else renderEmptySelection();
    syncAudienceLinkFromFrame();
    setStatus("Applied to canonical sources and regenerated the renderer manifest.", "success");
  } catch (error) {
    if (applied) {
      setStatus(`Sources were applied, but the view could not refresh: ${error.message} Reload the workspace.`, "error");
    } else {
      invalidateTransaction();
      setStatus(error.message, "error");
    }
  } finally {
    setBusy(false);
  }
}

function setBusy(busy, message = null, action = null) {
  state.busy = busy;
  state.busyAction = busy ? action : null;
  clearTimeout(busySpinnerTimer);
  busySpinnerTimer = null;
  elements.sourceSetSelect.disabled = busy;
  elements.intentInput.disabled = busy;
  elements.selectionPanel.inert = busy;
  elements.pendingPanel.inert = busy;
  elements.workspace.setAttribute("aria-busy", String(busy));
  elements.canvasPanel.setAttribute("aria-busy", String(busy));
  elements.inspector.setAttribute("aria-busy", String(busy));
  elements.previewChanges.disabled = busy || state.staged.length === 0;
  elements.applyChanges.disabled = busy || (!state.transactionId && !state.preparedPlan);
  elements.previewChanges.textContent = action === "preview" ? "Validating…" : BUTTON_LABELS.preview;
  elements.applyChanges.textContent = action === "apply" ? "Applying…" : BUTTON_LABELS.apply;
  elements.previewChanges.classList.remove("is-waiting");
  elements.applyChanges.classList.remove("is-waiting");
  if (busy && (action === "preview" || action === "apply")) {
    const activeButton = action === "preview" ? elements.previewChanges : elements.applyChanges;
    busySpinnerTimer = window.setTimeout(() => activeButton.classList.add("is-waiting"), 120);
  }
  renderPending();
  if (message) setStatus(message);
}

function setStatus(message, tone = null) {
  elements.reviewStatus.textContent = message || "";
  elements.reviewStatus.classList.toggle("is-error", tone === "error");
  elements.reviewStatus.classList.toggle("is-success", tone === "success");
}

function boardById(id) {
  return state.snapshot?.view?.boards?.find((board) => board.id === id);
}

function moduleByRef(ref) {
  const id = ref?.replace(/^modules\./, "");
  return state.snapshot?.architecture?.modules?.find((module) => module.id === id);
}

function humanize(value) {
  return String(value || "").split(".").at(-1).replaceAll("_", " ");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) },
  });
  return parseResponse(response);
}

async function postJson(url, body, options = {}) {
  const response = await fetch(url, {
    ...options,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Architecture-Review-Token": state.token,
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload.error || {};
    const details = Array.isArray(error.details) && error.details.length
      ? ` ${error.details.map((item) => item.message || String(item)).join(" ")}`
      : "";
    throw new Error(`${error.message || `Request failed (${response.status}).`}${details}`);
  }
  return payload;
}

elements.sourceSetSelect.addEventListener("change", () => loadSourceSet(elements.sourceSetSelect.value));
elements.pendingList.addEventListener("click", (event) => {
  if (state.busy) return;
  const index = Number(event.target.closest("button")?.dataset.removeIndex);
  if (!Number.isInteger(index)) return;
  state.staged.splice(index, 1);
  invalidateTransaction({ abortPreview: true });
  renderPending();
});
elements.clearPending.addEventListener("click", () => {
  if (state.busy) return;
  state.staged = [];
  invalidateTransaction({ abortPreview: true });
  renderPending();
  setStatus("Cleared the pending review transaction.");
});
elements.intentInput.addEventListener("input", () => {
  if (state.busy) return;
  if (state.preparedPlan || state.transactionId || state.previewController) {
    invalidateTransaction({ abortPreview: true });
    renderPending();
    setStatus("Intent changed. Preview the transaction again.");
  }
});
elements.previewChanges.addEventListener("click", previewChanges);
elements.applyChanges.addEventListener("click", applyChanges);
elements.audienceFrame.addEventListener("load", () => syncAudienceLinkFromFrame());
window.addEventListener("message", onArchitectureSelection);

boot();
