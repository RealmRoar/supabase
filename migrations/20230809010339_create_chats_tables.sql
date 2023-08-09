CREATE TABLE chats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title varchar(255) NOT NULL,
    schema_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp,
    deleted_at timestamp,
    FOREIGN KEY (schema_id) REFERENCES schemas(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tables_modtime
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
