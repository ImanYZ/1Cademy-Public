import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssitantRequestAction } from "src/types/IAssitantConversation";
import { openai } from "./openAI/helpers";
import { delay } from "@/lib/utils/utils";
import { sendGPTPrompt } from "src/utils/assistant-helpers";
import { Timestamp } from "firebase-admin/firestore";
import { roundNum } from "src/utils/common.utils";
import { clearGlobalAppDefaultCred } from "firebase-admin/lib/app/credential-factory";
type Message = {
  role: string;
  content: string;
  divided: string;
  question: true;
  sentAt: Timestamp;
  mid: string;
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { uid, uname, fName, customClaims } = req.body?.data?.user?.userData;
  let { url, cardsModel, furtherExplain, message } = req.body;
  let conversationId = "";
  let deviating: boolean = false;
  let relevanceResponse: boolean = true;
  try {
    console.log("assistant Tutor", uname);

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
    console.log({ unit });
    let course = "the-economy/microeconomics";
    if (url.includes("the-mission-corporation")) {
      course = "the-mission-corporation-4R-trimmed.html";
    }
    if (!course) {
      throw new Error("Course Doesn't exist");
    }
    const { tutorName, courseName, objectives, directions, techniques, assistantSecondAgent, passingThreshold } =
      await getPromptInstructions(course, uname, isInstructor);

    const concepts = await getConcepts(unit, uname, cardsModel, isInstructor, course);
    console.log(concepts.length);
    if (!concepts.length) {
      throw new Error("Flashcards don't exist in this page.");
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
      .where("deleted", "==", false)
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
    conversationId = newConversationRef.id;
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
    const extraInfoPrompt = getExtraInfo(fName, nextFlashcard);
    let furtherExplainPrompt = "";
    if (furtherExplain && conversationData.previousFlashcard) {
      furtherExplainPrompt = `Further explain the content of the following concept:{
    title: "${conversationData?.previousFlashcard?.title || ""}",
    content: "${conversationData?.previousFlashcard?.content || ""}"
  }`;

      /*  */
    }
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
    const { mergedMessages, mergedMessagesMinusFurtherExplain } = mergeDividedMessages([...conversationData.messages]);
    console.log(mergedMessages);
    console.log("deviating");

    if (!default_message) {
      // const exposedParagraphsIds = getExposedParagraphs(concepts, [
      //   ...conversationData.usedFlashcards,
      //   nextFlashcard?.id || "",
      // ]);
      deviating = await checkIfUserIsDeviating(mergedMessagesMinusFurtherExplain, false);
    }
    console.log({ deviating });
    if (deviating) {
      await handleDeviating(
        res,
        conversationData,
        relevanceResponse,
        message,
        courseName,
        questionMessage,
        newConversationRef,
        true,
        uname,
        cardsModel
      );
      return;
    }

    if (!nextFlashcard && !conversationData.done && conversationData.progress >= (passingThreshold || 91) / 100) {
      await delay(2000);
      const doneMessage = `Congrats! You have completed studying all the concepts in this unit.`;
      res.write(doneMessage);
      const sentAt = new Date(new Date());
      sentAt.setSeconds(sentAt.getSeconds() + 20);
      conversationData.messages.push({
        role: "assistant",
        content: doneMessage,
        sentAt,
        mid: db.collection("tutorConversations").doc().id,
      });
      conversationData.done = true;
    }
    const { completeMessage, answer, question } = await streamMainResponse({
      res,
      deviating,
      mergedMessages,
      scroll_flashcard_next,
      conversationData,
      furtherExplain,
    });

    // save the response from GPT in the db
    const divideId = db.collection("tutorConversations").doc().id;
    conversationData.messages.push({
      role: "assistant",
      content: !answer ? completeMessage : answer,
      divided: !!answer ? divideId : false,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
    });

    if (!!question) {
      conversationData.messages.push({
        role: "assistant",
        content: question,
        divided: !!answer ? divideId : false,
        question: true,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
      });
    } else if (questionMessage) {
      conversationData.messages.push({ ...questionMessage, sentAt: new Date() });
    } else if (!!nextFlashcard) {
      const question = await getTheNextQuestion(nextFlashcard);
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

    mergedMessagesMinusFurtherExplain.push({
      role: "assistant",
      content: !answer ? completeMessage : answer,
      divided: !!answer ? divideId : false,
      sentAt: new Date(),
      mid: db.collection("tutorConversations").doc().id,
    });
    deviating = await checkIfUserIsDeviating(mergedMessagesMinusFurtherExplain, true);
    console.log({ deviatingAfterResponse: deviating });
    if (deviating) {
      // handle the case where the user deviates from the conversation
      await handleDeviating(
        res,
        conversationData,
        relevanceResponse,
        message,
        courseName,
        questionMessage,
        newConversationRef,
        true,
        uname,
        cardsModel
      );
      return;
    }

    const lateResponse = await getEvaluation({
      mergedMessages,
      furtherExplain,
      scroll_flashcard_next,
      conversationData,
      uname,
      concepts,
      default_message,
    });

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
    };
    conversationData.usedFlashcards = Array.from(new Set(conversationData.usedFlashcards));
    await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
    console.log("Done", conversationId);

    const newLogRef = db.collection("logs").doc();
    await newLogRef.set({
      uname: uname || "",
      severity: "default",
      where: "assistant tutor endpoint",
      conversationId,
      deviating,
      relevanceResponse,
      createdAt: new Date(),
      message,
      project: "1Tutor",
    });
  } catch (error: any) {
    console.log(error);
    try {
      const newLogRef = db.collection("logs").doc();
      await newLogRef.set({
        uname: uname || "",
        severity: "error",
        where: "assistant tutor endpoint",
        error: {
          message: error.message,
          stack: error.stack,
        },
        conversationId,
        project: "1Tutor",
        createdAt: new Date(),
      });
    } catch (error) {
      console.log("error saving the log", error);
    }
    return res
      .status(500)
      .send("Sorry, something went wrong! Please try again! If the issue persists, contact iman@honor.education");
  }
}

export default fbAuth(handler);

const getEvaluation = async ({
  mergedMessages,
  furtherExplain,
  scroll_flashcard_next,
  conversationData,
  uname,
  concepts,
  default_message,
}: {
  mergedMessages: any;
  furtherExplain: boolean;
  scroll_flashcard_next: string;
  conversationData: any;
  uname: string;
  concepts: any;
  default_message: boolean;
}) => {
  console.log("getEvaluation");
  let lateResponse: {
    evaluation: any;
    emotion: string;
    progress: string;
    inform_instructor: string;
    learning_summary: string;
  } = {
    evaluation: "0",
    emotion: "",
    progress: "0",
    inform_instructor: "",
    learning_summary: "",
  };
  let got_response = false;
  let tries = 0;

  if (!furtherExplain && !default_message) {
    while (!got_response && tries < 5) {
      try {
        tries = tries + 1;
        const _messages = mergedMessages;
        _messages.push({
          role: "user",
          content: `
          Evaluate my answer to your last question. Your response should be a JSON object with the following structure:
          {
            "evaluation":"A number between 0 to 10 indicating the quality of my answer to your last question. If I perfectly answered your question with no difficulties, give me a 10, otherwise give me a lower number, 0 meaning my answer was completely wrong or irrelevant to the question.",
            "emotion": How happy are you with my last response? Give me only one of the values "sad", "annoyed", "very happy", "clapping", "crying", "apologies". Your default emotion should be "happy". Give me variations of emotions to my different answers,
            "inform_instructor": "Yes" if the instructor should be informed about my response to your last message. "No" if there is no reason to take the instructor's time about my last message to you.
          }
          Do not print anything other than this JSON object.`,
        });
        // "progress": A number between 0 to 100 indicating the percentage of the concept cards in this unit that I've already learned, based on the correctness of all my answers to your questions so far. These numbers should not indicate the number of concept cards that I have studied. You should calculate it based on my responses to your questions, indicating the proportion of the concepts cards in this page that I've learned and correctly answered the corresponding questions. This number should be cumulative and it should monotonically and slowly increase.

        const response = await openai.chat.completions.create({
          messages: _messages,
          model: "gpt-4-0125-preview",
          temperature: 0,
        });
        const responseText = response.choices[0].message.content;
        lateResponse = extractJSON(responseText);
        got_response = true;
      } catch (error) {
        console.log(error);
      }
    }
    console.log(lateResponse);
    /* we calculate the progress of the user in this unit
     */

    const evaluation = isNaN(lateResponse.evaluation) ? 0 : parseFloat(lateResponse.evaluation);

    if (scroll_flashcard_next && !furtherExplain) {
      if (conversationData.hasOwnProperty("flashcardsScores")) {
        conversationData.flashcardsScores[scroll_flashcard_next] = evaluation;
      } else {
        conversationData.flashcardsScores = {
          [scroll_flashcard_next]: evaluation,
        };
      }
    }
    console.log(
      "calculateProgress(conversationData.flashcardsScores):",
      calculateProgress(conversationData.flashcardsScores)
    );
    if (conversationData.progress < 1) {
      conversationData.progress = roundNum(
        calculateProgress(conversationData.flashcardsScores) / (concepts.length * 10)
      );
    }
    await addScoreToSavedCard(evaluation, scroll_flashcard_next, uname);

    if (conversationData.hasOwnProperty("scores")) {
      conversationData.scores.push({
        score: evaluation,
        date: new Date(),
        flashcard: scroll_flashcard_next,
      });
    } else {
      conversationData.scores = [
        {
          score: evaluation,
          date: new Date(),
        },
      ];
    }
    console.log({ lateResponse });
  }
  return lateResponse;
};
/*  */
const streamMainResponse = async ({
  res,
  deviating,
  mergedMessages,
  scroll_flashcard_next,
  conversationData,
  furtherExplain,
}: {
  res: NextApiResponse<any>;
  deviating: boolean;
  mergedMessages: any;
  scroll_flashcard_next: string;
  conversationData: any;
  furtherExplain: boolean;
}) => {
  let completeMessage = "";

  console.log({ deviatingResponse: deviating });
  const response = await openai.chat.completions.create({
    messages: mergedMessages,
    model: "gpt-4-0125-preview",
    temperature: 0,
    stream: true,
  });
  // stream the main response to the user
  let stopStreaming = false;
  let question = "";
  let answer = "";
  let scrolled = false;
  const regex = /~{2,}/g;
  for await (const result of response) {
    if (result.choices[0].delta.content) {
      if (!stopStreaming) {
        const streamText = result.choices[0].delta.content.replace(/~{2,}/g, "");
        res.write(`${streamText}`);
        answer += `${streamText}`;
      } else {
        question += `${result.choices[0].delta.content}`;
      }
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
  completeMessage = completeMessage.replace(/~{2,}/g, "");
  return {
    completeMessage,
    answer,
    question,
  };
};

const getExtraInfo = (fName: string, nextFlashcard: any) => {
  let prompt =
    `\n${fName} can't see this PS:If ${fName} asked any questions, you should answer their` +
    `questions only based on the concepts discussed in this conversation. Do not answer any question that is irrelevant.` +
    `Always separate your response to ${fName}'s last message from your next question using "\n~~~~~~~~\n".`;
  // if there a next Flashcard add this
  if (nextFlashcard) {
    prompt +=
      `Respond to ${fName} and then ask them a question about the following concept:
    {
      title: "${nextFlashcard.title}",
      content: "${nextFlashcard.content}"
    }
    Note that you can repeat asking the same question about a concept that the student previously had difficulties with.` +
      ` Also ${fName} has not read the concept yet. They will read the concept only after answering your question.`;
  }
  return prompt;
};
const handleDeviating = async (
  res: NextApiResponse<any>,
  conversationData: any,
  relevanceResponse: boolean,
  message: string,
  courseName: string,
  questionMessage: any,
  newConversationRef: any,
  secondPrompt: boolean,
  uname: string,
  cardsModel: string
) => {
  // relevanceResponse = await checkIfTheMessageIsRelevant(mergedMessagesMinusFurtherExplain, courseName);

  let featuredConcepts: any = [];
  let answer = "";
  if (secondPrompt) {
    conversationData.messages[conversationData.messages.length - 3].deviatingMessage = true;
    conversationData.messages[conversationData.messages.length - 2].deviatingMessage = true;
  } else {
    conversationData.messages[conversationData.messages.length - 1].deviatingMessage = true;
  }

  if (relevanceResponse) {
    //we have keepLoading at the end of the stream message to keep the front-end loading until we receive the full response.
    res.write(
      `You're deviating from the topic of the current session. For a thoughtful response, I need to take some time to find relevant parts of the course.keepLoading`
    );
    // call other agent to respond
    const { paragraphs, allParagraphs, sections }: any = await getChapterRelatedToResponse(message, courseName);
    let sectionsString = "";
    sections.map((s: string) => {
      sectionsString += `- ${s}\n`;
    });
    if (paragraphs.length > 0) {
      res.write(`I'm going to respond to you based on the following sections:\n\n ${sectionsString} keepLoading`);

      const prompt = `Concisely respond to the student (user)'s last message based on the following JSON array of paragraphs.  
  ${JSON.stringify(paragraphs)}
  Always respond a JSON object with the following structure:
  {
  "message": "Your concise message to the student's last message based on the sentences.",
  "sentences": [An array of the sentences that you used to respond to the student's last message.],
  "paragraphs": [An array of the paragraphs ids that you used to respond to the student's last message]
  }
  Your response should be only a complete and syntactically correct JSON object.`;
      console.log(prompt);
      const response2 = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "gpt-4-0125-preview",
        temperature: 0,
        stream: true,
      });
      let fullMessage = "";

      for await (const result of response2) {
        if (!result.choices[0].delta.content) continue;
        if (!fullMessage.includes(`"sentences":`) && fullMessage.includes(`"message":`)) {
          let cleanText = result.choices[0].delta.content;
          res.write(cleanText);
          answer += cleanText;
          console.log(result.choices[0].delta.content);
        }
        fullMessage += result.choices[0].delta.content;
      }
      // Extract the object from the fullMessage
      /* {
    "response": "Your response to the question based on the sentences.",
    "sentences": [An array of the sentences that you used to answer the question.],
    "paragraphs": [An array of paragraphs that you used to answer the question]
  } */
      //

      const responseJson = JSON.parse(fullMessage);
      const sentences = responseJson.sentences;
      const paragraph: { text: string; ids: string[] } = searchParagraphs(allParagraphs, sentences);
      console.log(paragraph);
      if (paragraph.text) {
        featuredConcepts = await extractFlashcards(paragraph, sections, uname, cardsModel);
      }
    } else {
      const _answer =
        "It sounds like your message is not relevant to this course. I can only help you within the scope of this course.";
      res.write(_answer);
      answer = _answer;
    }
  } else {
    const _answer =
      "It sounds like your message is not relevant to this course. I can only help you within the scope of this course.";
    res.write(_answer);
    answer = _answer;
  }
  answer = answer.replace(`{ "message":`, "");
  answer = answer.replace(`"sentences":`, "");
  answer = answer.replace(`",`, "");
  answer = answer.replace(`"`, "");
  const responseMessage = {
    role: "assistant",
    content: answer,
    sentAt: new Date(),
    mid: db.collection("tutorConversations").doc().id,
    concepts: featuredConcepts,
    deviatingMessage: true,
  };
  conversationData.messages.push(responseMessage);
  if (!questionMessage) {
    questionMessage = conversationData.messages.filter((m: any) => m.hasOwnProperty("question")).reverse()[0];
  }
  if (!!questionMessage) {
    conversationData.messages.push({ ...questionMessage, question: true, sentAt: new Date() });
  }
  await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
};

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
  Always separate your response to the student's last message from your next question using "\n~~~~~~~~\n".`;
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
    // if (end !== -1 || start !== -1) {
    //   return null;
    // }
    const jsonArrayString = text.slice(start, end + 1);
    return JSON.parse(jsonArrayString);
  } catch (error) {
    return null;
  }
};

