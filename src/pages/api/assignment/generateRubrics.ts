import { NextApiRequest, NextApiResponse } from "next";
import { sendGPTPrompt } from "src/utils/assistant-helpers";

const extractArray = (arrayString: string) => {
  const start = arrayString.indexOf("[");
  const end = arrayString.lastIndexOf("]");
  const jsonArrayString = arrayString.slice(start, end + 1);
  return jsonArrayString;
};

type IGenerateRubricsPayload = {
  phrase: string;
  explanation: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<IGenerateRubricsPayload[]>) {
  try {
    const { questionDescription } = req.body;
    const prompt =
      `Write key phrases, each with a complete explanation, that a student should mention in their response to the following question to receive a point per key phrase in a JSON array:\n` +
      `‘’'\n${questionDescription}‘’'\n`;

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
