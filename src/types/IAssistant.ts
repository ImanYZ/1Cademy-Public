import { NodeType } from "src/types";

import { Flashcard, IAssistantMessage } from "./IAssitantConversation";

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
    }
  | {
      type: "SEARCH_NODES";
      query: string;
    }
  | {
      type: "IMPROVEMENT" | "CHILD";
      selectedNode: {
        id: string;
        title: string;
        content: string;
        [key: string]: any;
      };
      title: string;
      content: string;
      flashcard: {
        passageId: string;
        title: string;
        content: string;
        type: "Concept" | "Relation";
      };
      referenceNode?: {
        id: string;
        type: NodeType;
        title: string;
        content: string;
      };
      bookUrl: string;
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

export type IAssistantNodePassage = {
  flashcards: Flashcard[];
  passage: string;
  contextPassage: string;
  urls: string[];
};
