export type INodeVoteActionType = "Correct" | "Wrong";
export type IProcessedReferenceData = {
  label: string;
  mode: string;
};
export type IProcessedReference = {
  documentId?: string;
  title: string;
  data: IProcessedReferenceData[];
};
