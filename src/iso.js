// SPDX-License-Identifier: AGPL-3.0-or-later
import { findById } from "./match.js";

export const DOCUMENT_STATUSES = ["Draft", "Issued", "Superseded", "Withdrawn"];
export const ASSET_STATUSES = ["in-service", "idle", "disposed"];
export const INCIDENT_STATUSES = ["open", "contained", "closed"];
export const PROCESS_GROUPS = [
  "initiating",
  "planning",
  "executing",
  "monitoring",
  "closing",
];
export const RACI_ROLES = [
  "responsible",
  "accountable",
  "consulted",
  "informed",
];

export function wrapDocuments(store) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      if (record.status != null) {
        if (!DOCUMENT_STATUSES.includes(record.status)) {
          throw new Error(
            "document status must be Draft, Issued, Superseded, or Withdrawn",
          );
        }
        if (record.status === "Issued" && (record.version == null || record.title == null)) {
          throw new Error("Issued document needs title and version");
        }
      }
      return store.add(record);
    },
  };
}

export function wrapLinked(store, parentStore, foreignKey, message) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      if (record[foreignKey] != null) {
        if (!findById(parentStore, record[foreignKey])) {
          throw new Error(message);
        }
      }
      return store.add(record);
    },
  };
}

export function wrapStatus(store, field, allowed, label) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      if (record[field] != null && !allowed.includes(record[field])) {
        throw new Error(`${label} must be ${allowed.join(", ")}`);
      }
      return store.add(record);
    },
  };
}
