import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { DatabaseTableDTO, DatabaseSchemaDTO } from "../dtos/index.ts";

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
}
