import {
  OpenAIApi,
} from "https://cdn.skypack.dev/-/openai-edge@v1.2.2-cBgM4wwmhuT6rhqax2SI/dist=es2019,mode=imports/optimized/openai-edge.js";

import { OpenAIPromptDTO } from "../dtos/index.ts";
export class OpenAIDispatches {
  private openai: OpenAIApi;

  constructor(openAIInstance: OpenAIApi) {
    this.openai = openAIInstance;
  }

  async chatCompletation(prompt: OpenAIPromptDTO): Promise<string> {
    const result = await this.openai.createChatCompletion(prompt);

    return result;
  }
}