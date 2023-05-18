export type IAssistantEventDetail =
  | {
      type: "SELECT_NOTEBOOK";
      notebookId: string;
    }
  | {
      type: "REQUEST_ID_TOKEN";
    };

export type INarrateWorkerMessage = {
  message?: string;
  messages: string[];
};
