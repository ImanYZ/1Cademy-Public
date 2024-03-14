import OpenAI from "openai";
import fbAuth from "src/middlewares/fbAuth";

require("dotenv").config();
const openAIGenerator = (apiKey: string, organization: string): any => {
  const openaiConfig = {
    apiKey,
    organization: "",
  };
  if (organization) {
    openaiConfig.organization = organization;
  }
  return new OpenAI(openaiConfig);
};

const handler = async (req: any, res: any) => {
  try {
    const { messages } = req.body;

    const apiKey: string = process.env.OPENAI_API_KEY || "";
    const organization: string = process.env.OPENAI_API_ORG_ID || "";

    if (!apiKey || !organization) {
      throw new Error("Environment variables missing!!");
    }
    const openai = openAIGenerator(apiKey, organization);
    let response = "";
    let responseObj = "";

    while (!response || !response.trim()) {
      const messagePayload = {
        model: "gpt-4-turbo-preview",
        messages,
        response_format: { type: "json_object" },
        temperature: 0,
      };

      const OpenAIResponse = await openai.chat.completions.create(messagePayload);
      response = OpenAIResponse?.choices[0]?.message?.content;

      try {
        responseObj = JSON.parse(response);
      } catch (error) {
        console.error("Error parsing JSON response from chatGPT: ", error);
        response = "";
      }
    }
    return res.status(200).json({ responseObj });
  } catch (e) {
    console.log(e);
    return res.status(500).json(e);
  }
};

export default fbAuth(handler);
