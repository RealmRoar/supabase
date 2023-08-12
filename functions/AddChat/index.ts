import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { OpenAIHttpDispatches } from "../shared/dispatches/index.ts";
import {
  OpenAIPromptDTO,
  DatabaseSchemaDTO,
  DatabaseTableDTO,
  DatabaseChatDTO
} from "../shared/dtos/index.ts";

import { SupabaseDispatches } from "../shared/dispatches/index.ts";

interface IRequestData {
  schemaId: string;
  prompt: string;
}

serve(async (req: Request) => {
  const body: IRequestData = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  const supabaseDispatches = new SupabaseDispatches(supabaseClient);

  const schema: DatabaseSchemaDTO | null =
    await supabaseDispatches.getDatabaseSchemaDTO(body.schemaId);

  if (!schema) {
    return new Response(JSON.stringify(false), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const tables: DatabaseTableDTO[] = await supabaseDispatches.getdatabaseTableDTO(
    body.schemaId
  ) || [];

  const tableNames = tables.map((table) => table.name);
  const tableNamesString = tableNames.join(", ");

  const promptMessage = `
    You are an artificial intelligence specialized in addressing data science challenges and assisting with SQL for the database ${schema.database_name}.\n\n
    Based on the user's question: Which tables from this database would you use to execute the query? \n\n
    Tables: ${tableNamesString}.\n\n
    Questions: ${body.prompt}.\n\n

    Note:\n\n
    Focus only on the tables, not the query itself. Retain the exact table names as provided, for instance, do not change "users" to "user".\n\n
    Return only output formatted as a JSON object. No more! \n\n

    Please return in the following JSON format:\n\n
    { name: "🔍 Add a title with an emoji about the user's question", tables: ['table1', 'table2', ...] }
  `;

  const openAIPrompt: OpenAIPromptDTO = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: promptMessage }],
    max_tokens: 1000,
    temperature: 0.8,
    stream: false,
  };

    const apiKey: string | undefined = Deno.env.get("OPENAI_KEY");
    const openaiDispatches = new OpenAIHttpDispatches(apiKey);

  const response = await openaiDispatches.chatCompletation(openAIPrompt);
  const content = await JSON.parse(response);

  const userId = await supabaseDispatches.getUserIdAuth();

  const responseInitial: DatabaseChatDTO = {
    title: content?.name || "unknown chat",
    schema_id: body.schemaId,
    tables: content?.tables || [],
    user_id: userId,
  };

  const chat = await supabaseDispatches.insertDatabaseChatDTO(responseInitial);

  return new Response(JSON.stringify(chat), {
    headers: { "Content-Type": "application/json" },
  });
})
