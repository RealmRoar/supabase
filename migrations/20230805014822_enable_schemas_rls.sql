ALTER TABLE schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY schemas_user_policy 
ON schemas 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_user_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_id
BEFORE INSERT ON schemas
FOR EACH ROW
EXECUTE FUNCTION set_user_id();
