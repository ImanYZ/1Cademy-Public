const collection = "tags";
interface Tag {
  id?: string;
  title: string;
  tags: string[];
  tagIds: string[];
  node: string;
  createdAt: Date;
  updatedAt: Date;
}
const data: Tag[] = [
  {
    id: "C7L3gNbNp5reFjQf8vAb",
    title: "1Cademy",
    tags: [],
    tagIds: [],
    node: "r98BjyFDCe4YyLA3U8ZE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const tagsData = { data, collection };

export default tagsData;
