#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MODULES, createApp, domains } from "./index.js";
import { booksSnapshot, seedDemo } from "./cli.js";
import { moduleKind } from "./graph.js";
import {
  domainLabel,
  moduleLabel,
  resolveLang,
  uiLabels,
} from "./locale.js";

export { moduleKind };

const UI_ROOT = join(dirname(fileURLToPath(import.meta.url)), "ui");
const HOST = "127.0.0.1";
const DEFAULT_PORT = 3847;
const BODY_LIMIT = 65536;

const STATIC = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.css": { file: "app.css", type: "text/css; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const data = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let n = 0;
    req.on("data", (chunk) => {
      n += chunk.length;
      if (n > BODY_LIMIT) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function findModule(domain, id) {
  return MODULES.find((module) => module.domain === domain && module.id === id);
}

function catalogMeta(lang) {
  const locale = resolveLang(lang);
  return {
    lang: locale,
    dir: locale === "fa" ? "rtl" : "ltr",
    ui: uiLabels(locale),
    domains: domains().map((domain) => ({
      id: domain,
      label: domainLabel(locale, domain),
      modules: MODULES.filter((module) => module.domain === domain).map(
        (module) => ({
          id: module.id,
          label: moduleLabel(locale, domain, module.id),
          kind: moduleKind(domain, module.id),
        }),
      ),
    })),
  };
}

export function createUiHandler(erp) {
  return async function handle(req, res) {
    const host = req.headers.host ?? `${HOST}:${DEFAULT_PORT}`;
    const url = new URL(req.url ?? "/", `http://${host}`);
    const lang = resolveLang(url.searchParams.get("lang") ?? "en");

    try {
      const asset = STATIC[url.pathname];
      if (req.method === "GET" && asset) {
        const html = await readFile(join(UI_ROOT, asset.file), "utf8");
        send(res, 200, html, asset.type);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/meta") {
        send(res, 200, catalogMeta(lang));
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/books") {
        send(res, 200, booksSnapshot(erp, lang));
        return;
      }

      const match = url.pathname.match(
        /^\/api\/modules\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)$/,
      );
      if (match) {
        const domain = match[1];
        const id = match[2];
        const spec = findModule(domain, id);
        if (!spec) {
          send(res, 404, { error: "unknown module" });
          return;
        }
        const store = erp[domain][id];
        if (req.method === "GET") {
          send(res, 200, { domain, id, kind: moduleKind(domain, id), rows: store.list() });
          return;
        }
        if (req.method === "POST") {
          const raw = await readBody(req);
          let payload;
          try {
            payload = JSON.parse(raw);
          } catch {
            send(res, 400, { error: "invalid JSON" });
            return;
          }
          if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            send(res, 400, { error: "JSON object required" });
            return;
          }
          if (payload.id == null || String(payload.id).trim() === "") {
            send(res, 400, { error: "id required" });
            return;
          }
          const row = store.add(payload);
          send(res, 201, row);
          return;
        }
      }

      send(res, 404, { error: "not found" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "error";
      send(res, 400, { error: message });
    }
  };
}

export function createUiServer(options = {}) {
  const erp = options.app ?? seedDemo(createApp());
  const server = createServer(createUiHandler(erp));
  return { erp, server };
}

export function listenUi(options = {}) {
  const { erp, server } = createUiServer(options);
  const host = options.host ?? HOST;
  const port = options.port ?? Number(process.env.GITI_PORT || DEFAULT_PORT);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve({
        erp,
        server,
        host,
        port: typeof address === "object" && address ? address.port : port,
      });
    });
  });
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const { host, port } = await listenUi();
  process.stdout.write(`Giti.one ERP  http://${host}:${port}  (local only)\n`);
}
