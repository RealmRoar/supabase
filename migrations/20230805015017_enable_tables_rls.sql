ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY tables_user_policy 
ON tables 
FOR ALL 
USING ((SELECT user_id FROM schemas WHERE id = tables.schema_id) = auth.uid())
WITH CHECK ((SELECT user_id FROM schemas WHERE id = tables.schema_id) = auth.uid());
