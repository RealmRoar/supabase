BEGIN;

SELECT plan(2);

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
  $$INSERT INTO conversations (id, chat_id, prompt, output) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121dba', 'feb0d7f2-e25b-4f18-b601-44de0d8110e7', '{"text": "Hello"}', '{"text": "Hi"}');$$,
  'chat_id does not belong to the current user',
  'Should not allow the user to create a conversation with another chat_id different from the one he has permission'
);

-- Test two: Should allow the user to create a conversation with the chat_id he has permission
INSERT INTO conversations (id, chat_id, prompt, output) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121dba', '123e4567-e89b-12d3-a456-426614174001', '{"text": "Hello"}', '{"text": "Hi"}');
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM conversations WHERE id = ''2282c0b9-5ed7-4af1-9e85-98ee0f121dba'' AND chat_id = ''123e4567-e89b-12d3-a456-426614174001''',
  ARRAY[1]::bigint[],
  'Should allow the user to create a conversation with the chat_id he has permission'
);

SELECT * FROM finish();

ROLLBACK;
