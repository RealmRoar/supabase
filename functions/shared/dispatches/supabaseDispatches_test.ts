import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { spy } from "https://deno.land/x/mock@0.15.2/mod.ts";
import { SupabaseDispatches } from "./index.ts";
import {
  DatabaseTableDTO,
  DatabaseSchemaDTO,
  DatabaseChatDTO,
  DatabaseType,
} from "../dtos/index.ts";

type InsertData = DatabaseTableDTO[];
let lastInsertedDataSchema: DatabaseSchemaDTO[] | null = null;
let lastInsertedDataChat: DatabaseChatDTO[] | null = null;
const mockSupabase = {
  from: spy((tableName: string) => {
    switch (tableName) {
      case "tables":
        return {
          insert: spy((data: InsertData) => {
            if (data[0].name === "ErrorTable") {
              return Promise.resolve({ error: new Error("Mocked Error") });
            }
            return Promise.resolve({});
          }),
        };

      case "schemas":
        return {
          insert: spy((data: DatabaseSchemaDTO[]) => {
            lastInsertedDataSchema = data;
            return {
              select: spy(() => {
                if (
                  lastInsertedDataSchema &&
                  lastInsertedDataSchema[0].name === "ErrorSchema"
                ) {
                  return Promise.resolve({
                    error: new Error("Mocked Schema Error"),
                  });
                }
                return Promise.resolve({ data: lastInsertedDataSchema });
              }),
            };
          }),
          select: spy(() => {
            return {
              eq: spy((_column: string, value: string) => {
                return {
                  single: spy(() => {
                    if (value === "ErrorSchemaId") {
                      return Promise.resolve({
                        error: new Error("Mocked Schema Error"),
                      });
                    }
                    return Promise.resolve({
                      data: lastInsertedDataSchema
                        ? lastInsertedDataSchema[0]
                        : null,
                    });
                  }),
                };
              }),
            };
          }),
        };

      case "chats":
        return {
          insert: spy((data: DatabaseChatDTO[]) => {
            lastInsertedDataChat = data;
            return {
              select: spy(() => {
                if (
                  lastInsertedDataChat &&
                  lastInsertedDataChat[0].title === "ErrorChat"
                ) {
                  return Promise.resolve({
                    error: new Error("Mocked Chat Error"),
                  });
                }
                return Promise.resolve({ data: lastInsertedDataChat });
              }),
            };
          }),
        };

      default:
        throw new Error("Table not mocked");
    }
  }),
};

Deno.test("should successfully insert DatabaseTableDTO", async () => {
  const dispatch = new SupabaseDispatches(mockSupabase as unknown as SupabaseClient);

  const sampleDTO: DatabaseTableDTO = {
    name: "SampleTable",
    columns: [],
    indexes: [],
    schema_id: "sample-schema-id",
  };

  await dispatch.insertDatabaseTableDTO([sampleDTO]);

  assertEquals(mockSupabase.from.calls.length, 1);
  assertEquals(mockSupabase.from.calls[0].args, ["tables"]);
});

Deno.test("should throw error for invalid data", () => {
  const dispatch = new SupabaseDispatches(mockSupabase as unknown as SupabaseClient);

  const errorDTO: DatabaseTableDTO = {
    name: "ErrorTable",
    columns: [],
    indexes: [],
    schema_id: "error-schema-id",
  };

  const fnTest = async () => {
    await dispatch.insertDatabaseTableDTO([errorDTO]);
  };

  assertRejects(fnTest, Error, "Mocked Error");
});

Deno.test("should successfully insert DatabaseSchemaDTO", async () => {
  const dispatch = new SupabaseDispatches(
    mockSupabase as unknown as SupabaseClient
  );

  const sampleDTO: DatabaseSchemaDTO = {
    name: "SampleSchema",
    database_name: DatabaseType.Postgres,
    user_id: "sample-user-id",
  };

  const result = await dispatch.insertDatabaseSchemaDTO(sampleDTO);

  assertEquals(result.name, "SampleSchema");
  assertEquals(result.database_name, DatabaseType.Postgres);
  assertEquals(result.user_id, "sample-user-id");
});

Deno.test("should throw error for invalid DatabaseSchemaDTO", async () => {
  const dispatch = new SupabaseDispatches(
    mockSupabase as unknown as SupabaseClient
  );

  const errorDTO: DatabaseSchemaDTO = {
    name: "ErrorSchema",
    database_name: DatabaseType.Postgres,
    user_id: "error-user-id",
  };

  const fnTest = async () => {
    await dispatch.insertDatabaseSchemaDTO(errorDTO);
  };

  await assertRejects(fnTest, Error, "Mocked Schema Error");
});

Deno.test(
  "should return correct DatabaseSchemaDTO after insertion",
  async () => {
    const dispatch = new SupabaseDispatches(
      mockSupabase as unknown as SupabaseClient
    );

    const sampleDTO: DatabaseSchemaDTO = {
      name: "ReturnSchema",
      database_name: DatabaseType.Postgres,
      user_id: "return-user-id",
    };

    const result = await dispatch.insertDatabaseSchemaDTO(sampleDTO);

    assertEquals(result, sampleDTO);
  }
);

Deno.test("should successfully retrieve DatabaseSchemaDTO by id", async () => {
  const dispatch = new SupabaseDispatches(
    mockSupabase as unknown as SupabaseClient
  );

  const sampleDTO: DatabaseSchemaDTO = {
    name: "RetrieveSchema",
    database_name: DatabaseType.Postgres,
    user_id: "retrieve-user-id",
  };

  lastInsertedDataSchema = [sampleDTO];

  const result = await dispatch.getDatabaseSchemaDTO(
    "123e4567-e89b-12d3-a456-426614174000"
  );

  assertEquals(result, sampleDTO);
});

Deno.test(
  "should throw error when trying to retrieve non-existent DatabaseSchemaDTO",
  async () => {
    const dispatch = new SupabaseDispatches(
      mockSupabase as unknown as SupabaseClient
    );

    const fnTest = async () => {
      await dispatch.getDatabaseSchemaDTO("ErrorSchemaId");
    };

    await assertRejects(fnTest, Error, "Mocked Schema Error");
  }
);

Deno.test("should successfully insert DatabaseChatDTO", async () => {
  const dispatch = new SupabaseDispatches(
    mockSupabase as unknown as SupabaseClient
  );

  const sampleDTO: DatabaseChatDTO = {
    title: "SampleChat",
    schema_id: "sample-schema-id",
    tables: [],
  };

  const result = await dispatch.insertDatabaseChatDTO(sampleDTO);

  assertEquals(result.title, "SampleChat");
});

Deno.test("should throw error for invalid DatabaseChatDTO", async () => {
  const dispatch = new SupabaseDispatches(
    mockSupabase as unknown as SupabaseClient
  );

  const errorDTO: DatabaseChatDTO = {
    title: "ErrorChat",
    schema_id: "error-schema-id",
    tables: [],
  };

  const fnTest = async () => {
    await dispatch.insertDatabaseChatDTO(errorDTO);
  };

  await assertRejects(fnTest, Error, "Mocked Chat Error");
});