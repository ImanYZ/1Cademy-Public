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

const PROMPT = (
  flashcards: any,
  title: string,
  fName: string,
  tutorName: string,
  courseName: string,
  objectives: string,
  directions: string,
  techniques: string
) => {
  const instructions = `Your name is ${tutorName}.
  The student’s name is ${fName}.
  You are a professional tutor, teaching ${courseName}.
  ${objectives}
  You should motivate and help the student learn all the concept cards in the following JSON array of objects ${title}:
  ${JSON.stringify(flashcards)}
  ${directions}
  ${techniques}
  You should make your messages very short.
  Always separate your response to the student’s last message from your next question using “\n—-------\n”.`;
  return instructions;
};

const generateSystemPrompt = async (
  url: string,
  concepts: any,
  fName: string,
  tutorName: string,
  courseName: string,
  objectives: string,
  directions: string,
  techniques: string
) => {
  let booksQuery = db.collection("chaptersBook").where("url", "==", url);
  const booksDocs = await booksQuery.get();
  const bookData = booksDocs.docs[0].data();
  let title = "";
  if (bookData.sectionTitle) {
    title = `from a unit titled ${bookData.sectionTitle}`;
  }
  const copy_flashcards = concepts
    .filter((f: any) => f.paragraphs.length > 0)
    .map(
      (f: any) =>
        (f = {
          title: f.title,
          content: f.content,
          id: f.id,
        })
    );
  return PROMPT(copy_flashcards, title, fName, tutorName, courseName, objectives, directions, techniques);
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

const roundNum = (num: number) => Number(Number.parseFloat(Number(num).toFixed(2)));
const getNextFlashcard = (concepts: any, usedFlashcards: string[], furtherExplain: boolean) => {
  if (furtherExplain) {
    const nextfId = usedFlashcards[usedFlashcards.length - 1];
    const conceptIndex = concepts.findIndex((c: any) => c.id === nextfId);
    return concepts[conceptIndex];
  }
  return concepts.filter((c: any) => !usedFlashcards.includes(c.id))[0];
};
const getPromptInstructions = async (course: string, uname: string, isInstructor: boolean) => {
  if (isInstructor) {
    let promptDocs = await db
      .collection("courseSettings")
      .where("url", "==", course)
      .where("instructor", "==", uname)
      .get();
    if (promptDocs.docs.length <= 0) {
      // TO:DO get the instructor settings here if the current user is a student
      promptDocs = await db
        .collection("courseSettings")
        .where("url", "==", course)
        .where("instructor", "==", "1man")
        .get();
    }
    const promptDoc = promptDocs.docs[0];
    const promptSettings = promptDoc.data().promptSettings;
    return promptSettings;
  } else {
    let promptDocs = await db
      .collection("courseSettings")
      .where("url", "==", course)
      .where("students", "array-contains", uname)
      .get();
    if (promptDocs.docs.length > 0) {
      const promptDoc = promptDocs.docs[0];
      const promptSettings = promptDoc.data().promptSettings;
      return promptSettings;
    } else {
      throw new Error("You are not a student in this course!");
    }
  }
};

const mergeDividedMessages = (messages: any) => {
  const mergedMessages = [];
  let currentDivideId = null;
  let mergedMessage = null;

  for (const message of messages) {
    if ("divided" in message) {
      if (message.divided !== currentDivideId) {
        if (mergedMessage) {
          mergedMessages.push(mergedMessage);
        }
        currentDivideId = message.divided;
        mergedMessage = { ...message };
      } else {
        mergedMessage.content += "\n" + message.content;
      }
    } else {
      if (mergedMessage) {
        mergedMessages.push(mergedMessage);
        mergedMessage = null;
      }
      mergedMessages.push({ ...message });
    }
  }

  if (mergedMessage) {
    mergedMessages.push(mergedMessage);
  }

  return mergedMessages.map((message: any) => ({
    role: message.role,
    content: message.content,
  }));
};
const sortConcepts = (concepts: any, cardsModel: string) => {
  return concepts
    .filter((f: any) => f.model === cardsModel)
    .sort((a: any, b: any) => {
      const numA = parseInt(a.paragraphs[0]?.split("-")[1] || 0);
      const numB = parseInt(b.paragraphs[0]?.split("-")[1] || 0);
      return numA - numB;
    });
};
const getConcepts = async (
  unit: string,
  uname: string,
  selectedModel: string,
  isInstructor: boolean,
  course: string
) => {
  const concepts: any = [];
  if (isInstructor) {
    const flashcardsDocs = await db
      .collection("flashcards")
      .where("url", "==", unit)
      .where("instructor", "==", uname)
      .get();

    flashcardsDocs.docs.forEach(doc => {
      const concept = doc.data();
      if (concept.paragraphs.length > 0) {
        concepts.push(concept);
      }
    });

    return sortConcepts(concepts, selectedModel);
  } else {
    let promptDocs = await db
      .collection("courseSettings")
      .where("url", "==", course)
      .where("students", "array-contains", uname)
      .get();
    if (promptDocs.docs.length > 0) {
      const promptDoc = promptDocs.docs[0];
      const instructorForStudent = promptDoc.data().instructor;
      const flashcardsDocs = await db
        .collection("flashcards")
        .where("url", "==", unit)
        .where("instructor", "==", instructorForStudent)
        .get();

      flashcardsDocs.docs.forEach(doc => {
        const concept = doc.data();
        if (concept.paragraphs.length > 0) {
          concepts.push(concept);
        }
      });
      return sortConcepts(concepts, selectedModel);
    } else {
      throw new Error("You are not a student in this course!");
    }
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    console.log("assistant Tutor");
    const { uid, uname, fName, customClaims } = req.body?.data?.user?.userData;
    const { url, cardsModel, furtherExplain } = req.body;
    let { message } = req.body;
    let default_message = false;
    let selectedModel = "";
    console.log({ cardsModel, customClaims });
    const isInstructor = customClaims.instructor;
    if (!!cardsModel) {
      selectedModel = cardsModel;
    }
    /*  */

    /*  */
    console.log({ url });
    const unit = (url.split("/").pop() || "").split("#")[0];
    let course = "";
    if (url.includes("/the-economy/microeconomics")) {
      course = "the-economy/microeconomics";
    }
    if (url.includes("the-mission-corporation")) {
      course = "the-mission-corporation-4R-trimmed.html";
    }
    if (!course) {
      res.write("Sorry, something went wrong, can you please try again!");
      return;
    }
    const { tutorName, courseName, objectives, directions, techniques } = await getPromptInstructions(
      course,
      uname,
      isInstructor
    );

    const concepts = await getConcepts(unit, uname, cardsModel, isInstructor, course);
    console.log(concepts.length);
    if (!concepts.length) {
      res.write("Sorry, something went wrong, can you please try again!");
      return;
    }
    const systemPrompt = await generateSystemPrompt(
      unit,
      concepts || [],
      fName,
      tutorName,
      courseName,
      objectives,
      directions,
      techniques
    );

    const conversationDocs = await db
      .collection("tutorConversations")
      .where("unit", "==", unit)
      .where("uid", "==", uid)
      .where("cardsModel", "==", selectedModel)
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
      cardsModel: selectedModel,
      deleted: false,
    };
    //new reference to the "tutorConversations" collection
    let newConversationRef = db.collection("tutorConversations").doc();

    /*  if the conversation associated with this unit already exist we continue the conversation from there
     otherwise we initialize a new one  */
    if (conversationDocs.docs.length > 0) {
      const conversationDoc = conversationDocs.docs[0];
      conversationData = conversationDoc.data();
      conversationData.messages[0].content = systemPrompt;
      newConversationRef = conversationDoc.ref;
    } else {
      conversationData.messages.push({
        role: "system",
        //we need the system prompt when the user starts chatting
        content: systemPrompt,
      });
    }
    if (!message) {
      message = `Hello My name is ${fName}, Teach me the concept cards on this page.`;
      default_message = true;
      conversationData.usedFlashcards = [];
    }

    let questionMessage = null;
    if (furtherExplain) {
      questionMessage = conversationData.messages.pop();
    }

    const nextFlashcard = getNextFlashcard(concepts, [...conversationData.usedFlashcards], furtherExplain);
    conversationData.messages.push({
      role: "user",
      content: message,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
      default_message,
      nextFlashcard: nextFlashcard.id,
    });

    // add the extra PS to the message of the user
    // we ignore it afterward when saving the conversation in the db

    conversationData.messages[conversationData.messages.length - 1].content =
      message +
      `\n${fName} can't see this PS:If ${fName}  asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the concept cards.` +
      (!!nextFlashcard
        ? `Respond to ${fName} and then focus on the following the concept card:
    {
    title: "${nextFlashcard.title}",
    content: "${nextFlashcard.content}"
    }`
        : "") +
      `Always separate your response to the student’s last message from your next question using “\n—-------\n”.`;
    console.log(
      `\n${fName} can't see this PS:If ${fName}  asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the concept cards.` +
        (!!nextFlashcard
          ? `Respond to ${fName} and then focus on the following the concept card:
{
title: "${nextFlashcard.title}",
content: "${nextFlashcard.content}"
}`
          : "") +
        `Always separate your response to the student’s last message from your next question using “\n—-------\n”.`
    );
    let completeMessage = "";
    let lateResponse: {
      concept_card_id: string;
      evaluation: any;
      emotion: string;
      progress: string;
      inform_instructor: string;
    } = {
      concept_card_id: "",
      evaluation: "0",
      emotion: "",
      progress: "0",
      inform_instructor: "",
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

    console.log(mergeDividedMessages([...conversationData.messages]));
    if (!furtherExplain && !default_message) {
      while (!got_response && tries < 5) {
        try {
          tries = tries + 1;
          const _messages = mergeDividedMessages([...conversationData.messages]);
          _messages.push({
            role: "user",
            content: `
          Evaluate my answer to your last question. Which concept card id should I look into to lean better about your last message? Your response should be a JSON object with the following structure:
          {
            "evaluation":"A number between 0 to 10 about the my answer to your last question. If I perfectly answered your question with no difficulties, give me a 10, otherwise give me a lower number, 0 meaning my answer was completely wrong or irrelevant to the question. Note that I expect you to rarely give 0s or 10s because they're extremes.",
            "emotion": How happy are you with my last response? Give me only one of the values "sad", "annoyed", "very happy" , "clapping", "crying", "apologies". Your default emotion should be "happy". Give me variations of emotions to my different answers to add some joy to my learning,
            "concept_card_id": "The id of the most important concept card that I should study to learn better about your last message",
            "inform_instructor": "Yes” if the instructor should be informed about my response to your last message. “No” if there is no reason to take the instructor’s time about my last message to you.
          }
          Do not print anything other than this JSON object.`,
          });
          // “progress”: A number between 0 to 100 indicating the percentage of the concept cards in this unit that I’ve already learned, based on the correctness of all my answers to your questions so far. These numbers should not indicate the number of concept cards that I have studied. You should calculate it based on my responses to your questions, indicating the proportion of the concepts cards in this page that I've learned and correctly answered the corresponding questions. This number should be cumulative and it should monotonically and slowly increase.

          const response = await openai.chat.completions.create({
            messages: _messages,
            model: "gpt-4-1106-preview",
            temperature: 0,
          });
          const responseText = response.choices[0].message.content;
          lateResponse = extractJSON(responseText);
          got_response = true;

          console.log(lateResponse.concept_card_id);
          console.log({ lateResponse });
        } catch (error) {
          console.log(error);
        }
      }
    }
    let scroll_to_flashcard = "";
    if (lateResponse.concept_card_id) {
      scroll_to_flashcard = lateResponse.concept_card_id;
    }

    /* we calculate the progress of the user in this unit
    100% means the user has 400 points
    */
    conversationData.progress = roundNum(
      conversationData.progress + parseInt(lateResponse.evaluation) / (concepts.length * 10)
    );
    if (conversationData.hasOwnProperty("scores")) {
      conversationData.scores.push({
        score: parseFloat(lateResponse.evaluation),
        date: new Date(),
      });
    } else {
      conversationData.scores = [
        {
          score: parseFloat(lateResponse.evaluation),
          date: new Date(),
        },
      ];
    }

    const response = await openai.chat.completions.create({
      messages: mergeDividedMessages([...conversationData.messages]),
      model: "gpt-4-1106-preview",
      temperature: 0,
      stream: true,
    });
    // stream the main reponse to the user
    let stopStreaming = false;
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        console.log(stopStreaming, `${result.choices[0].delta.content}`);
        if (!stopStreaming) {
          res.write(`${result.choices[0].delta.content}`);
        }
        if (result.choices[0].delta.content.includes("-------")) {
          stopStreaming = true;
        }
        completeMessage = completeMessage + result.choices[0].delta.content;
      }
    }
    if (scroll_to_flashcard) {
      conversationData.usedFlashcards.push(scroll_to_flashcard);
      res.write(`flashcard_id: "${scroll_to_flashcard}"`);
    }
    if (furtherExplain) {
      const scroll_to = conversationData.usedFlashcards[conversationData.usedFlashcards.length - 1];
      res.write(`flashcard_id: "${scroll_to}"`);
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
    let answer = "";
    let question = "";
    completeMessage = completeMessage.replace("-------", "");
    if (!default_message) {
      try {
        const _response = await openai.chat.completions.create({
          messages: [
            {
              role: "user",
              content: `Separate the question from the rest of the text in: "${completeMessage.replace("-------", "")}"
            {
              "rest_of_the_text":"",
              "question":"",
            }
            Do not print anything other than this JSON object.`,
            },
          ],
          model: "gpt-4-1106-preview",
          temperature: 0,
        });
        console.log(_response.choices[0].message.content);
        const _responseText = _response.choices[0].message.content;
        const question_answer = extractJSON(_responseText);
        answer = question_answer?.rest_of_the_text || "";
        question = question_answer?.question || "";
      } catch (error) {
        console.log("error", error);
      }
    }

    // save the reponse from GPT in the db
    const divideId = db.collection("tutorConversations").doc().id;
    conversationData.messages.push({
      role: "assistant",
      flashcard_used: lateResponse.concept_card_id,
      emotion: lateResponse.emotion,
      prior_evaluation: lateResponse.evaluation,
      content: !answer ? completeMessage : answer,
      divided: !!answer ? divideId : false,
      inform_instructor: lateResponse.inform_instructor,
      progress: lateResponse.progress,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
    });
    // if (furtherExplain) {
    //   delete questionMessage.divided;
    //   conversationData.messages.push(questionMessage);
    // }
    if (!!answer && !!question) {
      conversationData.messages.push({
        role: "assistant",
        content: question,
        divided: !!answer ? divideId : false,
        question: true,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
      });
    }

    await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
    console.log("Done");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Sorry, something went wrong,  can you please try again!");
  }
}

export default fbAuth(handler);
