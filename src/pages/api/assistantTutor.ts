const fs = require("fs");
import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssitantRequestAction } from "src/types/IAssitantConversation";
import { fetchCompelation, openai } from "./openAI/helpers";
import { delay } from "@/lib/utils/utils";
import { sendGPTPrompt } from "src/utils/assistant-helpers";

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
  const instructions =
    `Your name is ${tutorName}.
  The student's name is ${fName}.
  You are a professional tutor, teaching ${courseName}.
  ${objectives}` +
    // You should motivate and help the student learn all the concept cards in the following JSON array of objects ${title}:
    // ${JSON.stringify(flashcards)}
    `${directions}
  ${techniques}
  You should make your messages very short.
  Always separate your response to the student's last message from your next question using “\n~~~~~~~~\n”.`;
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

const getNextFlashcard = (concepts: any, usedFlashcards: string[], flashcardsScores: any) => {
  const nextFlashcard = concepts.filter((c: any) => !usedFlashcards.includes(c.id))[0];
  if (!nextFlashcard) {
    const [flashcard, minScore] = Object.entries(flashcardsScores).reduce((min: any, current: any) => {
      if (current[1] < min[1] && current[1] !== 10) {
        return current;
      } else {
        return min;
      }
    }, Object.entries(flashcardsScores)[0]);
    return minScore !== 10 ? concepts.find((c: any) => c.id === flashcard) : null;
  }
  return nextFlashcard;
};
const createSecondAgentFile = async (uname: string) => {
  let flashcardsJSON = [];
  const instructorFlashcards = await db.collection("flashcards").where("instructor", "==", uname).get();

  for (let flashcardDoc of instructorFlashcards.docs) {
    const flashcardData = flashcardDoc.data();
    if (!flashcardData.model) continue;
    flashcardsJSON.push({
      id: flashcardDoc.id,
      title: flashcardData.title,
      content: flashcardData.content,
    });
  }

  fs.writeFileSync("flashcards.json", JSON.stringify(flashcardsJSON, null, 2));

  const file = await openai.files.create({
    file: fs.createReadStream("flashcards.json"),
    purpose: "assistants",
  });
  await fs.unlinkSync("flashcards.json");
  const newAssistant = await openai.beta.assistants.create({
    instructions: `Always Respond by generating a JSON object with the following structure (this is important):
    {
    "reasoning": "Explain why you think the question can be responded using the selected concepts.",
    "concepts": [An array of ids of concepts from the JSON file that you used to answer this question.],
    "concept_titles": [An array of titles, each as a string, of concepts from the JSON file that you used to answer this question.],
    "response": "Your response to the question based on the concepts."
    }`,
    name: "Adrian",
    tools: [{ type: "retrieval" }],
    file_ids: [file.id],
    model: "gpt-4-0125-preview",
  });
  console.log("file here", newAssistant.id);
  return { assistantId: newAssistant.id, fileId: file.id };
};

