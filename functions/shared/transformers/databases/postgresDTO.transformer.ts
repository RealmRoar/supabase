import { PostgresDTO, DatabaseTableDTO } from "../../dtos/index.ts";

export class PostgresDTOTransformer {
  data: PostgresDTO;

  constructor(data: PostgresDTO) {
    this.data = data;
  }

  transformToDatabaseTableDTO(schemaId: string): DatabaseTableDTO[] {
    if (!schemaId) throw new Error("Schema Id is required.");

    return this.data.map((table) => ({
      name: table.table,
      columns: table.columns.map((col) => ({
        name: col.column_name,
        type: col.data_type,
      })),
      indexes: table.indexes.map((idx) => ({
        name: idx.index_name,
        columns: [idx.column_name],
      })),
      schema_id: schemaId,
    }));
  }
}
