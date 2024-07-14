/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const path = require("path");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fileToGenerativePart = require("../openAI/fileToGenerativePart");
require("dotenv").config({
  path: path.join(__dirname, "../", ".env.prod"),
});

const apiKey = process.env.GEMINI_API_KEY;
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

export async function askGemini(files: File[], prompt: string) {
  files.forEach((file, index) => {
    console.log(`File ${index} type:`, file.constructor.name);
  });

  const validFiles = files.filter(file => file instanceof File);
  if (validFiles.length !== files.length) {
    console.error("Some objects are not File instances:", files);
    throw new Error("Some provided objects are not File instances");
  }

  const imageParts = await Promise.all(validFiles.map(fileToGenerativePart));

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  let response = "";
  let isJSONObject: { jsonObject: any; isJSON: boolean } = {
    jsonObject: {},
    isJSON: false,
  };
  for (let i = 0; i < 4; i++) {
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            ...imageParts,
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
  }

  if (!isJSONObject.isJSON) {
    throw new Error("Failed to get a complete JSON object");
  }
  return isJSONObject.jsonObject;
}
