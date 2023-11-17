import { db } from "@/lib/firestoreServer/admin";
import {
  getTypesenseClient,
  typesenseCollectionExists,
  typesenseDocumentExists,
} from "@/lib/typesense/typesense.config";
import { google } from "googleapis";
import OpenAI from "openai";
import { TypesenseAssistantResponseSchema, TypesenseNodesSchema } from "src/knowledgeTypes";
import {
  FlashcardResponse,
  IAssistantChat,
  IAssistantConversation,
  IAssistantMessage,
  IAssistantNode,
} from "src/types/IAssitantConversation";
import { arrayToChunks } from "./arrayToChunks";
import { INode } from "src/types/INode";
import { getNodePageWithDomain } from "@/lib/utils/utils";
import { IUser } from "src/types/IUser";
import { IPractice } from "src/types/IPractice";
import { Timestamp } from "firebase-admin/firestore";
import moment from "moment";
import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";
import { IAssistantNodePassage, IAssistantPassageResponse } from "src/types/IAssistant";

export type BARD_RESULT_NODE = {
  title: string;
  content: string;
  correct_answers: number;
};

export const ASSISTANT_SYSTEM_PROMPT =
  `You are a tutor that answers each student's questions based on 1Cademy, which is a knowledge graph where:\n` +
  `- Each node represents a unique piece of knowledge, which we call a 'concept.'\n` +
  `- Each node is not divisible into smaller nodes.\n` +
  `- The source of each link is called a 'parent' and its destination is called a 'child'.\n` +
  `- If node A is a child of node B, then node B is a parent of node A.\n` +
  `- Each node can have one or multiple parents and zero, one, or multiple children.\n` +
  `- Each link between two nodes represents a direct prerequisite relationship. This means it's impossible for someone to learn a child before learning its parent. By 'direct,' we mean that if there exists a link from node A to node B, there cannot be any intermediary node C between them that has node A as its parent and node B as its child.\n` +
  `- There is no loop in this knowledge graph. This means if node A is a parent of node B and node B is a parent of node C, node C cannot be a parent of node A.\n` +
  `- Each node includes a 'title' that represents the corresponding concept, and 'content' that explains the concept in a short paragraph.\n` +
  `- The 'title' of each node is unique and very specific. This means to understand what concept the node is representing, one can just read its title without a need to know its parents or children.\n` +
  `- Nodes are in two types:\n` +
  `   1. A 'Concept' node defines a concept. What we explained above was a Concept node.\n` +
  `   2. A 'Relation' node is similar to a Concept node, but does not define any new concept, but just explains the relations between two or more concepts.\n` +
  `You can query the 1Cademy knowledge graph by generating the code \`\\1Cademy\\ [Your Query goes here]\\\`. Once you provide the student with the query, they will conduct a search on the 1Cademy database and retrieve information on the first four nodes that match the query. The student will present the information in the following format for each node, with a line break separating each node's details.\n` +
  `- Node Title\n` +
  `- Node Content\n` +
  `- Node Type\n` +
  `- The titles of all the node's parents as an array\n` +
  `- The titles of all the node's children as an array\n` +
  `- The student has correctly answered [number] questions about this node.\n` +
  `You can ask many queries until you formulate your final response to the student. The student will search 1Cademy database as many times as you ask and would respond to all your queries until you respond to their original request.\n` +
  `Your final response to their original request should not include any query.\n` +
  `Never solve a problem for the student. That would be considered cheating. Instead, guide them step-by-step, to find the solution on their own.\n` +
  `If your final response contains nodes from 1Cademy, list their titles and types as a JSON array of objects at the end of the response. Each node object should only include the following components:\n` +
  `- "title": This field will contain the title of node on 1Cademy\n` +
  `- "type": This field will contain the node type on 1Cademy, which can be either "Concept" or "Relation"`;

export const ASSISTANT_NOT_FOUND_MESSAGE =
  `I'm afraid this topic is not included in the course content that I have been trained on. However, I would be happy to help you in one of the following ways:\n` +
  `- I can provide you with an explanation based on my general knowledge outside of the course content.\n` +
  `- Alternatively, if you would like to contribute to the knowledge graph of the course, I am open to learning from you and expanding my knowledge on the topic.`;

