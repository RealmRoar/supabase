import { spy } from "https://deno.land/x/mock@0.15.2/mod.ts";
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { OpenAIApi } from "https://cdn.skypack.dev/-/openai-edge@v1.2.2-cBgM4wwmhuT6rhqax2SI/dist=es2019,mode=imports/optimized/openai-edge.js";
import { OpenAIPromptDTO } from "../dtos/index.ts";
import { OpenAIStreamDispatches } from "./index.ts";

const mockOpenAI = {
  createChatCompletion: spy((prompt: OpenAIPromptDTO) => {
    if (prompt.model === "ErrorModel") {
      return Promise.reject(new Error("Mocked OpenAI Error"));
    }
    return Promise.resolve("Mocked Response");
  }),
};

Deno.test("should successfully get chat completion", async () => {
  const dispatch = new OpenAIStreamDispatches(mockOpenAI as unknown as OpenAIApi);

  const sampleDTO: OpenAIPromptDTO = {
    model: "SampleModel",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    max_tokens: 150,
    stream: false,
  };

  const result = await dispatch.chatCompletation(sampleDTO);

  assertEquals(result, "Mocked Response");
});

Deno.test("should throw error for invalid model", () => {
  const dispatch = new OpenAIStreamDispatches(mockOpenAI as unknown as OpenAIApi);

  const errorDTO: OpenAIPromptDTO = {
    model: "ErrorModel",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    max_tokens: 150,
    stream: false,
  };

  const fnTest = async () => {
    await dispatch.chatCompletation(errorDTO);
  };

  assertRejects(fnTest, Error, "Mocked OpenAI Error");
});

