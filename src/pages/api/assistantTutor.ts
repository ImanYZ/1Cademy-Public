import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssitantRequestAction } from "src/types/IAssitantConversation";
import { chaptersMapCoreEcon, openai } from "./openAI/helpers";
import { delay } from "@/lib/utils/utils";
import { sendGPTPrompt, sendGPTPromptJSON } from "src/utils/assistant-helpers";
import { Timestamp } from "firebase-admin/firestore";
import { roundNum } from "src/utils/common.utils";
import { extractArray } from "./assignment/generateRubrics";
type Message = {
  role: string;
  content: string;
  divided: string;
  question: true;
  sentAt: Timestamp;
  mid: string;
};
const saveLogs = async (logs: { [key: string]: any }) => {
  const newLogRef = db.collection("logs").doc();
  await newLogRef.set({
    ...logs,
    createdAt: new Date(),
  });
};
const getId = () => {
  return db.collection("tutorConversations").doc().id;
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { uid, uname, fName, customClaims } = req.body?.data?.user?.userData;
  let {
    url,
    cardsModel,
    furtherExplain,
    message,
    removeAdditionalInfo,
    anotherTopic,
    answerQuestion,
    clarifyQuestion,
  } = req.body;
  let conversationId = "";
  let deviating: boolean = anotherTopic;
  let relevanceResponse: boolean = true;
  let course = "the-economy/microeconomics";
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

    if (url.includes("the-mission-corporation")) {
      course = "the-mission-corporation-4R-trimmed.html";
    }
    if (!course) {
      throw new Error("Course Doesn't exist");
    }
    const { tutorName, courseName, objectives, directions, techniques, assistantSecondAgent, passingThreshold } =
      await getPromptInstructions(course, uname, isInstructor);

    const concepts = await getConcepts(unit, uname, cardsModel, isInstructor, course);
    const unitTitle = concepts[0]?.sectionTitle || "";
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
    console.log(conversationDocs.docs.length);
    if (conversationDocs.docs.length > 0 && !message) {
      console.log(conversationDocs.docs[0].id);
      return;
    }
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
    if (clarifyQuestion) {
      const clarifiedQuestion = await clarifyTheQuestion(
        conversationData.messages,
        fName,
        tutorName,
        courseName,
        objectives,
        directions,
        techniques,
        res
      );
      conversationData.messages.push({
        content: "Clarify the question",
        role: "user",
        sentAt: new Date(),
        mid: getId(),
        ignoreMessage: true,
      });
      conversationData.messages.push({
        content: clarifiedQuestion,
        role: "assistant",
        clarifiedQuestion: true,
        sentAt: new Date(),
        mid: getId(),
        default_message,
        ignoreMessage: true,
      });
      await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
      await saveLogs({
        course,
        url,
        uname: uname || "",
        severity: "default",
        where: "assistant tutor endpoint",
        conversationId: newConversationRef.id,
        clarifyQuestion,
        question: conversationData.messages.at(-1),
        action: "clarify question",
        project: "1Tutor",
      });
      console.log(newConversationRef.id);
      res.end();
      return;
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
      const selfStudy = !!conversationData.selfStudy && removeAdditionalInfo;
      nextFlashcard = await getNextFlashcard(
        concepts,
        [...conversationData.usedFlashcards],
        conversationData.flashcardsScores || {},
        selfStudy
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
      mid: getId(),
      default_message,
      nextFlashcard: nextFlashcard?.id || "",
      extraInfoPrompt,
      furtherExplainPrompt,
    });
    const { mergedMessages, mergedMessagesMinusFurtherExplain } = mergeDividedMessages([...conversationData.messages]);
    console.log(mergedMessages);
    // const instructorLastMessage = mergedMessages.at(-2) || {};
    // if (!default_message && !instructorLastMessage.hasOwnProperty("question")) {
    //   // const exposedParagraphsIds = getExposedParagraphs(concepts, [
    //   //   ...conversationData.usedFlashcards,
    //   //   nextFlashcard?.id || "",
    //   // ]);

    //   deviating = _deviating;
    //   detectedSections = sections;
    // }
    console.log({ deviating });
    if (deviating) {
      const { sections }: any = await getChapterRelatedToResponse(
        [...conversationData.messages],
        courseName,
        unitTitle
      );

      console.log("deviating");
      await handleDeviating(
        res,
        conversationData,
        relevanceResponse,
        message,
        courseName,
        questionMessage,
        newConversationRef,
        false,
        uname,
        cardsModel,
        sections
      );
      await saveLogs({
        course,
        url,
        uname: uname || "",
        severity: "default",
        where: "assistant tutor endpoint",
        conversationId,
        deviating,
        relevanceResponse,
        message,
        project: "1Tutor",
      });
      console.log("conversationId", conversationId);
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
        mid: getId(),
      });
      conversationData.done = true;
    }
    const { completeMessage, answer, question, emotion, inform_instructor, evaluation } = await streamMainResponse({
      res,
      deviating,
      mergedMessages,
      scroll_flashcard_next,
      conversationData,
      furtherExplain,
    });

    // save the response from GPT in the db
    const divideId = getId();
    conversationData.messages.push({
      role: "assistant",
      content: !answer ? completeMessage : answer,
      completeMessage,
      divided: !!answer ? divideId : false,
      sentAt: new Date(),
      mid: getId(),
    });

    if (!!question) {
      conversationData.messages.push({
        role: "assistant",
        content: question,
        divided: !!answer ? divideId : false,
        question: true,
        sentAt: new Date(),
        mid: getId(),
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
        mid: getId(),
      });
    }
    await newConversationRef.set({ ...conversationData, updatedAt: new Date() });

    mergedMessagesMinusFurtherExplain.push({
      role: "assistant",
      content: !answer ? completeMessage : answer,
      divided: !!answer ? divideId : false,
      sentAt: new Date(),
      mid: getId(),
    });

    // const lateResponse = await getEvaluation({
    //   mergedMessages,
    //   furtherExplain,
    //   scroll_flashcard_next,
    //   conversationData,
    //   uname,
    //   concepts,
    //   default_message,
    // });
    const lateResponse = {
      emotion,
      inform_instructor,
      evaluation,
    };

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
    res.end();
    await saveLogs({
      course,
      url,
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
      await saveLogs({
        course,
        url,
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

const clarifyTheQuestion = async (
  messages: any,
  fName: string,
  tutorName: string,
  courseName: string,
  objectives: string,
  directions: string,
  techniques: string,
  res: any
) => {
  try {
    const systemPrompt = PROMPT(fName, tutorName, courseName, objectives, directions, techniques, true);
    const userPrompt =
      "Please clarify your question by rephrasing it, explaining it further, and provide examples if possible.";
    messages[0].content = systemPrompt;
    const messagesSet = new Set();
    const messagesSimplified = messages
      .filter((m: any) => {
        const messageExist = messagesSet.has(m.content);
        messagesSet.add(m.content);
        return !m.ignoreMessage && !m.deviatingMessage && !messageExist;
      })
      .map((message: any) => ({
        role: message.role,
        content: message.content,
      }));
    messagesSimplified.push({
      role: "user",
      content: userPrompt,
    });
    console.log(messagesSimplified);
    const response = await openai.chat.completions.create({
      messages: messagesSimplified,
      model: "gpt-4-0125-preview",
      temperature: 0,
      stream: true,
    });
    let clarifiedQuestion = "";
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        const resultText = result.choices[0].delta.content;
        clarifiedQuestion = clarifiedQuestion + resultText;
        res.write(resultText);
      }
    }
    return clarifiedQuestion;
  } catch (error) {
    console.log(error);
  }
};
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
  let gpt_response = false;
  let tries = 0;

  if (!furtherExplain && !default_message) {
    while (!gpt_response && tries < 5) {
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
        gpt_response = true;
      } catch (error) {
        console.log(error);
      }
    }
    if (!lateResponse) {
      lateResponse = {
        evaluation: "0",
        emotion: "",
        progress: "0",
        inform_instructor: "",
        learning_summary: "",
      };
    }
    console.log(lateResponse, "lateResponse");
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
  console.log("===> streamMainResponse");
  let completeMessage = "";

  console.log({ deviatingResponse: deviating });
  const response = await openai.chat.completions.create({
    messages: mergedMessages,
    model: "gpt-4-0125-preview",
    temperature: 0,
    stream: true,
  });
  // stream the main response to the user
  let answer = "";
  let scrolled = false;
  for await (const result of response) {
    if (result.choices[0].delta.content) {
      const resultText = result.choices[0].delta.content;
      console.log(result.choices[0].delta.content);
      if (!completeMessage.includes(`evaluation`) && completeMessage.includes(`"your_response":`)) {
        res.write(resultText);
      }
      completeMessage = completeMessage + resultText;
      if (completeMessage.includes(`evaluation`) && !scrolled) {
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
  }
  // if (default_message && removeAdditionalInfo) {
  //   answer +=
  //     "\n\n You can either study the page on your own and review it with me, or I can walk you through the page.";
  // }

  // console.log(completeMessage);
  const response_object = extractJSON(completeMessage);
  console.log(response_object);
  return {
    completeMessage,
    answer: response_object?.your_response || "",
    question: response_object?.next_questio || "",
    emotion: response_object?.emotion || "",
    inform_instructor: response_object?.inform_instructor || "",
    evaluation: response_object?.evaluation || "",
  };
};

const getExtraInfo = (fName: string, nextFlashcard: any) => {
  let prompt =
    "\n" +
    fName +
    " can't see this PS:If " +
    fName +
    " asked any questions, you should answer their\n" +
    "questions only based on the concepts discussed in this conversation. Do not answer any question that is irrelevant.";
  // if there a next Flashcard add this
  if (nextFlashcard) {
    prompt +=
      "Respond to " +
      fName +
      " and then ask them a question about the following concept:" +
      "{" +
      "title: " +
      nextFlashcard.title +
      ",\n" +
      "content:" +
      nextFlashcard.content +
      "\n}\n" +
      "Note that you can repeat asking the same question about a concept that the student previously had difficulties with.\n" +
      "Also " +
      fName +
      " has not read the concept yet. They will read the concept only after answering your question.";
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
  cardsModel: string,
  sections: { section: string; url: string }[]
) => {
  // relevanceResponse = await checkIfTheMessageIsRelevant(mergedMessagesMinusFurtherExplain, courseName);

  let featuredConcepts: any = [];
  let answer = "";
  if (secondPrompt) {
    conversationData.messages.pop();
  }

  let lastDeviatingMessageIndex = -1;
  for (let i = conversationData.messages.length - 1; i >= 0; i--) {
    if (conversationData.messages[i].content === message) {
      lastDeviatingMessageIndex = i;
      break;
    }
  }
  if (lastDeviatingMessageIndex !== -1) {
    conversationData.messages[lastDeviatingMessageIndex].deviatingMessage = true;
    if (secondPrompt) {
      conversationData.messages[lastDeviatingMessageIndex + 1].deviatingMessage = true;
    }
  }

  if (relevanceResponse) {
    //we have keepLoading at the end of the stream message to keep the front-end loading until we receive the full response.
    // const messDev =
    //   "You're deviating from the topic of the current session. For a thoughtful response, I need to take some time to find relevant parts of the course.";
    // res.write(`${messDev}keepLoading`);
    // conversationData.messages.push({
    //   role: "assistant",
    //   content: messDev,
    //   sentAt: new Date(),
    //   mid: getId(),
    //   concepts: featuredConcepts,
    //   deviatingMessage: true,
    // });
    // call other agent to respond
    const { paragraphs, allParagraphs } = await getParagraphs(sections);

    let sectionsString = sections.map(s => `- [${s.section}](core-econ/${s.url})\n`).join("");
    if (paragraphs.length > 0) {
      const messDev = `I'm going to respond to you based on the following sections:\n\n ${sectionsString}`;
      res.write(`${messDev} keepLoading`);
      conversationData.messages.push({
        role: "assistant",
        content: messDev,
        sentAt: new Date(),
        mid: getId(),
        concepts: featuredConcepts,
        deviatingMessage: true,
      });
      const prompt =
        "Concisely respond to the student (user)'s last message based on the following JSON array of paragraphs.\n" +
        JSON.stringify(paragraphs) +
        "\n" +
        "Always respond a JSON object with the following structure:\n" +
        "{\n" +
        '"message": "Your concise message to the student' +
        "'s last message based on the sentences." +
        '",\n' +
        '"sentences": [An array of the sentences that you used to respond to the student' +
        "'s last message.],\n" +
        '"paragraphs": [An array of the paragraphs ids that you used to respond to the student' +
        "'s last message]\n" +
        "}\n" +
        "Your response should be only a complete and syntactically correct JSON object.";
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
    mid: getId(),
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
  res.end();
};

export type IAssistantRequestPayload = {
  actionType: IAssitantRequestAction;
  message: string;
  conversationId?: string;
  url?: string;
  // notebookId?: string;
};

const PROMPT = (
  fName: string,
  tutorName: string,
  courseName: string,
  objectives: string,
  directions: string,
  techniques: string,
  clarifyQuestion = false
) => {
  const instructions =
    "Your name is " +
    tutorName +
    ".\n" +
    "The student's name is " +
    fName +
    ".\n" +
    "You are a professional tutor, teaching " +
    courseName +
    ".\n" +
    objectives +
    "\n" +
    // You should motivate and help the student learn all the concept cards in the following JSON array of objects ${title}:
    // ${JSON.stringify(flashcards)}
    directions +
    "\n" +
    "Do not include any citations in your responses, unless the student explicitly asks for citations.\n" +
    "If the student asked you to further explain anything, further explain it to make sure they learn the concept.\n" +
    "If the student asked you to further explain a question that you previously asked, further explain the question to make sure they well-understand it to answer.\n" +
    techniques +
    "\n" +
    "You should make your messages very short.\n" +
    "Evaluate " +
    fName +
    "'s response to your last message. Your response should be only a JSON object with the following structure:\n" +
    "{\n" +
    '   "your_response": "Your response to ' +
    fName +
    "'s last message based on the conversation. do not ask the user any questions here." +
    '",\n' +
    '   "evaluation":"A number between 0 to 10 indicating the quality of ' +
    fName +
    "'s response to your last message. If " +
    fName +
    " perfectly answered your question with no difficulties, give them a 10, otherwise give " +
    fName +
    ' a lower number, 0 meaning their answer was completely wrong or irrelevant to your message.",' +
    '   "next_question": "Your next question for ' +
    fName +
    '",\n' +
    '   "emotion": "How happy are you with ' +
    fName +
    "'s last response? Give them only one of the values 'sad', 'annoyed', 'very happy', 'clapping', 'crying', 'apologies'. Your default emotion should be 'happy'. Give " +
    fName +
    ' variations of emotions to their different answers.",' +
    '   "inform_instructor": "' +
    "'Yes' if the instructor of the course should be informed about " +
    fName +
    "'s response to your last message. " +
    "'No' if there is no reason to take the instructor's time about " +
    fName +
    "'s last message to you." +
    "}\n" +
    "Do not print anything other than this JSON object.";

  const clarify_question_instructions =
    "Your name is " +
    tutorName +
    ".\n" +
    "The student's name is " +
    fName +
    ".\n" +
    "You are a professional tutor, teaching " +
    courseName +
    ".\n" +
    objectives +
    "\n" +
    directions +
    "\n" +
    "Do not include any citations in your responses, unless the student explicitly asks for citations.\n" +
    "If the student asked you to further explain anything, further explain it to make sure they learn the concept.\n" +
    "If the student asked you to further explain a question that you previously asked, further explain the question to make sure they well-understand it to answer.\n" +
    techniques;
  return clarifyQuestion ? clarify_question_instructions : instructions;
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
  return PROMPT(fName, tutorName, courseName, objectives, directions, techniques);
};

const extractJSON = (text: string) => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (end === -1 || start === -1) {
      return null;
    }
    const jsonArrayString = text.slice(start, end + 1);
    return JSON.parse(jsonArrayString);
  } catch (error) {
    return null;
  }
};

const getRandomFlashcard = async (concepts: any) => {
  try {
    if (!concepts.length) return null;
    const randomArbitrary = Math.floor(Math.random() * concepts.length - 1);
    return concepts[randomArbitrary];
  } catch (error) {
    console.log(error);
  }
};

const getNextFlashcard = async (concepts: any, usedFlashcards: string[], flashcardsScores: any, selfStudy: boolean) => {
  let nextFlashcard = null;
  console.log("========= selfStudy =======>", selfStudy);
  if (selfStudy) {
    nextFlashcard = await getRandomFlashcard(concepts.filter((c: any) => !usedFlashcards.includes(c.id)));
  } else {
    nextFlashcard = concepts.filter((c: any) => !usedFlashcards.includes(c.id))[0];
  }

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

  const filteredMessages = messages.filter(
    (m: any) => !m.ignoreMessage && !m.deviatingMessage && !m.hasOwnProperty("question") && !!m?.content.trim()
  );
  for (const message of filteredMessages) {
    if ("divided" in message) {
      mergedMessages.push({
        ...message,
        content: message.completeMessage,
      });
    }
    if (!message.hasOwnProperty("divided")) {
      mergedMessages.push(message);
    }
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

const streamPrompt = async (messages: any): Promise<any> => {
  try {
    const response = await openai.chat.completions.create({
      messages,
      model: "gpt-4-0125-preview",
      temperature: 0,
      stream: true,
    });
    let completeMessage = "";
    let deviating = false;
    let sections = [];
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        completeMessage += result.choices[0].delta.content;
        const regex = /"deviating": "(\w+)",/;
        const sections_regex = /"relevant_sub_sections"\s*:\s*\[.*?\]/;
        console.log(completeMessage);
        const deviation_match = regex.exec(completeMessage);
        const sections_array = extractArray(completeMessage);
        if (deviation_match) {
          const deviatingTopic = deviation_match[1];
          console.log(deviatingTopic);
          deviating = deviatingTopic.toLowerCase().includes("yes");
          console.log("=== sections_match ===>", sections_array);
          if (sections_array) {
            sections = JSON.parse(sections_array);
            break;
          }
        } else {
          console.log("No match found.");
        }
      }
    }
    return { deviating, sections };
  } catch (error) {
    console.log(error);
  }
};

const checkIfUserIsDeviating = async (
  message: any,
  courseName: string,
  unitTitle: string,
  messages: any
): Promise<{ deviating: boolean; sections: { section: string; url: string }[] }> => {
  const { sections, deviating }: any = await getChapterRelatedToResponse(messages, courseName, unitTitle);
  console.log(sections, unitTitle);

  return { deviating, sections };
  // const chaptersDoc = await db.collection("chaptersBook").where("url", "==", unit).get();
  // const chapterDoc = chaptersDoc.docs[0];
  // const chapterData = chapterDoc.data();

  // const paragraphs = getInteractedParagraphs(chapterData.paragraphs, paragraphsIds);
  //   console.log("checkIfTheQuestionIsRelated");
  //   let _messages = [...messages];
  //   const lastMessage = _messages.pop();
  //   _messages = _messages.filter((m: any) => m.role !== "system");

  //   let deviatingPrompt = `
  //   The following is a conversation between a student and a tutor:
  //   '''
  //   ${generateListMessagesText(_messages)}
  //   '''
  //   The student just responded:
  //   '''
  //   ${lastMessage.content}
  //   '''
  //   Only generate a JSON response with this structure: {"deviating_topic": Is the student's last message (not the tutor's) about a topic different from the tutor's last message? Only answer "Yes" or "No",
  //   "deviating_evidence": "Your reasoning for why you think the student's last message is about a topic different from the topic of conversation with the tutor"}`;
  //   console.log({ secondPrompt });
  //   if (secondPrompt) {
  //     deviatingPrompt = `
  //   The following is a conversation between a student and a tutor:
  //   '''
  //   ${generateListMessagesText(_messages)}
  //   '''
  //   The tutor just responded:
  //   '''
  //   ${lastMessage.content}
  //   '''
  // Only generate a JSON response with this structure: {"deviating_topic": Is the tutor's last message indicating that the student (not the tutor) was deviating from the topic of conversation with the tutor? Only answer "Yes" or "No",
  // "deviating_evidence": "Your reasoning for why you think the student's last message is about a topic different from the topic of conversation with the tutor"}`;
  //   }
  //   console.log("deviatingPrompt", deviatingPrompt);
  //   const deviating = await streamPrompt([{ content: deviatingPrompt, role: "user" }]);
  //   return !!deviating;
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

const getChapterRelatedToResponse = async (messages: any, courseName: string, unitTitle: string) => {
  try {
    const messagesHistory = [...messages].filter(m => !m.ignoreMessage && !m.deviatingMessage && !m.question);
    // let chaptersBookQuery = db.collection("chaptersBook").where("chapter", "in", ["01", "02", "03", "04"]);
    let chapterMap = chaptersMapCoreEcon;
    if (courseName == "Mission Corporation") {
      const chaptersBookQuery = db.collection("chaptersBook").where("book", "==", "Mission Corporation");

      const chaptersBookDocs = await chaptersBookQuery.get();
      //Create a chapterMap that will have all the chapters and subchapters in an array of objects
      //
      const _chapterMap: { chapter: string; subSections: { title: string; key_words: string[] }[] }[] = [];
      for (let chapterDoc of chaptersBookDocs.docs) {
        const chapterData = chapterDoc.data();
        const chapterIdx = _chapterMap.findIndex(c => c.chapter === chapterData.chapterTitle);
        if (chapterIdx !== -1) {
          _chapterMap[chapterIdx].subSections.push({
            title: chapterData.sectionTitle,
            key_words: chapterData.keyWords,
          });
        } else {
          _chapterMap.push({
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
    }
    const tutorLastMessage = messagesHistory[messagesHistory.length - 2].content;
    const studentLastMessage = messagesHistory[messagesHistory.length - 1].content;
    /* 
        `You are an expert on ${courseName}.\n` +
      `The following is the table of contents, including the titles of chapters and sub-chapters within the book ${courseName}:\n` +
      `${JSON.stringify(chaptersMap)}\n` +
      `You have access to the conversation between an instructor and a student.\n` +
      `You should respond an array of strings ["____", "____", ...] \n` +
      `of the titles of the sub-sections of the book the student should study to learn what they want. \n` +
      `The array should only include the sub-section titles that are very related to the student's last message. \n` +
      `If none of the sub-sections are very related to the student's last message, return an empty array []\n` +
      `The last message that the instructor sent to the student is: '''${tutorLastMessage}'''\n` +
      `The student's last message is: '''${studentLastMessage}'''`;
     */

    const systemPrompt =
      `Given the table of contents of the book for the course titled ${courseName}, which includes chapters and sub-chapters, and considering the ongoing conversation between an instructor and a student, your task is to evaluate the student's last message for its relevance to the course material. The table of contents is as follows:    
    ${JSON.stringify(chapterMap)}\n \n` +
      "Based on the student's message, determine whether the student is staying on topic with the course material or deviating from it. When evaluating the student's response, consider the following:\n" +
      "- Direct answers to the instructor's questions, even if incorrect, should not be considered a deviation.\n" +
      `- Responses indicating uncertainty or a request for clarification ("I don't know", "Could you explain...?", "I have no ideas", "tell me", ...) are part of the learning process and should not be classified as deviation.\n` +
      "- Determine the relevance of the student's response by identifying any connections to the course material, even if the connections are loose.\n" +
      "- Direct questions from the student should be considered a deviation in case the student is avoiding to answer the current question from the instructor or the question isn't related to the instructor's message.\n" +
      "- Student's responses that are directly related to the instructor's previous message or follow-up questions seeking clarification on the instructor's last point should not be considered a deviation, even if they do not directly reference the course material.\n" +
      "- Make sure to include the correct sub sections the user needs to look into for a correct answer.\n" +
      "\n" +
      "Your response should be structured as a json object as follows:\n" +
      "{\n" +
      '  "deviating": "Yes" or "No",\n' +
      '  "relevant_sub_sections": [{section:"Sub-section title 1", "url":"Sub-section url 1"}, {section:"Sub-section title 2", url:"Sub-section url 2"}, ...}] (this should never be an empty array, only focus on the student message when searching for relevant_sub_sections),\n' +
      '  "explanation": "Your brief explanation here."\n' +
      "}\n";
    const userPrompt =
      `"Instructor's message": "${tutorLastMessage}"\n` + `"Student's response": "${studentLastMessage}"`;

    const prompt_messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content:
          `"instructor's message": "Why is data collection important in the field of economics, according to renowned economists like Thomas Piketty and James Heckman?"` +
          `"student's response": "what's GDP?"`,
      },
      {
        role: "assistant",
        content:
          "{" +
          '"deviating": "YES",' +
          '"relevant_sub_sections": [{"section":"1.2 History’s hockey stick",  "url": "01-prosperity-inequality-02-historys-hockey-stick.html" }],' +
          '"explanation": "because the user is asking a question different than what the tutor is talking about",' +
          "}",
      },
      {
        role: "user",
        content:
          `"instructor's message": "What does the Malthusian population model suggest happens to population size as agricultural productivity improves?"` +
          `"student's response": "i don't know"`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "NO",\n' +
          '"relevant_sub_sections": [{\n' +
          '"url": "01-prosperity-inequality-07-malthusian-trap.html",\n' +
          '"section": "1.7 Explaining the flat part of the hockey stick: The Malthusian trap, population, and the average product of labour"\n' +
          "}],\n" +
          '"explanation":""' +
          "}",
      },
      {
        role: "user",
        content:
          `"instructor's message": "What does the Malthusian population model suggest happens to population size as agricultural productivity improves?",` +
          `"student's response": "i have no idea"`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "NO",\n' +
          '"relevant_sub_sections": [{\n' +
          '"url": "01-prosperity-inequality-07-malthusian-trap.html",\n' +
          '"section": "1.7 Explaining the flat part of the hockey stick: The Malthusian trap, population, and the average product of labour"' +
          "}],\n" +
          '"explanation":""' +
          "}",
      },
      {
        role: "user",
        content:
          `"instructor's message": "How did socio-economic disparities within nations compare to the disparities between different regions several centuries ago?",` +
          `"student's response": "tell me"`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "NO",\n' +
          '"relevant_sub_sections": [{\n' +
          '"url": "01-prosperity-inequality-01-ibn-battuta.html",\n' +
          '"section": "1.1 Ibn Battuta’s fourteenth-century travels in a flat world"\n' +
          "}],\n" +
          '"explanation":""\n' +
          "}",
      },
      {
        role: "user",
        content:
          `"instructor's message": "Can you guess which 14th-century Moroccan scholar traveled extensively across Africa, Europe, central Asia, and China, documenting his experiences?",` +
          `"student's response": "tell me about socialism"`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "YES",\n' +
          '"relevant_sub_sections": [{\n' +
          '"url": "01-prosperity-inequality-12-capitalism-varieties.html",\n' +
          '"section": "1.12 Varieties of capitalism: Institutions, government, and politics"\n' +
          "}],\n" +
          `"explanation":"the user wan't to talk about a different topic than what the instructor is asking a question about"\n` +
          "}",
      },
      {
        role: "user",
        content:
          `"instructor's message": "Can you guess which 14th-century Moroccan scholar traveled extensively across Africa, Europe, central Asia, and China, documenting his experiences?"` +
          `"student's response": "Ibn Battuta, the 14th-century Moroccan scholar, traveled extensively across Africa, Europe, central Asia, and China, documenting his experiences in his renowned travelogue."`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "NO",\n' +
          '"relevant_sub_sections": [{\n' +
          '"url": "01-prosperity-inequality-01-ibn-battuta.html",\n' +
          '"section": "1.1 Ibn Battuta’s fourteenth-century travels in a flat world"\n' +
          "}],\n" +
          '"explanation":"the user is not deviating because he is trying to answer the question of the instructor"' +
          "}",
      },
      {
        role: "user",
        content:
          `"Instructor's message": "Please explain the concept of GDP and its importance in understanding economic growth."` +
          `"Student's response": "What does GDP stand for?"`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "No",\n' +
          `"relevant_sub_sections": [{"section":"1.2 History’s hockey stick", "url":"01-prosperity-inequality-02-historys-hockey-stick.html"}],\n` +
          `"explanation": "The student is asking for clarification on a term directly related to the instructor's question, which is relevant to the course material."\n` +
          "}",
      },
      {
        role: "user",
        content:
          `"Instructor's message": "Discuss the impact of the Industrial Revolution on agricultural productivity."` +
          `"Student's response": "Why is the sky blue?"`,
      },
      {
        role: "assistant",
        content:
          "{\n" +
          '"deviating": "Yes",\n' +
          `"relevant_sub_sections": [{"section":"1.7 Explaining the flat part of the hockey stick: The Malthusian trap, population, and the average product of labour", "url":"01-prosperity-inequality-07-malthusian-trap.html"}],\n` +
          `"explanation": "The student's question is completely unrelated to the course material and the instructor's question, indicating a deviation."\n` +
          "}",
      },
      {
        role: "user",
        content:
          `"Instructor's message": "How did British colonization affect India's economy?"` +
          `"Student's response": "Did the colonization lead to any technological advancements in India?"`,
      },
      {
        role: "assistant",
        content:
          "{" +
          '"deviating": "No",' +
          `"relevant_sub_sections": [{"section":"1.11 Application: Did the British colonization of India reduce Indian living standards?", "url":"01-prosperity-inequality-11-british-colonization-india.html"}],` +
          `"explanation": "The student's question is directly related to the topic being discussed and seeks further information on a specific aspect of the colonization's impact."` +
          +"}",
      },
      {
        role: "user",
        content:
          `"Instructor's message": "What types of resources were abundant in small villages centuries ago?"` +
          `"Student's response": "rice"`,
      },
      {
        role: "assistant",
        content:
          "{" +
          '"deviating": "No",' +
          `"relevant_sub_sections": [{"section":"1.1 Ibn Battuta’s fourteenth-century travels in a flat world", "url":"01-prosperity-inequality-11-british-colonization-india.html"}],` +
          `"explanation": "the student is directly answering the instructor's question."` +
          +"}",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    console.log(userPrompt);
    console.log("waiting for response from GPT: deviating prompt");
    console.log(prompt_messages);
    const { deviating, sections } = await streamPrompt(prompt_messages);
    //-----

    // if (sections.length > 0 ) {
    //   deviating = !checkIncludes(unitTitle, sectionsTitles);
    // }

    return { sections, deviating };
  } catch (error) {
    console.log(error);
  }
};

const getParagraphs = async (sections: { section: string; url: string }[]) => {
  const paragraphs: any = [];
  let allParagraphs: any = [];
  const sectionsUrls = sections.map(s => s.url);
  if (sectionsUrls.length <= 0) return { paragraphs, allParagraphs };
  const chaptersBookDocs = await db.collection("chaptersBook").where("url", "in", sectionsUrls).get();
  for (let sectionDoc of chaptersBookDocs.docs) {
    const sectionData = sectionDoc.data();
    const _paragraphs: any = [];
    sectionData.paragraphs.map((p: any) => {
      if ((p.ids || []).length > 0) {
        _paragraphs.push({ text: p.text, id: p.ids[0] });
      }
    });
    allParagraphs = [...allParagraphs, ...sectionData.paragraphs];
    paragraphs.push({
      section: sectionData.sectionTitle,
      paragraphs: _paragraphs,
    });
  }
  console.log("paragraphs.length", paragraphs.length);
  return { paragraphs, allParagraphs };
};

const extractFlashcards = async (
  paragraph: { text: string; ids: string[] },
  sections: { section: string; url: string }[],
  uname: string,
  cardsModel: string
) => {
  try {
    let pIds: string[] = [...paragraph.ids];
    if (!pIds.length) return [];
    const sectionsUrls = sections.map(s => s.url);
    if (sectionsUrls.length <= 0) return [];
    const flashcardsDocs = await db
      .collection("flashcards")
      .where("paragraphs", "array-contains-any", pIds)
      .where("instructor", "==", uname)
      .where("url", "in", sectionsUrls)
      .where("model", "==", cardsModel)
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
  console.log(allParagraphs);
  for (let paragraph of allParagraphs) {
    const key = paragraph.ids[0];
    if (!paragraph?.text || key.includes("figure") || key.includes("image") || key.includes("youtube")) continue;
    const paragraphSentences = (paragraph?.text || "").split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/);
    let cosSimilarityParagraph = 0;
    for (let sentence1 of paragraphSentences) {
      const v1 = tokenizeAndCount(sentence1);
      for (let sentence2 of sentences) {
        const v2 = tokenizeAndCount(sentence2);
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

const checkIncludes = (searchString: string, arrayString: string[]) => {
  const v1 = tokenizeAndCount(searchString);
  for (let section of arrayString) {
    const v2 = tokenizeAndCount(section);
    if (calculateCosineSimilarity(v1, v2) > 0.8) {
      return true;
    }
  }
  return false;
};

/* 
1-Guide me:
	-Get Started:
		- Adrian asked a question:
			- student answers the question
				- next question
     					GO BACK TO ( Adrian asked a question)
				- tell me more
				- switch to review mode
				- student send a new message
			- student ask a question about a different topic:
				- next question
				- switch to review mode
				- student send a new message
				- student asks another question about a different topic
			- student asks about the answer to the question
				- next question
				- tell me more
				- switch to review mode
        - Tell me more       
        - Switch to review mode 
2-I’ll review first:
	  - I’m ready to review
		- Adrian asks a question
			- Student answers the question
				- next question
					GO BACK TO ( Adrian asked a question)
				- tell me more
				- switch to guided mode
				- student send a new message
			- Student ask a question about a different topic
				- next question
				- switch to guided mode
				- student send a new message 
				- student asks another question about a different topic
			- Student asks about the answer to the question
				- next question
				- tell me more
				-switch to guided mode

	  - Switch to guided mode

3-student send a new message:
	the tutor gives an answer the student.
*/
