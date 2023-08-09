ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY chats_user_policy 
ON chats 
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
BEFORE INSERT ON chats
FOR EACH ROW
EXECUTE FUNCTION set_user_id();
