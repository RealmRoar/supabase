import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { OpenAIPromptDTO } from "../dtos/index.ts";
import { OpenAIHttpDispatches } from "./openaiHttp.dispatches.ts";

const originalFetch = globalThis.fetch;

const mockFetch = (
  input: string | Request | URL,
  init?: RequestInit
): Promise<Response> => {
  if (
    typeof input === "string" &&
    JSON.parse(init!.body as string).model === "ErrorModel"
  ) {
    return Promise.reject(new Error("Mocked OpenAI Error"));
  }
  return Promise.resolve(
    new Response(
      JSON.stringify({ choices: [{ message: { content: "Mocked Response" } }] })
    )
  );
};

globalThis.fetch = mockFetch;

Deno.test("should successfully get chat completion", async () => {
  const dispatch = new OpenAIHttpDispatches("mockedApiKey");

  const sampleDTO: OpenAIPromptDTO = {
    model: "SampleModel",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    max_tokens: 150,
    stream: false
  };

  const result = await dispatch.chatCompletation(sampleDTO);

  assertEquals(result, "Mocked Response");
});

Deno.test("should throw error for invalid model", () => {
  const dispatch = new OpenAIHttpDispatches("mockedApiKey");

  const errorDTO: OpenAIPromptDTO = {
    model: "ErrorModel",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    max_tokens: 150,
    stream: false
  };

  const fnTest = async () => {
    await dispatch.chatCompletation(errorDTO);
  };

  assertRejects(fnTest, Error, "Mocked OpenAI Error");
});

Deno.test("cleanup", () => {
  globalThis.fetch = originalFetch;
});