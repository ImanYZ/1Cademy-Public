import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { imageIrl } = req.body;
    // prompt for handling images from the textbook
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "prompt here",
            },
            {
              type: "image_url",
              image_url: {
                imageIrl,
              },
            },
          ],
        },
      ],
    });
  } catch (error) {}
}

export default fbAuth(handler);
