import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

import { corsHeaders } from "../shared/cors.ts";
import {
  SupabaseDispatches,
  OpenAIHttpDispatches,
} from "../shared/dispatches/index.ts";
import {
  DatabaseChatDTO,
  DatabaseQuestionDTO,
  DatabaseTableDTO,
  DatabaseSchemaDTO,
  OpenAIPromptDTO,
} from "../shared/dtos/index.ts";

function mountMessage(prompt: string, oldQuestion: DatabaseQuestionDTO, tables: DatabaseTableDTO[], schema: DatabaseSchemaDTO) {
  const hasOldQuestion = !!oldQuestion;

  const minifyTables = tables.map((table) => {
    return {
      table_name: table.name,
      columns: table.columns.map((column) => {
        return {
          column_name: column.name,
        };
      }),
      indexes: table.indexes.map((index) => {
        return {
          index_name: index.name,
        };
      }),
    };
  });

  if (hasOldQuestion) {
    return `
      You are an artificial intelligence specialized in addressing data science challenges and assisting with SQL for the database ${schema.database_name}.\n\n
      The user has interacted with you again, and perhaps your previous response wasn't optimal.\n\n
      Please review all previous conversations and combine them with the user's new question: "${prompt}" to optimize your answer.\n\n

      Notes:\n\n
      - If you didn't meet the user's needs in the previous interaction, try to be polite. For example: "The lion doesn't always get it right. I apologize and will try again."\n\n
      - If the user expresses gratitude, share a snippet from Katy Perry's song "Roar".\n\n
    `;
  }

  return `
    You are an artificial intelligence specialized in addressing data science challenges and assisting with SQL for the database ${
      schema.database_name
    }.\n\n
    Based on the user's question: ${prompt}\n\n
    And also, considering this schema, table name, columns, column types, and indexes in JSON format:\n\n
    ${JSON.stringify(minifyTables)}\n\n

    Please return the SQL in markdown code block format that addresses the user's request.\n\n

    Notes:\n\n
    - Try to leverage the provided indexes.\n\n
    - Use only the SQL syntax that exists in the database ${
      schema.database_name
    }.\n\n
    - Avoid unnecessary chatter, focus on the SQL.\n\n
    - Before sending the SQL, add a lion's roar (rooooooar with random quantities of the letter o and a, but no more than 30 characters). For example, "Roooooar, here's your SQL:"\n\n
  `;
}

interface IRequestData {
  chatId: string;
  prompt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
  const chat: DatabaseChatDTO | null = await supabaseDispatches.getDatabaseChatDTO(body.chatId);
  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  const oldQuestion: DatabaseQuestionDTO | null =
    await supabaseDispatches.getDatabaseQuestionDTOByChatId(chat.id);

  const tables: DatabaseTableDTO[] | null =
    await supabaseDispatches.getDatabaseTablesDTOByTabblesNameArray(
      chat.tables
    );

  const schema: DatabaseSchemaDTO | null =
    await supabaseDispatches.getDatabaseSchemaDTO(chat.schema_id);

  const message = mountMessage(body.prompt, oldQuestion!, tables!, schema!);
  
  const openAIPrompt: OpenAIPromptDTO = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: message,
      },
    ],
    max_tokens: 3000,
    temperature: 0.8,
    stream: false,
  };

  const apiKey: string | undefined = Deno.env.get("OPENAI_KEY");
  const openaiDispatches = new OpenAIHttpDispatches(apiKey);

  const response = await openaiDispatches.chatCompletation(openAIPrompt);
  const question: DatabaseQuestionDTO = {
    chat_id: chat.id!,
    prompt: body.prompt,
    output: response,
  };

  await supabaseDispatches.insertDatabaseQuestionDTO(question);

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