const getNextFlashcard = (concepts: any, usedFlashcards: string[], flashcardsScores: any) => {
  const nextFlashcard = concepts.filter((c: any) => !usedFlashcards.includes(c.id))[0];
  if (!nextFlashcard && Object.entries(flashcardsScores).length > 0) {
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
      assistantSecondAgent = "";
      // const { assistantId, fileId } = await createSecondAgentFile(uname);
      // await promptDocs.docs[0].ref.update({
      //   assistantSecondAgent: assistantId,
      //   fileSecondAgent: fileId,
      // });
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
  console.log("mergeDividedMessages");
  const mergedMessages = [];
  let currentDivideId = null;
  let mergedMessage = null;
  const filteredMessages = messages.filter((m: any) => !m.ignoreMessage && !m.deviatingMessage);
  for (const message of filteredMessages) {
    if (!message?.content) continue;
    if ("divided" in message) {
      if (message.divided !== currentDivideId) {
        if (mergedMessage) {
          mergedMessages.push(mergedMessage);
        }
        currentDivideId = message.divided;
        mergedMessage = { ...message };
      } else {
        if (!mergedMessage.content.includes(message?.content)) {
          mergedMessage.content += "\n~~~~~~~~\n" + (message?.content || "").trim();
        }
      }
    } else {
      if (mergedMessage) {
        mergedMessages.push(mergedMessage);
        mergedMessage = null;
        currentDivideId = null;
      }
      mergedMessages.push({ ...message });
    }
  }

  if (mergedMessage) {
    mergedMessages.push(mergedMessage);
  }

  return {
    mergedMessagesMinusFurtherExplain: mergedMessages,
    mergedMessages: mergedMessages.map((message: any) => ({
      role: message.role,
      content: !!message.furtherExplainPrompt
        ? message.furtherExplainPrompt
        : replaceExtraPhrase(message?.content || "") + (message.extraInfoPrompt || ""),
    })),
    scroll_flashcard_next: mergedMessages[mergedMessages.length - 3]?.nextFlashcard || "",
  };
};
//
//
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
const addScoreToSavedCard = async (score: any, cardId: string, uname: string, addScore = true) => {
  if (!cardId) return;
  const previousSavedCardDoc = await db
    .collection("savedBookCards")
    .where("savedBy", "==", uname)
    .where("cardId", "==", cardId)
    .get();

  if (previousSavedCardDoc.docs.length > 0) {
    if (addScore) {
      previousSavedCardDoc.docs[0].ref.update({
        score,
      });
    }
  } else {
    const flashcardDoc = await db.collection("flashcards").doc(cardId).get();
    const flashcardData = flashcardDoc.data();

    const newSavedFlashcard = {
      savedBy: uname,
      savedAt: new Date(),
      ...flashcardData,
      cardId,
      score,
    };
    const newRef = db.collection("savedBookCards").doc();
    await newRef.set(newSavedFlashcard);
  }
};
const generateListMessagesText = (messages: any) => {
  let messagesText = "";
  for (let message of messages) {
    if (message.content) {
      if (message.role === "user") {
        messagesText += `\n\nStudent: "${message.content.replace(/~{2,}/g, "").trim()}"`;
      } else {
        messagesText += `\n\nTutor: "${message.content.replace(/~{2,}/g, "").trim()}"`;
      }
    }
  }
  return messagesText;
};

const streamPrompt = async (messages: any) => {
  try {
    const response = await openai.chat.completions.create({
      messages,
      model: "gpt-4-0125-preview",
      temperature: 0,
      stream: true,
    });
    let completeMessage = "";
    let deviating = false;
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        completeMessage += result.choices[0].delta.content;
        const regex = /"deviating_topic": "(\w+)",/;

        const match = regex.exec(completeMessage);
        console.log(completeMessage);
        if (match) {
          const deviatingTopic = match[1];
          console.log(deviatingTopic);
          deviating = deviatingTopic.toLowerCase().includes("yes");
          break;
        } else {
          console.log("No match found.");
        }
      }
    }
    return deviating;
  } catch (error) {
    console.log(error);
  }
};

