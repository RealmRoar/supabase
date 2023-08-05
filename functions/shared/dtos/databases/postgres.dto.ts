export interface Column {
  data_type: string;
  column_name: string;
}

export interface Index {
  index_name: string;
  column_name: string;
}

export interface Table {
  table: string;
  columns: Column[];
  indexes: Index[];
}

export type PostgresDTO = Table[];
