import { firstWeekMonthDays } from "../../src/utils";

const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();

export const collection = "monthlyReputations";

const data: any[] = [
  {
    documentd: "015jsmezvToCC9bv7bug",
    negatives: 1.8,
    dCorrects: 12,
    totalPoints: 10.2,
    createdAt: new Date(),
    iCorrects: 0,
    iInst: 0,
    firstMonthDay,
    firstWeekDay,
    positives: 12,
    isAdmin: false,
    mInst: 0,
    iWrongs: 0,
    dInst: 0,
    mCorrects: 0,
    ltermte: 0,
    mWrongs: 0,
    dWrongs: 1.8,
    tagId: "C7L3gNbNp5reFjQf8vAb",
    uname: "1man",
    updatedAt: new Date(),
    ltermDay: 0,
    tag: "1Cademy",
  },
  {
    documentId: "01LMgFl66e859MBBJtzu",
    tag: "1Cademy",
    mCorrects: 46.5,
    negatives: -1,
    tagId: "r98BjyFDCe4YyLA3U8ZE",
    updatedAt: new Date(),
    dCorrects: 128.5,
    positives: 175,
    ltermDay: 0,
    iWrongs: 0,
    dInst: 0,
    createdAt: new Date(),
    mWrongs: 0,
    iInst: 0,
    iCorrects: 0,
    totalPoints: 176,
    dWrongs: -1,
    firstMonthDay: "2-1-2021",
    lterm: 0,
    uname: "Venkata Sai Suraj Chengalvala",
    isAdmin: true,
    mInst: 0,
  },
];

const monthlyReputationsData = { data, collection };

export default monthlyReputationsData;
