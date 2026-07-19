import { manifestIndex } from "./renderer/architecture/manifest-index.js";
import { installThemeSwitcher } from "./theme-state.mjs";

const SVG_NS = "http://www.w3.org/2000/svg";
const architectureGrid = document.querySelector("#architectureGrid");
const referenceGrid = document.querySelector("#referenceGrid");
const referenceSection = document.querySelector("#referenceSection");
const searchInput = document.querySelector("#directorySearch");
const familyFilters = document.querySelector("#familyFilters");
const resultCount = document.querySelector("#directoryResultCount");
const emptyState = document.querySelector("#directoryEmpty");
const themeSwitcher = document.querySelector("#directoryThemeSwitcher");

const state = {
  entries: [],
  family: "all",
  query: "",
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function svgElement(tag, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
  return node;
}

function humanize(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function rootBoard(manifest) {
  return (manifest.boards?.items || []).find(
    (board) => board.id === manifest.boards?.rootBoard,
  ) || manifest.boards?.items?.[0] || null;
}

function semanticDepth(manifest) {
  const boards = manifest.boards?.items || [];
  const byId = new Map(boards.map((board) => [board.id, board]));
  const depthOf = (board, visiting = new Set()) => {
    if (!board?.parent || visiting.has(board.id)) return 1;
    const next = new Set(visiting);
    next.add(board.id);
    return 1 + depthOf(byId.get(board.parent), next);
  };
  return Math.max(1, ...boards.map((board) => depthOf(board)));
}

function rootModuleLabels(manifest) {
  return (manifest.architecture?.modules || [])
    .filter((module) => module.parent_ref === "architecture")
    .map((module) => module.label || humanize(module.id));
}

function directoryEntry(indexEntry, manifest) {
  const architecture = manifest.architecture || {};
  const board = rootBoard(manifest);
  const family = architecture.family || "unclassified";
  const tasks = architecture.taskModes || [];
  const searchable = [
    architecture.name,
    family,
    board?.summary,
    ...tasks,
    ...rootModuleLabels(manifest),
  ].join(" ").toLowerCase();
  return {
    indexEntry,
    manifest,
    architecture,
    board,
    family,
    tasks,
    searchable,
    depth: semanticDepth(manifest),
  };
}

function renderArchitecturePreview(entry) {
  const board = entry.board;
  const nodes = board?.nodes || [];
  const edges = board?.edges || [];
  const svg = svgElement("svg", {
    class: "directory-preview-svg",
    viewBox: "0 0 520 132",
    role: "img",
    "aria-label": `${entry.architecture.name} overview topology`,
    preserveAspectRatio: "xMidYMid meet",
  });
  if (!nodes.length) return svg;

  const columns = nodes.map((node) => Number(node.col) || 1);
  const rows = nodes.map((node) => Number(node.row) || 1);
  const minCol = Math.min(...columns);
  const maxCol = Math.max(...columns);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const xFor = (col) => 34 + ((Number(col) || 1) - minCol) / Math.max(1, maxCol - minCol) * 452;
  const yFor = (row) => 24 + ((Number(row) || 1) - minRow) / Math.max(1, maxRow - minRow) * 84;
  const nodePositions = new Map(nodes.map((node) => [node.id, {
    node,
    x: xFor(node.col),
    y: yFor(node.row),
  }]));

  const edgeGroup = svgElement("g", { class: "directory-preview-edges" });
  edges.forEach((edge) => {
    const from = nodePositions.get(edge.from);
    const to = nodePositions.get(edge.to);
    if (!from || !to) return;
    const midpoint = (from.x + to.x) / 2;
    const path = svgElement("path", {
      d: `M ${from.x} ${from.y} H ${midpoint} V ${to.y} H ${to.x}`,
      class: `directory-preview-edge${edge.kind === "conditioning" ? " is-conditioning" : ""}`,
    });
    edgeGroup.appendChild(path);
  });
  svg.appendChild(edgeGroup);

  const moduleById = new Map(
    (entry.architecture.modules || []).map((module) => [module.id, module]),
  );
  const nodeGroup = svgElement("g", { class: "directory-preview-nodes" });
  nodePositions.forEach(({ node, x, y }) => {
    const ref = node.ref || "";
    const isModule = ref.startsWith("modules.");
    const width = isModule ? 42 : 23;
    const height = isModule ? 18 : 23;
    const rect = svgElement("rect", {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      rx: isModule ? 5 : 3,
      class: `directory-preview-node ${isModule ? "is-module" : "is-value"}${node.board_ref ? " is-drillable" : ""}`,
    });
    const title = svgElement("title");
    const module = isModule ? moduleById.get(ref.slice("modules.".length)) : null;
    title.textContent = node.label || module?.label || humanize(node.id);
    rect.appendChild(title);
    nodeGroup.appendChild(rect);
  });
  svg.appendChild(nodeGroup);
  return svg;
}

function renderTaskList(tasks) {
  const list = element("ul", "directory-task-list");
  if (!tasks.length) {
    list.appendChild(element("li", "directory-task is-muted", "Reference pipeline"));
    return list;
  }
  tasks.forEach((task) => list.appendChild(element("li", "directory-task", humanize(task))));
  return list;
}

function renderRootRoute(entry) {
  const route = element("div", "directory-root-route");
  const labels = rootModuleLabels(entry.manifest);
  const visibleLabels = labels.length > 4
    ? [...labels.slice(0, 3), `+${labels.length - 3} stages`]
    : labels;
  visibleLabels.forEach((label, index) => {
    if (index) route.appendChild(element("span", "directory-route-arrow", "→"));
    route.appendChild(element("span", "directory-route-unit", label));
  });
  return route;
}

function renderDirectoryCard(entry, reference = false) {
  const link = element("a", `directory-card${reference ? " is-reference" : ""}`);
  link.href = `./renderer/architecture/?arch=${encodeURIComponent(entry.architecture.id)}`;
  link.setAttribute("aria-label", `Explore ${entry.architecture.name}`);

  const preview = element("div", "directory-card-preview");
  preview.appendChild(renderArchitecturePreview(entry));
  link.appendChild(preview);

  const body = element("div", "directory-card-body");
  const kicker = element("div", "directory-card-kicker");
  kicker.append(
    element("span", "directory-family", humanize(entry.family)),
    element("span", "directory-depth", `${entry.depth} zoom ${entry.depth === 1 ? "level" : "levels"}`),
  );
  body.appendChild(kicker);
  body.appendChild(element("h3", "directory-card-title", entry.architecture.name));
  body.appendChild(element("p", "directory-card-summary", entry.board?.summary || "Open the architecture overview."));
  body.appendChild(renderTaskList(entry.tasks));

  const routeLabel = element("p", "directory-route-label", "System boundary");
  body.append(routeLabel, renderRootRoute(entry));

  const footer = element("footer", "directory-card-footer");
  const coverage = entry.architecture.coverage?.scopes?.architecture?.status
    || entry.architecture.decomposition?.status
    || "declared";
  footer.append(
    element("span", "directory-card-stat", `${entry.architecture.modules?.length || 0} modules`),
    element("span", "directory-card-stat", `${entry.manifest.boards?.items?.length || 0} boards`),
    element("span", "directory-card-stat", `${humanize(coverage)} breadth`),
    element("span", "directory-card-open", "Explore architecture →"),
  );
  body.appendChild(footer);
  link.appendChild(body);
  return link;
}

function renderFamilyFilters(entries) {
  const families = [...new Set(entries.map((entry) => entry.family))].sort();
  familyFilters.replaceChildren();
  [["all", "All families"], ...families.map((family) => [family, humanize(family)])]
    .forEach(([value, label]) => {
      const button = element("button", "directory-filter", label);
      button.type = "button";
      button.dataset.family = value;
      button.classList.toggle("is-active", value === state.family);
      button.setAttribute("aria-pressed", String(value === state.family));
      button.addEventListener("click", () => {
        state.family = value;
        renderFamilyFilters(entries);
        renderArchitectureGrid();
      });
      familyFilters.appendChild(button);
    });
}

function renderArchitectureGrid() {
  const entries = state.entries.filter(({ indexEntry }) => indexEntry.role === "architecture");
  const visible = entries.filter((entry) => {
    const familyMatches = state.family === "all" || state.family === entry.family;
    const queryMatches = !state.query || entry.searchable.includes(state.query);
    return familyMatches && queryMatches;
  });
  architectureGrid.replaceChildren(...visible.map((entry) => renderDirectoryCard(entry)));
  emptyState.hidden = visible.length > 0;
  resultCount.textContent = `${visible.length} of ${entries.length} architectures`;
}

async function loadDirectory() {
  try {
    state.entries = await Promise.all(manifestIndex.map(async (indexEntry) => {
      const module = await import(`./renderer/architecture/${indexEntry.file}`);
      return directoryEntry(indexEntry, module.manifest);
    }));
    const architectures = state.entries.filter(({ indexEntry }) => indexEntry.role === "architecture");
    const references = state.entries.filter(({ indexEntry }) => indexEntry.role === "reference");
    document.querySelector("#architectureCount").textContent = String(architectures.length);
    document.querySelector("#familyCount").textContent = String(new Set(architectures.map(({ family }) => family)).size);
    renderFamilyFilters(architectures);
    renderArchitectureGrid();
    referenceGrid.replaceChildren(...references.map((entry) => renderDirectoryCard(entry, true)));
    referenceSection.hidden = references.length === 0;
  } catch (error) {
    architectureGrid.replaceChildren();
    const message = element("p", "directory-error", "The architecture directory could not be loaded from the generated manifests.");
    architectureGrid.appendChild(message);
    console.error(error);
  }
}

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim().toLowerCase();
  renderArchitectureGrid();
});

installThemeSwitcher(themeSwitcher);
loadDirectory();
