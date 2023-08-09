BEGIN;

-- Setting up the test user
SELECT set_config('request.jwt.claim.sub', '123e4567-e89b-12d3-a456-426614174000', true);
SELECT auth.uid();

SELECT plan(2);

-- Inserting a schema for testing purposes
INSERT INTO auth.users (id, email) VALUES (auth.uid(), 'user1@example.com');
INSERT INTO schemas (id, name, database_name) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'schema1', 'postgres');

-- Test one: Should be able to create a chat
INSERT INTO chats (id, title, schema_id, user_id) VALUES ('123e4567-e89b-12d3-a456-426614174001', 'chat1', '123e4567-e89b-12d3-a456-426614174000', auth.uid());
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM chats WHERE id = ''123e4567-e89b-12d3-a456-426614174001''',
  ARRAY[1]::bigint[],
  'Should be able to create a chat'
);

-- Test two: Should not allow user to create a chat with another user_id different from the logged in one
INSERT INTO auth.users (id, email) VALUES ('feb0d7f2-e25b-4f18-b601-44de0d8110e7', 'user2@example.com');
INSERT INTO chats (id, title, schema_id, user_id) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121dba', 'chat2', '123e4567-e89b-12d3-a456-426614174000', 'feb0d7f2-e25b-4f18-b601-44de0d8110e7');
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM chats WHERE id = ''2282c0b9-5ed7-4af1-9e85-98ee0f121dba'' AND user_id = ''feb0d7f2-e25b-4f18-b601-44de0d8110e7''',
  ARRAY[0]::bigint[],
  'Should not allow user to create a chat with another user_id different from the logged in one'
);

SELECT * FROM finish();

ROLLBACK;
