ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY tables_user_policy 
ON tables 
FOR ALL 
USING ((SELECT user_id FROM schemas WHERE id = tables.schema_id) = auth.uid())
WITH CHECK ((SELECT user_id FROM schemas WHERE id = tables.schema_id) = auth.uid());

CREATE OR REPLACE FUNCTION check_schema_id() RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT user_id FROM schemas WHERE id = NEW.schema_id) != auth.uid() THEN
    RAISE EXCEPTION 'schema_id does not belong to the current user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_schema_id
BEFORE INSERT ON tables
FOR EACH ROW
EXECUTE FUNCTION check_schema_id();
