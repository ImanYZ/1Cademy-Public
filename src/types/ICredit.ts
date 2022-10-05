export type ICredit = {
  documentId?: string;
  tag: string;
  tagId: string;
  meanA: number;
  meanAInst: number;
  deepA: number;
  deepAInst: number;
  iInstValue: number;
  iValue: number;
  ltermA: number;
  ltermMaxDay?: number;
  credits: number;
  createdAt: Date;
};
