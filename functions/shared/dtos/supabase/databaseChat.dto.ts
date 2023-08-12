export interface DatabaseChatDTO {
  id?: string;
  title?: string;
  schema_id: string;
  user_id?: string;
  tables: string[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}