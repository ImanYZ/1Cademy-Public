const collection = "othersReputations";

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

const data: data[] = [
  {
    documentId: "00agUIVckQC7WmJXgV07",
    createdAt: new Date(),
    dInst: 0,
    positives: 6,
    isAdmin: false,
    lterm: 0,
    uname: "Catherine Huang",
    mWrongs: 0,
    negatives: 0,
    ltermDay: 0,
    totalPoints: 6,
    updatedAt: new Date(),
    iCorrects: 0,
    iWrongs: 0,
    mInst: 0,
    iInst: 0,
    tag: "Python Programming Language",
    dWrongs: 0,
    mCorrects: 4,
    dCorrects: 2,
    tagId: "MlwLPB5GwSBWXgf1wqTe",
  },
  {
    documentId: "04kxJvmd30xhWwUNWrHM",
    dWrongs: 0,
    uname: "Meng ",
    negatives: 2,
    positives: 25,
    iInst: 0,
    isAdmin: true,
    ltermDay: 0,
    iWrongs: 0,
    updatedAt: new Date(),
    tag: "Biomedical Sciences",
    iCorrects: 0,
    dInst: 0,
    mWrongs: 2,
    tagId: "JvMjw4kbgeqNA7sRQjfZ",
    dCorrects: 0,
    createdAt: new Date(),
    totalPoints: 23,
    mCorrects: 25,
    lterm: 0,
    mInst: 0,
  },
  {
    documentId: "DfcStscbOm",
    dWrongs: 0,
    uname: "A_wei",
    negatives: 2,
    positives: 25,
    iInst: 0,
    isAdmin: true,
    ltermDay: 0,
    iWrongs: 0,
    updatedAt: new Date(),
    tag: "Biomedical Sciences",
    iCorrects: 0,
    dInst: 0,
    mWrongs: 2,
    tagId: "JvMjw4kbgeqNA7sRQjfZ",
    dCorrects: 0,
    createdAt: new Date(),
    totalPoints: 23,
    mCorrects: 25,
    lterm: 0,
    mInst: 0,
  },
];

const othersReputationsData = {
  data,
  collection,
};

export default othersReputationsData;
