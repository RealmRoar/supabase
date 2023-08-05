import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { PostgresDTO } from "../shared/dtos/index.ts";
import { PostgresDTOValidator } from "../shared/validators/index.ts";
import { PostgresDTOTransformer } from "../shared/transformers/index.ts";

serve(async (req: Request) => {
  const body: PostgresDTO = await req.json();
  
  try {
    const validator = new PostgresDTOValidator(body);
    validator.validate();
  } catch (error) {
    return new Response(error.message, {
      status: 422,
    });
  }

  // Schema Id
  const schemaId = "12345";

  // Transformer
  const transformer = new PostgresDTOTransformer(body);
  const databaseTableDTO = transformer.transformToDatabaseTableDTO(schemaId);

  // WIP

  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
});