export const topGoogleSearchResults = async (
  query: string,
  count: number = 4,
  tagTitle?: string
): Promise<string[]> => {
  const customsearch = google.customsearch("v1");
  const res = await customsearch.cse.list({
    q: query + (tagTitle ? JSON.stringify(tagTitle) : ""),
    cx: process.env.GOOGLE_CX,
    auth: process.env.GOOGLE_CX_API_KEY,
  });
  const items = res.data.items || [];
  const nodeIds = items
    .filter(item => String(item.link).includes("/node/"))
    .map(item => {
      const link_parts: string[] = (item.link! || "").split("/");
      return (link_parts.pop() || "").replace(/[#?].+/g, "");
    })
    .filter((nodeId: string) => nodeId);
  const _nodeIds: Set<string> = new Set();
  const nodeIdsChunk = arrayToChunks(nodeIds, 10);
  for (const nodeIds of nodeIdsChunk) {
    const nodes = await db
      .collection("nodes")
      .where("__name__", "in", nodeIds)
      .where("nodeType", "in", ["Concept", "Relation"])
      .limit(nodeIds.length)
      .get();
    for (const node of nodes.docs) {
      if (_nodeIds.size >= count) break;
      _nodeIds.add(node.id);
    }
  }
  return Array.from(_nodeIds);
};

export const topTypesenseSearch = async (query: string, count: number, tagTitle?: string): Promise<string[]> => {
  const numOfWords = query.split(" ");
  const tSQuery = {
    q: query,
    query_by: "title,content",
    query_by_weights: "1,1",
    sort_by: "",
    filter_by: "nodeType:=[Concept,Relation]" + (tagTitle ? ` && tags:=[\`${tagTitle}\`]` : ""),
    page: 1,
    num_typos: numOfWords.length > 2 ? "2" : "1",
    typo_tokens_threshold: numOfWords.length > 2 ? 2 : 1,
  };

  const searchResults = await getTypesenseClient()
    .collections<TypesenseNodesSchema>("nodes")
    .documents()
    .search(tSQuery);

  const hits = searchResults.hits || [];
  const nodeIds = hits.map(hit => hit.document.id);

  const _nodeIds: Set<string> = new Set();
  const nodeIdsChunk = arrayToChunks(nodeIds, 10);
  for (const nodeIds of nodeIdsChunk) {
    const nodes = await db
      .collection("nodes")
      .where("__name__", "in", nodeIds)
      .where("nodeType", "in", ["Concept", "Relation"])
      .limit(nodeIds.length)
      .get();
    for (const node of nodes.docs) {
      if (_nodeIds.size >= count) break;
      _nodeIds.add(node.id);
    }
  }
  return Array.from(_nodeIds);
};

export const findPassageResponse = async (
  passage: string,
  url: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot<any> | undefined> => {
  const _passageResponses = await db.collection("passageResponses").where("url", "==", url).get();
  const passageResponses = _passageResponses.docs.filter(passageResponse => {
    const passageResponseData = passageResponse.data() as IAssistantPassageResponse;
    return passageResponseData.passage.includes(passage.trim()) || passage.trim().includes(passageResponseData.passage);
  });

  if (passageResponses.length) {
    return passageResponses[0];
  }
};

export const updatePassageResponse = async ({
  passage,
  queries,
  response,
  url,
}: {
  passage: string;
  queries?: string[];
  response?: IAssistantMessage;
  url: string;
}) => {
  const _passageResponse = await findPassageResponse(passage, url);

  const passageResponse: IAssistantPassageResponse = {
    passage,
    queries: queries || [],
    url,
  };
  if (_passageResponse) {
    const _passageResponseData = _passageResponse.data() as IAssistantPassageResponse;
    passageResponse.queries = _passageResponseData.queries;
    passageResponse.response = _passageResponseData.response;
  }

  if (queries) {
    passageResponse.queries = queries;
  }

  if (response) {
    passageResponse.response = response;
  }

  const passageResponseRef = _passageResponse
    ? db.collection("passageResponses").doc(_passageResponse.id)
    : db.collection("passageResponses").doc();

  if (_passageResponse) {
    await passageResponseRef.update(passageResponse);
    return;
  }

  await passageResponseRef.set(passageResponse);
};

export const typesenseReferenceNodeSearch = async (query: string): Promise<string[]> => {
  const tSQuery = {
    q: query,
    query_by: "title,content",
    query_by_weights: "1,1",
    sort_by: "",
    filter_by: "nodeType:=[Reference]",
    page: 1,
    num_typos: "2",
    typo_tokens_threshold: 2,
  };

  const searchResults = await getTypesenseClient()
    .collections<TypesenseNodesSchema>("nodes")
    .documents()
    .search(tSQuery);

  const hits = searchResults.hits || [];
  const nodeIds = hits.map(hit => hit.document.id);

  const _nodeIds: Set<string> = new Set();
  const nodeIdsChunk = arrayToChunks(nodeIds, 10);
  for (const nodeIds of nodeIdsChunk) {
    const nodes = await db
      .collection("nodes")
      .where("__name__", "in", nodeIds)
      .where("nodeType", "in", ["Reference"])
      .limit(nodeIds.length)
      .get();
    for (const node of nodes.docs) {
      _nodeIds.add(node.id);
    }
  }
  return Array.from(_nodeIds);
};

export const sendMessageToGPT4 = async (
  message: any,
  conversation: IAssistantConversation,
  request?: string
): Promise<any> => {
  const config = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_ORG_ID,
  };

  const openai = new OpenAI(config);
  const messages = conversation.messages;
  messages.push({
    gptMessage: message,
    request,
  });

  const response = await openai.chat.completions.create({
    messages: messages.filter(message => message.gptMessage).map(message => message.gptMessage!),
    model: "gpt-4",
    temperature: 0,
  });

  return response.choices[0].message.content;
};

export const sendMessageToGPT4V2 = async (
  message: any,
  conversation: IAssistantConversation,
  request?: string
): Promise<any> => {
  const config = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_ORG_ID,
  };

  const openai = new OpenAI(config);
  const messages = conversation.messages;
  messages.push({
    gptMessage: message,
    request,
  });

  const response = await openai.chat.completions.create({
    messages: [message],
    model: "gpt-4",
    temperature: 0,
  });

  return response.choices[0].message.content;
};

export const sendGPTPrompt = async (
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-1106-preview" | "gpt-4-0613",
  messages: any[]
) => {
  const config = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_ORG_ID,
  };

  const openai = new OpenAI(config);

  const response = await openai.chat.completions.create({
    messages,
    model,
    temperature: 0,
  });

  return response.choices[0].message.content;
};

