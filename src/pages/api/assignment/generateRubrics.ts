import { NextApiRequest, NextApiResponse } from "next";
import { sendGPTPrompt } from "src/utils/assistant-helpers";

const extractArray = (arrayString: string) => {
  const start = arrayString.indexOf("[");
  const end = arrayString.lastIndexOf("]");
  const jsonArrayString = arrayString.slice(start, end + 1);
  return jsonArrayString;
};

async function handler(req: NextApiRequest, res: NextApiResponse<string[]>) {
  try {
    const { questionDescription, questionTitle } = req.body;
    const prompt =
      `Answer the following triple-quoted question comprehensively as a JSON Array of sentences. Each item in the array should be short and mention only one complete sentence for which a student would receive a point if they say it in their response to this question. Do not print anything other than the JSON Array.\n` +
      `‘’'\n
      ${questionTitle}\n
      ${questionDescription}\n‘’'`;

    const completion = await sendGPTPrompt("gpt-3.5-turbo", [
      {
        content: prompt,
        role: "user",
      },
    ]);
    let gptResponse: any = completion?.choices?.[0]?.message?.content || "";
    console.log({ gptResponse });

    const responseArray = JSON.parse(extractArray(gptResponse));

    return res.status(200).json(responseArray);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    } as any);
  }
}

export default handler;
