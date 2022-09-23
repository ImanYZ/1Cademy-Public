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

const data: any[] = [
  {
    documentId: "00agUIVckJK7WmJXgV07",
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
    tagId: "FJfzAX7zbgQS8jU5XcEk",
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
