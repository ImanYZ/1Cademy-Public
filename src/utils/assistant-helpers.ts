import { db } from "@/lib/firestoreServer/admin";
import { getTypesenseClient } from "@/lib/typesense/typesense.config";
import { google } from "googleapis";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, CreateChatCompletionResponse } from "openai";
import { TypesenseNodesSchema } from "src/knowledgeTypes";
import { IAssistantConversation, IAssistantMessage, IAssistantNode } from "src/types/IAssitantConversation";
import { arrayToChunks } from "./arrayToChunks";
import { INode } from "src/types/INode";
import { getNodePageWithDomain } from "@/lib/utils/utils";
import { IUser } from "src/types/IUser";
import { IPractice } from "src/types/IPractice";
import { Timestamp } from "firebase-admin/firestore";
import moment from "moment";

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

export const top4GoogleSearchResults = async (query: string, tagTitle?: string): Promise<string[]> => {
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
      if (_nodeIds.size >= 4) break;
      _nodeIds.add(node.id);
    }
  }
  return Array.from(_nodeIds);
};

export const top4TypesenseSearch = async (query: string, tagTitle?: string): Promise<string[]> => {
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
      if (_nodeIds.size >= 4) break;
      _nodeIds.add(node.id);
    }
  }
  return Array.from(_nodeIds);
};

export const sendMessageToGPT4 = async (
  message: ChatCompletionRequestMessage,
  conversation: IAssistantConversation,
  request?: string
): Promise<CreateChatCompletionResponse> => {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(config);
  const messages = conversation.messages;
  messages.push({
    gptMessage: message,
    request,
  });

  const response = await openai.createChatCompletion({
    messages: messages.filter(message => message.gptMessage).map(message => message.gptMessage!),
    model: "gpt-4",
    temperature: 0,
  });

  return response.data;
};

export const createTeachMePrompt = (bookText: string): string => {
  return (
    `I've selected the following triple-quoted text. Explain it to me to learn it.\n` +
    `'''\n` +
    bookText +
    "\n" +
    `'''`
  );
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

export const generateBardQueryResult = async (nodeIds: string[], uname?: string) => {
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

  const bardResultNodes: {
    title: string;
    content: string;
    correct_answers: number;
  }[] = [];
  for (const node of nodes) {
    bardResultNodes.push({
      title: node.title,
      content: node.content,
      correct_answers: practiceAnsweredByNodeIds[String(node.documentId!)] || 0,
    });
  }

  return bardResultNodes;
};

export const processRecursiveCommands = async (
  message: ChatCompletionRequestMessage,
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
      const googleNodeIds = await top4GoogleSearchResults(command, tagTitle);
      if (googleNodeIds.length) {
        nodeIds = googleNodeIds;
      } else {
        nodeIds = await top4TypesenseSearch(command, tagTitle);
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
  const matchResult = content.match(/\[[\t\n ]*?{/gm);
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
  const notebook_parts = notebookTitle.split("\n").filter(line => line.replace(/[^a-zA-Z0-9]+/g, "").trim());
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
