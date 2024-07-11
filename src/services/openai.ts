import OpenAI from "openai";

import { Post } from "@/lib/mapApi";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORG_ID,
});

export const sendMessageToChatGPT = async (messages: { role: string; content: string }[]) => {
  const result: any = await Post("/openAI/request", {
    messages,
    model: "gpt-4o",
    response_format: { type: "json_object" },
  });
  if (result?.response) {
    try {
      return JSON.parse(result?.response);
    } catch (err: any) {
      console.error(err.message);
      return [];
    }
  } else {
    return [];
  }
};

export const generateImage = async (prompt: string) => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  const image_url = response.data[0].url;
  return image_url;
};
