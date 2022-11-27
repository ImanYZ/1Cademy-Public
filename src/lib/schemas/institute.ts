import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

export const TypesenseInstituteSchema = [
  { name: "id", type: "string" },
  { name: "name", type: "string" },
] as CollectionFieldSchema[];
