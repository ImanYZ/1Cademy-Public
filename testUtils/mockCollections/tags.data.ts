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
    documentId: "20uCsZ9at3glZZmq2vMv",
    title: "1man",
    tags: [],
    tagIds: [],
    node: "ti7rc0S0nv7RkTIGSkWc",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentId: "36puAFPsMTpx7Z4ES9ml",
    title: "1man",
    tags: ["Haroon"],
    tagIds: ["ti7rc0S0nv7RkTIGSkWc"],
    node: "011Y1p6nPmPvfHuhkAyw",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentId: "0Yyc9HobchfKIHEAfV0c",
    title: "1man",
    tags: [],
    tagIds: ["9BVhNniLS940DBVqKbFR"],
    node: "iUex43wFn3yzFcDbma04",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentId: "IsQb1mziTK34QH3rY0ps",
    title: "1Cademy",
    tags: [],
    tagIds: ["9BVhNniLS940DBVqKbFR"],
    node: "9BVhNniLS940DBVqKbFR",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
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
    documentId: "kAyHgnb1ou6YNfv36K6a",
    title: "Cocaine",
    tags: ["Data Science & something", "slkdjflsdjf"],
    tagIds: ["00NwvYhgES9mjNQ9LRhG"],
    node: "tKxTypLrxds",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const tagsData = { data, collection };

export default tagsData;
