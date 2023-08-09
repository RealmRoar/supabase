CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id uuid NOT NULL,
    prompt jsonb NOT NULL,
    output jsonb NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp,
    deleted_at timestamp,
    FOREIGN KEY (chat_id) REFERENCES chats(id)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tables_modtime
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
