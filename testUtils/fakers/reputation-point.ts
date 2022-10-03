import { faker } from "@faker-js/faker";

import { INode } from "../../src/types/INode";
import { IMonthlyReputation, IReputation, IWeeklyReputation } from "../../src/types/IReputationPoint";
import { IUser } from "../../src/types/IUser";
import { firstWeekMonthDays } from "../../src/utils/helpers";

type IFakeReputationPointOptions = {
  documentId?: string;
  tag?: INode;
  user?: IUser;
  currentDate?: Date;
  cnCorrects?: number;
  cnWrongs?: number;
  cnInst?: number;
};

export function createReputationPoints(params: IFakeReputationPointOptions): IReputation {
  const { tag, user, documentId, cnCorrects, cnWrongs, cnInst } = params;
  let postives = 0;
  let negatives = 0;
  if (cnCorrects) {
    postives += cnCorrects;
  }
  if (cnInst) {
    postives += cnInst;
  }
  if (cnWrongs) {
    negatives += cnWrongs;
  }
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),

    uname: user ? user.uname : faker.internet.userName(),

    tag: tag ? tag.title : faker.hacker.phrase(),
    tagId: tag ? String(tag.documentId) : faker.datatype.uuid(),

    aCorrects: 0,
    aWrongs: 0,
    aInst: 0,

    pCorrects: 0,
    pWrongs: 0,
    pInst: 0,

    sCorrects: 0,
    sWrongs: 0,
    sInst: 0,

    cnCorrects: cnCorrects ? cnCorrects : 0,
    cnWrongs: cnWrongs ? cnWrongs : 0,
    cnInst: cnInst ? cnInst : 0,

    qCorrects: 0,
    qWrongs: 0,
    qInst: 0,

    iCorrects: 0,
    iWrongs: 0,
    iInst: 0,

    mCorrects: 0,
    mWrongs: 0,
    mInst: 0,

    cdCorrects: 0,
    cdWrongs: 0,
    cdInst: 0,

    rfCorrects: 0,
    rfWrongs: 0,
    rfInst: 0,

    nCorrects: 0,
    nWrongs: 0,
    nInst: 0,

    lterm: 0,
    ltermDay: 0,

    negatives: negatives,
    positives: postives,
    totalPoints: postives - negatives,

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createMonthlyReputationPoints(params: IFakeReputationPointOptions): IMonthlyReputation {
  const { currentDate } = params;
  return {
    ...createReputationPoints(params),
    firstMonthDay: currentDate ? firstWeekMonthDays(currentDate).firstMonthDay : firstWeekMonthDays().firstMonthDay,
  };
}

export function createWeeklyReputationPoints(params: IFakeReputationPointOptions): IWeeklyReputation {
  const { currentDate } = params;
  return {
    ...createReputationPoints(params),
    firstWeekDay: currentDate ? firstWeekMonthDays(currentDate).firstWeekDay : firstWeekMonthDays().firstWeekDay,
  };
}
