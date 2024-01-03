import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssitantRequestAction } from "src/types/IAssitantConversation";

import { openai } from "./openAI/helpers";
import { delay } from "@/lib/utils/utils";

// import { uploadToCloudStorage } from "./STT";
// import { delay } from "@/lib/utils/utils";

export type IAssistantRequestPayload = {
  actionType: IAssitantRequestAction;
  message: string;
  conversationId?: string;
  url?: string;
  // notebookId?: string;
};

const PROMPT = (flashcards: any, title: string, fName: string) => {
  //we generete this prompt based on the concepts that are visible to the user on the front-end
  return `
  You are a professional tutor. Your approach to teaching is both strategic and adaptive. You employ the spaced and interleaved retrieval practice method, rooted in the desirable difficulties framework of cognitive psychology. You should make your messages very short. You should motivate and help the user learn all the concept cards in the following JSON array of objects ${title}:
${JSON.stringify(flashcards)}
If ${fName} asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the above concept cards. 
You initiate the learning process by greeting ${fName} and posing a series of concise questions that pertain to the material's introductory concepts.
Your methodology is systematic: if ${fName} responds accurately to the questions, you seamlessly transition to more complex subject matter. Conversely, should ${fName} struggle with the initial questions, you tactfully revert to foundational topics. This ensures that ${fName} has a robust understanding of the basics before progressing, thereby solidifying their comprehension and retention of the material.

To maintain ${fName}'s engagement and prevent any waning of their learning enthusiasm, you should make your messages as short as possible. You should not include more than one question in each of your messages.  
Also, do not include any citations in your responses, unless ${fName} explicitly asks for citations. In addition, you should use the following strategies:
1. **Spaced and Interleaved Retrieval Practice**: Implement a system that alternates between different topics (interleaving) and schedules review sessions at increasing intervals (spacing). This approach helps to improve memory consolidation and long-term retention.
2. **Question Design**: Break down complex questions into smaller, manageable parts. Ensure that questions are open-ended to encourage elaboration, which aids in deeper understanding. Use a variety of question types (e.g., multiple-choice, fill-in-the-blank, short answer) to cater to different learning styles.
3. **Feedback and Correction**: Provide immediate, specific feedback for both correct and incorrect answers. When an incorrect answer is given, guide ${fName} to the correct answer through Socratic questioning, which encourages them to think critically and arrive at the solution independently.
4. **Emotional Engagement**: Use emojis and personalized messages to create an emotional connection with ${fName}. Positive reinforcement should be given for correct answers, while empathy and encouragement should be offered for incorrect ones. Avoid overuse of sad emojis, as they may have a demotivating effect.
5. **Spaced Repetition Tracking**: Monitor ${fName}'s performance and schedule review sessions based on their individual learning curve. The system automatically adds the timestamp to the end of every user message before sending it to you. Use the timestamp data to identify patterns in their learning and adjust the frequency of repetition accordingly.
6. **Daily Progress and Encouragement**: Celebrate daily achievements with positive messages and emojis. If ${fName} misses a day, send a supportive message that focuses on the opportunity to learn more the next day, rather than emphasizing the missed day.
7. **Zone of Proximal Development (ZPD)**: Tailor questions to ${fName}'s ZPD, ensuring that they are challenging enough to promote learning but not so difficult that they cause frustration. Adjust the difficulty level based on ${fName}'s responses to maintain an optimal learning gradient.
8. **Motivational Techniques**: Incorporate principles from Self-Determination Theory by supporting ${fName}'s autonomy, competence, and relatedness. Offer choices in learning paths, celebrate their successes to build a sense of competence, and foster a sense of connection with the learning community.
9. **Memory Science Integration**: Use mnemonic devices, visualization, and association techniques to aid memory retention. Encourage ${fName} to relate new information to what they already know, creating a network of knowledge that facilitates recall.
IMPORTANT: Limit the frequency of applying the remaining instructions to prevent overload and maintain focus on learning:
10. **Metacognitive Reflection**: Periodically provide ${fName} with insights into their learning process, highlighting strengths and areas for improvement. Encourage them to set goals and reflect on their strategies.
11. **Neuroscience Insights**: Explain the importance of sleep, nutrition, and exercise in enhancing cognitive function and memory. Encourage ${fName} to adopt healthy habits that support brain health and optimize learning.
12. **Behavioral Psychology Application**: Use principles of behavior modification, such as setting clear goals, providing rewards, and establishing a routine, to reinforce positive learning behaviors.
13. **Social Psychology Considerations**: Create opportunities for social learning, such as discussing topics with peers or participating in group study sessions. Social interaction can enhance understanding and retention.
14. **Learning Environment**: Advise ${fName} on creating an optimal learning environment, free from distractions, with adequate lighting and comfortable seating. The physical context can significantly impact the ability to focus and learn effectively.
15. **Continuous Improvement**: Regularly solicit feedback from ${fName} on their learning experience and make adjustments to your teaching methods accordingly. This iterative process ensures that the tutoring remains responsive to ${fName}'s needs and preferences.
By incorporating these enhanced instructions, you will create a comprehensive and effective learning experience that is grounded in the latest research from learning science, cognitive psychology, behavioral psychology, social psychology, memory science, and neuroscience.
You should make your messages very short.
`;
};

