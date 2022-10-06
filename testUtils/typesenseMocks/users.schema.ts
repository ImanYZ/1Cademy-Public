import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

export default [
  { name: "username", type: "string" },
  { name: "name", type: "string" },
  { name: "imageUrl", type: "string" },
] as CollectionFieldSchema[];
