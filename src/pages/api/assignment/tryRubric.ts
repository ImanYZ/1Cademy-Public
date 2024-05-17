import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Rubric } from "src/client/firestore/questions.firestore";
import { generateQuestionNode, sendGPTPrompt } from "src/utils/assistant-helpers";

type UserAnswerFromCache = {
  questionId: string;
  rubricId: string;
  userAnswer: string;
  result: any[];
  createdAt: Date;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // console.log("called");
    // const { essayText, rubrics } = req.body;
    const essayText: string = req.body.essayText;
    const rubrics: Rubric = req.body.rubrics;

    // get from cache the answer
    const questionId = rubrics.questionId;
    const rubricId = rubrics.id;
    const userAnswersCache = await db
      .collection("answerResultFromCache")
      .where("questionId", "==", questionId)
      .where("rubricId", "==", rubricId)
      .where("userAnswer", "==", essayText)
      .limit(1)
      .get();
    if (userAnswersCache.docs.length) {
      const userAnswerFromCache = userAnswersCache.docs[0].data() as UserAnswerFromCache;
      console.log("from-cache");
      return res.status(200).json(userAnswerFromCache.result);
    }

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
      rubrics.prompts.map(p => "(" + p.prompt + ")") +
      "]" +
      `\nYour response should be a JSON array of objects. Each item should represent a rubric item, as an object with the following key-value pairs:\n` +
      `{\n` +
      ` "rubric_item": [the rubric item string goes here],\n` +
      `  "mentioned": the value should be either "YES" or "NO",\n` +
      `"correct": if the student has mentioned the key phrase and their explanation is correct, the value should be "YES", otherwise, "NO",\n` +
      `"sentences": [an array of sentences from the student's answer, which mention the key phrase.] If the student has not mentioned the key phrase anywhere in their answer, the value should be an empty array [].\n` +
      `}\n` +
      `Do not print anything other than this array of objects.`;
    let gptResponse: string = "";
    let numRequests = 0;
    while (!gptResponse) {
      try {
        if (numRequests++ > 3) {
          break;
        }
        const completion = await sendGPTPrompt([
          {
            content: prompt,
            role: "user",
          },
        ]);
        gptResponse = completion || "";
      } catch (error) {
        gptResponse = "";
      }
    }

    if (!gptResponse) {
      return res.status(500).send({
        error: true,
        reason: "GPT-4 failed to respond",
      });
    }

    const responseArray = JSON.parse(extractArray(gptResponse));

    // save on cache the result of the user answer
    const userAnswerData: UserAnswerFromCache = {
      questionId,
      rubricId,
      userAnswer: essayText,
      createdAt: new Date(),
      result: responseArray,
    };

    const userNodeRef = db.collection("answerResultFromCache").doc();
    userNodeRef.set(userAnswerData); //INFO: we don't await this because we want to return ASAP

    console.log("not-from-cache");
    return res.status(200).json(responseArray);
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
