import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { PostgresDTO } from "../shared/dtos/index.ts";
import { PostgresDTOValidator } from "../shared/validators/index.ts";

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

  // WIP

  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
