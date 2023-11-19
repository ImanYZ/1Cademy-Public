const OpenAI = require("openai");

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
export const openai = new OpenAI({
  apiKey: secretKey,
  //   OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});
