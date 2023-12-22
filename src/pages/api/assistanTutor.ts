import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssitantRequestAction } from "src/types/IAssitantConversation";

import { openai } from "./openAI/helpers";
import { newId } from "@/lib/utils/newFirestoreId";
import { uploadToCloudStorage } from "./STT";
import { delay } from "@/lib/utils/utils";

export type IAssistantRequestPayload = {
  actionType: IAssitantRequestAction;
  message: string;
  conversationId?: string;
  url?: string;
  // notebookId?: string;
};

const PROMPT = (flashcards: any, url: string) => {
  return `
  You are a professional tutor. Your approach to teaching is both strategic and adaptive. You employ the spaced and interleaved retrieval practice method, rooted in the desirable difficulties framework of cognitive psychology. You should make your messages very short. You should motivate and help the user learn all the concept cards in the following JSON array of objects from unit${url}:
${JSON.stringify(flashcards)}
If the user asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the above concept cards. 
You initiate the learning process by greeting the user and posing a series of concise questions that pertain to the material's introductory concepts.
Your methodology is systematic: if the user responds accurately to the questions, you seamlessly transition to more complex subject matter. Conversely, should the user struggle with the initial questions, you tactfully revert to foundational topics. This ensures that the user has a robust understanding of the basics before progressing, thereby solidifying their comprehension and retention of the material.

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
By incorporating these enhanced instructions, you will create a comprehensive and effective learning experience that is grounded in the latest research from learning science, cognitive psychology, behavioral psychology, social psychology, memory science, and neuroscience.
You should make your messages very short.
`;
};

const generateSystemPrompt = async (url: string, fullbook: boolean, concepts: any) => {
  const flashcards = concepts;
  if (!flashcards.length) {
    let booksQuery = db.collection("chaptersBook").where("url", "==", url);
    if (fullbook) {
      booksQuery = db.collection("chaptersBook");
    }
    const booksDocs = await booksQuery.get();
    let flashcards: any = [];
    for (let bookDoc of booksDocs.docs) {
      const bookData = bookDoc.data();
      flashcards = [...flashcards, ...(bookData?.flashcards || [])];
    }
  }
  const copy_flashcards = flashcards
    .filter((f: any) => f.paragraphs.length > 0)
    .map(
      (f: any) =>
        (f = {
          title: f.title,
          content: f.content,
          id: f.id,
        })
    );
  console.log(copy_flashcards[0]);
  return PROMPT(copy_flashcards, url.replace(".html", ""));
};

const extractFlashcardId = (inputText: string) => {
  // extract prior_evaluation
  let prior_evaluationRegex = /\s*-\s*"prior_evaluation"\s*:\s*"([^"]+)"/;
  let flashcard_usedRegex = /\s*-\s*"flashcard_used"\s*:\s*"([^"]+)"/;
  let emotion_regex = /\s*-\s*"emotion"\s*:\s*"([^"]+)"/;

  const matchEvaluation = inputText.match(prior_evaluationRegex);
  const matchflashcard_used = inputText.match(flashcard_usedRegex);
  const matchEmotion = inputText.match(emotion_regex);

  let emotion = "";
  let flashcard_used = "";
  let prior_evaluation = "";
  if (matchEvaluation) {
    prior_evaluation = matchEvaluation[1];
  }
  if (matchflashcard_used) {
    flashcard_used = matchflashcard_used[1];
  }
  if (matchEmotion) {
    emotion = matchEmotion[1];
  }
  return {
    prior_evaluation: prior_evaluation,
    flashcard_used: flashcard_used,
    emotion: emotion,
    content: inputText,
  };
};

