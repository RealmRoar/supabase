ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_user_policy 
ON conversations 
FOR ALL 
USING ((SELECT user_id FROM chats WHERE id = conversations.chat_id) = auth.uid())
WITH CHECK ((SELECT user_id FROM chats WHERE id = conversations.chat_id) = auth.uid());

CREATE OR REPLACE FUNCTION check_chat_id() RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT user_id FROM chats WHERE id = NEW.chat_id) != auth.uid() THEN
    RAISE EXCEPTION 'chat_id does not belong to the current user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_chat_id
BEFORE INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION check_chat_id();