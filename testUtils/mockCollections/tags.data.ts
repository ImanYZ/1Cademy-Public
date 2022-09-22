const collection = "tags";
interface Tag {
  documentId?: string;
  title: string;
  tags: string[];
  tagIds: string[];
  node: string;
  createdAt: Date;
  updatedAt: Date;
}
const data: Tag[] = [
  {
    documentId: "C7L3gNbNp5reFjQf8vAb",
    title: "1Cademy",
    tags: [],
    tagIds: [],
    node: "r98BjyFDCe4YyLA3U8ZE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    documentId: "kAyByld1ou6YNfv36K6a",
    title: "Cocaine",
    tags: ["Data Science & something", "slkdjflsdjf"],
    tagIds: ["r98BjyFDCe4YyLA3U8ZE", "a random id"],
    node: "00NwvYhgES9mjNQ9LRhG",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentId: "kAyBiUyTou6YNfv36K6a",
    title: "Cocaine",
    tags: ["Data Science & something", "slkdjflsdjf"],
    tagIds: ["r98BjyFDCe4YyLA3U8ZE", "a random id"],
    node: "OR8UsmsxmeExHG8ekkIY",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const tagsData = { data, collection };

export default tagsData;
