import {
  DatabaseSchemaDTO,
  DatabaseType,
} from "../../dtos/supabase/databaseSchema.dto.ts";
import { isObject, hasStringProperty } from "../utils/validationHelpers.ts";

export class DatabaseSchemaDTOValidator {
  data: DatabaseSchemaDTO | unknown;

  constructor(data: DatabaseSchemaDTO | unknown) {
    this.data = data;
  }

  private isValidDatabaseType(
    databaseType: unknown
  ): databaseType is DatabaseType {
    return Object.values(DatabaseType).includes(databaseType as DatabaseType);
  }

  public validate(): void {
    if (!isObject(this.data)) {
      throw new Error("Data should be an object.");
    }

    if (!hasStringProperty(this.data, "name")) {
      throw new Error(`Invalid name: ${JSON.stringify(this.data?.name)}`);
    }

    if (
      !hasStringProperty(this.data, "database_name") ||
      !this.isValidDatabaseType(this.data.database_name)
    ) {
      throw new Error(
        `Invalid database name: ${JSON.stringify(this.data?.database_name)}`
      );
    }

    if (this.data.id && typeof this.data.id !== "string") {
      throw new Error(`Invalid ID: ${JSON.stringify(this.data.id)}`);
    }

    if (this.data.user_id && typeof this.data.user_id !== "string") {
      throw new Error(`Invalid User ID: ${JSON.stringify(this.data.user_id)}`);
    }

    if (this.data.created_at && !(this.data.created_at instanceof Date)) {
      throw new Error(
        `Invalid Created At: ${JSON.stringify(this.data.created_at)}`
      );
    }

    if (this.data.updated_at && !(this.data.updated_at instanceof Date)) {
      throw new Error(
        `Invalid Updated At: ${JSON.stringify(this.data.updated_at)}`
      );
    }

    if (
      this.data.deleted_at &&
      !(this.data.deleted_at instanceof Date) &&
      this.data.deleted_at !== null
    ) {
      throw new Error(
        `Invalid Deleted At: ${JSON.stringify(this.data.deleted_at)}`
      );
    }
  }
}