const checkIfUserIsDeviating = async (messages: any, secondPrompt: boolean): Promise<boolean> => {
  // const chaptersDoc = await db.collection("chaptersBook").where("url", "==", unit).get();
  // const chapterDoc = chaptersDoc.docs[0];
  // const chapterData = chapterDoc.data();

  // const paragraphs = getInteractedParagraphs(chapterData.paragraphs, paragraphsIds);
  console.log("checkIfTheQuestionIsRelated");
  let _messages = [...messages];
  const lastMessage = _messages.pop();
  _messages = _messages.filter((m: any) => m.role !== "system");

  let deviatingPrompt = `
  The following is a conversation between a student and a tutor:
  '''
  ${generateListMessagesText(_messages)}
  '''
  The student just responded:
  '''
  ${lastMessage.content}
  '''
  Only generate a JSON response with this structure: {"deviating_topic": Is the student's last message (not the tutor's) about a topic different from the tutor's last message? Only answer "Yes" or "No"}`;
  console.log({ secondPrompt });
  if (secondPrompt) {
    deviatingPrompt = `
  The following is a conversation between a student and a tutor:
  '''
  ${generateListMessagesText(_messages)}
  '''
  The tutor just responded:
  '''
  ${lastMessage.content}
  '''
Only generate a JSON response with this structure: {"deviating_topic": Is the tutor's last message indicating that the student (not the tutor) was deviating from the topic of conversation with the tutor? Only answer "Yes" or "No",  "deviating_evidence": "Your reasoning for why you think the student's last message is about a topic different from the topic of conversation with the tutor}`;
  }
  console.log("deviatingPrompt", deviatingPrompt);
  const deviating = await streamPrompt([{ content: deviatingPrompt, role: "user" }]);
  return !!deviating;
};
const calculateProgress = (flashcardsScores: { [key: string]: number }) => {
  const scores = Object.values(flashcardsScores);
  const sum = scores.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return sum;
};
const getTheNextQuestion = async (nextFlashcard: { title: string; content: string }) => {
  const prompt = `Ask me a question about the following card:
    {
      title: "${nextFlashcard.title}",
      content: "${nextFlashcard.content}"
    }`;
  const context = [
    {
      content: prompt,
      role: "user",
    },
  ];
  const gptResponse = await sendGPTPrompt("gpt-4-0125-preview", context);
  return gptResponse;
};

