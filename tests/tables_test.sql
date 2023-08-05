BEGIN;
SELECT plan(2);

-- Test one: Should not allow the user to create a table with another schema_id different from the one he has permission
SELECT set_config('request.jwt.claim.sub', '123e4567-e89b-12d3-a456-426614174000', true);
INSERT INTO auth.users (id, email) VALUES (auth.uid(), 'user1@example.com');
INSERT INTO schemas (id, name, database_name) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'schema1', 'postgres');

SELECT set_config('request.jwt.claim.sub', 'feb0d7f2-e25b-4f18-b601-44de0d8110e6', true);
INSERT INTO auth.users (id, email) VALUES (auth.uid(), 'user2@example.com');
INSERT INTO schemas (id, name, database_name) VALUES ('feb0d7f2-e25b-4f18-b601-44de0d8110e6', 'schema2', 'postgres');

SELECT set_config('request.jwt.claim.sub', '123e4567-e89b-12d3-a456-426614174000', true);

SELECT throws_ok(
  $$INSERT INTO tables (id, name, schema_id) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121db9', 'table1', 'feb0d7f2-e25b-4f18-b601-44de0d8110e6');$$,
  'schema_id does not belong to the current user',
  'Should not allow the user to create a table with another schema_id different from the one he has permission'
);

-- Test two: Should allow the user to create a table with the schema_id he has permission
INSERT INTO tables (id, name, schema_id, columns, indexes) VALUES ('2282c0b9-5ed7-4af1-9e85-98ee0f121db9', 'table1', '123e4567-e89b-12d3-a456-426614174000', '[]', '[]');
SELECT results_eq(
  'SELECT COUNT(*)::bigint FROM tables WHERE id = ''2282c0b9-5ed7-4af1-9e85-98ee0f121db9'' AND schema_id = ''123e4567-e89b-12d3-a456-426614174000''',
  ARRAY[1]::bigint[],
  'Should allow the user to create a table with the schema_id he has permission'
);

SELECT * FROM finish();

ROLLBACK;