const getPromptInstructions = async (course: string, uname: string, isInstructor: boolean) => {
  if (isInstructor) {
    let promptDocs = await db
      .collection("courseSettings")
      .where("url", "==", course)
      .where("instructor", "==", uname)
      .get();
    if (promptDocs.docs.length <= 0) {
      promptDocs = await db
        .collection("courseSettings")
        .where("url", "==", course)
        .where("instructor", "==", "1man")
        .get();
    }
    const promptDoc = promptDocs.docs[0];
    let { promptSettings, assistantSecondAgent } = promptDoc.data();
    if (!assistantSecondAgent) {
      const { assistantId, fileId } = await createSecondAgentFile(uname);
      await promptDocs.docs[0].ref.update({
        assistantSecondAgent: assistantId,
        fileSecondAgent: fileId,
      });
    }
    return { ...promptSettings, assistantSecondAgent };
  } else {
    let courseDocs = await db
      .collection("courseSettings")
      .where("url", "==", course)
      .where("students", "array-contains", uname)
      .get();
    if (courseDocs.docs.length > 0) {
      const courseDoc = courseDocs.docs[0];
      const courseSettingsData = courseDoc.data();
      const promptSettings = courseSettingsData.promptSettings;
      return { ...promptSettings, assistantSecondAgent: courseSettingsData.assistantSecondAgent };
    } else {
      throw new Error("You are not a student in this course!");
    }
  }
};
const replaceExtraPhrase = (messageContent: string) => {
  const phrases = [
    "Look over this page and when you’re ready for me, let me know.",
    "When you are ready to check your understanding, let me know.",
    "Want to see how well you’ve grasped this material? I can help.",
  ];

  return phrases.reduce((acc, phrase) => acc.replace(phrase, ""), messageContent);
};
const mergeDividedMessages = (messages: any) => {
  const mergedMessages = [];
  let currentDivideId = null;
  let mergedMessage = null;
  const filteredMessages = messages.filter((m: any) => !m.ignoreMessage && !m.deviatingMessage);
  for (const message of filteredMessages) {
    if ("divided" in message) {
      if (message.divided !== currentDivideId) {
        if (mergedMessage) {
          mergedMessages.push(mergedMessage);
        }
        currentDivideId = message.divided;
        mergedMessage = { ...message };
      } else {
        mergedMessage.content += "\n~~~~~~~~\n" + message.content;
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
  console.log(mergedMessages[mergedMessages.length - 3]);
  console.log(mergedMessages);
  return {
    mergedMessagesMinusFurtherExplain: mergedMessages,
    mergedMessage: mergedMessages.map((message: any) => ({
      role: message.role,
      content: !!message.furtherExplainPrompt
        ? message.furtherExplainPrompt
        : replaceExtraPhrase(message.content) + (message.extraInfoPrompt || ""),
    })),
    scroll_flashcard_next: mergedMessages[mergedMessages.length - 3]?.nextFlashcard || "",
  };
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
const addScoreToSavedCard = async (score: any, cardId: string, uname: string) => {
  const previousSavedCardDoc = await db
    .collection("savedBookCards")
    .where("savedBy", "==", uname)
    .where("cardId", "==", cardId)
    .get();

  if (previousSavedCardDoc.docs.length > 0) {
    previousSavedCardDoc.docs[0].ref.update({
      score,
    });
  } else {
    const flashcardDoc = await db.collection("flashcards").doc(cardId).get();
    const flashcardData = flashcardDoc.data();

    const newSavedFlashcard = {
      savedBy: uname,
      savedAt: new Date(),
      ...flashcardData,
      cardId,
    };
    const newRef = db.collection("savedBookCards").doc();
    await newRef.set(newSavedFlashcard);
  }
};
const generateListMessagesText = (messages: any) => {
  let messagesText = "";
  for (let message of messages) {
    if (message.role === "user") {
      messagesText += `\nStudent: "${message.content.replace(/~{2,}/g, "")}"`;
    } else {
      messagesText += `\nTutor: "${message.content.replace(/~{2,}/g, "")}"`;
    }
  }
  return messagesText;
};

const secondAgent = async (question: string, assistantSecondAgent: string) => {
  console.log({ assistantSecondAgent });
  const newThread = await openai.beta.threads.create();
  const secondAgentPrompt = `
  The attached file includes a JSON array of the concepts extracted from the Economy book. Answer the following question only based on these concept cards:
  '''
  ${question}
  '''
  If the question requires knowledge beyond the concepts, explain that you cannot answer it.
  Always Respond by generating a JSON object with the following structure (this is important):
  {
  "reasoning": "Explain why you think the question can be responded using the selected concepts.",
  "concepts": [An array of ids of concepts from the JSON file that you used to answer this question.],
  "concept_titles": [An array of titles, each as a string, of concepts from the JSON file that you used to answer this question.],
  "response": "Your response to the question based on the concepts."
  }`;
  await openai.beta.threads.messages.create(newThread.id, {
    role: "user",
    content: secondAgentPrompt,
  });
  let response = null;
  while (!response) {
    try {
      console.log("waiting on response second agent");
      const completionResponse = await fetchCompelation(newThread.id, assistantSecondAgent);
      console.log(completionResponse);
      response = extractJSON(completionResponse.response);
      if (!response.hasOwnProperty("response")) {
        response = null;
      }
    } catch (error) {
      console.log(error);
      response = null;
    }
  }
  return response;
};

const checkIfTheQuestionIsRelated = async (messages: any): Promise<boolean> => {
  const lasMessage = messages.pop();
  messages = messages.filter((m: any) => m.role !== "system");
  try {
    const deviatingPrompt = `
    The following is a conversation between a student and a tutor:
    '''
    ${generateListMessagesText(messages)}
    '''
    The student just responded:
    '''
    ${lasMessage.content}
    '''
    Is the student deviating from the topic of conversation with the tutor? Only generate a JSON response with this structure: {"reasoning": "Your reasoning for why the student is deviating from the topic of conversation with the tutor.", "response": "Yes" or "No".}`;
    console.log("deviatingPrompt", deviatingPrompt);
    let response = null;
    try {
      while (!response) {
        response = await sendGPTPrompt("gpt-4-0125-preview", [{ content: deviatingPrompt, role: "user" }]);
        if (typeof response === "string") {
          response = extractJSON(response);
        } else {
          response = null;
        }
      }
    } catch (error) {
      console.log("Error at checkIfTheQuestionIsRelated", error);
    }

    return !!response && response.response.toLowerCase() === "yes";
  } catch (error) {
    console.log("Error at checkIfTheQuestionIsRelated", error);
    return false;
  }
};
const getDeviatingConcepts = async (concepts: string[], uname: string) => {
  if (concepts.length <= 0) return [];
  const sliceConcepts = concepts.splice(0, 4);
  const flashcardsDocs = await db.collection("flashcards").where("__name__", "in", sliceConcepts).get();
  const _concepts = [];
  for (let flashcardsDoc of flashcardsDocs.docs) {
    const flashcardData = flashcardsDoc.data();
    _concepts.push({ ...flashcardData, cardId: flashcardsDoc.id });
    const previousSavedCardDoc = await db
      .collection("savedBookCards")
      .where("savedBy", "==", uname)
      .where("cardId", "==", flashcardsDoc.id)
      .get();

    if (previousSavedCardDoc.docs.length <= 0) {
      const newSavedFlashcard = {
        savedBy: uname,
        savedAt: new Date(),
        ...flashcardData,
        cardId: flashcardsDoc.id,
      };
      const newRef = db.collection("savedBookCards").doc();
      newRef.set(newSavedFlashcard);
    }
  }
  return _concepts;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uid, uname, fName, customClaims } = req.body?.data?.user?.userData;
    console.log("assistant Tutor", uname);
    let { url, cardsModel, furtherExplain, message } = req.body;
    await db.runTransaction(async t => {
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
      const { tutorName, courseName, objectives, directions, techniques, assistantSecondAgent } =
        await getPromptInstructions(course, uname, isInstructor);

      const concepts = await getConcepts(unit, uname, cardsModel, isInstructor, course);
      console.log(concepts.length);
      if (!concepts.length) {
        res.write("Sorry, something went wrong!");
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

      const conversationDocs = await t.get(
        db
          .collection("tutorConversations")
          .where("unit", "==", unit)
          .where("uid", "==", uid)
          .where("cardsModel", "==", selectedModel)
          .where("deleted", "==", false)
      );

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
      let questionMessage = null;
      if (!message) {
        message = `Hello My name is ${fName}.`;
        default_message = true;
        conversationData.usedFlashcards = [];
      } else if (!!conversationData.messages[conversationData.messages.length - 1].question) {
        furtherExplain = true;
        questionMessage = conversationData.messages.pop();
      }

      let scroll_flashcard_next = "";
      let nextFlashcard = null;
      if (!furtherExplain) {
        scroll_flashcard_next = conversationData?.nextFlashcard?.id || "";
        console.log("conversationData.usedFlashcards", conversationData.usedFlashcards);
        if (scroll_flashcard_next) {
          conversationData.usedFlashcards.push(scroll_flashcard_next);
        }
        nextFlashcard = getNextFlashcard(
          concepts,
          [...conversationData.usedFlashcards],
          conversationData.flashcardsScores || {}
        );
        if (nextFlashcard) {
          conversationData.previousFlashcard = conversationData.nextFlashcard;
          conversationData.nextFlashcard = nextFlashcard;
        } else {
          delete conversationData.nextFlashcard;
        }
      }

      console.log({ nextFlashcard });
      // add the extra PS to the message of the user
      // we ignore it afterward when saving the conversation in the db
      const extraInfoPrompt =
        `\n${fName} can't see this PS:If ${fName} asked any questions, you should answer their questions only based on the above concept cards. Do not answer any question that is irrelevant to the concept cards.` +
        `Always separate your response to the student's last message from your next question using “\n~~~~~~~~\n”.` +
        (!!nextFlashcard
          ? `Respond to ${fName} and then ask them a question about the following card:
    {
      title: "${nextFlashcard.title}",
      content: "${nextFlashcard.content}"
    }
    Note that ${fName} has not read the card yet. They will see the card only after answering your question.`
          : "");
      const furtherExplainPrompt =
        furtherExplain && conversationData.previousFlashcard
          ? `Further explain the content of the following card:{
        title: "${conversationData?.previousFlashcard?.title || ""}",
        content: "${conversationData?.previousFlashcard?.content || ""}"
      }`
          : "";

      conversationData.messages.push({
        role: "user",
        content: message,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
        default_message,
        nextFlashcard: nextFlashcard?.id || "",
        extraInfoPrompt,
        furtherExplainPrompt,
      });
      const { mergedMessage, mergedMessagesMinusFurtherExplain } = mergeDividedMessages([...conversationData.messages]);
      let deviatingResponse: boolean = false;
      if (!default_message) {
        deviatingResponse = await checkIfTheQuestionIsRelated(mergedMessagesMinusFurtherExplain);
      }
      if (deviatingResponse) {
        conversationData.messages[conversationData.messages.length - 1].deviatingMessage = true;

        // call other agent to respond
        let { concepts, response } = await secondAgent(message, assistantSecondAgent);
        concepts = await getDeviatingConcepts(concepts, uname);
        const responseMessage = {
          role: "assistant",
          content: response,
          sentAt: new Date(),
          mid: db.collection("tutorConversations").doc().id,
          concepts,
          deviatingMessage: true,
        };
        conversationData.messages.push(responseMessage);
        if (!questionMessage) {
          questionMessage = conversationData.messages.filter((m: any) => m.hasOwnProperty("question")).reverse()[0];
          questionMessage.question = true;
        }
        conversationData.messages.push({ ...questionMessage, sentAt: new Date() });
        t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });
        return;
      }

      let completeMessage = "";
      let lateResponse: {
        evaluation: any;
        emotion: string;
        progress: string;
        inform_instructor: string;
      } = {
        evaluation: "0",
        emotion: "",
        progress: "0",
        inform_instructor: "",
      };
      let got_response = false;
      let tries = 0;

      console.log({ deviatingResponse });
      const response = await openai.chat.completions.create({
        messages: mergedMessage,
        model: "gpt-4-0125-preview",
        temperature: 0,
        stream: true,
      });
      // stream the main reponse to the user
      let stopStreaming = false;
      let question = "";
      let answer = "";
      let scrolled = false;
      const regex = /~{2,}/g;
      for await (const result of response) {
        if (result.choices[0].delta.content) {
          console.log(stopStreaming, `${result.choices[0].delta.content}`);
          if (!stopStreaming) {
            const streamText = result.choices[0].delta.content.replace(/~{2,}/g, "");
            res.write(`${streamText}`);
            answer += `${streamText}`;
          } else {
            question += `${result.choices[0].delta.content}`;
          }
          console.log(result.choices[0].delta.content);
          const matches = result.choices[0].delta.content.match(regex);
          if (matches) {
            stopStreaming = true;
            if (!scrolled) {
              console.log({ scroll_flashcard_next });
              if (scroll_flashcard_next) {
                conversationData.usedFlashcards.push(scroll_flashcard_next);
                res.write(`flashcard_id: "${scroll_flashcard_next}"`);
              }
              if (furtherExplain) {
                const scroll_to = conversationData.usedFlashcards[conversationData.usedFlashcards.length - 1];
                res.write(`flashcard_id: "${scroll_to}"`);
              }
              scrolled = true;
            }
          }
          completeMessage = completeMessage + result.choices[0].delta.content;
        }
      }

      // if (default_message) {
      //   const extraPhrases = [
      //     "Look over this page and when you’re ready for me, let me know.",
      //     "When you are ready to check your understanding, let me know.",
      //     "Want to see how well you’ve grasped this material? I can help.",
      //   ];
      //   const randomIndex = Math.floor(Math.random() * extraPhrases.length);
      //   const phrase = extraPhrases[randomIndex];
      //   res.write(`${phrase}`);
      //   answer += phrase;
      // }

      //end stream
      res.end();

      if (!nextFlashcard && !conversationData.done && conversationData.progress >= 1) {
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

      completeMessage = completeMessage.replace(/~{2,}/g, "");

      // save the response from GPT in the db
      const divideId = db.collection("tutorConversations").doc().id;
      conversationData.messages.push({
        role: "assistant",
        content: !answer ? completeMessage : answer,
        divided: !!answer ? divideId : false,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
      });

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
      t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });
      if (!furtherExplain && !default_message) {
        while (!got_response && tries < 5) {
          try {
            tries = tries + 1;
            const _messages = mergedMessage;
            _messages.push({
              role: "user",
              content: `
            Evaluate my answer to your last question. Your response should be a JSON object with the following structure:
            {
              "evaluation":"A number between 0 to 10 about the my answer to your last question. If I perfectly answered your question with no difficulties, give me a 10, otherwise give me a lower number, 0 meaning my answer was completely wrong or irrelevant to the question. Note that I expect you to rarely give 0s or 10s because they're extremes.",
              "emotion": How happy are you with my last response? Give me only one of the values "sad", "annoyed", "very happy" , "clapping", "crying", "apologies". Your default emotion should be "happy". Give me variations of emotions to my different answers to add some joy to my learning,
              "inform_instructor": "Yes” if the instructor should be informed about my response to your last message. “No” if there is no reason to take the instructor's time about my last message to you.
            }
            Do not print anything other than this JSON object.`,
            });
            // “progress”: A number between 0 to 100 indicating the percentage of the concept cards in this unit that I've already learned, based on the correctness of all my answers to your questions so far. These numbers should not indicate the number of concept cards that I have studied. You should calculate it based on my responses to your questions, indicating the proportion of the concepts cards in this page that I've learned and correctly answered the corresponding questions. This number should be cumulative and it should monotonically and slowly increase.

            const response = await openai.chat.completions.create({
              messages: _messages,
              model: "gpt-4-0125-preview",
              temperature: 0,
            });
            const responseText = response.choices[0].message.content;
            lateResponse = extractJSON(responseText);
            got_response = true;

            console.log({ lateResponse });
          } catch (error) {
            console.log(error);
          }
        }
        /* we calculate the progress of the user in this unit
         */
        if (conversationData.progress < 1) {
          conversationData.progress = roundNum(
            conversationData.progress + parseInt(lateResponse.evaluation) / (concepts.length * 10)
          );
        }

        if (scroll_flashcard_next && !furtherExplain) {
          if (conversationData.hasOwnProperty("flashcardsScores")) {
            conversationData.flashcardsScores[scroll_flashcard_next] = parseFloat(lateResponse.evaluation);
          } else {
            conversationData.flashcardsScores = {
              [scroll_flashcard_next]: parseFloat(lateResponse.evaluation),
            };
          }
        }
        await addScoreToSavedCard(parseFloat(lateResponse.evaluation), scroll_flashcard_next, uname);

        if (conversationData.hasOwnProperty("scores")) {
          conversationData.scores.push({
            score: parseFloat(lateResponse.evaluation),
            date: new Date(),
            flashcard: scroll_flashcard_next,
          });
        } else {
          conversationData.scores = [
            {
              score: parseFloat(lateResponse.evaluation),
              date: new Date(),
            },
          ];
        }
      }

      if (conversationData.messages.length === 2) {
        lateResponse.emotion = "";
      }
      let messageIdx = conversationData.messages.length - 1;
      if (!!answer && !!question) {
        messageIdx = conversationData.messages.length - 2;
      }
      conversationData.messages[messageIdx] = {
        ...conversationData.messages[messageIdx],
        inform_instructor: lateResponse.inform_instructor,
        prior_evaluation: lateResponse.evaluation,
        emotion: lateResponse.emotion,
        progress: lateResponse.progress,
      };
      t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });
      console.log("Done");
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Sorry, something went wrong,  can you please try again!");
  }
}

export default fbAuth(handler);

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

// if (!default_message) {
//   try {
//     const _response = await openai.chat.completions.create({
//       messages: [
//         {
//           role: "user",
//           content: `Separate the question from the rest of the text in: "${completeMessage.replace(" ~~~~~~~~", "")}"
//         {
//           "rest_of_the_text":"",
//           "question":"",
//         }
//         Do not print anything other than this JSON object.`,
//         },
//       ],
//       model: "gpt-4-0125-preview",
//       temperature: 0,
//     });
//     console.log(_response.choices[0].message.content);
//     const _responseText = _response.choices[0].message.content;
//     const question_answer = extractJSON(_responseText);
//     answer = question_answer?.rest_of_the_text || "";
//     question = question_answer?.question || "";
//   } catch (error) {
//     console.log("error", error);
//   }
// }
