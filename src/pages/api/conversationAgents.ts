import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./openAI/helpers";
import { MODEL } from "@/lib/utils/constants";
import fbAuth from "src/middlewares/fbAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { messages, concept } = req.body;
    console.log(messages);
    messages.unshift({
      role: "system",
      content: `
            You are a helpful assistant
            discuss the content of this flashcard:
            {
              title:${concept.title}, 
              content:${concept.content}, 
            }
            make your messages as short as possible
            `,
    });
    const response = await openai.chat.completions.create({
      messages: messages,
      model: MODEL,
      temperature: 0,
      stream: true,
    });
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        const resultText = result.choices[0].delta.content;
        res.write(resultText);
      }
    }
    res.end();
  } catch (error) {
    console.log(error);
  }
}

export default fbAuth(handler);
