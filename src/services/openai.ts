import { Post } from "@/lib/mapApi";

export const sendMessageToChatGPT = async (messages: { role: string; content: string }[]) => {
  const result: any = await Post("/openAI/request", {
    messages,
    model: "gpt-4-turbo-preview",
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
