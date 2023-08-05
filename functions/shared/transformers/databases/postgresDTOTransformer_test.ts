import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";

import { PostgresDTO, DatabaseTableDTO } from "../../dtos/index.ts";
import { PostgresDTOTransformer } from "./postgresDTO.transformer.ts"

const sampleData: PostgresDTO = [
  {
    table: "SampleTable",
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
        index_name: "sampletable_pkey",
        column_name: "id",
      },
    ],
  },
];

Deno.test("should throw error if schemaId is not provided", () => {
  const transformer = new PostgresDTOTransformer(sampleData);
  const fnTest = () => {
    transformer.transformToDatabaseTableDTO("");
  };
  assertThrows(fnTest, Error, "Schema Id is required.");
});

Deno.test(
  "should successfully transform PostgresDTO to DatabaseTableDTO",
  () => {
    const transformer = new PostgresDTOTransformer(sampleData);
    const result = transformer.transformToDatabaseTableDTO("sample-schema-id");
    const expected: DatabaseTableDTO[] = [
      {
        name: "SampleTable",
        columns: [
          {
            name: "id",
            type: "integer",
          },
          {
            name: "name",
            type: "character varying",
          },
        ],
        indexes: [
          {
            name: "sampletable_pkey",
            columns: ["id"],
          },
        ],
        schema_id: "sample-schema-id",
      },
    ];
    assertEquals(result, expected);
  }
);