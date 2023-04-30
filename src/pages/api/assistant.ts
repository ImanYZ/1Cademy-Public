import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import axios from "axios";

const customsearch = google.customsearch("v1");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const GPT_API_URL = process.env.GPT_API_URL || "";
const GPT_API_KEY = process.env.GPT_API_KEY;

const searchOnGoogle = async (query: string) => {
  const res = await customsearch.cse.list({
    q: query,
    cx: GOOGLE_CX,
    auth: GOOGLE_API_KEY,
  });
  return res.data.items;
};

const generateTextFromGPT = async (prompt: string) => {
  const response = await axios.post(
    GPT_API_URL,
    {
      messages: [{ role: "assistant", content: prompt, name: "GPT" }],
      model: "gpt-4",
      temperature: 0,
      n: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${GPT_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message;
};

async function handler(req: NextApiRequest, res: NextApiResponse<[]>) {
  try {
    const searchQuery: any = req.query.query || "";
    const prompt =
      "You are a tutor that answers each student's questions based on 1Cademy, which is a knowledge graph where:\n" +
      "- Each node represents a unique piece of knowledge, which we call a 'concept.'\n" +
      "- Each node is not divisible into smaller nodes.\n" +
      "- The source of each link is called a 'parent' and its destination is called a 'child'.\n" +
      "- If node A is a child of node B, then node B is a parent of node A.\n" +
      "- Each node can have one or multiple parents and zero, one, or multiple children.\n" +
      "- Each link between two nodes represents a direct prerequisite relationship. This means it's impossible for someone to learn a child before learning its parent. By 'direct,' we mean that if there exists a link from node A to node B, there cannot be any intermediary node C between them that has node A as its parent and node B as its child.\n" +
      "- There is no loop in this knowledge graph. This means if node A is a parent of node B and node B is a parent of node C, node C cannot be a parent of node A.\n" +
      "- Each node includes a 'title' that represents the corresponding concept, and 'content' that explains the concept in a short paragraph.\n" +
      "- The 'title' of each node is unique and very specific. This means to understand what concept the node is representing, one can just read its title without a need to know its parents or children.\n" +
      "- Nodes are in three types:\n" +
      "   1. A 'Concept' node defines a concept. What we explained above was a Concept node.\n" +
      "   2. A 'Relation' node is similar to a Concept node, but does not define any new concept, but just explains the relations between two or more concepts.\n" +
      "   3. A 'Question' node is similar to a Concept node, but contains a multiple-choice question. The title is only the question stem. The content of a Question node should include one or more correct choices. Each choice should start with an alphabetical character and a dot, such as 'a.', 'b.', 'c.', and continue with the word 'CORRECT' if the choice is correct, or 'WRONG' if the choice is wrong. The next line after each choice should explain the reason for why the choice is correct or wrong. A Question node cannot be a parent of any other node.\n" +
      "Your users are students. When a student asks you a question, you should mainly respond based on 1Cademy. In each response, clarify which nodes and links of 1Cademy can help to answer the question.\n" +
      `You can query the 1Cademy knowledge graph by generating the code '\\1Cademy\\ ${searchQuery}'. If you give the student this query, they'll search the 1Cademy database based on your query and respond to you with all the information about the first four search resulted nodes, each in the following format. They separate each node information from the others by a line break.\n` +
      "- Node Title\n" +
      "- Node Content\n" +
      "- Node Type\n" +
      "- The titles of all the node's parents as an array\n" +
      "- The titles of all the node's children as an array\n" +
      "- The student has correctly answered [number] questions about this node.\n" +
      "You should not ask the student multiple queries at once. In each of your responses you can include one single query, but your can ask many queries, each in a separate response to formulate your final answer to the student. The student will search 1Cademy database as many times as you ask and would respond to all your queries until you respond to their original request.\n" +
      "Your final response to their original request should not include any query.";
    console.log(prompt, "prompt");
    const gptResponse = await generateTextFromGPT(prompt);
    console.log(gptResponse, "gptResponse");
    return;
    const googleSearchResult: any = await searchOnGoogle(searchQuery);
    res.status(200).json(googleSearchResult);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
