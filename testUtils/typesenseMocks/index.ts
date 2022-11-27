import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { clientTypesense } from "@/lib/typesense/typesense.config";

import InstitutionsSchemaTS from "./institutions.schema";
import NodesSchemaTS from "./nodes.schema";
import ProcessedReferencesSchemaTS from "./processedReferences.schema";
import UsersSchemaTS from "./users.schema";

export class TypesenseMock {
  constructor(private schema: CollectionFieldSchema[], private data: any[], private collection: string) {}

  public getData = () => this.data;
  public getCollection = () => this.collection;

  public populate = async () => {
    if (await clientTypesense.collections(this.collection).exists()) {
      await this.clean();
    }
    await clientTypesense.collections().create({
      name: this.collection,
      fields: this.schema,
    });
    if (this.data.length) {
      await clientTypesense.collections(this.collection).documents().import(this.data);
    }
  };

  public clean = async () => {
    await clientTypesense.collections(this.collection).delete();
  };
}

export { InstitutionsSchemaTS, NodesSchemaTS, ProcessedReferencesSchemaTS, UsersSchemaTS };