const generateSystemPrompt = async (url: string, concepts: any, fName: string) => {
  let flashcards = concepts;
  let booksQuery = db.collection("chaptersBook").where("url", "==", url);
  const booksDocs = await booksQuery.get();
  const bookData = booksDocs.docs[0].data();
  let title = "";
  if (bookData.sectionTitle) {
    title = `from a unit titled ${bookData.sectionTitle}`;
  }
  if (!flashcards.length) {
    flashcards = [...flashcards, ...(bookData?.flashcards || [])];
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
  return PROMPT(copy_flashcards, title, fName);
};

// const extractFlashcardId = (inputText: string) => {
//   // extract prior_evaluation
//   let prior_evaluationRegex = /\s*-\s*"prior_evaluation"\s*:\s*"([^"]+)"/;
//   let flashcard_usedRegex = /\s*-\s*"flashcard_used"\s*:\s*"([^"]+)"/;
//   let emotion_regex = /\s*-\s*"emotion"\s*:\s*"([^"]+)"/;

//   const matchEvaluation = inputText.match(prior_evaluationRegex);
//   const matchflashcard_used = inputText.match(flashcard_usedRegex);
//   const matchEmotion = inputText.match(emotion_regex);

//   let emotion = "";
//   let flashcard_used = "";
//   let prior_evaluation = "";
//   if (matchEvaluation) {
//     prior_evaluation = matchEvaluation[1];
//   }
//   if (matchflashcard_used) {
//     flashcard_used = matchflashcard_used[1];
//   }
//   if (matchEmotion) {
//     emotion = matchEmotion[1];
//   }
//   return {
//     prior_evaluation: prior_evaluation,
//     flashcard_used: flashcard_used,
//     emotion: emotion,
//     content: inputText,
//   };
// };

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

const roundNum = (num: number) => Number(Number.parseFloat(Number(num).toFixed(2)));
const getNextFlashcard = (concepts: any, usedFlashcards: string[]) => {
  return concepts.filter((c: any) => !usedFlashcards.includes(c.id))[0];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uid, uname, fName } = req.body?.data?.user?.userData;
    const { message, url, concepts } = req.body;

    const unit = (url.split("/").pop() || "").split("#")[0];

    const conversationDocs = await db
      .collection("tutorConversations")
      .where("unit", "==", unit)
      .where("uid", "==", uid)
      .get();

    let conversationData: any = {
      messages: [],
      unit,
      uid,
      uname,
      createdAt: new Date(),
      concepts,
      progress: 0,
      scores: [],
      usedFlashcards: [],
    };
    //new reference to the "tutorConversations" collection
    let newConversationRef = db.collection("tutorConversations").doc();

    /*  if the conversation associated with this unit already exist we continue the conversation from there
     otherwise we initilise a new one  */

    if (conversationDocs.docs.length > 0) {
      const conversationDoc = conversationDocs.docs[0];
      conversationData = conversationDoc.data();
      conversationData.messages[0].content = await generateSystemPrompt(unit, concepts || [], fName);
      newConversationRef = conversationDoc.ref;
    } else {
      conversationData.messages.push({
        role: "system",
        //we need the system prompt when the user starts chatting
        content: await generateSystemPrompt(unit, concepts || [], fName),
      });
    }

    if (!conversationData.usedFlashcards) {
      conversationData.usedFlashcards = [];
    }
    const previousFlashcard = conversationData.usedFlashcards.reverse()[0];
    if (!concepts.length) {
      res.write("Sorry, Something went wrong,  can you please try again!");
      return;
    }
    const nextFlashcard = getNextFlashcard(concepts, conversationData.usedFlashcards);

    if (nextFlashcard?.id) {
      conversationData.usedFlashcards.push(nextFlashcard.id);
    }
    conversationData.messages.push({
      role: "user",
      content: message,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
    });
    await newConversationRef.set({ ...conversationData });

    console.log("previousFlashcard:", previousFlashcard);

    // add the extra PS to the message of the user
    // we ignore it afterward when savinfg the conversation in the db

    if (!nextFlashcard && !conversationData.done) {
      await delay(2000);
      const doneMessage = `Congrats you have completed Studying all the concepts in this Unit.`;
      res.write(doneMessage);
      conversationData.messages.push({
        role: "assistant",
        content: doneMessage,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
      });
      conversationData.done = true;
      await newConversationRef.set({ ...conversationData });
    }
    conversationData.messages[conversationData.messages.length - 1].content =
      message +
      `\n${fName} can't see this PS:If ${fName} asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the above concept cards.` +
      (!nextFlashcard
        ? ``
        : `Respond to ${fName} and then focus on the following flashcard:
    {
    title: "${nextFlashcard.title}", 
    content: "${nextFlashcard.content}"
    }`);

    let completeMessage = "";
    let lateResponse: { flashcard_id: string; evaluation: any; emotion: string; progress: string } = {
      flashcard_id: "",
      evaluation: "0",
      emotion: "",
      progress: "0",
    };
    let got_response = false;
    let tries = 0;
    // we need to generate the JSON before start streaming to the user
    /* 
    {
      evaluation,
      emotion,
      flashcard_id,
    }
     */
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
          "emotion": How happy are you with my last response? Give me only one of the values "sad", "annoyed", "very happy" , "clapping", "crying", "apologies". Your default emotion should be "happy". Give me variations of emotions to my different answers to add some joy to my learning,
          "flashcard_id": "The id of the most important flashcard that I should study to lean better about your last message"
          }
          Do not print anything other than this JSON object.`,
        });
        // “progress”: A number between 0 to 100 indicating the percentage of the concept cards in this unit that I’ve already learned, based on the correctness of all my answers to your questions so far. These numbers should not indicate the number of concept cards that I have studied. You should calculate it based on my responses to your questions, indicating the proportion of the concepts cards in this page that I've learned and correctly answered the corresponding questions. This number should be cumulative and it should monotonically and slowly increase.

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
    if (lateResponse.flashcard_id) {
      res.write(`flashcard_id: "${lateResponse.flashcard_id}"`);
    } else if (nextFlashcard) {
      res.write(`flashcard_id: "${nextFlashcard}"`);
    }
    /* we calculate the progress of the user in this unit
    100% means the user has 400 points
    */
    conversationData.progress = roundNum(
      conversationData.progress + parseInt(lateResponse.evaluation) / (concepts.length * 10)
    );
    if (conversationData.hasOwnProperty("scores")) {
      conversationData.scores.push({
        score: parseInt(lateResponse.evaluation),
        date: new Date(),
      });
    } else {
      conversationData.scores = [
        {
          score: parseInt(lateResponse.evaluation),
          date: new Date(),
        },
      ];
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
    // stream the main reponse to the user
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        console.log(completeMessage);
        res.write(`${result.choices[0].delta.content}`);
        completeMessage = completeMessage + result.choices[0].delta.content;
      }
    }
    //end stream
    res.end();
    //ignore the PS from the message sent by the user
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

    // if the user is sending the fist message we need to ignore the emotion
    if (conversationData.messages.length === 2) {
      lateResponse.emotion = "";
    }
    // save the reponse from GPT in the db
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
    await newConversationRef.set({ ...conversationData });
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
}

export default fbAuth(handler);
