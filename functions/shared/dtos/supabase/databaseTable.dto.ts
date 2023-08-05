export interface DatabaseColumn {
  name: string;
  type: string;
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
}

export interface DatabaseTableDTO {
  id?: string;
  name: string;
  columns: DatabaseColumn[];
  indexes: DatabaseIndex[];
  schema_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}
