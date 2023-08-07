import { assertThrows } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { DatabaseSchemaDTOValidator } from "./databaseSchemaDTO.validator.ts";

Deno.test("should successfully validate valid data", () => {
  const validPayload = {
    name: "Sample Database",
    database_name: "Postgres",
    id: "12345",
    user_id: "67890",
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };
  const validator = new DatabaseSchemaDTOValidator(validPayload);
  validator.validate();
});

Deno.test("should throw error for invalid database name", () => {
  const invalidPayload = {
    name: "Sample Database",
    database_name: "Invalid", // This is not a valid DatabaseType
  };
  const validator = new DatabaseSchemaDTOValidator(invalidPayload);
  const fnTest = () => {
    validator.validate();
  };
  assertThrows(fnTest, Error, 'Invalid database name: "Invalid"');
});

Deno.test("should throw error for invalid ID type", () => {
  const invalidIDPayload = {
    name: "Sample Database",
    database_name: "Postgres",
    id: 12345,
  };
  const validator = new DatabaseSchemaDTOValidator(invalidIDPayload);
  const fnTest = () => {
    validator.validate();
  };
  assertThrows(fnTest, Error, "Invalid ID: 12345");
});
