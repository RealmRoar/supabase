CREATE TABLE questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id uuid NOT NULL,
    prompt_agg jsonb,
    prompt text NOT NULL,
    output text NOT NULL,
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
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION add_previous_prompt_to_agg()
RETURNS TRIGGER AS $$
DECLARE
    previous_prompt text;
    previous_output text;
    previous_prompt_agg jsonb;
    formatted_previous_prompt jsonb;
    formatted_previous_output jsonb;
    new_prompt_agg jsonb := '[]'::jsonb;
    element jsonb;
BEGIN
    SELECT prompt, output, prompt_agg INTO previous_prompt, previous_output, previous_prompt_agg
    FROM questions
    WHERE chat_id = NEW.chat_id
    ORDER BY created_at DESC, id DESC
    LIMIT 1;

    IF previous_prompt IS NOT NULL AND previous_output IS NOT NULL THEN
        formatted_previous_prompt := jsonb_build_object('role', 'user', 'content', previous_prompt);
        formatted_previous_output := jsonb_build_object('role', 'assistant', 'content', previous_output);

        IF previous_prompt_agg IS NOT NULL THEN
            FOR element IN SELECT * FROM jsonb_array_elements(previous_prompt_agg)
            LOOP
                new_prompt_agg := new_prompt_agg || element;
            END LOOP;
        END IF;

        NEW.prompt_agg = new_prompt_agg || jsonb_build_array(formatted_previous_prompt, formatted_previous_output);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_previous_prompt_trigger
BEFORE INSERT ON questions
FOR EACH ROW
EXECUTE FUNCTION add_previous_prompt_to_agg();
