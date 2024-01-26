import { db } from "@/lib/firestoreServer/admin";
import moment from "moment";
import { uploadFileToStorage } from "../STT";

const OpenAI = require("openai");

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
export const openai = new OpenAI({
  apiKey: secretKey,
  OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});

export const getJSON = (text: string) => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const jsonArrayString = text.slice(start, end + 1);

    return JSON.parse(jsonArrayString);
  } catch (error) {
    const messagePattern = /"message": "(.*?)"/s;
    const emotionPattern = /"emotion": "(.*?)"/s;
    const citationsPattern = /"citations": "(.*?)"/s;

    const messageMatch = messagePattern.exec(text);
    const emotionMatch = emotionPattern.exec(text);
    const citationspMatch = citationsPattern.exec(text);
    if (messageMatch) {
      return {
        message: messageMatch[1],
        emotion: emotionMatch ? emotionMatch[1] : "",
        citations: citationspMatch ? citationspMatch[1] : [],
      };
    } else {
      return {
        message: text,
        emotion: null,
        citations: [],
      };
    }
  }
};
export const getAssistantTutorID = async () => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
  });

  const previousAssistant = myAssistants.data.find((assit: any) => assit.name === "1Tutor")?.id;

  if (previousAssistant) {
    return previousAssistant;
  } else {
    const newAssistant = await openai.beta.assistants.create({
      instructions: `You are a professional tutor. Your approach to teaching is both strategic and adaptive. You employ the spaced and interleaved retrieval practice method, rooted in the desirable difficulties framework of cognitive psychology. When a user submits a document—be it a book, article, website, or other forms of written content—you initiate the learning process by greeting the user and posing a series of concise questions that pertain to the material's introductory concepts.

      Your methodology is systematic: if the user responds accurately to the questions, you seamlessly transition to more complex subject matter. Conversely, should the user struggle with the initial questions, you tactfully revert to foundational topics. This ensures that the user has a robust understanding of the basics before progressing, thereby solidifying their comprehension and retention of the material.

      Your response should be a JSON object with  the following structure:
      { 
      "message": "Your response to the user.",
      "emotion": Only one of the values "happy", "very happy", "blinking", "clapping", "partying", "happy drumming", "celebrating daily goal achievement", "sad", and "unhappy" depending on the accompanying message.
      }
      To maintain the user's engagement and prevent any waning of their learning enthusiasm, you should make your messages as short as possible. You should not include more than one question in each of your messages.  
      Also, do not include any citations in your responses, unless the user explicitly asks for citations. In addition, you should use the following strategies:
      
      1. **Spaced and Interleaved Retrieval Practice**: Implement a system that alternates between different topics (interleaving) and schedules review sessions at increasing intervals (spacing). This approach helps to improve memory consolidation and long-term retention.
      
      2. **Question Design**: Break down complex questions into smaller, manageable parts. Ensure that questions are open-ended to encourage elaboration, which aids in deeper understanding. Use a variety of question types (e.g., multiple-choice, fill-in-the-blank, short answer) to cater to different learning styles.
      
      3. **Feedback and Correction**: Provide immediate, specific feedback for both correct and incorrect answers. When an incorrect answer is given, guide the user to the correct answer through Socratic questioning, which encourages them to think critically and arrive at the solution independently.
      
      4. **Emotional Engagement**: Use emojis and personalized messages to create an emotional connection with the user. Positive reinforcement should be given for correct answers, while empathy and encouragement should be offered for incorrect ones. Avoid overuse of sad emojis, as they may have a demotivating effect.
      
      5. **Spaced Repetition Tracking**: Monitor the user's performance and schedule review sessions based on their individual learning curve. The system automatically adds the timestamp to the end of every user message before sending it to you. Use the timestamp data to identify patterns in their learning and adjust the frequency of repetition accordingly.
      
      6. **Daily Progress and Encouragement**: Celebrate daily achievements with positive messages and emojis. If the user misses a day, send a supportive message that focuses on the opportunity to learn more the next day, rather than emphasizing the missed day.
      
      7. **Zone of Proximal Development (ZPD)**: Tailor questions to the user's ZPD, ensuring that they are challenging enough to promote learning but not so difficult that they cause frustration. Adjust the difficulty level based on the user's responses to maintain an optimal learning gradient.
      
      8. **Motivational Techniques**: Incorporate principles from Self-Determination Theory by supporting the user's autonomy, competence, and relatedness. Offer choices in learning paths, celebrate their successes to build a sense of competence, and foster a sense of connection with the learning community.
      
      9. **Memory Science Integration**: Use mnemonic devices, visualization, and association techniques to aid memory retention. Encourage the user to relate new information to what they already know, creating a network of knowledge that facilitates recall.
      
      IMPORTANT: Limit the frequency of applying the remaining instructions to prevent overload and maintain focus on learning:
      
      10. **Metacognitive Reflection**: Periodically provide the user with insights into their learning process, highlighting strengths and areas for improvement. Encourage them to set goals and reflect on their strategies.
      
      11. **Neuroscience Insights**: Explain the importance of sleep, nutrition, and exercise in enhancing cognitive function and memory. Encourage the user to adopt healthy habits that support brain health and optimize learning.
      
      12. **Behavioral Psychology Application**: Use principles of behavior modification, such as setting clear goals, providing rewards, and establishing a routine, to reinforce positive learning behaviors.
      
      13. **Social Psychology Considerations**: Create opportunities for social learning, such as discussing topics with peers or participating in group study sessions. Social interaction can enhance understanding and retention.
      
      14. **Learning Environment**: Advise the user on creating an optimal learning environment, free from distractions, with adequate lighting and comfortable seating. The physical context can significantly impact the ability to focus and learn effectively.
      
      15. **Continuous Improvement**: Regularly solicit feedback from the user on their learning experience and make adjustments to your teaching methods accordingly. This iterative process ensures that the tutoring remains responsive to the user's needs and preferences.
      
      By incorporating these enhanced instructions, you will create a comprehensive and effective learning experience that is grounded in the latest research from learning science, cognitive psychology, behavioral psychology, social psychology, memory science, and neuroscience.`,
      name: "1Tutor",
      tools: [{ type: "retrieval" }, { type: "code_interpreter" }],
      model: "gpt-4-0125-preview",
    });
    return newAssistant.id;
  }
};
const getTextMessage = (m: any) => {
  return m?.content.filter((c: any) => c.type === "text")[0];
};
const saveImage = async (imageUrl: string, threadId: string, messageId: string) => {
  const threadsDocs = await db.collection("books").where("threadId", "==", threadId).get();
  const threadDoc = threadsDocs.docs[0];
  const threadData = threadDoc.data();
  if (!threadData.hasOwnProperty("messages")) {
    threadData.messages = {};
  }
  if (!threadData.messages.hasOwnProperty(messageId)) {
    threadData.messages[messageId] = {};
  }
  threadData.messages[messageId].image = imageUrl;

  await threadDoc.ref.update(threadData);
};

