type PromptAggElement = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface DatabaseQuestionDTO {
  id?: string;
  chat_id: string;
  prompt_agg?: PromptAggElement[];
  prompt: string;
  output: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}
