const collection = "credits";

interface Credits {
  documentId?: string;
  createdAt: Date;
  credits: number;
  deepA: number;
  deepAInst: number;
  iInstValue: number;
  iValue: number;
  ltermA: number;
  meanA: number;
  meanAInst: number;
  tag: string;
  tagId: string;
}

const data: Credits[] = [
  {
    documentId: "0kq7suqGr8RLQMMjuKs9",
    createdAt: new Date(),
    credits: 3,
    deepA: 760,
    deepAInst: 3,
    iInstValue: 7,
    iValue: 3,
    ltermA: 67,
    meanA: 3,
    meanAInst: 5,
    tag: "1Cademy",
    tagId: "C7L3gNbNp5reFjQf8vAb",
  },
];

const creditsData = {
  data,
  collection,
};

export default creditsData;
