import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { spy } from "https://deno.land/x/mock@0.15.2/mod.ts";
import { Dispatches } from "./supabase.dispatches.ts";
import { DatabaseTableDTO } from "../dtos/index.ts";

type InsertData = DatabaseTableDTO[];
const mockSupabase = {
  from: spy(() => {
    return {
      insert: spy((data: InsertData) => {
        if (data[0].name === "ErrorTable") {
          return Promise.resolve({ error: new Error("Mocked Error") });
        }
        return Promise.resolve({});
      }),
    };
  }),
};

Deno.test("should successfully insert DatabaseTableDTO", async () => {
  const dispatch = new Dispatches(mockSupabase as unknown as SupabaseClient);

  const sampleDTO: DatabaseTableDTO = {
    name: "SampleTable",
    columns: [],
    indexes: [],
    schema_id: "sample-schema-id",
  };

  await dispatch.insertDatabaseTableDTO(sampleDTO);

  assertEquals(mockSupabase.from.calls.length, 1);
  assertEquals(mockSupabase.from.calls[0].args, ["tables"]);
});

Deno.test("should throw error for invalid data", () => {
  const dispatch = new Dispatches(mockSupabase as unknown as SupabaseClient);

  const errorDTO: DatabaseTableDTO = {
    name: "ErrorTable",
    columns: [],
    indexes: [],
    schema_id: "error-schema-id",
  };

  const fnTest = async () => {
    await dispatch.insertDatabaseTableDTO(errorDTO);
  };

  assertRejects(fnTest, Error, "Mocked Error");
});
