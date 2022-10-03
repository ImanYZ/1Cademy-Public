export type IReputation = {
  documentId?: string;

  uname: string;

  tag: string;
  tagId: string;

  aCorrects: number;
  aWrongs: number;
  aInst: number;

  pCorrects: number;
  pWrongs: number;
  pInst: number;

  sCorrects: number;
  sWrongs: number;
  sInst: number;

  cnCorrects: number;
  cnWrongs: number;
  cnInst: number;

  qCorrects: number;
  qWrongs: number;
  qInst: number;

  iCorrects: number;
  iWrongs: number;
  iInst: number;

  mCorrects: number;
  mWrongs: number;
  mInst: number;

  cdCorrects: number;
  cdWrongs: number;
  cdInst: number;

  rfCorrects: number;
  rfWrongs: number;
  rfInst: number;

  nCorrects: number;
  nWrongs: number;
  nInst: number;

  lterm: number;
  ltermDay: number;

  negatives: number;
  positives: number;
  totalPoints: number;

  createdAt: Date;
  updatedAt: Date;
};

export type IMonthlyReputation = IReputation & {
  firstMonthDay: string; // M-D-Y .i.e. '9-1-2022'
};

export type IWeeklyReputation = IReputation & {
  firstWeekDay: string; // M-D-Y .i.e. '9-1-2022'
};

export type IOtherReputation = IReputation;
export type IOthMonReputation = IMonthlyReputation;
export type IOthWeekReputation = IWeeklyReputation;
