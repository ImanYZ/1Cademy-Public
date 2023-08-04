import { NextApiRequest, NextApiResponse } from "next";
import { generateQuestionNode, sendGPTPrompt } from "src/utils/assistant-helpers";

export type IAssistantGetTopicPayload = {
  url?: string;
  passage: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // console.log("called");
    const { essayText, rubrics } = req.body;
    // console.log("generateQuestionNode", essayText, rubrics);

    // const extractArray = (arrayString: any) => {
    //   const start = arrayString.indexOf("[");
    //   const end = arrayString.lastIndexOf("]");
    //   const jsonArrayString = arrayString.slice(start, end + 1);
    //   return jsonArrayString;
    // };

    // const prompt =
    //   `A student has written the following triple-quoted answer to a question:\n` +
    //   `‘’'\n${essayText}‘’'\n` +
    //   `\n` +
    //   `Respond whether the student has mentioned each of the following rubric items, listed as items of the following array, in their writing:\n` +
    //   "[" +
    //   rubrics.prompts.map((p: any) => "(" + p + ")") +
    //   "]" +
    //   `\nYour response should be a JSON array of objects. Each item should represent a rubric item, as an object with the following key-value pairs:\n` +
    //   `{\n` +
    //   ` "rubric_item": [the rubric item string goes here],\n` +
    //   `  "mentioned": the value should be either "YES" or "NO",\n` +
    //   `"correct": if the student has mentioned the key phrase and their explanation is correct, the value should be "YES", otherwise, "NO",\n` +
    //   `"sentences": [an array of sentences from the student's answer, which mention the key phrase.] If the student has not mentioned the key phrase anywhere in their answer, the value should be an empty array [].\n` +
    //   `}\n` +
    //   `Do not print anything other than this array of objects.`;

    // const completion = await sendGPTPrompt("gpt-3.5-turbo", [
    //   {
    //     content: prompt,
    //     role: "user",
    //   },
    // ]);
    // let gptResponse: any = completion?.choices?.[0]?.message?.content || "";
    // console.log({ gptResponse });

    // const responseArray = JSON.parse(extractArray(gptResponse));

    console.log({ essayText });
    return res.status(200).json(MOCK_2.result);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
const MOCK_2 = {
  answer:
    "The process of mRNA translation starts with the transcription of DNA into mRNA in the cell nucleus. Once the mRNA is formed, it exits the nucleus through nuclear pores and don't enters the cytoplasm.",
  result: [
    {
      rubric_item: "mRNA exits nucleus via nuclear pore.",
      mentioned: "YES",
      correct: "YES",
      sentences: ["Once the mRNA is formed, it exits the nucleus through nuclear pores"],
    },
    {
      rubric_item: "mRNA travels through the cytoplasm to the ribosome or enters the rough endoplasmic reticulum.",
      mentioned: "YES",
      correct: "NO",
      sentences: ["don't enters the cytoplasm."],
    },
    {
      rubric_item: "mRNA bases are read in triplets called codons (by rRNA)",
      mentioned: "NO",
      correct: "NO",
      sentences: [],
    },
    {
      rubric_item:
        "tRNA carrying the complementary (U=A, C+G) anticodon recognizes the complementary codon of the mRNA.",
      mentioned: "NO",
      correct: "NO",
      sentences: [],
    },
  ],
};
