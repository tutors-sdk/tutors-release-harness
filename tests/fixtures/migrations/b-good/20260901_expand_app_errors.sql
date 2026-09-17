-- Expand only: a nullable column, an index and a policy. Version a keeps working.
ALTER TABLE app_errors ADD COLUMN IF NOT EXISTS release TEXT;
CREATE INDEX IF NOT EXISTS idx_app_errors_release ON app_errors (release);
CREATE POLICY "anon_update_app_errors" ON app_errors FOR UPDATE TO anon USING (true);
