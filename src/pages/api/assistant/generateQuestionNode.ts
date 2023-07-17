import { NextApiRequest, NextApiResponse } from "next";
import { generateQuestionNode } from "src/utils/assistant-helpers";

export type IAssistantGetTopicPayload = {
  url?: string;
  passage: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { nodeTitle, nodeContent } = req.body;
    console.log("generateQuestionNode", nodeTitle);
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
    const question = await generateQuestionNode(nodeTitle, nodeContent, []);
    // const question = {
    //   Stem: "question?",
    //   Choices: [
    //     {
    //       choice:
    //         "a. Choice A",
    //       correct: true,
    //       feedback:
    //         "Feedback A",
    //     },
    //     {
    //       choice:
    //         "b. Choice B",
    //       correct: false,
    //       feedback:
    //         "Feedback B",
    //     },
    //     {
    //       choice:
    //         "c. Choice C",
    //       correct: false,
    //       feedback:
    //         "Feedback C.",
    //     },
    //     {
    //       choice:
    //         "d. Choice D",
    //       correct: false,
    //       feedback:
    //         "Feedback D.",
    //     },
    //   ],
    // };
    return res.status(200).json(question);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
