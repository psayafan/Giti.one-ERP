DOCUMENT GITI-ISO-27001  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan. Not a certificate.

# ISO/IEC 27001 — records in Giti.one

This pack is the evidence an information-security management system would keep in the ERP: who may act, what they did to the books, what broke, which assets exist.

## Where the records live

| Control (plain) | Giti module | Postgres view |
|---|---|---|
| Access — users | `platform.users` | `iso_27001_users` |
| Access — roles | `platform.roles` | `iso_27001_roles` |
| Logging | `platform.auditLogs` | `iso_27001_audit_logs` |
| Incidents | `platform.incidents` | `iso_27001_incidents` |
| Asset inventory | `accounting.assets` | `iso_27001_assets` |

A user with `roleId` must point at a role. Journal posts write an audit row (`action: journal.post`). Incident `status` is open, contained, or closed.
