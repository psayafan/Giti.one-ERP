DOCUMENT GITI-PMP  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan.

# PMP / PMBOK coverage

Giti.one maps the PMI process groups and knowledge areas onto `projects.*` (and the ERP modules they already use). ISO 21502 is the related project-management standard; this file is the PMP map, not a PMI credential.

`projects.projects.processGroup` must be one of: initiating, planning, executing, monitoring, closing.

## Process groups

| Group | Giti |
|---|---|
| Initiating | `projects.charters`, `projects.stakeholders` |
| Planning | `projects.wbs`, `projects.schedules`, `projects.costs`, `projects.risks`, `buying.purchaseRequests` |
| Executing | `projects.tasks`, `projects.communications`, `buying.purchaseOrders` |
| Monitoring and controlling | `projects.changes`, `quality.changeRequests`, `accounting.budgets` |
| Closing | `projects.projects` with `processGroup: closing` |

## Knowledge areas

| Area | Giti |
|---|---|
| Integration | `projects.charters`, `projects.changes` |
| Scope | `projects.wbs` |
| Schedule | `projects.schedules`, `projects.tasks` |
| Cost | `projects.costs`, `projects.timesheets`, `accounting.budgets` |
| Quality | `quality.*` (ISO 9001 pack) |
| Resource | `hr.employees`, `hr.planning` |
| Communications | `projects.communications` |
| Risk | `projects.risks`, `quality.risks` |
| Procurement | `buying.*` |
| Stakeholder | `projects.stakeholders`, `parties.contacts` |

Rows persist in PostgreSQL as `erp_row` and are readable through the `pmp_*` views in `schema.sql`.
