BEGIN;

SELECT plan(4);

-- Test one: Should not allow the user to create a conversation with another chat_id different from the one he has permission
SELECT set_config('request.jwt.claim.sub', '123e4567-e89b-12d3-a456-426614174000', true);
INSERT INTO auth.users (id, email) VALUES (auth.uid(), 'user1@example.com');
INSERT INTO schemas (id, name, database_name) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'schema1', 'postgres');
INSERT INTO chats (id, title, schema_id, user_id) VALUES ('123e4567-e89b-12d3-a456-426614174001', 'chat1', '123e4567-e89b-12d3-a456-426614174000', auth.uid());

SELECT set_config('request.jwt.claim.sub', 'feb0d7f2-e25b-4f18-b601-44de0d8110e6', true);
INSERT INTO auth.users (id, email) VALUES (auth.uid(), 'user2@example.com');
INSERT INTO schemas (id, name, database_name) VALUES ('feb0d7f2-e25b-4f18-b601-44de0d8110e6', 'schema2', 'postgres');
INSERT INTO chats (id, title, schema_id, user_id) VALUES ('feb0d7f2-e25b-4f18-b601-44de0d8110e7', 'chat2', 'feb0d7f2-e25b-4f18-b601-44de0d8110e6', auth.uid());

SELECT set_config('request.jwt.claim.sub', '123e4567-e89b-12d3-a456-426614174000', true);

SELECT throws_ok(
  $$INSERT INTO questions (id, chat_id, prompt, output) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121dba', 'feb0d7f2-e25b-4f18-b601-44de0d8110e7', 'Hello', 'Hi');$$,
  'chat_id does not belong to the current user',
  'Should not allow the user to create a conversation with another chat_id different from the one he has permission'
);

-- Test two: Should allow the user to create a conversation with the chat_id he has permission
INSERT INTO questions (id, chat_id, prompt, output) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121dba', '123e4567-e89b-12d3-a456-426614174001', 'Hello', 'Hi');
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM questions WHERE id = ''2282c0b9-5ed7-4af1-9e85-98ee0f121dba'' AND chat_id = ''123e4567-e89b-12d3-a456-426614174001''',
  ARRAY[1]::bigint[],
  'Should allow the user to create a conversation with the chat_id he has permission'
);

-- Test three: Should add prompt_agg when it's NULL
INSERT INTO chats (id, title, schema_id, user_id) VALUES ('6435cf10-4726-40d2-9b4f-f93d4f9610b1', 'chat2', '123e4567-e89b-12d3-a456-426614174000', auth.uid());
INSERT INTO questions (id, chat_id, prompt, output) VALUES ('24d370c3-1057-4430-9f58-eff0788ef74f', '6435cf10-4726-40d2-9b4f-f93d4f9610b1', 'First question', 'First answer');
INSERT INTO questions (id, chat_id, prompt, output) VALUES ('c08b3757-567a-4aac-8220-09a2a300399a', '6435cf10-4726-40d2-9b4f-f93d4f9610b1', 'Second question', 'Second answer');

SELECT results_eq(
  'SELECT prompt_agg FROM questions WHERE id = ''c08b3757-567a-4aac-8220-09a2a300399a''',
  'SELECT ''[{"role": "user", "content": "First question"}, {"role": "assistant", "content": "First answer"}]''::jsonb',
  'Should add prompt_agg when it''s NULL'
);

-- Test four: Should append to prompt_agg when it already has data
INSERT INTO chats (id, title, schema_id, user_id) VALUES ('139b6ec7-a88b-4fe4-ae7a-ad52f411c189', 'chat3', '123e4567-e89b-12d3-a456-426614174000', auth.uid());
INSERT INTO questions (id, chat_id, prompt, output, prompt_agg) VALUES ('a1b2c3d4-5678-90ab-cdef-1234567890ab', '139b6ec7-a88b-4fe4-ae7a-ad52f411c189', 'Initial question', 'Initial answer', '[{"role": "user", "content": "Previous question"}, {"role": "assistant", "content": "Previous answer"}]'::jsonb);
INSERT INTO questions (id, chat_id, prompt, output) VALUES ('b2c3d4e5-6789-01ab-cdef-2345678901bc', '139b6ec7-a88b-4fe4-ae7a-ad52f411c189', 'New question', 'New answer');

SELECT results_eq(
  'SELECT prompt_agg FROM questions WHERE id = ''b2c3d4e5-6789-01ab-cdef-2345678901bc''',
  'SELECT ''[{"role": "user", "content": "Previous question"}, {"role": "assistant", "content": "Previous answer"}, {"role": "user", "content": "Initial question"}, {"role": "assistant", "content": "Initial answer"}]''::jsonb',
  'Should append to prompt_agg when it already has data'
);

SELECT * FROM finish();

ROLLBACK;
