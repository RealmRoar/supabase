interface messages {
  role: string;
  content: string;
}

export interface OpenAIPromptDTO {
  model: string;
  messages: messages[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}