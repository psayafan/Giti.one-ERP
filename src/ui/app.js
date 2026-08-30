const state = {
  lang: localStorage.getItem("giti-lang") || "en",
  page: "books",
  meta: null,
  domain: "accounting",
  module: "journals",
};

const main = document.getElementById("main");

function money(n) {
  return Number(n).toFixed(2);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ui(key) {
  return state.meta?.ui?.[key] ?? key;
}

async function loadMeta() {
  const res = await fetch(`/api/meta?lang=${encodeURIComponent(state.lang)}`);
  state.meta = await res.json();
  document.documentElement.lang = state.meta.lang;
  document.documentElement.dir = state.meta.dir;
  document.title = state.meta.ui.title;
  document.getElementById("brand").textContent = state.meta.ui.title;
  document.getElementById("nav-books").textContent = state.meta.ui.books;
  document.getElementById("nav-catalog").textContent = state.meta.ui.catalog;
  document.getElementById("doctrine").textContent = state.meta.ui.doctrine;
  document.getElementById("local-only").textContent = state.meta.ui.localOnly;
  for (const btn of document.querySelectorAll("[data-lang]")) {
    btn.classList.toggle("on", btn.dataset.lang === state.lang);
  }
  for (const btn of document.querySelectorAll("[data-page]")) {
    btn.classList.toggle("on", btn.dataset.page === state.page);
  }
}

function rowsTable(headers, rows) {
  if (!rows.length) {
    return `<p class="note">${esc(ui("empty"))}</p>`;
  }
  const head = headers
    .map((h) => `<th${h.num ? ' class="num"' : ""}>${esc(h.label)}</th>`)
    .join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => {
            const cell = row[h.key] ?? "";
            return `<td${h.num ? ' class="num"' : ""}>${esc(cell)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

async function renderBooks() {
  const res = await fetch(`/api/books?lang=${encodeURIComponent(state.lang)}`);
  const books = await res.json();
  const trialClass = books.trial.balanced ? "ok" : "bad";
  const trialWord = books.trial.balanced ? ui("balanced") : ui("unbalanced");
  main.innerHTML = `
    <section>
      <h2>${esc(ui("books"))}</h2>
      ${rowsTable(
        [
          { key: "kind", label: "" },
          { key: "id", label: "id" },
          { key: "detail", label: "" },
        ],
        [
          ...books.purchaseOrders.map((r) => ({
            kind: ui("buy"),
            id: r.id,
            detail: `${r.qty} × ${money(r.unitCost)}`,
          })),
          ...books.receipts.map((r) => ({
            kind: ui("receipt"),
            id: r.id,
            detail: `${r.warehouseId} +${r.qty}`,
          })),
          ...books.saleOrders.map((r) => ({
            kind: ui("sell"),
            id: r.id,
            detail: `${r.qty} × ${money(r.unitPrice)}`,
          })),
          ...books.deliveries.map((r) => ({
            kind: ui("delivery"),
            id: r.id,
            detail: `${r.warehouseId} -${r.qty}`,
          })),
          ...books.invoices.map((r) => ({
            kind: ui("invoice"),
            id: r.id,
            detail: `${r.partyId ?? ""} ${money(r.amount)}`,
          })),
          ...books.payments.map((r) => ({
            kind: ui("payment"),
            id: r.id,
            detail: `${r.invoiceId ?? r.billId ?? ""} ${money(r.amount)}`,
          })),
        ],
      )}
    </section>
    <section>
      <h2>${esc(ui("stock"))}</h2>
      ${rowsTable(
        [
          { key: "itemId", label: "item" },
          { key: "warehouseId", label: "wh" },
          { key: "qty", label: "qty", num: true },
        ],
        books.stock,
      )}
    </section>
    <section>
      <h2>ISO / PMP</h2>
      ${rowsTable(
        [
          { key: "kind", label: "" },
          { key: "id", label: "id" },
          { key: "detail", label: "" },
        ],
        [
          ...books.documents.map((r) => ({
            kind: ui("iso9001"),
            id: r.id,
            detail: r.status ?? "",
          })),
          ...books.users.map((r) => ({
            kind: ui("iso27001"),
            id: r.id,
            detail: r.roleId ?? "",
          })),
          ...books.assets.map((r) => ({
            kind: ui("iso55001"),
            id: r.id,
            detail: r.status ?? "",
          })),
          ...books.projects.map((r) => ({
            kind: ui("pmp"),
            id: r.id,
            detail: r.processGroup ?? "",
          })),
        ],
      )}
    </section>
    <section>
      <h2>${esc(ui("trial"))} <span class="${trialClass}">${esc(trialWord)}</span></h2>
      ${rowsTable(
        [
          { key: "label", label: "" },
          { key: "debit", label: ui("debit"), num: true },
          { key: "credit", label: ui("credit"), num: true },
        ],
        [
          ...books.trial.rows.map((r) => ({
            label: r.label,
            debit: money(r.debit),
            credit: money(r.credit),
          })),
          {
            label: "",
            debit: money(books.trial.debitTotal),
            credit: money(books.trial.creditTotal),
          },
        ],
      )}
    </section>
    <section>
      <h2>${esc(ui("journals"))}</h2>
      ${rowsTable(
        [
          { key: "id", label: "id" },
          { key: "debit", label: ui("debit") },
          { key: "credit", label: ui("credit") },
          { key: "amount", label: "", num: true },
          { key: "ref", label: "ref" },
        ],
        books.journals.map((r) => ({ ...r, amount: money(r.amount) })),
      )}
    </section>
  `;
}

function currentSpec() {
  const domain = state.meta.domains.find((d) => d.id === state.domain);
  const module = domain?.modules.find((m) => m.id === state.module);
  return { domain, module };
}

async function renderCatalog() {
  if (!state.meta.domains.some((d) => d.id === state.domain)) {
    state.domain = state.meta.domains[0].id;
  }
  const domain = state.meta.domains.find((d) => d.id === state.domain);
  if (!domain.modules.some((m) => m.id === state.module)) {
    state.module = domain.modules[0].id;
  }
  const spec = currentSpec();
  const res = await fetch(
    `/api/modules/${state.domain}/${state.module}?lang=${encodeURIComponent(state.lang)}`,
  );
  const data = await res.json();
  const keys = [...new Set(data.rows.flatMap((row) => Object.keys(row)))];
  const headers = keys.map((key) => ({
    key,
    label: key,
    num: key === "amount" || key === "qty" || key === "debit" || key === "credit",
  }));
  const kindLabel = ui(spec.module?.kind ?? "slot");
  main.innerHTML = `
    <div class="layout">
      <aside class="side">
        ${state.meta.domains
          .map(
            (d) =>
              `<button type="button" data-domain="${esc(d.id)}" class="${d.id === state.domain ? "on" : ""}">${esc(d.label)}</button>`,
          )
          .join("")}
      </aside>
      <div>
        <section>
          ${domain.modules
            .map(
              (m) =>
                `<button type="button" data-module="${esc(m.id)}" class="${m.id === state.module ? "on" : ""}">${esc(m.label)}<span class="kind">${esc(ui(m.kind))}</span></button>`,
            )
            .join("")}
        </section>
        <section>
          <h2>${esc(spec.module?.label ?? "")} <span class="kind">${esc(kindLabel)}</span></h2>
          ${rowsTable(
            headers,
            data.rows.map((row) => {
              const out = { ...row };
              for (const h of headers) {
                if (h.num && out[h.key] != null) out[h.key] = money(out[h.key]);
              }
              return out;
            }),
          )}
          <p class="note">${esc(ui("jsonHint"))}</p>
          <textarea id="add-json">{\n  "id": ""\n}</textarea>
          <p><button type="button" id="add-row">${esc(ui("add"))}</button></p>
          <p class="err" id="add-err"></p>
        </section>
      </div>
    </div>
  `;
  for (const btn of main.querySelectorAll("[data-domain]")) {
    btn.addEventListener("click", () => {
      state.domain = btn.dataset.domain;
      render();
    });
  }
  for (const btn of main.querySelectorAll("[data-module]")) {
    btn.addEventListener("click", () => {
      state.module = btn.dataset.module;
      render();
    });
  }
  document.getElementById("add-row").addEventListener("click", addRow);
}

async function addRow() {
  const err = document.getElementById("add-err");
  err.textContent = "";
  let payload;
  try {
    payload = JSON.parse(document.getElementById("add-json").value);
  } catch {
    err.textContent = ui("error");
    return;
  }
  const res = await fetch(`/api/modules/${state.domain}/${state.module}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) {
    err.textContent = body.error ?? ui("error");
    return;
  }
  await renderCatalog();
}

async function render() {
  if (state.page === "catalog") {
    await renderCatalog();
    return;
  }
  await renderBooks();
}

for (const btn of document.querySelectorAll("[data-lang]")) {
  btn.addEventListener("click", async () => {
    state.lang = btn.dataset.lang;
    localStorage.setItem("giti-lang", state.lang);
    await loadMeta();
    await render();
  });
}

for (const btn of document.querySelectorAll("[data-page]")) {
  btn.addEventListener("click", async () => {
    state.page = btn.dataset.page;
    await loadMeta();
    await render();
  });
}

await loadMeta();
await render();