export const getGPT4Queries = async (conversation: IAssistantConversation, bookText: string): Promise<string[]> => {
  const prompt =
    `You're a tutor and I'm a student.\n` +
    `We have a database of flashcards.\n` +
    `What should I search in our flashcard database to learn the following triple-quoted text?\n` +
    `'''\n` +
    `${bookText}\n` +
    `'''\n` +
    `Give me a MAXIMUM of 7 query strings with this pattern: \`\\1Cademy\\ [Your Query goes here]\\\`\n` +
    `Only respond with an Array of query strings like:\n` +
    `[\n` +
    `"\\1Cademy\\ capitalist revolution",\n` +
    `"\\1Cademy\\ history of capitalism"\n` +
    `]\n` +
    `DO NOT print any extra text or explanation.`;
  const gpt4Response = await sendMessageToGPT4V2(
    {
      role: "user",
      content: prompt,
    },
    conversation
  );
  const response = gpt4Response?.choices?.[0]?.message?.content || "";
  const commands: string[] = parseJSONArrayFromResponse(response);
  return commands.map((command: string) => command.replace("\\1Cademy\\", "").trim());
};

export const createTeachMePrompt = (bookText: string, nodes: IAssistantNode[]): string => {
  return (
    `'''\n` +
    bookText +
    "\n" +
    `'''\n` +
    `I am a student. Explain the above selected text (in triple-quotes) ONLY based on the content of this course shown in the following nodes. For each node, I've specified its title, content, and correct_answers (the number of times I've answered it correctly) in the following JSON object.\n` +
    generateNodesPrompt(nodes) +
    `\n` +
    `Your response should be ONLY a JSON object with your well-explained response to my question and the list of titles of the nodes that you used in your explanation, with the following structure:\n` +
    `{\n` +
    `   "response": "Your well-explained response to my question"\n` +
    `   nodes:\n` +
    `   [\n` +
    `      "The title of the node 1",\n` +
    `      "The title of the node 2",\n` +
    `      "The title of the node 3"\n` +
    `   ]\n` +
    `}`
  );
};

export const createDirectQuestionPrompt = (bookText: string, nodes: IAssistantNode[]): string => {
  return (
    `I am a student. Answer my following question, but NEVER give me the direct solution to a problem. That would be considered cheating. Instead, guide me step-by-step, to find the solution on my own.\n` +
    `'''\n` +
    bookText +
    "\n" +
    `'''\n` +
    generateNodesPrompt(nodes) +
    `\n` +
    `Your response should be ONLY a JSON object with your well-explained response to my question and the list of titles of the nodes that you used in your explanation, with the following structure:\n` +
    `{\n` +
    `   "response": "Your well-explained response to my question"\n` +
    `   nodes:\n` +
    `   [\n` +
    `      "The title of the node 1",\n` +
    `      "The title of the node 2",\n` +
    `      "The title of the node 3"\n` +
    `   ]\n` +
    `}`
  );
};

export const generateNodesPrompt = (nodes: IAssistantNode[]) => {
  let result = `[\n`;
  let nodesList: string[] = [];
  for (const node of nodes) {
    let nodeResult = `  {\n`;
    nodeResult += `    "title": '''${node.title}''',\n`;
    nodeResult += `    "content": '''${node.content}''',\n`;
    nodeResult += `    "correct_answers": ${node.practice?.answered || 0}\n`;
    nodeResult += `  }`;
    nodesList.push(nodeResult);
  }
  result += nodesList.join(",\n");
  result += `\n]`;

  return result;
};

export const extractSearchCommands = (response: string): string[] => {
  const commandIndices: number[] = [];
  const commands: string[] = [];

  let commandIdx: number = -1;
  do {
    commandIdx = response.indexOf("\\1Cademy\\", commandIdx + 1);
    if (commandIdx !== -1) commandIndices.push(commandIdx);
  } while (commandIdx !== -1);

  for (let i = 0; i < commandIndices.length; i++) {
    const startIdx = commandIndices[i];
    // we need boundary to not overlap next command
    const boundary = commandIndices[i + 1] !== undefined ? commandIndices[i + 1] : response.length;
    let endIdx = commandIndices[i];
    let lastEndIdx = commandIndices[i];
    do {
      lastEndIdx = response.indexOf("\\", lastEndIdx + 1);
      // stop if we are going out of boundary
      if (lastEndIdx >= boundary) break;
      if (lastEndIdx !== -1) {
        endIdx = lastEndIdx;
      }
    } while (lastEndIdx !== -1);

    let command = response.substring(startIdx, endIdx + 1);
    command = command
      .replace(/^\\1Cademy\\/, "")
      .replace(/\\$/, "")
      .trim();
    commands.push(command);
  }

  return commands;
};

