CREATE TABLE schemas (
    id uuid PRIMARY KEY,
    name varchar(255) NOT NULL,
    database_name varchar(255) NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
