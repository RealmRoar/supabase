BEGIN;
SELECT set_config('request.jwt.claim.sub', '123e4567-e89b-12d3-a456-426614174000', true);
SELECT auth.uid();

SELECT plan(2);

-- Test one: Should be able to create a schema
INSERT INTO auth.users (id, email) VALUES (auth.uid(), 'user1@example.com');

INSERT INTO schemas (id, name, database_name) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'schema1', 'postgres');
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM schemas WHERE id = ''123e4567-e89b-12d3-a456-426614174000''',
  ARRAY[1]::bigint[],
  'Should be able to create a schema'
);

-- Test two: Should not allow user to create a schema with another user_id different from the one logged in
INSERT INTO auth.users (id, email) VALUES ('feb0d7f2-e25b-4f18-b601-44de0d8110e6', 'user2@example.com');
INSERT INTO schemas (id, name, database_name, user_id) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121db9', 'schema2', 'postgres', 'feb0d7f2-e25b-4f18-b601-44de0d8110e6');
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM schemas WHERE id = ''123e4567-e89b-12d3-a456-426614174000'' AND user_id = ''feb0d7f2-e25b-4f18-b601-44de0d8110e6''',
  ARRAY[0]::bigint[],
  'Should not allow user to create a schema with another user_id different from the one logged in'
);

SELECT * FROM finish();

ROLLBACK;
