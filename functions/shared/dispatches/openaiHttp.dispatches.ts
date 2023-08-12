import { OpenAIPromptDTO } from "../dtos/index.ts";

export class OpenAIHttpDispatches {
  private apiKey: string;
  private endpoint = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey: string | undefined) {
    if (!apiKey) throw new Error("OpenAI API key is required");
    this.apiKey = apiKey;
  }

  async chatCompletation(prompt: OpenAIPromptDTO): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
