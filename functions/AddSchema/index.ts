import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { createClient } from "@supabase/supabase-js";

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

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.all('/', async (req: ExpressRequest, res: ExpressResponse) => {
  if (req.method === "OPTIONS") {
    return res.status(200).set(corsHeaders).send("ok");
  }

  const body: IRequestData = req.body;
  const { tables, schema } = body;

  // Validate
  try {
    validateData(tables, schema);
  } catch (error) {
    return res.status(422).set(corsHeaders).send(error.message);
  }

  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
    {
      global: {
        headers: { ...corsHeaders, Authorization: req.get("Authorization")! },
      },
    }
  );

  const dispatches = new SupabaseDispatches(supabaseClient);
  const { id: schemaId } = await dispatches.insertDatabaseSchemaDTO(schema);

  const transformer = new PostgresDTOTransformer(tables);
  const databaseTableDTO = transformer.transformToDatabaseTableDTO(schemaId!);

  await dispatches.insertDatabaseTableDTO(databaseTableDTO);
  return res.status(200).set({ ...corsHeaders, "Content-Type": "application/json" }).json(schemaId);
});

const port = parseInt(process.env.PORT || "8000");
app.listen(port, () => {
  console.log(`Function listening on port ${port}`);
});