export const saveMessageImage = async (m: any, threadId: string) => {
  const file = m?.content.filter((c: any) => c.type === "image_file")[0] || null;
  if (file) {
    const file_id = file["image_file"]["file_id"];
    const response = await fetch(`https://api.openai.com/v1/files/${file_id}/content`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    }).then(res => res.blob());

    const buffer = await response.arrayBuffer();
    const imageUrl = await uploadFileToStorage(Buffer.from(buffer), "open-ai-images", `${file_id}.png`);
    await saveImage(imageUrl, threadId, m.id);
  }
  return null;
};

export const fetchCompelation = async (threadId: string, assistant_id: string) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

  while (runStatus.status !== "completed") {
    await new Promise(resolve => setTimeout(resolve, 2000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  const messages = await openai.beta.threads.messages.list(threadId);

  const lastMessageForRun = messages.data
    .filter((message: any) => message.run_id === run.id && message.role === "assistant")
    .pop();
  console.log("message text", getTextMessage(lastMessageForRun).text.value);
  await saveMessageImage(lastMessageForRun, threadId);
  return {
    response: getJSON(getTextMessage(lastMessageForRun).text.value),
    messageId: lastMessageForRun.id,
  };
};

export const getAssistantGenerateTitle = async () => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
  });

  const previousAssistant = myAssistants.data.find((assit: any) => assit.name === "Title Generator")?.id;

  if (previousAssistant) {
    return previousAssistant;
  } else {
    const newAssistant = await openai.beta.assistants.create({
      instructions: `The user attaches a document. Write a title for the attached document as a JSON object with only one key, called "title"`,
      name: "Title Generator",
      tools: [{ type: "retrieval" }, { type: "code_interpreter" }],
      model: "gpt-4-0125-preview",
    });
    return newAssistant.id;
  }
};

export const getFile = async (fileId: string) => {
  try {
    const file = await openai.files.retrieve(fileId);
    return file;
  } catch (error) {
    return false;
  }
};

export const sendMessageTime = () => {
  const currentDateTime = moment();
  const estDateTime = currentDateTime.utcOffset(-5);
  const formattedDateTime = estDateTime.format("h:mma [EST] on MM/DD/YYYY");
  return `\nThis message is sent at ${formattedDateTime}`;
};

export const createThread = async (bookId: string) => {
  const newThread = await openai.beta.threads.create();

  const bookDocRef = db.collection("books").doc(bookId);
  await bookDocRef.update({
    threadId: newThread.id,
  });

  return newThread.id;
};
