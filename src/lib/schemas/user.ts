import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

export const TypesenseUserSchema = [
  { name: "username", type: "string" },
  { name: "name", type: "string" },
  { name: "imageUrl", type: "string" },
] as CollectionFieldSchema[];
