import { manifestIndex } from "./renderer/architecture/manifest-index.js";
import { installThemeSwitcher } from "./theme-state.mjs";

const architectureList = document.querySelector("#architectureList");
const emptyState = document.querySelector("#directoryEmpty");
const themeSwitcher = document.querySelector("#directoryThemeSwitcher");

function architectureItem(entry) {
  const item = document.createElement("li");
  item.className = "architecture-list-item";

  const link = document.createElement("a");
  link.className = "architecture-list-link";
  link.href = `./renderer/architecture/?arch=${encodeURIComponent(entry.id)}`;
  link.setAttribute("aria-label", `Open ${entry.name}`);

  const name = document.createElement("span");
  name.className = "architecture-list-name";
  name.textContent = entry.name;

  const action = document.createElement("span");
  action.className = "architecture-list-action";
  action.textContent = "Open →";

  link.append(name, action);
  item.appendChild(link);
  return item;
}

const architectures = manifestIndex.filter((entry) => entry.role === "architecture");
architectureList.replaceChildren(...architectures.map(architectureItem));
emptyState.hidden = architectures.length > 0;

installThemeSwitcher(themeSwitcher);
