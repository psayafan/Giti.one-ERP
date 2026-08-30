// SPDX-License-Identifier: AGPL-3.0-or-later
import { MODULES, domains } from "./catalog.js";

export const LANGS = ["en", "fa"];

const FA_DOMAINS = {
  accounting: "حسابداری",
  parties: "طرف‌حساب",
  sales: "فروش",
  buying: "خرید",
  stock: "انبار",
  manufacturing: "تولید",
  crm: "ارتباط با مشتری",
  pos: "صندوق",
  hr: "منابع انسانی",
  quality: "کیفیت",
  projects: "پروژه",
  website: "وب",
  platform: "سکوی سیستم",
};

const FA_MODULES = {
  "accounting.accounts": "حساب‌ها",
  "accounting.journals": "دفتر روزنامه",
  "accounting.invoices": "فاکتور فروش",
  "accounting.bills": "فاکتور خرید",
  "accounting.payments": "پرداخت",
  "accounting.taxRates": "نرخ مالیات",
  "accounting.currencies": "ارز",
  "accounting.exchangeRates": "نرخ ارز",
  "accounting.expenses": "هزینه",
  "accounting.creditNotes": "اعلامیه بستانکار",
  "accounting.vendorCredits": "بستانکاری فروشنده",
  "accounting.bankAccounts": "حساب بانکی",
  "accounting.bankTransactions": "گردش بانک",
  "accounting.bankRules": "قواعد بانک",
  "accounting.reconciliations": "مغایرت‌گیری",
  "accounting.budgets": "بودجه",
  "accounting.assets": "دارایی",
  "accounting.fiscalYears": "سال مالی",
  "accounting.analyticAccounts": "حساب تحلیلی",
  "accounting.loans": "وام",
  "accounting.cheques": "چک",
  "accounting.installments": "اقساط",
  "accounting.financialReports": "گزارش مالی",
  "parties.customers": "مشتری",
  "parties.vendors": "فروشنده",
  "parties.contacts": "مخاطب",
  "parties.companies": "شرکت",
  "parties.salesAgents": "نماینده فروش",
  "sales.leads": "سرنخ",
  "sales.opportunities": "فرصت",
  "sales.quotations": "پیش‌فاکتور",
  "sales.saleOrders": "سفارش فروش",
  "sales.subscriptions": "اشتراک",
  "sales.rentals": "اجاره",
  "buying.purchaseRequests": "درخواست خرید",
  "buying.purchaseOrders": "سفارش خرید",
  "buying.receipts": "رسید انبار",
  "buying.landedCosts": "هزینه ورود کالا",
  "stock.items": "کالا",
  "stock.itemCategories": "گروه کالا",
  "stock.warehouses": "انبار",
  "stock.stockMoves": "حواله انبار",
  "stock.stockQuants": "موجودی لحظه‌ای",
  "stock.lots": "لات",
  "stock.serials": "سریال",
  "stock.inventoryAdjustments": "تعدیل موجودی",
  "stock.warehouseTransfers": "انتقال بین انبار",
  "stock.deliveries": "تحویل",
  "stock.boms": "صورت مواد",
  "manufacturing.workcenters": "ایستگاه کار",
  "manufacturing.routings": "مسیر تولید",
  "manufacturing.manufacturingOrders": "سفارش ساخت",
  "manufacturing.workOrders": "دستور کار",
  "manufacturing.shopFloor": "کف کارگاه",
  "manufacturing.subcontracting": "پیمانکاری",
  "manufacturing.qualityChecks": "کنترل کیفیت",
  "manufacturing.maintenance": "نگهداری",
  "crm.pipelines": "قیف فروش",
  "crm.activities": "فعالیت",
  "crm.campaigns": "کمپین",
  "crm.lists": "فهرست",
  "crm.listEntries": "ردیف فهرست",
  "crm.savedViews": "نمای ذخیره‌شده",
  "crm.notes": "یادداشت",
  "crm.meetings": "جلسه",
  "pos.posSessions": "نشست صندوق",
  "pos.posOrders": "فروش صندوق",
  "hr.employees": "کارمند",
  "hr.departments": "واحد",
  "hr.attendance": "حضور",
  "hr.leaves": "مرخصی",
  "hr.payroll": "حقوق",
  "hr.recruitment": "جذب",
  "hr.appraisals": "ارزیابی",
  "hr.expensesHr": "هزینه پرسنل",
  "hr.fleet": "ناوگان",
  "hr.planning": "برنامه‌ریزی نیرو",
  "hr.trainings": "آموزش",
  "quality.documents": "سند",
  "quality.documentRevisions": "نسخه سند",
  "quality.nonconformances": "عدم انطباق",
  "quality.correctiveActions": "اقدام اصلاحی",
  "quality.internalAudits": "ممیزی داخلی",
  "quality.managementReviews": "بازبینی مدیریت",
  "quality.calibrations": "کالیبراسیون",
  "quality.complaints": "شکایت",
  "quality.changeRequests": "درخواست تغییر",
  "quality.risks": "ریسک کیفیت",
  "quality.rules": "قاعده کیفیت",
  "projects.projects": "پروژه",
  "projects.charters": "منشور",
  "projects.stakeholders": "ذی‌نفع",
  "projects.workers": "نیروی پروژه",
  "projects.assignments": "تخصیص",
  "projects.raci": "ماتریس مسئولیت",
  "projects.wbs": "ساختار شکست کار",
  "projects.schedules": "زمان‌بندی",
  "projects.tasks": "فعالیت پروژه",
  "projects.costs": "هزینه پروژه",
  "projects.timesheets": "برگه ساعت",
  "projects.communications": "ارتباطات پروژه",
  "projects.risks": "ریسک پروژه",
  "projects.changes": "تغییر پروژه",
  "projects.tickets": "تیکت",
  "projects.fieldService": "خدمات میدانی",
  "projects.knowledge": "دانش",
  "website.pages": "صفحه",
  "website.ecommerceOrders": "سفارش فروشگاه",
  "website.events": "رویداد",
  "website.liveChat": "گفتگوی زنده",
  "website.memberships": "عضویت",
  "website.donations": "کمک مالی",
  "platform.users": "کاربر",
  "platform.roles": "نقش",
  "platform.companiesOrg": "سازمان",
  "platform.branches": "شعبه",
  "platform.settings": "تنظیمات",
  "platform.attachments": "پیوست",
  "platform.auditLogs": "لاگ حسابرسی",
  "platform.incidents": "حادثه امنیتی",
  "platform.webhooks": "وب‌هوک",
  "platform.imports": "ورود داده",
  "platform.exports": "خروج داده",
};

