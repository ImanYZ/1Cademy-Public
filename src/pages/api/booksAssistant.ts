import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
const OpenAI = require("openai");

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
  //   OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});

const getJSON = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const jsonArrayString = text.slice(start, end + 1);
  return jsonArrayString;
};

const uploadPdf = async (bookUrl: string, bookId: string) => {
  const file = await openai.files.create({
    file: await fetch(bookUrl),
    purpose: "assistants",
  });
  const assistantTitleId = await getAssistantGenerateTitle();

  //get response
  const newThread = await openai.beta.threads.create();
  console.log(newThread);
  await openai.beta.threads.messages.create(newThread.id, {
    role: "user",
    file_ids: [file.id],
    content: "The document is attached.",
  });
  const response = await fetchCompelation(newThread.id, assistantTitleId);
  console.log(response);
  const title = JSON.parse(getJSON(response)).title;

  const bookRef = db.collection("books").doc(bookId);
  await bookRef.update({
    file_id: file.id,
    title,
  });
  await openai.beta.assistants.del(assistantTitleId);
  return file.id;
};

const fetchCompelation = async (threadId: string, assistant_id: string) => {
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

  return lastMessageForRun.content[0].text.value;
};

const getAssistantID = async () => {
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
      
      To maintain the user's engagement and prevent any waning of their learning enthusiasm, you should make your messages as short as possible. You should not include more than one question in each of your messages.  
      Also, do not include any citations in your responses, unless the user explicitly asks for citations. In addition, you should use the following strategies:
      
      1. **Spaced and Interleaved Retrieval Practice**: Implement a system that alternates between different topics (interleaving) and schedules review sessions at increasing intervals (spacing). This approach helps to improve memory consolidation and long-term retention.
      
      2. **Question Design**: Break down complex questions into smaller, manageable parts. Ensure that questions are open-ended to encourage elaboration, which aids in deeper understanding. Use a variety of question types (e.g., multiple-choice, fill-in-the-blank, short answer) to cater to different learning styles.
      
      3. **Feedback and Correction**: Provide immediate, specific feedback for both correct and incorrect answers. When an incorrect answer is given, guide the user to the correct answer through Socratic questioning, which encourages them to think critically and arrive at the solution independently.
      
      4. **Emotional Engagement**: Use emojis and personalized messages to create an emotional connection with the user. Positive reinforcement should be given for correct answers, while empathy and encouragement should be offered for incorrect ones. Avoid overuse of sad emojis, as they may have a demotivating effect.
      
      5. **Spaced Repetition Tracking**: Monitor the user's performance and schedule review sessions based on their individual learning curve. Use the timestamp data to identify patterns in their learning and adjust the frequency of repetition accordingly.
      
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
      model: "gpt-4-1106-preview",
    });
    return newAssistant.id;
  }
};

const getAssistantGenerateTitle = async () => {
  const newAssistant = await openai.beta.assistants.create({
    instructions: `The user attaches a document. Write a title for the attached document as a JSON object with only one key, called "title"`,
    name: "Title Generator",
    tools: [{ type: "retrieval" }, { type: "code_interpreter" }],
    model: "gpt-4-1106-preview",
  });
  return newAssistant.id;
};
const getThread = async (bookId: string) => {
  const bookDoc = await db.collection("books").doc(bookId).get();
  const bookData = bookDoc.data();
  return bookData;
};

const createThread = async (bookId: string) => {
  const newThread = await openai.beta.threads.create();

  const bookDocRef = db.collection("books").doc(bookId);
  await bookDocRef.update({
    threadId: newThread.id,
  });

  return newThread.id;
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { bookId, message, asAudio } = req.body;
    const data = req.body.data;
    const firstname = data.user.userData.fName;
    let newMessage = message;
    console.log({ bookId });

    const documentData: any = await getThread(bookId);

    const assistantId = await getAssistantID();

    let pdfId = documentData.file_id;
    console.log(documentData.bookUrl, pdfId);
    if (!pdfId) {
      pdfId = await uploadPdf(documentData.bookUrl, bookId);
    }
    let threadId = documentData.threadId;

    console.log({ pdfId });
    if (!threadId) {
      threadId = await createThread(bookId);
      newMessage = `Hi, I'm ${firstname}. Teach me everything in the attached file.`;
    }
    //create thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      file_ids: [pdfId],
      content: newMessage,
    });
    //get response
    const responseText = await fetchCompelation(threadId, assistantId);

    const threadMessages = await openai.beta.threads.messages.list(threadId);

    await openai.beta.assistants.del(assistantId);

    if (asAudio) {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: responseText,
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());

      return res.status(200).send({
        messages: threadMessages.data.sort((a: any, b: any) => a.created_at - b.created_at),
        buffer,
      });
    } else {
      return res.status(200).send({
        messages: threadMessages.data.sort((a: any, b: any) => a.created_at - b.created_at),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
