import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

import { corsHeaders } from "../shared/cors.ts";

import { PostgresDTO, DatabaseSchemaDTO } from "../shared/dtos/index.ts";
import { PostgresDTOValidator, DatabaseSchemaDTOValidator } from "../shared/validators/index.ts";
import { PostgresDTOTransformer } from "../shared/transformers/index.ts";

import { SupabaseDispatches } from "../shared/dispatches/index.ts";

function validateData(tables: PostgresDTO, schema: DatabaseSchemaDTO) {
  const validatorPostgresDTO = new PostgresDTOValidator(tables);
  validatorPostgresDTO.validate();

  const validatorDatabaseSchemaDTO = new DatabaseSchemaDTOValidator(schema);
  validatorDatabaseSchemaDTO.validate();
}
interface IRequestData {
  tables: PostgresDTO;
  schema: DatabaseSchemaDTO;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body: IRequestData = await req.json();
  const { tables, schema } = body;

  // Validate
  try {
    validateData(tables, schema);
  } catch (error) {
    return new Response(error.message, {
      status: 422,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  const dispatches = new SupabaseDispatches(supabaseClient);
  const { id: schemaId } = await dispatches.insertDatabaseSchemaDTO(schema);
  
  const transformer = new PostgresDTOTransformer(tables);
  const databaseTableDTO = transformer.transformToDatabaseTableDTO(schemaId!);
  
  await dispatches.insertDatabaseTableDTO(databaseTableDTO);
  return new Response(JSON.stringify(true), {
    headers: { "Content-Type": "application/json" },
  });
});