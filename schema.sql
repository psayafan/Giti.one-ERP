-- Giti.one ERP — one table, every module is a row.
-- domain + module + id is the primary key. payload is the record.

CREATE TABLE IF NOT EXISTS erp_row (
  domain   text NOT NULL,
  module   text NOT NULL,
  id       text NOT NULL,
  payload  jsonb NOT NULL,
  PRIMARY KEY (domain, module, id)
);

CREATE INDEX IF NOT EXISTS erp_row_domain_module ON erp_row (domain, module);

-- ISO 9001
CREATE OR REPLACE VIEW iso_9001_documents AS
  SELECT id, payload FROM erp_row WHERE domain = 'quality' AND module = 'documents';
CREATE OR REPLACE VIEW iso_9001_nonconformances AS
  SELECT id, payload FROM erp_row WHERE domain = 'quality' AND module = 'nonconformances';
CREATE OR REPLACE VIEW iso_9001_capa AS
  SELECT id, payload FROM erp_row WHERE domain = 'quality' AND module = 'correctiveActions';
CREATE OR REPLACE VIEW iso_9001_audits AS
  SELECT id, payload FROM erp_row WHERE domain = 'quality' AND module = 'internalAudits';
CREATE OR REPLACE VIEW iso_9001_management_reviews AS
  SELECT id, payload FROM erp_row WHERE domain = 'quality' AND module = 'managementReviews';

-- ISO 27001
CREATE OR REPLACE VIEW iso_27001_users AS
  SELECT id, payload FROM erp_row WHERE domain = 'platform' AND module = 'users';
CREATE OR REPLACE VIEW iso_27001_roles AS
  SELECT id, payload FROM erp_row WHERE domain = 'platform' AND module = 'roles';
CREATE OR REPLACE VIEW iso_27001_audit_logs AS
  SELECT id, payload FROM erp_row WHERE domain = 'platform' AND module = 'auditLogs';
CREATE OR REPLACE VIEW iso_27001_incidents AS
  SELECT id, payload FROM erp_row WHERE domain = 'platform' AND module = 'incidents';
CREATE OR REPLACE VIEW iso_27001_assets AS
  SELECT id, payload FROM erp_row WHERE domain = 'accounting' AND module = 'assets';

-- ISO 55001
CREATE OR REPLACE VIEW iso_55001_assets AS
  SELECT id, payload FROM erp_row WHERE domain = 'accounting' AND module = 'assets';
CREATE OR REPLACE VIEW iso_55001_maintenance AS
  SELECT id, payload FROM erp_row WHERE domain = 'manufacturing' AND module = 'maintenance';

-- PMP / PMBOK
CREATE OR REPLACE VIEW pmp_projects AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'projects';
CREATE OR REPLACE VIEW pmp_charters AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'charters';
CREATE OR REPLACE VIEW pmp_stakeholders AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'stakeholders';
CREATE OR REPLACE VIEW pmp_wbs AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'wbs';
CREATE OR REPLACE VIEW pmp_schedules AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'schedules';
CREATE OR REPLACE VIEW pmp_costs AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'costs';
CREATE OR REPLACE VIEW pmp_communications AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'communications';
CREATE OR REPLACE VIEW pmp_risks AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'risks';
CREATE OR REPLACE VIEW pmp_changes AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'changes';
CREATE OR REPLACE VIEW pmp_workers AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'workers';
CREATE OR REPLACE VIEW pmp_assignments AS
  SELECT id, payload FROM erp_row WHERE domain = 'projects' AND module = 'assignments';
