// SPDX-License-Identifier: AGPL-3.0-or-later
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MODULES, domains } from "./catalog.js";

export const POSTS = new Set([
  "buying.receipts",
  "buying.landedCosts",
  "stock.stockMoves",
  "stock.deliveries",
  "stock.warehouseTransfers",
  "stock.inventoryAdjustments",
  "accounting.invoices",
  "accounting.payments",
  "accounting.bills",
]);

export const RECORDS = new Set([
  "quality.documents",
  "quality.correctiveActions",
  "accounting.assets",
  "manufacturing.maintenance",
  "platform.users",
  "platform.incidents",
  "projects.projects",
  "projects.workers",
  "projects.assignments",
  "projects.raci",
  "crm.listEntries",
  "crm.savedViews",
]);

const LINKS = [
  ["buying.purchaseOrders", "buying.receipts", "promise"],
  ["buying.receipts", "stock.stockMoves", "posts"],
  ["buying.receipts", "accounting.journals", "inventory / GRNI"],
  ["sales.saleOrders", "stock.deliveries", "promise"],
  ["stock.deliveries", "stock.stockMoves", "posts"],
  ["stock.deliveries", "accounting.journals", "COGS"],
  ["accounting.invoices", "accounting.journals", "AR / revenue"],
  ["accounting.payments", "accounting.journals", "cash"],
  ["accounting.bills", "accounting.journals", "expense / AP"],
  ["buying.landedCosts", "accounting.journals", "inventory / AP"],
  ["quality.correctiveActions", "quality.nonconformances", "needs"],
  ["manufacturing.maintenance", "accounting.assets", "needs"],
  ["platform.users", "platform.roles", "needs"],
  ["projects.workers", "projects.projects", "needs"],
  ["projects.assignments", "projects.workers", "needs"],
  ["projects.raci", "projects.projects", "needs"],
  ["crm.listEntries", "crm.lists", "needs"],
  ["crm.savedViews", "crm.lists", "needs"],
];

export function moduleKind(domain, id) {
  const key = `${domain}.${id}`;
  if (POSTS.has(key)) return "posts";
  if (RECORDS.has(key)) return "records";
  return "slot";
}

export function catalogGraph() {
  const nodes = [];
  for (const domain of domains()) {
    nodes.push({ id: `domain:${domain}`, kind: "domain", domain, label: domain });
  }
  for (const module of MODULES) {
    const id = `${module.domain}.${module.id}`;
    nodes.push({
      id,
      kind: moduleKind(module.domain, module.id),
      domain: module.domain,
      module: module.id,
      label: id,
    });
  }
  const known = new Set(nodes.map((node) => node.id));
  const edges = [];
  for (const domain of domains()) {
    for (const module of MODULES.filter((row) => row.domain === domain)) {
      edges.push({
        from: `domain:${domain}`,
        to: `${domain}.${module.id}`,
        rel: "catalog",
      });
    }
  }
  for (const [from, to, rel] of LINKS) {
    if (known.has(from) && known.has(to)) {
      edges.push({ from, to, rel });
    }
  }
  const counts = { posts: 0, records: 0, slot: 0 };
  for (const node of nodes) {
    if (counts[node.kind] != null) counts[node.kind] += 1;
  }
  return { title: "Giti.one catalog graph", public: true, counts, nodes, edges };
}

export async function writeCatalogGraph(root) {
  const graph = catalogGraph();
  const out = join(root, "docs", "catalog-graph.json");
  await writeFile(out, `${JSON.stringify(graph, null, 2)}\n`);
  return { out, graph };
}

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const result = await writeCatalogGraph(ROOT);
  process.stdout.write(
    `graph  posts=${result.graph.counts.posts}  records=${result.graph.counts.records}  slot=${result.graph.counts.slot}\n`,
  );
}
