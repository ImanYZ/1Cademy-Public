import { firstWeekMonthDays } from "../../src/utils";

const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();

const collection = "comMonthlyPoints";

const data: any[] = [
  {
    documentId: "2Zb5dE2cDZqWpg1ldNvO",
    nCorrects: 0,
    aInst: 0,
    pInst: 0,
    aCorrects: 0,
    cdCorrects: 0,
    rfInst: 0,
    ltermDay: 0,
    iInst: 0,
    mWrongs: 0,
    nWrongs: 0,
    tag: "1Cademy",
    adminPoints: 0,
    iCorrects: 0,
    rfCorrects: 0,
    iWrongs: 0,
    aWrongs: 0,
    cnInst: 0,
    createdAt: new Date(),
    tagId: "C7L3gNbNp5reFjQf8vAb",
    updatedAt: new Date(),
    firstWeekDay,
    firstMonthDay,
    qCorrects: 0,
    lterm: 0,
    cnWrongs: 0,
    sCorrects: 0,
    sWrongs: 0,
    mInst: 0,
    sInst: 0,
    aChooseUname: false,
    qWrongs: 0,
    aFullname: "1man",
    cdInst: 0,
    rfWrongs: 0,
    cnCorrects: 0,
    pCorrects: 0,
    mCorrects: 0,
    cdWrongs: 0,
    totalPoints: 0,
    aImgUrl: null,
    qInst: 0,
    pWrongs: 0,
    nInst: 0,
    positives: 0,
    negatives: 0,
  },
];

const comMonthlyPointsData = {
  data,
  collection,
};

export default comMonthlyPointsData;
