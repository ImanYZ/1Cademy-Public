/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { fileToGenerativePart } from "../openAI/fileToGenerativePart";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const isValidJSON = (jsonString: string): { jsonObject: any; isJSON: boolean } => {
  try {
    return { jsonObject: JSON.parse(jsonString), isJSON: true };
  } catch (error) {
    return { jsonObject: {}, isJSON: false };
  }
};

export async function askGemini(files: string[], prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  let response = "";
  let isJSONObject: { jsonObject: any; isJSON: boolean } = {
    jsonObject: {},
    isJSON: false,
  };
  let filesParts = [];

  for (let file of files) {
    try {
      const fileContent = await fileToGenerativePart(file);
      filesParts.push(fileContent);
    } catch (error) {
      console.error(error);
    }
  }

  for (let i = 0; i < 4; i++) {
    try {
      const result = await model.generateContent({
        contents: [
          {
            parts: [
              ...filesParts,
              {
                text: prompt,
              },
            ],
            role: "user",
          },
        ],
        generationConfig,
        safetySettings,
      });
      response = result.response.text();
      isJSONObject = isValidJSON(response);
      if (isJSONObject.isJSON) {
        break;
      }
      console.log("Failed to get a complete JSON object. Retrying for the ", i + 1, " time.");
      console.log("Response: ", response);
    } catch (error) {
      console.error("Error in generating content: ", error);
    }
  }

  if (!isJSONObject.isJSON) {
    throw new Error("Failed to get a complete JSON object");
  }
  return isJSONObject.jsonObject;
}