export const generateGpt4QueryResult = async (nodeIds: string[], uname?: string) => {
  const nodes: INode[] = [];
  const practiceAnsweredByNodeIds: {
    [nodeId: string]: number;
  } = {};
  const nodeIdChunks = arrayToChunks(nodeIds, 10);

  for (const nodeIds of nodeIdChunks) {
    const _nodes = await db.collection("nodes").where("__name__", "in", nodeIds).get();
    for (const _node of _nodes.docs) {
      if (uname) {
        const practiceLogs = await db
          .collection("practiceLog")
          .where("user", "==", uname)
          .where("node", "==", _node.id)
          .where("q", "==", 5)
          .limit(5)
          .get();
        practiceAnsweredByNodeIds[_node.id] = practiceLogs.docs.length;
      }
      const node = _node.data();
      node.documentId = _node.id;
      nodes.push(_node.data() as INode);
    }
  }

  let queryResult: string = "";
  for (const node of nodes) {
    queryResult +=
      `- ${node.title}\n` +
      `- ${node.content}\n` +
      `- ${node.nodeType}\n` +
      `- ${JSON.stringify(
        node.parents.filter(parent => ["Concept", "Relation"].includes(parent.type!)).map(parent => parent.title)
      )}\n` +
      `- ${JSON.stringify(
        node.children.filter(child => ["Concept", "Relation"].includes(child.type!)).map(child => child.title)
      )}\n`;
    if (practiceAnsweredByNodeIds[String(node.documentId)]) {
      queryResult += `- The student has correctly answered ${
        practiceAnsweredByNodeIds[node.documentId!]
      } questions about this node.\n`;
    }
    queryResult += `\n`;
  }

  return queryResult;
};

export const generateGpt4QueryResultV2 = async (nodeIds: string[], userData?: IUser) => {
  const nodes: IAssistantNode[] = [];
  const nodeIdChunks = arrayToChunks(nodeIds, 10);

  for (const nodeIds of nodeIdChunks) {
    const _nodes = await db.collection("nodes").where("__name__", "in", nodeIds).get();
    for (const _node of _nodes.docs) {
      const node = _node.data() as INode;
      node.documentId = _node.id;
      const responseNode: IAssistantNode = {
        node: _node.id,
        title: node.title,
        type: node.nodeType,
        link: getNodePageWithDomain(node.title, _node.id),
        content: node.content,
        nodeImage: node.nodeImage,
        nodeVideo: node.nodeVideo,
      };
      if (userData) {
        // adding practice related data
        responseNode.practice = await numOfPracticesAnsweredByNodeAndUser(_node.id, userData.uname);
      }
      const unitNo = findUnitNoFromNodeData(node);
      if (unitNo) {
        responseNode.unit = unitNo;
      }
      nodes.push(responseNode);
    }
  }
  return nodes;
};

export const getNodeResultFromCommands = async (
  commands: string[],
  tagTitle?: string,
  userData?: IUser,
  count: number = 4
): Promise<IAssistantNode[]> => {
  const nodeIds: Set<string> = new Set();

  for (const command of commands) {
    let _nodeIds: string[] = [];
    const googleNodeIds = await topGoogleSearchResults(command, count, tagTitle);
    if (googleNodeIds.length) {
      _nodeIds = googleNodeIds;
    } else {
      _nodeIds = await topTypesenseSearch(command, count, tagTitle);
    }

    for (const _nodeId of _nodeIds) {
      nodeIds.add(_nodeId);
    }
  }

  return generateGpt4QueryResultV2(Array.from(nodeIds), userData);
};

