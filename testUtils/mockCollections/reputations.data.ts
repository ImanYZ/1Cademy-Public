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
    createdAt: new Date(),
    isAdmin: true,
    tagId: "r98BjyFDCe4YyLA3U8ZE",
    uname: "1man",
    updatedAt: new Date(),
    tag: "1Cademy",
    lterm: 0.0,
    ltermDay: 0,
    cnCorrects: 0.0,
    cnInst: 0.0,
    cdCorrects: 0.0,
    cdInst: 0.0,
    qCorrects: 0.0,
    qInst: 0.0,
    pCorrects: 0.0,
    pInst: 0.0,
    sCorrects: 0.0,
    sInst: 0.0,
    aCorrects: 0.0,
    aInst: 0.0,
    rfCorrects: 0.0,
    rfInst: 0.0,
    nCorrects: 0.0,
    nInst: 0.0,
    iCorrects: 0.0,
    iInst: 0.0,
    mCorrects: 0.0,
    mInst: 0.0,
    cnWrongs: 0.0,
    cdWrongs: 0.0,
    qWrongs: 0.0,
    pWrongs: 0.0,
    sWrongs: 0.0,
    aWrongs: 0.0,
    rfWrongs: 0.0,
    nWrongs: 0.0,
    iWrongs: 0.0,
    mWrongs: 0.0,
    negatives: 0.0,
    positives: 0.0,
    totalPoints: 0.0,
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
  {
    documentId: "zYqfbsnfvz",
    mWrongs: 4,
    iCorrects: 0,
    dCorrects: 14,
    tag: "Psychology",
    isAdmin: false,
    positives: 15,
    updatedAt: new Date(),
    mCorrects: 1,
    createdAt: new Date(),
    uname: "A_wei",
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
