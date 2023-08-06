import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { DatabaseTableDTO } from "../dtos/index.ts";

export class Dispatches {
  private supabase;

  constructor(supabaseInstance: SupabaseClient) {
    this.supabase = supabaseInstance;
  }

  async insertDatabaseTableDTO(data: DatabaseTableDTO): Promise<void> {
    const { error } = await this.supabase.from("tables").insert([data]);

    if (error) {
      throw error;
    }
  }
}