export const processRecursiveCommands = async (
  message: any,
  conversationData: IAssistantConversation,
  tagId: string,
  uname: string,
  n: number = 1
): Promise<IAssistantMessage> => {
  // updating conversation
  conversationData.messages.push({
    gptMessage: message,
  });

  let tagTitle: string = "";
  if (tagId) {
    const tagDoc = await db.collection("nodes").doc(tagId).get();
    if (tagDoc.exists) {
      const tag = tagDoc.data() as INode;
      tagTitle = tag.title;
    }
  }

  const commands: string[] = extractSearchCommands(message?.content || "");
  if (commands.length) {
    let gpt4QueryResult: string = ``;
    for (const command of commands) {
      let nodeIds: string[] = [];
      const googleNodeIds = await topGoogleSearchResults(command, 10, tagTitle);
      if (googleNodeIds.length) {
        nodeIds = googleNodeIds;
      } else {
        nodeIds = await topTypesenseSearch(command, 10, tagTitle);
      }

      // If not results found for desired query then
      // TODO: instead of just checking >= 3 check if we are processing same search results again and again
      if (n >= 3 || (!nodeIds.length && n === 1)) {
        const message: IAssistantMessage = {
          is404: true,
          message: ASSISTANT_NOT_FOUND_MESSAGE,
          actions: [
            {
              type: "GeneralExplanation",
              title: "Provide me an explanation",
              variant: "outline",
            },
            {
              type: "IllContribute",
              title: "I'll Contribute",
              variant: "outline",
            },
          ],
        };
        conversationData.messages.push(message);
        return message;
      } else if (!nodeIds.length) {
        // Add Prompt to Clarify on given information or return NO incase it can't summarize based given information
        const response = await sendMessageToGPT4(
          {
            content:
              "I was not able to find nodes from the given query, Please provide more queries to search 1Cademy Knowledge graph.",
            role: "system",
            name: "1Cademy",
          },
          conversationData
        );

        return processRecursiveCommands(response.choices?.[0]?.message!, conversationData, tagId, uname, n + 1);
      }

      gpt4QueryResult += (await generateGpt4QueryResult(nodeIds)) + "\n\n";
    }
    gpt4QueryResult = gpt4QueryResult.trim();

    // Response that would be sent to user
    const queryInputResponse = await sendMessageToGPT4(
      {
        role: "system",
        content: gpt4QueryResult,
      },
      conversationData
    );

    // If need to process commands further
    const responseMessage = queryInputResponse.choices?.[0]?.message;
    const hasCommands = String(responseMessage?.content).includes("\\1Cademy\\");
    if (hasCommands) {
      return processRecursiveCommands(responseMessage!, conversationData, tagId, uname, n + 1);
    }

    const contentInitial = String(responseMessage?.content).substring(0, 50).toLowerCase();
    if (
      contentInitial.includes("i apologize") ||
      contentInitial.includes("i couldn't find any information") ||
      contentInitial.includes("i could not find any information") ||
      contentInitial.includes("i can not find any information") ||
      contentInitial.includes("i can't find any information") ||
      contentInitial.includes("i'm afraid this topic is not included") ||
      contentInitial.includes("i am afraid this topic is not included")
    ) {
      const message: IAssistantMessage = {
        is404: true,
        message: ASSISTANT_NOT_FOUND_MESSAGE,
        actions: [
          {
            type: "GeneralExplanation",
            title: "Provide me an explanation",
            variant: "outline",
          },
          {
            type: "IllContribute",
            title: "I'll Contribute",
            variant: "outline",
          },
        ],
      };
      conversationData.messages.push(message);
      return message;
    }

    conversationData.messages.push({
      gptMessage: queryInputResponse.choices?.[0]?.message!,
    });
  }

  return conversationData.messages[conversationData.messages.length - 1];
};