const FA_ACCOUNTS = {
  cash: "نقد",
  AR: "دریافتنی",
  AP: "پرداختنی",
  GRNI: "کالای رسیده فاکتورنشده",
  inventory: "موجودی کالا",
  cogs: "بهای تمام‌شده",
  expense: "هزینه",
  revenue: "درآمد",
  equity: "سرمایه",
};

const FA_UI = {
  title: "گیتی.وان ERP",
  buy: "خرید",
  receipt: "رسید",
  sell: "فروش",
  delivery: "تحویل",
  invoice: "فاکتور",
  payment: "پرداخت",
  stock: "موجودی",
  iso9001: "ایزو۹۰۰۱",
  iso27001: "ایزو۲۷۰۰۱",
  iso55001: "ایزو۵۵۰۰۱",
  pmp: "پی‌ام‌پی",
  debit: "بدهکار",
  credit: "بستانکار",
  balanced: "تراز",
  unbalanced: "نامتراز",
  books: "دفتر",
  catalog: "کاتالوگ",
  add: "افزودن",
  trial: "تراز آزمایشی",
  journals: "روزنامه",
  localOnly: "فقط روی این رایانه. محصول میزبانی‌شده نیست.",
  posts: "ثبت در دفتر",
  records: "رکورد",
  slot: "خانهٔ کاتالوگ",
  empty: "خالی",
  error: "خطا",
  jsonHint: "یک شیء JSON با id",
  doctrine: "سفارش خرید وعده است. رسید و تحویل دفتر را می‌نویسند.",
};

const EN_UI = {
  title: "Giti.one ERP",
  buy: "buy",
  receipt: "receipt",
  sell: "sell",
  delivery: "delivery",
  invoice: "invoice",
  payment: "payment",
  stock: "stock",
  iso9001: "iso9001",
  iso27001: "iso27001",
  iso55001: "iso55001",
  pmp: "pmp",
  debit: "Dr",
  credit: "Cr",
  balanced: "balanced",
  unbalanced: "UNBALANCED",
  books: "Books",
  catalog: "Catalog",
  add: "Add",
  trial: "Trial balance",
  journals: "Journal",
  localOnly: "Local only. Not a hosted product.",
  posts: "posts",
  records: "record",
  slot: "catalog slot",
  empty: "empty",
  error: "error",
  jsonHint: "JSON object with id",
  doctrine: "A purchase order is a promise. Receipt and delivery post.",
};

function titleCase(id) {
  return id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (ch) => ch.toUpperCase());
}

export function resolveLang(value) {
  const raw = String(value ?? "en")
    .trim()
    .toLowerCase();
  if (
    raw === "fa" ||
    raw === "fas" ||
    raw === "per" ||
    raw === "persian" ||
    raw === "farsi" ||
    raw === "fa-ir"
  ) {
    return "fa";
  }
  return "en";
}

export function langFromArgv(argv = [], env = {}) {
  const flag = argv.indexOf("--lang");
  if (flag >= 0 && argv[flag + 1]) {
    return resolveLang(argv[flag + 1]);
  }
  return resolveLang(env.GITI_LANG);
}

export function t(lang, key) {
  const locale = resolveLang(lang);
  const table = locale === "fa" ? FA_UI : EN_UI;
  return table[key] ?? key;
}

export function uiLabels(lang) {
  const locale = resolveLang(lang);
  return { ...(locale === "fa" ? FA_UI : EN_UI) };
}

export function domainLabel(lang, domain) {
  if (resolveLang(lang) === "fa") {
    return FA_DOMAINS[domain] ?? domain;
  }
  return titleCase(domain);
}

export function moduleLabel(lang, domain, id) {
  const key = `${domain}.${id}`;
  if (resolveLang(lang) === "fa") {
    return FA_MODULES[key] ?? id;
  }
  return titleCase(id);
}

export function accountLabel(lang, accountId) {
  if (resolveLang(lang) === "fa") {
    return FA_ACCOUNTS[accountId] ?? accountId;
  }
  return accountId;
}

export function missingFaLabels() {
  const missing = [];
  for (const domain of domains()) {
    if (!FA_DOMAINS[domain]) missing.push(`domain:${domain}`);
  }
  for (const module of MODULES) {
    const key = `${module.domain}.${module.id}`;
    if (!FA_MODULES[key]) missing.push(key);
  }
  return missing;
}
