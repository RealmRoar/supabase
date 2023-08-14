import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import {
  DatabaseTableDTO,
  DatabaseSchemaDTO,
  DatabaseChatDTO,
  DatabaseQuestionDTO,
} from "../dtos/index.ts";

export class SupabaseDispatches {
  private supabase;

  constructor(supabaseInstance: SupabaseClient) {
    this.supabase = supabaseInstance;
  }

  async insertDatabaseTableDTO(data: DatabaseTableDTO[]): Promise<void> {
    const { error } = await this.supabase.from("tables").insert(data);

    if (error) {
      throw error;
    }
  }

  async insertDatabaseSchemaDTO(
    data: DatabaseSchemaDTO
  ): Promise<DatabaseSchemaDTO> {
    const { data: result, error } = await this.supabase
      .from("schemas")
      .insert([data])
      .select();

    if (error) {
      throw error;
    }

    return result[0];
  }

  async insertDatabaseQuestionDTO(
    data: DatabaseQuestionDTO
  ): Promise<DatabaseQuestionDTO> {
    const { data: result, error } = await this.supabase
      .from("questions")
      .insert([data])
      .select();

    if (error) {
      throw error;
    }

    return result[0];
  }

  async getDatabaseSchemaDTO(
    schemaId: string
  ): Promise<DatabaseSchemaDTO | null> {
    const { data, error } = await this.supabase
      .from("schemas")
      .select()
      .eq("id", schemaId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getdatabaseTableDTO(
    schemaId: string
  ): Promise<DatabaseTableDTO[] | null> {
    const { data, error } = await this.supabase
      .from("tables")
      .select()
      .eq("schema_id", schemaId);

    if (error) {
      throw error;
    }

    return data;
  }

  async insertDatabaseChatDTO(data: DatabaseChatDTO): Promise<DatabaseChatDTO> {
    const { data: result, error } = await this.supabase
      .from("chats")
      .insert([data])
      .select();

    if (error) {
      throw error;
    }

    return result[0];
  }

  async getUserIdAuth(): Promise<string> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      throw error;
    }

    const { user } = data;

    return user?.id ?? "";
  }

  async getDatabaseChatDTO(id: string): Promise<DatabaseChatDTO | null> {
    const { data, error } = await this.supabase
      .from("chats")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getDatabaseQuestionDTOByChatId(
    chatId: string | undefined
  ): Promise<DatabaseQuestionDTO | null> {
    if (!chatId) {
      return null;
    }

    const { data, error } = await this.supabase
      .from("questions")
      .select()
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getDatabaseTablesDTOByTabblesNameArray(
    tablesNameArray: string[]
  ): Promise<DatabaseTableDTO[] | null> {
    const { data, error } = await this.supabase
      .from("tables")
      .select()
      .in("name", tablesNameArray);

    if (error) {
      throw error;
    }

    return data;
  }
}