const parseJSONArrayFromResponse = (content: string) => {
  const matchResult = content.match(/\[[\t\n ]*?[{"]/gm);
  const startIdx = content.indexOf(matchResult![0]);
  let endIdx = -1;
  const stack: string[] = ["["];
  for (let idx = startIdx + 1; idx < content.length; idx++) {
    if (content[idx] === "{" || content[idx] === "[") {
      stack.push(content[idx]);
    } else if (content[idx] === "}" || content[idx] === "]") {
      const opening = stack.pop();
      if ((opening !== "{" && content[idx] === "}") || (opening !== "[" && content[idx] === "]")) {
        throw new Error(`Invalid syntax at ${idx}`);
      }
    }

    if (stack.length === 0) {
      endIdx = idx;
      break;
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Invalid JSON provided`);
  }

  return JSON.parse(content.substring(startIdx, endIdx + 1).replace(/\\/g, "\\\\"));
};

export const parseJSONObjectResponse = (content: string) => {
  const matchResult = content.match(/\{[\t\n ]*?\"/gm);
  const startIdx = content.indexOf(matchResult![0]);
  let endIdx = -1;
  const stack: string[] = ["{"];
  for (let idx = startIdx + 1; idx < content.length; idx++) {
    if (content[idx] === "{" || content[idx] === "[") {
      stack.push(content[idx]);
    } else if (content[idx] === "}" || content[idx] === "]") {
      const opening = stack.pop();
      if ((opening !== "{" && content[idx] === "}") || (opening !== "[" && content[idx] === "]")) {
        throw new Error(`Invalid syntax at ${idx}`);
      }
    }

    if (stack.length === 0) {
      endIdx = idx;
      break;
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Invalid JSON provided`);
  }

  return JSON.parse(content.substring(startIdx, endIdx + 1));
};

export const parseJSONMarkdownObjectsFromResponse = (content: string) => {
  const matchResult = content.match(/\n[-]?[ ]?\{[\t\n ]*?"title"/gm);
  const matchIdx = content.indexOf(matchResult![0]);
  let startIdx = content.indexOf("{", matchIdx <= 0 ? 0 : matchIdx - 1);
  const objs: {
    title: string;
    type: string;
  }[] = [];
  let endIdx = -1;
  const stack: string[] = ["{"];
  for (let idx = startIdx + 1; idx < content.length; idx++) {
    if (content[idx] === "{" || content[idx] === "[") {
      if (stack.length === 0) {
        startIdx = idx;
      }
      stack.push(content[idx]);
    } else if (content[idx] === "}" || content[idx] === "]") {
      const opening = stack.pop();
      if ((opening !== "{" && content[idx] === "}") || (opening !== "[" && content[idx] === "]")) {
        throw new Error(`Invalid syntax at ${idx}`);
      }
    }

    if (stack.length === 0) {
      endIdx = idx;
      if (startIdx !== -1 && endIdx !== -1) {
        objs.push(JSON.parse(content.substring(startIdx, endIdx + 1)));
        startIdx = -1;
        endIdx = -1;
      }
    }
  }

  return objs;
};

export const numOfPracticesAnsweredByNodeAndUser = async (nodeId: string, uname: string) => {
  const result = {
    totalQuestions: 0,
    answered: 0, // correctly answered
  };
  const practices = await db
    .collection("practice")
    .where("node", "==", nodeId)
    .where("user", "==", uname)
    .limit(1)
    .get();
  if (!practices.docs.length) return result;

  const practice = practices.docs[0].data() as IPractice;
  const questionNodes = practice.questionNodes || [];
  result.totalQuestions = questionNodes.length;

  for (const questionNode of questionNodes) {
    const practiceLogs = await db
      .collection("practiceLog")
      .where("lastId", "==", questionNode)
      .where("user", "==", uname)
      .where("q", "==", 5)
      .limit(1)
      .get();
    if (practiceLogs.docs.length) {
      result.answered += 1;
    }
  }

  return result;
};

export const findUnitNoFromNodeData = (nodeData: INode): string | undefined => {
  const referenceLabel = nodeData.referenceLabels.find(label => label.trim().includes(`https://www.core-econ.org/`));
  if (referenceLabel) {
    const label_parts = referenceLabel.trim().split("/");
    const fileName = String(label_parts.pop()!);
    const unitNo = fileName.split(".html")[0];
    const _unitNo = parseInt(unitNo);
    if (isNaN(_unitNo)) return;
    return unitNo;
  }

  return;
};

export const getAssistantNodesFromTitles = async (
  nodesList: {
    title: string;
    type?: string;
  }[],
  userData?: IUser
) => {
  const nodes: IAssistantNode[] = [];

  for (const node of nodesList) {
    const _nodes = await db.collection("nodes").where("title", "==", node.title).get();
    for (const _node of _nodes.docs) {
      const _nodeData = _node.data() as INode;
      if (_nodeData.deleted || !["Concept", "Relation"].includes(_nodeData.nodeType)) continue;
      const responseNode: IAssistantNode = {
        node: _node.id,
        title: _nodeData.title,
        type: _nodeData.nodeType,
        link: getNodePageWithDomain(_nodeData.title, _node.id),
        content: _nodeData.content,
        nodeImage: _nodeData.nodeImage,
        nodeVideo: _nodeData.nodeVideo,
      };
      if (userData) {
        // adding practice related data
        responseNode.practice = await numOfPracticesAnsweredByNodeAndUser(_node.id, userData.uname);
      }
      const unitNo = findUnitNoFromNodeData(_nodeData);
      if (unitNo !== undefined) {
        responseNode.unit = unitNo;
      }
      nodes.push(responseNode);
      break;
    }
  }

  return nodes;
};

// 1. Try to match following to substring JSON explanation and JSON itself
// [^\n]+\:[^a-zA-Z0-9]*?\[[\t\n ]*?{
// 2. If JSON don't have explanation
// \[[\t\n ]*?{
// 3. If JSON have explanation and instead of array gave markdown and json
// [^\n\.]+\:[^a-zA-Z0-9]*?\n[-]?[ ]?\{[\t\n ]*?"title"
// 4. If JSON have no explanation and instead of array gave markdown and json
// \n[-]?[ ]?\{[\t\n ]*?"title"
// Second case when response only include JSON
// 5. If both above pattern don't match that means response doesn't include JSON/nodes
export const loadResponseNodes = async (assistantMessage: IAssistantMessage, userData?: IUser) => {
  const content = assistantMessage?.gptMessage?.content || "";
  const case1 = content.match(/[^\n]+\:[^a-zA-Z0-9]*?\[[\t\n ]*?{/gm);
  const case2 = content.match(/\[[\t\n ]*?{/gm);
  const case3 = content.match(/[^\n\.]+\:[^a-zA-Z0-9]*?\n[-]?[ ]?\{[\t\n ]*?"title"/gm);
  const case4 = content.match(/\n[-]?[ ]?\{[\t\n ]*?"title"/gm);

  if (case1 || case2 || case3 || case4) {
    let jsonStart: string = "";
    if (case1) {
      jsonStart = case1[0];
    } else if (case2) {
      jsonStart = case2![0];
    } else if (case3) {
      jsonStart = case3![0];
    } else if (case4) {
      jsonStart = case4![0];
    }

    const markupIdx = content.indexOf(jsonStart);
    const _content = content.substring(0, markupIdx);
    const _markupContent = content.substring(markupIdx, content.length);
    const nodesList: {
      title: string;
      type?: string;
    }[] =
      case3 || case4
        ? parseJSONMarkdownObjectsFromResponse(_markupContent)
        : parseJSONArrayFromResponse(_markupContent);

    const nodes = await getAssistantNodesFromTitles(nodesList, userData);
    assistantMessage.message = _content;
    assistantMessage.nodes = nodes;
  } else {
    assistantMessage.message = content || assistantMessage.message;
  }
};

export const getGeneralKnowledgePrompt = (conversationData: IAssistantConversation, message?: string) => {
  if (message) {
    return `Please provide an answer to the following question triple-quoted text based on your general knowledge:\n'''\n${message}\n'''`;
  }

  let request: string = "";
  for (let i = conversationData.messages.length - 1; i >= 0; i--) {
    if (conversationData.messages[i].request) {
      request = conversationData.messages[i].request!;
      break;
    }
  }

  if (!request) return request;

  return `Please provide an answer to the following question triple-quoted text based on your general knowledge:\n'''\n${message}\n'''`;
};

export const getLastAssistantResponse = (conversationData: IAssistantConversation) => {
  for (let i = conversationData.messages.length - 1; i >= 0; i--) {
    if (conversationData.messages[i].gptMessage?.role === "assistant") {
      return conversationData.messages[i];
    }
  }

  return null;
};

export const getExplainMorePrompt = (conversationData: IAssistantConversation, message?: string) => {
  let nodes: IAssistantNode[] = [];

  if (message) {
    return `Further explain ` + message + ".";
  }

  for (let i = conversationData.messages.length - 1; i >= 0; i--) {
    if (conversationData.messages[i].nodes) {
      nodes = conversationData.messages[i].nodes!;
      break;
    }
  }

  if (!nodes.length) {
    const assistantMessage = getLastAssistantResponse(conversationData);
    if (!assistantMessage) return "";

    return `Further explain following triple-quoted text:\n'''\n${assistantMessage.gptMessage!.content}\n'''`;
  }

  const nodeTitles = nodes.map(node => node.title);
  let _nodeTitles: string = "";
  for (let i = 1; i < nodeTitles.length; i++) {
    _nodeTitles += "- " + JSON.stringify(nodeTitles[i]) + "\n";
  }

  return `Further explain following nodes from 1Cademy:\n` + _nodeTitles;
};

export const generateNotebookTitleGpt4 = async (message: string) => {
  const conversationData: IAssistantConversation = {
    messages: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const prompt = `Write a short title for the following triple-quoted text, in a few words:\n'''\n${message}\n'''`;

  const gpt4Response = await sendMessageToGPT4(
    {
      role: "user",
      content: prompt,
    },
    conversationData
  );

  const defaultTitle = "Conversation " + moment().format("YYYY-MM-DD HH:mm:ss");

  let notebookTitle = gpt4Response.choices?.[0]?.message?.content || defaultTitle;
  const notebook_parts = notebookTitle.split("\n").filter((line: any) => line.replace(/[^a-zA-Z0-9]+/g, "").trim());
  notebookTitle = notebook_parts.pop() || defaultTitle;
  if (
    notebookTitle[0] === '"' ||
    notebookTitle[0] === "'" ||
    notebookTitle[notebookTitle.length - 1] === '"' ||
    notebookTitle[notebookTitle.length - 1] === "'"
  ) {
    notebookTitle = notebookTitle.substring(1, notebookTitle.length - 1);
  }

  return notebookTitle;
};

export const getPassageTopicGpt4 = async (passage: string) => {
  let prompt = `Write a title with a few words for the following triple-quoted paragraph. Only print the title, without any extra text. At the end of the title, instead of a full-stop, print a colon.\n`;
  prompt += `'''\n`;
  prompt += passage;
  prompt += `\n'''`;
  const response = await sendGPTPrompt("gpt-3.5-turbo", [
    {
      role: "user",
      content: prompt,
    },
  ]);
  let topic: any = response || "";
  topic = topic.trim().split("");
  if (topic.length && topic[topic.length - 1] === ":") {
    topic.pop();
  }
  return topic.join("");
};

export const createChat = async (uname?: string) => {
  const assistantChatRef = db.collection("assistantChats").doc();
  await assistantChatRef.set({
    messages: [],
    uname,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  } as IAssistantChat);
  return assistantChatRef.id;
};

export const findPassagesBySelection = async (
  selection: string,
  url: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot<any>[] | undefined> => {
  const _selection = selection.trim();
  const bookPassages = await db.collection("bookPassages").where("urls", "array-contains", url).get();
  const _bookPassages = bookPassages.docs.filter(bookPassage => {
    const bookPassageData = bookPassage.data() as IAssistantNodePassage;
    return bookPassageData.passage.includes(_selection) || _selection.includes(bookPassageData.passage);
  });

  if (_bookPassages.length) {
    return _bookPassages;
  }
};

export const getFlashcardsFromPassage = async (passage: string): Promise<FlashcardResponse> => {
  const prompt =
    `Flashcards are in two types: Concept or Relation\n` +
    `A "Concept" flashcard defines/explains a single concept.The format of this flashcard should be in a single paragraph.\n` +
    `A "Relation" flashcard explains some relationships between multiple concepts.\n` +
    `Print as many flashcards as possible for students' learning  ONLY from the following triple-quoted text:` +
    `'''\n` +
    passage +
    `\n'''` +
    `NEVER print any information beyond the provided text.\n` +
    `Print an array of flashcards, each flashcard as a JSON object with the following keys:\n` +
    `{\n` +
    `"title": The flashcard title as a string. Each title should be stand-alone such that a student would understand it without any need to look up images or other resources.\n` +
    `"content": The flashcard content as a string,\n` +
    `"type": Concept or Relation\n` +
    `}\n` +
    `If you cannot extract any valuable information from the text, print an empty array [].`;
  const response = await sendGPTPrompt("gpt-4", [
    {
      role: "user",
      content: prompt,
    },
  ]);
  let content: string = response || "";
  const flashCardResponse: FlashcardResponse = parseJSONArrayFromResponse(content);
  return flashCardResponse;
};

export const combineContents = async (passages: string[]): Promise<string> => {
  if (passages.length < 2) {
    return passages?.[0] || "";
  }
  const prompt =
    `'''\n` +
    `${passages[0]}\n` +
    `'''\n` +
    `Combine the above triple-quoted text with the one below and paraphrase the result.\n` +
    `'''\n` +
    `${passages[1]}\n` +
    `'''`;
  const response = await sendGPTPrompt("gpt-4", [
    {
      role: "user",
      content: prompt,
    },
  ]);
  return response || "";
};

export const generateQuestionNode = async (
  nodeTitle: string,
  nodeContent: string,
  context: any[]
): Promise<{
  Stem: string;
  Choices: {
    choice: string;
    correct: boolean;
    feedback: string;
  }[];
}> => {
  let prompt: string = `Please compose a multiple-choice question based on the provided text block enclosed in triple quotes. The output should be formatted as a JSON object and consist of the following components:\n`;
  prompt += `- "Stem": This field will contain the central question.\n`;
  prompt += `- "Choices": This will be an array of potential answers. Each answer is an individual object, featuring:\n`;
  prompt += `- "choice": The text of the choice, starting with a lowercase letter followed by a period, like "a.", "b.",  "c." ...\n`;
  prompt += `- "correct": This field should state either "true" if the choice is the right answer, or "false"  if it isn't it should be boolean.\n`;
  prompt += `- "feedback": An explanation describing why the given choice is either correct or incorrect.\n`;
  prompt += `Remember to follow JSON syntax rules to ensure proper formatting and shuffle correct choice(s).\n`;

  prompt += `'''\n`;
  prompt += `"${nodeTitle}":\n`;
  prompt += `"${nodeContent}"\n`;
  prompt += `'''\n`;

  context.push({
    content: prompt,
    role: "user",
  });

  const gptResponse = await sendGPTPrompt("gpt-3.5-turbo", context);

  const response: string = gptResponse || "";
  if (gptResponse) {
    context.push({
      content: gptResponse,
      role: "assistant",
    });
  }
  try {
    const startBracket = response.indexOf("{");
    if (startBracket === -1) {
      throw new Error(`JSON not found`);
    }
    let endBracket = response.indexOf("}");
    while (response.indexOf("}", endBracket + 1) !== -1) {
      endBracket = response.indexOf("}", endBracket + 1);
    }
    if (endBracket === -1) {
      throw new Error(`JSON not found`);
    }
    return JSON.parse(response.substring(startBracket, endBracket + 1));
  } catch (err) {
    return await generateQuestionNode(nodeTitle, nodeContent, context);
  }
};

export const generateFlashcard = async (
  passages: string[],
  context: any[],
  model: "gpt-4-1106-preview" | "gpt-4-0613"
): Promise<{
  Stem: string;
  Choices: {
    choice: string;
    correct: boolean;
    feedback: string;
  }[];
}> => {
  let prompt: string = `
  Flashcards are in two types: Concept or Relation\n
  - A "Concept" flashcard defines/explains a concept.\n
  - A "Relation" flashcard explains some relationships between multiple concepts.\n
  Print a JSON array of objects, each representing a flashcard. Include as many flashcards as possible for students to learn, ONLY from the following triple-quoted JSON object of paragraphs:\n
  '''
  ${JSON.stringify(passages)}
  '''\n
  Do not include any information beyond the provided text. Each array item (flashcard) should be a JSON object with the following keys:\n
  {
  "why_matters": A string explaining why this flashcard is important for students to learn.,
  "paragraphs": [An array of the paragraph keys that were used in the flashcard. The keys come from the JSON object.],
  "title": The flashcard title as a string,
  "content": The flashcard content as a paraphrased string,,
  "type": Concept or Relation,
  "image":[Optional. If the flashcard includes an image, the image key should be included here.]
  }`;

  context.push({
    content: prompt,
    role: "user",
  });

  const gptResponse = await sendGPTPrompt(model, context);

  const response: string = gptResponse || "";

  if (gptResponse) {
    context.push({
      content: gptResponse,
      role: "assistant",
    });
  }

  const start = response.indexOf("[");
  const end = response.lastIndexOf("]");
  const jsonArrayString = response.slice(start, end + 1);
  return JSON.parse(jsonArrayString);
};
