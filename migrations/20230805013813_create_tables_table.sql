CREATE TABLE tables (
    id uuid PRIMARY KEY,
    name varchar(255) NOT NULL,
    columns jsonb NOT NULL,
    indexes jsonb NOT NULL,
    schema_id uuid NOT NULL,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    FOREIGN KEY (schema_id) REFERENCES schemas(id)
);