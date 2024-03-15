//import OpenAI from "openai";
import axios from "axios";
import { getIdToken } from "@/lib/firestoreClient/auth";

// const openAIGenerator = (apiKey: string, organization: string): any => {
//   const openaiConfig = {
//     dangerouslyAllowBrowser: true,
//     apiKey,
//     organization: "",
//   };
//   if (organization) {
//     openaiConfig.organization = organization;
//   }
//   return new OpenAI(openaiConfig);
// };

// const text2Speech = async (
//   assistantVoice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
//   message: string
// ) => {
//   const { apiKey, organization } = { apiKey: "", organization: "" };
//   try {
//     const openai = openAIGenerator(apiKey, organization);

//     const response = await openai.audio.speech.create({
//       model: "tts-1",
//       voice: assistantVoice,
//       input: message,
//     });

//     // Convert the response to a Blob
//     const blob = new Blob([await response.arrayBuffer()], {
//       type: "audio/mp3",
//     });

//     // Create an audio element and set the source to the Blob URL
//     const audio = new Audio(URL.createObjectURL(blob));

//     // Play the audio
//     audio.play();
//   } catch (error) {
//     console.error("Error generating speech: ", error);
//   }
// };

export const sendMessageToChatGPT = async (messages: { role: string; content: string }[]) => {
  const token = await getIdToken();
  const response = await axios.post("/api/coauthor", { messages }, { headers: { Authorization: `Bearer ${token}` } });
  if (response?.data?.responseObj) {
    return response.data.responseObj;
  } else {
    return [];
  }
};
