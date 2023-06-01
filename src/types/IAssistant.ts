import { IAssistantMessage } from "./IAssitantConversation";

export type IAssistantEventDetail =
  | {
      type: "SELECT_NOTEBOOK";
      notebookId: string;
    }
  | {
      type: "REQUEST_ID_TOKEN";
    }
  | {
      type: "EXTENSION_ID";
      extensionId: string;
    };

export type INarrateWorkerMessage = {
  message?: string;
  messages: string[];
};

export type IAssistantPassageResponse = {
  passage: string;
  queries: string[];
  response?: IAssistantMessage;
  url: string;
};
