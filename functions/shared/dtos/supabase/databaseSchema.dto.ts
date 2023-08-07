export enum DatabaseType {
  Postgres = "Postgres",
}

export interface DatabaseSchemaDTO {
  id?: string;
  name: string;
  database_name: DatabaseType;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}
