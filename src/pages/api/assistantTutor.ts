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
  let { url, cardsModel, furtherExplain, message, removeAdditionalInfo, clarifyQuestion, unitTitle } = req.body;
  let conversationId = "";
  let deviating: boolean = false;
  let relevanceResponse: boolean = true;
  let course = "the-economy/microeconomics";
  try {
    console.log("assistant Tutor", uname, unitTitle);

    let default_message = false;
    const defaultAnswer = `Hello I’m Adrian and I’m here to guide your learning by asking questions and providing feedback based on your responses. Lets start with, how familiar are you with 
    ${unitTitle ? unitTitle.replace(/^\d+(\.\d+)?\s+/, "") : ""}?`;
    if (!message) {
      default_message = true;
      for (let word of defaultAnswer.split(" ")) {
        await delay(100);
        res.write(word + " ");
      }
    }
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
    unitTitle = concepts[0]?.sectionTitle || "";

    console.log(concepts.length);
    if (!concepts.length) {
      await saveLogs({
        course,
        url,
        uname: uname || "",
        severity: "default",
        where: "assistant tutor endpoint",
        error: "Flashcards don't exist in this page.",
        clarifyQuestion,
        action: "clarify question",
        project: "1Tutor",
      });
      return;
      // throw new Error("Flashcards don't exist in this page.");
    }
    const systemPrompt = PROMPT(fName, tutorName, courseName, objectives, techniques, {
      title: "",
      content: "",
    });

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
    const instructorMessage = conversationData.messages
      .filter((m: any) => !m.ignoreMessage && !m.deviatingMessage && !!m?.content.trim())
      .at(-1);
    const studentMessage = message;
    const { questions, questionAnswer, clarificationRequest, continueLearning, clarify }: any = default_message
      ? { questions: [], questionAnswer: "", clarificationRequest: "", continueLearning: "", clarify: "" }
      : instructorMessage.hasOwnProperty("question")
      ? await getQuestionsAfterQuestion(instructorMessage.content, message)
      : await getQuestionsAfterAnswer(instructorMessage.content, studentMessage);
    console.log({ questions, questionAnswer, clarificationRequest, continueLearning, clarify });
    //
    //after extracting the questions and the answer
    if (questions.length > 0) {
      deviating = true;
    }
    if (clarify) {
      furtherExplain = true;
    }

    console.log("questions", questions);
    if (!!clarificationRequest) {
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
        content: clarificationRequest /* "Clarify the question" */,
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
      // message = `Hello My name is ${fName}.`;

      conversationData.usedFlashcards = [];
    } /* else if (!!conversationData.messages[conversationData.messages.length - 1].question) {
      furtherExplain = true;
      questionMessage = conversationData.messages.pop();
    } */

    let scroll_flashcard_next = "";
    let nextFlashcard = null;
    if ((!furtherExplain && !deviating) || !questionAnswer) {
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

    //update the system prompt  to add the next flashcard that gpt need to ask a question about
    if (nextFlashcard) {
      systemPrompt;
      conversationData.messages[0].content = PROMPT(
        fName,
        tutorName,
        courseName,
        objectives,
        techniques,
        nextFlashcard
      );
    }

    // add the extra PS to the message of the user
    // we ignore it afterward when saving the conversation in the db

    let furtherExplainPrompt = "";
    if (furtherExplain && conversationData.previousFlashcard) {
      furtherExplainPrompt = `Further explain the content of the following concept:{
    title: "${conversationData?.previousFlashcard?.title || ""}",
    content: "${conversationData?.previousFlashcard?.content || ""}"
  }`;

      /*  */
    }
    if (!!message && !!questionAnswer.trim()) {
      conversationData.messages.push({
        role: "user",
        content: questionAnswer,
        sentAt: new Date(),
        mid: getId(),
        default_message,
        nextFlashcard: nextFlashcard?.id || "",
        furtherExplainPrompt,
        deviating,
      });
    }

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

    if (questionAnswer || default_message) {
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

      const { completeMessage, answer, question, emotion, inform_instructor, evaluation } = default_message
        ? {
            completeMessage: defaultAnswer,
            answer: defaultAnswer,
            question: "",
            emotion: "",
            inform_instructor: "",
            evaluation: 0,
          }
        : await streamMainResponse({
            res,
            deviating,
            mergedMessages,
            scroll_flashcard_next,
            conversationData,
            furtherExplain,
          });
      // console.log({ completeMessage, answer, question, emotion, inform_instructor, evaluation });
      // save the response from GPT in the db
      const divideId = getId();
      conversationData.messages[conversationData.messages.length - 1].content = message;
      conversationData.messages.push({
        role: "assistant",
        content: !answer ? completeMessage : answer,
        completeMessage,
        divided: !!answer ? divideId : false,
        sentAt: new Date(),
        mid: getId(),
        emotion: default_message ? "" : emotion,
        inform_instructor: inform_instructor,
        prior_evaluation: evaluation,
        concept: scroll_flashcard_next,
      });
      // if (default_message) {
      //   await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
      // }

      if (typeof question === "string" && !!question) {
        conversationData.messages.push({
          role: "assistant",
          content: question,
          divided: !!answer ? divideId : false,
          question: true,
          sentAt: new Date(),
          mid: getId(),
        });
      } else if (!!nextFlashcard) {
        const question = await getTheNextQuestion(nextFlashcard);
        conversationData.messages[conversationData.messages.length - 1].completeMessage =
          "{\n" +
          `  "your_response": "${answer}",\n` +
          `  "evaluation": "${evaluation}",\n` +
          `  "emotion": "${emotion}",\n` +
          `  "inform_instructor": "${inform_instructor}",\n` +
          `  "next_question": "${question}"\n` +
          "}";
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
    }

    if (deviating) {
      /*  if (relatedTopic) {
        const systemPrompt = ClarifyPROMPT(fName, tutorName, courseName, objectives, directions, techniques);
        const response = await handleRelatedTopic([...conversationData.messages], systemPrompt, res);
        conversationData.messages.push({
          content: response,
          role: "assistant",
          sentAt: new Date(),
          mid: getId(),
          default_message,
          ignoreMessage: true,
        });
        conversationData.messages.map((m: any) => {
          if (m.deviating) {
            m.ignoreMessage = true;
            delete m.deviating;
          }
        });
        if (!questionMessage) {
          questionMessage = conversationData.messages.filter((m: any) => m.hasOwnProperty("question")).reverse()[0];
        }
        if (!!questionMessage) {
          conversationData.messages.push({ ...questionMessage, question: true, sentAt: new Date() });
        }
        await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
      } else { */
      for (let question of questions) {
        const { sections }: any = await getChapterRelatedToResponse(question, courseName, unitTitle);
        console.log("deviating");
        await handleDeviating(
          res,
          conversationData,
          relevanceResponse,
          question,
          newConversationRef,
          uname,
          cardsModel,
          sections
        );
      }
      // if(questionAnswer || default_message){

      // }
      if (!questionMessage) {
        questionMessage = conversationData.messages.filter((m: any) => m.hasOwnProperty("question")).reverse()[0];
      }
      if (!!questionMessage) {
        conversationData.messages.push({ ...questionMessage, question: true, sentAt: new Date() });
      }
      /* } */
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
    }
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

/* instructor last message is not a question */
const getQuestionsAfterAnswer = async (
  instructorMessage: string,
  studentMessage: string
): Promise<{ questions: string[]; continueLearning: string; clarify: string }> => {
  const prompt = `
    We are processing a conversation between an instructor and a student.
    The instructor sent the following triple-quoted message:
    '''
    ${instructorMessage}
    '''
    The student responded the following triple-quoted message:
    '''
    ${studentMessage}
    '''
    Analyze the student's response based on the following rules:
    - If the student asked for further explanation/clarification of the instructor's message, identify it as "clarify".
    - If the student asked to continue with the next topic/question, identify it as "continue".
    - If the student asked additional questions or makes requests that are not directly related to the instructor's message, identify these as "deviate".
    Given this, respond with a JSON object structured as follows:
    {
       "clarify": "If the student asked for further explanation/clarification of the instructor's message, assign their request as a string to this field. If there is no clarification request, the value should be an empty string.",
       "continue": "If the student asked to continue with the next topic/question, assign their request as a string to this field. If there is nothing indicating their willingness to continue, the value should be an empty string.",
       "deviate": ["If there are questions or requests included in any part of the student's message that are not related to the instructor's message, assign each as a string to this array. If there are no questions or requests irrelevant to the instructor's message, the value should be []."]
    }`;
  const response: any = await sendGPTPrompt("gpt-4-0125-preview", [
    {
      role: "user",
      content: prompt,
    },
  ]);

  const objectResponse = extractJSON(response);
  const questions: string[] = objectResponse.deviate || [];
  const continueLearning: string = objectResponse.continue || "";
  const clarify: string = objectResponse.clarify || "";
  return { questions, continueLearning, clarify };
};
/* instructor last message is a question */
const getQuestionsAfterQuestion = async (
  instructorMessage: string,
  studentMessage: string
): Promise<{ questions: string[]; questionAnswer: string; clarificationRequest: string }> => {
  const prompt = `
We are processing a conversation between an instructor and a student.
The instructor sent the following question:
'''
${instructorMessage}
'''
The student responded the following triple-quoted message:
'''
${studentMessage}
'''
Analyze the student's response based on the following rules:
- If the student provides information directly related to the instructor's question, classify this as part of their answer.
- If the student asks for the answer or expresses uncertainty or a lack of knowledge about the question (e.g., "I don't know", "tell me", "I have no ideas", "answer it", "solve it"), consider this as their answer indicating they cannot provide the requested information. Treat such expressions as valid responses to the instructor's question.
- If the student asks additional questions or makes requests that are not directly related to answering the instructor's question (e.g., "What is GDP?"), identify these as separate questions or requests.
Given this, respond with a JSON object structured as follows:
{
   "questionsOrRequests": ["If there are questions or requests included in any part of the student's message that are not in response to the instructor's question, assign each as a string to this array. If there are no questions or requests irrelevant to the instructor's question, the value should be []."],
   "answer": "Only if there are parts of the student's message that respond to the instructor's question, merge them into one message and assign it as a string to this field. If the student's response is an expression of uncertainty or a lack of knowledge, include this as their answer. If neither of these exist, the value should be an empty string.",
   "clarificationRequest": "If the student is asking the instructor to clarify the question, assign this request as a string to this field. If there is no clarification request, the value should be an empty string."
}`;
  const response: any = await sendGPTPrompt("gpt-4-0125-preview", [
    {
      role: "user",
      content: prompt,
    },
  ]);

  const objectResponse = extractJSON(response);
  console.log("objectResponse =====>", objectResponse);
  const questions: string[] = objectResponse.questionsOrRequests || [];
  const questionAnswer: string = objectResponse.answer || "";
  const clarificationRequest: string = objectResponse.clarificationRequest || "";
  return { questions, questionAnswer, clarificationRequest };
};

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
    const systemPrompt = ClarifyPROMPT(fName, tutorName, courseName, objectives, directions, techniques);
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

  if (furtherExplain) mergedMessages.shift(); //remove the system prompt from the history of messages if the user is asking for further explanation
  /*  */
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

  console.log(completeMessage);
  const response_object = extractJSON(completeMessage);
  console.log(response_object);
  return {
    completeMessage,
    answer: response_object?.your_response || "",
    question: response_object?.next_question || "",
    emotion: response_object?.emotion || "",
    inform_instructor: response_object?.inform_instructor || "",
    evaluation: response_object?.evaluation || "",
  };
};

const handleDeviating = async (
  res: NextApiResponse<any>,
  conversationData: any,
  relevanceResponse: boolean,
  question: string,
  newConversationRef: any,
  uname: string,
  cardsModel: string,
  sections: { section: string; url: string }[]
) => {
  // relevanceResponse = await checkIfTheMessageIsRelevant(mergedMessagesMinusFurtherExplain, courseName);

  let featuredConcepts: any = [];
  let answer = "";

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

    let sectionsString = sections.map(s => `- [${s.section}](/core-econ/${s.url})\n`).join("");
    if (paragraphs.length > 0) {
      const messDev = `For your question: ${question}\n\nI'm going to respond to you based on the following sections:\n\n ${sectionsString}`;
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

      const response2 = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: question,
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
        }
        fullMessage += result.choices[0].delta.content;
      }

      const responseJson = JSON.parse(fullMessage);
      const sentences = responseJson.sentences;

      const paragraph: { text: string; ids: string[] } = searchParagraphs(allParagraphs, sentences);

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
  await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
};

export type IAssistantRequestPayload = {
  actionType: IAssitantRequestAction;
  message: string;
  conversationId?: string;
  url?: string;
  // notebookId?: string;
};
const ClarifyPROMPT = (
  fName: string,
  tutorName: string,
  courseName: string,
  objectives: string,
  directions: string,
  techniques: string
) => {
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

  return clarify_question_instructions;
};
const PROMPT = (
  fName: string,
  tutorName: string,
  courseName: string,
  objectives: string,
  techniques: string,
  nextFlashcard: {
    title: string;
    content: string;
  }
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
    // You should motivate and help the student learn all the concept cards in the following JSON array of objects ${title}:
    // ${JSON.stringify(flashcards)}
    "\n" +
    "Do not include any citations in your responses, unless the student explicitly asks for citations.\n" +
    "If the student asked you to further explain anything, further explain it to make sure they learn the concept.\n" +
    techniques +
    "\n" +
    "Evaluate " +
    fName +
    "'s response to your last message and give them constructive feedback. Your message should be only a JSON object with the following structure:\n" +
    "{\n" +
    '"your_response": "Your response to ' +
    fName +
    "'s last message based on the conversation, which should be as short as possible. Do not explain what you do or anything else. Only answer the question or give feedback to " +
    fName +
    "'s answer. If " +
    fName +
    " has answered your last question, give them constructive feedback to their answer. If " +
    fName +
    " does not know the answer (indicated by responses like 'I do not know', 'I have no ideas', 'Help me learn the answer', 'Explain it to me', 'Tell me the answer', ...), just give them a concise answer without any further explanation. Never ask any question or seek" +
    fName +
    "'s opinion or preference about anything." +
    '",\n' +
    '   "evaluation":"A number between 0 to 10 indicating the quality of ' +
    fName +
    "'s response to your last message. If " +
    fName +
    " perfectly answered your question with no difficulties, give them a 10, otherwise give " +
    fName +
    ' a lower number, 0 meaning their answer was completely wrong or irrelevant to your message.",\n' +
    '   "emotion": "How happy are you with ' +
    fName +
    "'s last response? Give them only one of the values 'sad', 'annoyed', 'very happy', 'clapping', 'crying', 'apologies'. Your default emotion should be 'happy'. Give " +
    fName +
    ' variations of emotions to their different answers.",\n' +
    '   "inform_instructor": "' +
    "'Yes' if the instructor of the course should be informed about " +
    fName +
    "'s response to your last message. " +
    "'No' if there is no reason to take the instructor's time about " +
    fName +
    "'s last message to you." +
    '",\n' +
    '   "next_question": "Generate a question to assess ' +
    fName +
    "'s learning of the following concept:" +
    nextFlashcard.title +
    ":\n" +
    nextFlashcard.content +
    "\nDo not involve any information beyond this concept.\n" +
    "}\n" +
    "Do not print anything other than this JSON object.";

  return instructions;
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

// const streamPrompt = async (messages: any): Promise<any> => {
//   try {
//     const response = await openai.chat.completions.create({
//       messages,
//       model: "gpt-4-0125-preview",
//       temperature: 0,
//       stream: true,
//     });
//     let completeMessage = "";
//     let deviating = false;
//     let sections = [];
//     for await (const result of response) {
//       if (result.choices[0].delta.content) {
//         completeMessage += result.choices[0].delta.content;
//         const regex = /"deviating": "(\w+)",/;
//         const sections_regex = /"relevant_sub_sections"\s*:\s*\[.*?\]/;
//         console.log(completeMessage);
//         const deviation_match = regex.exec(completeMessage);
//         const sections_array = extractArray(completeMessage);
//         if (deviation_match) {
//           const deviatingTopic = deviation_match[1];
//           console.log(deviatingTopic);
//           deviating = deviatingTopic.toLowerCase().includes("yes");
//           console.log("=== sections_match ===>", sections_array);
//           if (sections_array) {
//             sections = JSON.parse(sections_array);
//             break;
//           }
//         } else {
//           console.log("No match found.");
//         }
//       }
//     }
//     return { deviating, sections };
//   } catch (error) {
//     console.log(error);
//   }
// };

const checkIfUserIsDeviating = async (
  message: any,
  courseName: string,
  unitTitle: string,
  messages: any
): Promise<{ deviating: boolean; sections: { section: string; url: string }[] }> => {
  const { sections, deviating }: any = await getChapterRelatedToResponse(messages, courseName, unitTitle);

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

const getChapterRelatedToResponse = async (studentLastMessage: string, courseName: string, unitTitle: string) => {
  try {
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

    const getChaptersPrompt =
      `Given the table of contents of the book for the course titled ${courseName}, which includes chapters and sub-chapters, The table of contents is as follows:    
    ${JSON.stringify(chapterMap)}\n \n` +
      "\n" +
      "detect the sub-sections that are relevant to the Student's response:" +
      studentLastMessage +
      "Your response should be structured as a json object as follows:\n" +
      "{\n" +
      '  "relevant_sub_sections": [{section:"Sub-section title 1", "url":"Sub-section url 1"}, {section:"Sub-section title 2", url:"Sub-section url 2"}, ...}] (this should never be an empty array, only focus on the student message when searching for relevant_sub_sections),\n' +
      "}\n";
    const userPrompt = `"Student's response": "${studentLastMessage}"`;

    const prompt_messages = [
      {
        role: "user",
        content: getChaptersPrompt,
      },
    ];

    const response = await openai.chat.completions.create({
      messages: prompt_messages,
      model: "gpt-4-0125-preview",
      temperature: 0,
    });
    const response_sections = response.choices[0].message.content;
    const sections = JSON.parse(extractArray(response_sections) || "[]");
    //-----

    // if (sections.length > 0 ) {
    //   deviating = !checkIncludes(unitTitle, sectionsTitles);
    // }

    return { sections };
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
const handleRelatedTopic = async (messages: any, systemPrompt: string, res: any) => {
  try {
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

    const response = await openai.chat.completions.create({
      messages: messagesSimplified,
      model: "gpt-4-0125-preview",
      temperature: 0,
      stream: true,
    });
    let responseToQuestion = "";
    for await (const result of response) {
      if (result.choices[0].delta.content) {
        const resultText = result.choices[0].delta.content;
        responseToQuestion = responseToQuestion + resultText;
        res.write(resultText);
      }
    }
    return responseToQuestion;
  } catch (error) {
    console.log(error);
  }
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
