import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { clientTypesense } from "@/lib/typesense/typesense.config";

import InstitutionsSchemaTS from "./institutions.schema";
import NodesSchemaTS from "./nodes.schema";
import ProcessedReferencesSchemaTS from "./processedReferences.schema";
import UsersSchemaTS from "./users.schema";

export class TypesenseMock {
  constructor(private schema: CollectionFieldSchema[], private data: any[], private collecion: string) {}

  public getData = () => this.data;
  public getCollection = () => this.collecion;

  public populate = async () => {
    if(await clientTypesense.collections(this.collecion).exists()) {
      await this.clean();
    }
    await clientTypesense.collections().create({
      name: this.collecion,
      fields: this.schema,
    });
    await clientTypesense.collections(this.collecion).documents().import(this.data);
  };

  public clean = async () => {
    await clientTypesense.collections(this.collecion).delete();
  };
}

export { InstitutionsSchemaTS, NodesSchemaTS, ProcessedReferencesSchemaTS, UsersSchemaTS };
