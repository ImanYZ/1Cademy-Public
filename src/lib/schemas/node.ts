import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

export const TypesenseNodeSchema = [
  { name: "changedAtMillis", type: "int64" }, // DATE_MODIFIED x
  { name: "updatedAt", type: "int64" }, //LAST_VIEWED from updatedAt X
  { name: "content", type: "string" },
  { name: "contributorsNames", type: "string[]" },
  { name: "mostHelpful", type: "int32" },
  { name: "corrects", type: "int32" },
  { name: "wrongs", type: "int32" }, //wrongs X
  { name: "netVotes", type: "int32" }, //NET_NOTES x
  { name: "labelsReferences", type: "string[]" },
  { name: "institutionsNames", type: "string[]" },
  { name: "nodeType", type: "string" },
  { name: "tags", type: "string[]" },
  { name: "title", type: "string" },
  { name: "titlesReferences", type: "string[]" },
  { name: "isTag", type: "bool" },
  { name: "institNames", type: "string[]" },
  { name: "versions", type: "int64" }, // PROPOSALS X
] as CollectionFieldSchema[];

export const TypesenseProcessedReferencesSchema = [{ name: "title", type: "string" }] as CollectionFieldSchema[];
