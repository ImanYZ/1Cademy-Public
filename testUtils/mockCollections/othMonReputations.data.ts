import { firstWeekMonthDays } from "../../src/utils";

const { firstMonthDay } = firstWeekMonthDays();

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
    documentId: "00I3EKcUHGdi45Cw9pzy",
    createdAt: new Date(),
    firstMonthDay,
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
    tagId: "FJfzAX7zbgQS8jU5XcEk",
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
