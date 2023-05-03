import { Timestamp } from "firebase-admin/firestore";
import { ChatCompletionRequestMessage } from "openai";

import { INodeType } from "./INodeType";

export type IAssistantNode = {
  type: INodeType;
  node: string;
  title: string;
  link: string;
  content: string;
  practice?: {
    totalQuestions: number;
    answered: number;
  };
  unit?: string;
};

export type IAssistantMessage = {
  request?: string;
  is404?: boolean;
  gptMessage?: ChatCompletionRequestMessage;
  actions?: {
    type: IAssitantRequestAction;
    title: string;
    variant: "contained" | "outline";
  }[];
  nodes?: IAssistantNode[];
  message?: string;
};

export type IAssistantConversation = {
  documentId?: string;
  messages: IAssistantMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type IAssitantRequestAction =
  | "Practice"
  | "TeachContent"
  | "PracticeLater"
  | "Understood"
  | "ExplainMore"
  | "GeneralExplanation"
  | "IllContribute"
  | "DirectQuestion";

export type IAssistantResponse = {
  conversationId: string;
  message: string;
  is404?: boolean;
  nodes?: IAssistantNode[];
  actions?: {
    type: IAssitantRequestAction;
    title: string;
    variant: "contained" | "outline";
  }[];
};
