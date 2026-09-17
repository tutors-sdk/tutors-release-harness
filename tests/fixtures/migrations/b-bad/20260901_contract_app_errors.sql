-- Contract while a still runs: drops a column a reads, narrows another, adds NOT NULL with no default.
ALTER TABLE app_errors DROP COLUMN user_agent;
ALTER TABLE app_errors ALTER COLUMN context TYPE JSON;
ALTER TABLE app_errors ADD COLUMN tenant TEXT NOT NULL;
DROP INDEX idx_app_errors_level;