const getChapterRelatedToResponse = async (message: string, courseName: string) => {
  try {
    let chaptersBookQuery = db.collection("chaptersBook").where("chapter", "in", ["01", "02", "03", "04"]);

    if (courseName == "Mission Corporation") {
      chaptersBookQuery = db.collection("chaptersBook").where("book", "==", "Mission Corporation");
    }

    const chaptersBookDocs = await chaptersBookQuery.get();
    //Create a chapterMap that will have all the chapters and subchapters in an array of objects
    //
    const chaptersMap: { chapter: string; subSections: { title: string; key_words: string[] }[] }[] = [];
    for (let chapterDoc of chaptersBookDocs.docs) {
      const chapterData = chapterDoc.data();
      const chapterIdx = chaptersMap.findIndex(c => c.chapter === chapterData.chapterTitle);
      if (chapterIdx !== -1) {
        chaptersMap[chapterIdx].subSections.push({
          title: chapterData.sectionTitle,
          key_words: chapterData.keyWords,
        });
      } else {
        chaptersMap.push({
          chapter: chapterData.chapterTitle,
          subSections: [
            {
              title: chapterData.sectionTitle,
              key_words: chapterData.keyWords,
            },
          ],
        });
      }
    }
    //
    console.log(chaptersMap);
    const systemPrompt =
      `You are an expert on ${courseName}.
        The following is the table of contents, including the titles of chapters and sub-chapters within the book ${courseName}:
        ${JSON.stringify(chaptersMap)}
        The user asks you a question and you should respond an array of strings ["____", "____", ...] ` +
      `of the titles of the sub-sections of the book the user should study to learn the answer to their question. ` +
      `The array should only include the sub-section titles that are very related to the student's question. ` +
      `If none of the sub-sections are very related to the student's question, return an empty array []`;

    console.log(systemPrompt);
    const response = await sendGPTPrompt("gpt-4-turbo-preview", [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ]);
    console.log({ response });
    let sections = [];
    if (response) {
      try {
        sections = JSON.parse(response);
      } catch (error) {
        console.log(error);
      }
    }
    const paragraphs = [];
    let allParagraphs: any = [];
    for (let section of sections) {
      const chaptersBookDocs = await db.collection("chaptersBook").where("sectionTitle", "==", section).get();

      const chapterDoc = chaptersBookDocs.docs[0];
      const chapterData = chapterDoc.data();
      const _paragraphs: any = [];
      chapterData.paragraphs.map((p: any) => _paragraphs.push({ text: p.text, id: p.ids[0] }));
      allParagraphs = [...allParagraphs, ...chapterData.paragraphs];
      paragraphs.push({
        section,
        paragraphs: _paragraphs,
      });
    }
    console.log("paragraphs.length", paragraphs.length);
    return { paragraphs, allParagraphs, sections };
  } catch (error) {
    console.log(error);
  }
};
const extractFlashcards = async (
  paragraph: { text: string; ids: string[] },
  sections: string[],
  uname: string,
  cardsModel: string
) => {
  try {
    let pIds: string[] = [...paragraph.ids];
    if (!pIds.length) return [];
    const flashcardsDocs = await db
      .collection("flashcards")
      .where("paragraphs", "array-contains-any", pIds)
      .where("instructor", "==", uname)
      .where("model", "==", cardsModel)
      .where("sectionTitle", "in", sections)
      .get();
    const concepts = [];
    for (let flashcardDoc of flashcardsDocs.docs) {
      const flashcardData = flashcardDoc.data();
      concepts.push({ ...flashcardData, cardId: flashcardDoc.id });
      addScoreToSavedCard(0, flashcardDoc.id, uname, false);
    }
    return concepts;
  } catch (error) {
    console.log(error);
  }
};

