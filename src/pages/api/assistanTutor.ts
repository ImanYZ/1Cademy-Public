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
  You should make your messages very short.`;
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
const getNextFlashcard = (concepts: any, usedFlashcards: string[]) => {
  return concepts.filter((c: any) => !usedFlashcards.includes(c.id))[0];
};
const getPromptInstructions = async (url: string, uname: string) => {
  let promptDocs = await db.collection("assistantPrompt").where("url", "==", url).where("uname", "==", uname).get();
  if (promptDocs.docs.length <= 0) {
    promptDocs = await db.collection("assistantPrompt").where("url", "==", url).where("uname", "==", "1man").get();
  }
  const promptDoc = promptDocs.docs[0];
  return promptDoc.data();
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

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uid, uname, fName } = req.body?.data?.user?.userData;
    const { url, concepts, cardsModel } = req.body;
    let { message } = req.body;
    let default_message = false;
    let selectedModel = "";
    console.log({ cardsModel });
    if (!!cardsModel) {
      selectedModel = cardsModel;
    }
    const unit = (url.split("/").pop() || "").split("#")[0];
    let courseUrl = unit;
    if (url.includes("/the-economy/microeconomics")) {
      courseUrl = "the-economy/microeconomics";
    }
    if (url.includes("the-mission-corporation")) {
      courseUrl = "the-mission-corporation-4R-trimmed.html";
    }
    const { tutorName, courseName, objectives, directions, techniques } = await getPromptInstructions(courseUrl, uname);
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
    };
    //new reference to the "tutorConversations" collection
    let newConversationRef = db.collection("tutorConversations").doc();

    /*  if the conversation associated with this unit already exist we continue the conversation from there
     otherwise we initilise a new one  */
    const sysetmPrompt = await generateSystemPrompt(
      unit,
      concepts || [],
      fName,
      tutorName,
      courseName,
      objectives,
      directions,
      techniques
    );
    if (conversationDocs.docs.length > 0) {
      const conversationDoc = conversationDocs.docs[0];
      conversationData = conversationDoc.data();
      conversationData.messages[0].content = sysetmPrompt;
      newConversationRef = conversationDoc.ref;
    } else {
      conversationData.messages.push({
        role: "system",
        //we need the system prompt when the user starts chatting
        content: sysetmPrompt,
      });
    }
    if (!message) {
      message = `Hello My name is ${fName}, Teach me the concept cards on this page.`;
      default_message = true;
    }
    if (default_message) {
      conversationData.usedFlashcards = [];
    }
    const previousFlashcard = [...conversationData.usedFlashcards].reverse()[0];
    if (!concepts.length) {
      res.write("Sorry, Something went wrong,  can you please try again!");
      return;
    }
    const nextFlashcard = getNextFlashcard(concepts, [...conversationData.usedFlashcards]);

    if (nextFlashcard?.id) {
      conversationData.usedFlashcards.push(nextFlashcard.id);
    }

    conversationData.messages.push({
      role: "user",
      content: message,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
      default_message,
    });
    await newConversationRef.set({ ...conversationData });
    //scroll to flashcard
    if (conversationData.usedFlashcards.length >= 2) {
      const scroll_to_flashcard = conversationData.usedFlashcards[conversationData.usedFlashcards.length - 2];
      console.log({ scroll_to_flashcard });
      res.write(`flashcard_id: "${scroll_to_flashcard}"`);
    }
    console.log("previousFlashcard:", previousFlashcard);

    // add the extra PS to the message of the user
    // we ignore it afterward when savinfg the conversation in the db

    conversationData.messages[conversationData.messages.length - 1].content =
      message +
      `\n${fName} can't see this PS:If ${fName}  asked any questions, you should  answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the concept cards.` +
      (!nextFlashcard
        ? ``
        : `Respond to ${fName} and then focus on the following the concept card:
    {
    title: "${nextFlashcard.title}",
    content: "${nextFlashcard.content}"
    }`);

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
    if (!lateResponse.concept_card_id) {
      lateResponse.concept_card_id = nextFlashcard;
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
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        console.log(`${result.choices[0].delta.content}`);
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
    if (!default_message) {
      try {
        const _response = await openai.chat.completions.create({
          messages: [
            {
              role: "user",
              content: `Separate the question from the rest of the text in: "${completeMessage}"
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
    if (!!answer && !!question) {
      conversationData.messages.push({
        role: "assistant",
        content: question,
        divided: !!answer ? divideId : false,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
      });
    }

    await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
}

export default fbAuth(handler);
