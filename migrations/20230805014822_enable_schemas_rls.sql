ALTER TABLE schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY schemas_user_policy 
ON schemas 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);