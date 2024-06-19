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

// Function to convert File to Base64 string and then to the required part structure
export const fileToGenerativePart = async (file: File): Promise<any> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString().split(",")[1] || "");
      } else {
        reject("Failed to read file");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64Data = await base64EncodedDataPromise;
  return {
    inlineData: {
      mimeType: file.type,
      data: base64Data,
    },
  };
};

function isValidJSON(jsonString: string) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

export async function askGemini(files: File[], prompt: string) {
  try {
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
      if (isValidJSON(response)) {
        break;
      }
      console.log("Failed to get a complete JSON object. Retrying for the ", i + 1, " time.");
      console.log("Response: ", response);
    }

    if (!isValidJSON(response)) {
      throw new Error("Failed to get a complete JSON object");
    }
    return response;
  } catch (error) {
    console.error("Error in askGemini:", error);
  }
}
