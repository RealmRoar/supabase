import { Column, Index, Table, PostgresDTO } from "../../dtos/databases/postgres.dto.ts";
import { isObject, hasStringProperty } from "../utils/validationHelpers.ts";

export class PostgresDTOValidator {
  data: PostgresDTO | unknown;

  constructor(data: PostgresDTO | unknown) {
    this.data = data;
  }

  private isValidColumn(column: unknown): column is Column {
    if (
      isObject(column) &&
      hasStringProperty(column, "data_type") &&
      hasStringProperty(column, "column_name")
    ) {
      return true;
    }
    throw new Error(`Invalid Column: ${JSON.stringify(column)}`);
  }

  private isValidIndex(index: unknown): index is Index {
    if (
      isObject(index) &&
      hasStringProperty(index, "index_name") &&
      hasStringProperty(index, "column_name")
    ) {
      return true;
    }

    throw new Error(`Invalid Index: ${JSON.stringify(index)}`);
  }

  private isValidTable(table: unknown): table is Table {
    if (!isObject(table)) {
      throw new Error("Invalid table data.");
    }

    if (!hasStringProperty(table, "table")) {
      throw new Error(`Invalid Table name: ${JSON.stringify(table)}`);
    }

    if (!Array.isArray(table.columns)) {
      throw new Error(`Columns for Table ${table.table} should be an array.`);
    }

    for (const column of table.columns) {
      this.isValidColumn(column);
    }

    if (!Array.isArray(table.indexes)) {
      throw new Error(`Indexes for Table ${table.table} should be an array.`);
    }

    for (const index of table.indexes) {
      this.isValidIndex(index);
    }

    return true;
  }

  public validate(): void {
    if (!Array.isArray(this.data)) {
      throw new Error("Data should be an array of tables.");
    }

    for (const table of this.data) {
      this.isValidTable(table);
    }
  }
}