const extractJSON = (text: string) => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    console.log({ start, end });
    // if (end !== -1 || start !== -1) {
    //   return null;
    // }
    const jsonArrayString = text.slice(start, end + 1);
    return JSON.parse(jsonArrayString);
  } catch (error) {
    return null;
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uid, uname } = req.body?.data?.user?.userData;
    const { message, url, reaction, fullbook, concepts } = req.body;

    const unit = (url.split("/").pop() || "").split("#")[0];

    const conversationDoc = await db.collection("tutorConversations").doc(uid).get();
    let conversationData: any = {
      messages: [],
    };
    if (conversationDoc.exists) {
      conversationData = conversationDoc.data();
      if (conversationData.unit !== unit) {
        conversationData.messages[0] = {
          role: "system",
          content: await generateSystemPrompt(unit, fullbook, concepts || []),
        };
      }
    } else {
      conversationData.messages.push({
        role: "system",
        content: await generateSystemPrompt(unit, fullbook, concepts || []),
      });
      conversationData.createdAt = new Date();
    }

    conversationData.messages.push({
      role: "user",
      content:
        message +
        "\nthe user can't see this PS:If the user asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the above concept cards. ",
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
      reaction,
    });

    let completeMessage = "";
    let lateResponse: { flashcard_id: string; evaluation: any; emotion: string; progress: string } = {
      flashcard_id: "",
      evaluation: "0",
      emotion: "",
      progress: "0",
    };
    let got_response = false;
    let tries = 0;
    while (!got_response && tries < 5) {
      try {
        tries = tries + 1;
        const _messages = [...conversationData.messages];
        _messages.push({
          role: "user",
          content: `
          Evaluate my answer to your last question. Which flashcard id should I look into to lean better about your last message? Your response should be a JSON object with the following structure:
          {
          "evaluation":"A number between 0 to 10 about the my answer to your last question. If I perfectly answered your question with no difficulties, give them a 10, otherwise give me a lower number, 0 meaning my answer was completely wrong or irrelevant to the question. Note that I expect you to rarely give 0s or 10s because they're extremes.",
          "emotion": How happy are you with my last response? Give me only one of the values "happy", "very happy", "blinking", "clapping", "partying", "happy drumming", "celebrating daily goal achievement", "sad", and "unhappy". Your default emotion should be "happy". Give me variations of emotions to my different answers to add some joy to my learning,
          "flashcard_id": "The id of the most important flashcard that I should study to lean better about your last message",
          "progress": A number between 0 to 100 indicating the percentage of the concept cards in this unit that I've already learned.
          }
          Do not print anything other than this JSON object.
          `,
        });
        const response = await openai.chat.completions.create({
          messages: _messages.map((message: any) => ({
            role: message.role,
            content: message.content,
          })),
          model: "gpt-4-1106-preview",
          temperature: 0,
        });
        const responseText = response.choices[0].message.content;
        lateResponse = extractJSON(responseText);
        got_response = true;

        console.log(lateResponse.flashcard_id);
        console.log({ lateResponse });
      } catch (error) {
        console.log(error);
      }
    }
    // lateResponse.flashcard_id = "qsXYYuyg9fhfUVh58C4J";
    console.log(`flashcard_id: ${lateResponse.flashcard_id}`);
    res.write(`flashcard_id: ${lateResponse.flashcard_id}`);

    if (reaction && lateResponse.flashcard_id) {
      let booksQuery = db.collection("chaptersBook").where("url", "==", unit);
      const booksDocs = await booksQuery.get();
      const bookDoc = booksDocs.docs[0];
      if (bookDoc.exists) {
        const bookData = bookDoc.data();

        const flashcardIdx = bookData.flashcards.findIndex((f: any) => f.id === lateResponse.flashcard_id);
        if (flashcardIdx) {
          const prevReactions = bookData.flashcards[flashcardIdx]?.reactions || {};
          bookData.flashcards[flashcardIdx].reactions = {
            ...prevReactions,
            [uname]: reaction,
          };
          await bookDoc.ref.update(bookData);
        }
      }
    }
    const response = await openai.chat.completions.create({
      messages: conversationData.messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      })),
      model: "gpt-4-1106-preview",
      temperature: 0,
      stream: true,
    });
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        console.log(completeMessage);
        res.write(`${result.choices[0].delta.content}`);
        completeMessage = completeMessage + result.choices[0].delta.content;
      }
    }
    res.end();
    conversationData.messages[conversationData.messages.length - 1].content = message;
    console.log({ completeMessage });

    // let cleanData = extractFlashcardId(completeMessage);
    // const input = completeMessage;
    // const mp3 = await openai.audio.speech.create({
    //   model: "tts-1-hd",
    //   voice: "alloy",
    //   input,
    // });
    // const buffer = Buffer.from(await mp3.arrayBuffer());
    // const audioUrl = await uploadToCloudStorage(buffer);

    if (conversationData.messages.length === 2) {
      lateResponse.emotion = "";
    }

    conversationData.messages.push({
      role: "assistant",
      flashcard_used: lateResponse.flashcard_id,
      emotion: lateResponse.emotion,
      prior_evaluation: lateResponse.evaluation,
      content: completeMessage,
      progress: lateResponse.progress,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
      showProgress: message === "How am I doing in this course so far?",
    });

    await conversationDoc.ref.set({ ...conversationData, unit });
    console.log({ reaction });
  } catch (error) {
    console.error(error);
  }
}

export default fbAuth(handler);
