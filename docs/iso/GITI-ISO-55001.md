DOCUMENT GITI-ISO-55001  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan. Not a certificate.

# ISO 55001 — records in Giti.one

Asset management here is the register plus work against an asset. It is not a full lifecycle CMMS.

## Where the records live

| Requirement (plain) | Giti module | Postgres view |
|---|---|---|
| Asset register | `accounting.assets` | `iso_55001_assets` |
| Maintenance / work | `manufacturing.maintenance` | `iso_55001_maintenance` |

Asset `status` is in-service, idle, or disposed. Maintenance with `assetId` must point at an asset.
