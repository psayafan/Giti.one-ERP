DOCUMENT GITI-ISO-9001  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan. Not a certificate.

# ISO 9001:2015 — records in Giti.one

**Scope:** design and publication of Giti.one ERP (Node.js, AGPL).

**Quality policy:** every goods or money movement posts a balanced journal. Documents that are Issued have a title and a version.

**Quality objectives:** (1) trial balance stays balanced after the buy–sell–cash demo; (2) Issued documents are identifiable; (3) nonconformances can link to corrective actions.

## Where the records live

| Clause (plain) | Giti module | Postgres view |
|---|---|---|
| Documented information (7.5) | `quality.documents` | `iso_9001_documents` |
| Nonconforming outputs (8.7) | `quality.nonconformances` | `iso_9001_nonconformances` |
| Corrective action (10.2) | `quality.correctiveActions` | `iso_9001_capa` |
| Internal audit (9.2) | `quality.internalAudits` | `iso_9001_audits` |
| Management review (9.3) | `quality.managementReviews` | `iso_9001_management_reviews` |

Issued documents require `title` and `version`. Status is Draft, Issued, Superseded, or Withdrawn. A corrective action with `nonconformanceId` must point at a nonconformance row.
