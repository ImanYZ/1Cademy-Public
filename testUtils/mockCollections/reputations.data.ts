const collection = "reputations";

interface data {
  documentId?: string;
  mWrongs: number;
  isAdmin: boolean;
  uname: string;
  tag: string;
  dWrongs: number;
  totalPoints: number;
  positives: number;
  iInst: number;
  dCorrects: number;
  tagId: string;
  createdAt: Date;
  mCorrects: number;
  dInst: number;
  negatives: number;
  lterm: number;
  iCorrects: number;
  iWrongs: number;
  ltermDay: number;
  updatedAt: Date;
  mInst: number;
}

const data = [
  {
    documentId: "002j3xtyl6HL0liNb8Ay",
    mWrongs: 0,
    isAdmin: true,
    uname: "Venkata Sai Suraj Chengalvala",
    tag: "Neurodegenerative Diseases",
    dWrongs: -1.3,
    totalPoints: 55.2,
    positives: 53.9,
    iInst: 0,
    dCorrects: 19.4,
    tagId: "S5ScstjhpnwKSxhfpI0b",
    createdAt: new Date(),
    mCorrects: 34.5,
    dInst: 0,
    negatives: -1.3,
    lterm: 0,
    iCorrects: 0,
    iWrongs: 0,
    ltermDay: 0,
    updatedAt: new Date(),
    mInst: 0,
  },
  {
    documentId: "00IXQfwKJ5vF5iZJB34e",
    mWrongs: 4,
    iCorrects: 0,
    dCorrects: 14,
    tag: "Psychology",
    isAdmin: false,
    positives: 15,
    updatedAt: new Date(),
    mCorrects: 1,
    createdAt: new Date(),
    uname: "celestehoang",
    negatives: 6,
    lterm: 0,
    dWrongs: 2,
    mInst: 0,
    tagId: "owiurXq2sPdbHTC3zWHq",
    iInst: 0,
    iWrongs: 0,
    ltermDay: 0,
    dInst: 0,
    totalPoints: 9,
  },
];

const reputationsData = {
  data,
  collection,
};

export default reputationsData;
