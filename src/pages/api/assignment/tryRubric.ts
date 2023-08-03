import { NextApiRequest, NextApiResponse } from "next";
import { generateQuestionNode, sendGPTPrompt } from "src/utils/assistant-helpers";

export type IAssistantGetTopicPayload = {
  url?: string;
  passage: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    console.log("called");
    const { essayText, rubrics } = req.body;
    console.log("generateQuestionNode", essayText, rubrics);

    const extractArray = (arrayString: any) => {
      const start = arrayString.indexOf("[");
      const end = arrayString.lastIndexOf("]");
      const jsonArrayString = arrayString.slice(start, end + 1);
      return jsonArrayString;
    };

    const prompt =
      `A student has written the following triple-quoted answer to a question:\n` +
      `‘’'\n${essayText}‘’'\n` +
      `\n` +
      `Respond whether the student has mentioned each of the following rubric items, listed as items of the following array, in their writing:\n` +
      "[" +
      rubrics.prompts.map((p: any) => "(" + p + ")") +
      "]" +
      `\nYour response should be a JSON array of objects. Each item should represent a rubric item, as an object with the following key-value pairs:\n` +
      `{\n` +
      ` "rubric_item": [the rubric item string goes here],\n` +
      `  "mentioned": the value should be either "YES" or "NO",\n` +
      `"correct": if the student has mentioned the key phrase and their explanation is correct, the value should be "YES", otherwise, "NO",\n` +
      `"sentences": [an array of sentences from the student's answer, which mention the key phrase.] If the student has not mentioned the key phrase anywhere in their answer, the value should be an empty array [].\n` +
      `}\n` +
      `Do not print anything other than this array of objects.`;

    const gptResponse = await sendGPTPrompt("gpt-3.5-turbo", [
      {
        content: prompt,
        role: "user",
      },
    ]);

    const responseArray = JSON.parse(extractArray(gptResponse));

    return res.status(200).json(responseArray);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
