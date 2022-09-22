const collection = "othMonReputations";

interface data {
  documentId: string;
  firstMonthDay: string;
  iCorrects: number;
  mInst: number;
  dInst: number;
  positives: number;
  createdAt: Date;
  negatives: number;
  mCorrects: number;
  dWrongs: number;
  isAdmin: boolean;
  tag: string;
  iInst: number;
  lterm: number;
  uname: string;
  totalPoints: number;
  mWrongs: number;
  dCorrects: number;
  iWrongs: number;
  updatedAt: Date;
  ltermDay: number;
  tagId: string;
}

const data: any[] = [
  {
    documentId: "00I3EKcUHGdi45Cw9pHa",
    firstMonthDay: "1-1-2021",
    iCorrects: 0,
    mInst: 0,
    dInst: 0,
    positives: 1,
    createdAt: new Date(),
    negatives: 0,
    mCorrects: 0,
    dWrongs: 0,
    isAdmin: false,
    tag: "Psychology",
    iInst: 0,
    lterm: 0,
    uname: "1man",
    totalPoints: 1,
    mWrongs: 0,
    dCorrects: 1,
    iWrongs: 0,
    updatedAt: new Date(),
    ltermDay: 0,
    tagId: "owiurXq2sPdbHTC3zWHq",
  },
  {
    documentId: "01mWUDqwpgWYWonwsp5y",
    positives: 1.5,
    mWrongs: 0,
    dCorrects: 1.5,
    createdAt: new Date(),
    iCorrects: 0,
    negatives: 0,
    dWrongs: 0,
    ltermDay: 0,
    mInst: 0,
    updatedAt: new Date(),
    iInst: 0,
    totalPoints: 1.5,
    mCorrects: 0,
    isAdmin: false,
    dInst: 0,
    firstMonthDay: 2 - 1 - 2021,
    iWrongs: 0,
    uname: "Erica-Poon",
    tag: "1Cademy",
    tagId: "r98BjyFDCe4YyLA3U8ZE",
    lterm: 0,
  },
  {
    documentId: "01qBxQ6JUUOecJf2LueA",
    tag: "\"A Guide of UI Design Trends for 2021'",
    dWrongs: 0,
    mWrongs: 0,
    mCorrects: 0,
    firstMonthDay: "1-1-2021",
    positives: 10,
    mInst: 0,
    totalPoints: 10,
    ltermDay: 0,
    updatedAt: new Date(),
    createdAt: new Date(),
    lterm: 0,
    dInst: 0,
    uname: "Liana Masangkay",
    iCorrects: 0,
    tagId: "6HwHnq1maHMSvbIILCR8",
    negatives: 0,
    dCorrects: 10,
    iInst: 0,
    iWrongs: 0,
    isAdmin: true,
  },
  {
    documentId: "qfMqIl7x8M",
    tag: "A Guide of UI Design Trends for 2021",
    dWrongs: 0,
    mWrongs: 0,
    mCorrects: 0,
    firstMonthDay: "1-1-2021",
    positives: 10,
    mInst: 0,
    totalPoints: 10,
    ltermDay: 0,
    updatedAt: new Date(),
    createdAt: new Date(),
    lterm: 0,
    dInst: 0,
    uname: "A_wei",
    iCorrects: 0,
    tagId: "6HwHnq1maHMSvbIILCR8",
    negatives: 0,
    dCorrects: 10,
    iInst: 0,
    iWrongs: 0,
    isAdmin: true,
  },
];

const othMonReputationsData = {
  data,
  collection,
};

export default othMonReputationsData;
