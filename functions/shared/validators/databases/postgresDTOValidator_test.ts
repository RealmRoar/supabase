import { assertThrows } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { PostgresDTOValidator } from "./postgresDTO.validator.ts";

Deno.test("should successfully validate valid data", () => {
  const validPayload = [
    {
      table: "Activities",
      columns: [
        {
          column_name: "id",
          data_type: "integer",
        },
        {
          column_name: "name",
          data_type: "character varying",
        },
      ],
      indexes: [
        {
          index_name: "activities_pkey",
          column_name: "id",
        },
      ],
    },
  ];
  const validator = new PostgresDTOValidator(validPayload);
  validator.validate();
});

Deno.test("should throw error for invalid data type for table name", () => {
  const invalidPayload = [
    {
      table: 12345,
      columns: [],
      indexes: [],
    },
  ];
  const validator = new PostgresDTOValidator(invalidPayload);
  const fnTest = () => {
    validator.validate();
  };
  assertThrows(fnTest, Error, "Invalid Table name: 12345");
});

Deno.test("should throw error for missing columns property", () => {
  const missingColumnsPayload = [
    {
      table: "Activities"
    },
  ];
  const validator = new PostgresDTOValidator(missingColumnsPayload);
  const fnTest = () => {
    validator.validate();
  };
  assertThrows(fnTest, Error, "Columns for Table Activities should be an array.");
});