const searchParagraphs = (allParagraphs: any, sentences: string[]): { text: string; ids: string[] } => {
  let result = {
    text: "",
    ids: [""],
  };
  let maxCose = 0;
  for (let paragraph of allParagraphs) {
    if (!paragraph?.text) continue;
    const paragraphSentences = (paragraph?.text || "").split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/);
    let cosSimilarityParagraph = 0;
    for (let sentence of paragraphSentences) {
      const v1 = tokenizeAndCount(sentence);
      for (let sentence of sentences) {
        const v2 = tokenizeAndCount(sentence);
        const cosSimilarity = calculateCosineSimilarity(v1, v2);
        cosSimilarityParagraph += cosSimilarity;
      }
    }
    if (cosSimilarityParagraph > maxCose) {
      result = paragraph;
      maxCose = cosSimilarityParagraph;
    }
  }
  return result;
};

export const tokenizeAndCount = (text: string): Record<string, number> => {
  const wordCounts: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b(\w+)\b/g);
  if (words) {
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  }
  return wordCounts;
};

export const calculateCosineSimilarity = (vec1: object, vec2: object): number => {
  const intersection = Object.keys(vec1).filter(value => Object.keys(vec2).includes(value));

  const dotProduct = intersection.reduce(
    (sum, key) => sum + vec1[key as keyof typeof vec1] * vec2[key as keyof typeof vec2],
    0
  );

  const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 && magnitude2) {
    return dotProduct / (magnitude1 * magnitude2);
  } else {
    return 0;
  }
};
