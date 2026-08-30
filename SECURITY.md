# Security

Report a vulnerability **privately**. Do not open a public GitHub issue for a secret, credential, or exploitable bug.

1. GitHub private report: https://github.com/psayafan/Giti.one-ERP/security/advisories/new
2. Or mail **psayafan@hotmail.com**

## Scope

This repository is a Node.js ERP. Runtime is in-memory `list` / `add`. PostgreSQL is optional via `./setup.sh`. There is no public HTTP server or login in this tree. Still report:

- A secret or key committed in git
- A bug in `src/` that would leak or overwrite data once the module is used
- A problem in docs that would make someone ship an unsafe pattern

Do not send AWS keys, customer data, or production dumps with a report.

## What I will do

1. Acknowledge the report.
2. Confirm whether it applies to this tree.
3. Fix in public only after a patch exists, or after you agree the issue is already public.
