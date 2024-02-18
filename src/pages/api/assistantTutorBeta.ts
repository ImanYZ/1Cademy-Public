const fs = require("fs");
import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssitantRequestAction } from "src/types/IAssitantConversation";
import { fetchCompelation, openai } from "./openAI/helpers";
import { delay } from "@/lib/utils/utils";
import { sendGPTPrompt } from "src/utils/assistant-helpers";
import { Timestamp } from "firebase-admin/firestore";
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
  let conversationId = "";
  let deviating: boolean = false;
  let relevanceResponse: boolean = false;
  try {
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
      console.log({ unit });
      let course = "the-economy/microeconomics";
      if (url.includes("the-mission-corporation")) {
        course = "the-mission-corporation-4R-trimmed.html";
      }
      if (!course) {
        res.write("Sorry, something went wrong, can you please try again!");
        return;
      }
      const { tutorName, courseName, objectives, directions, techniques, assistantSecondAgent, passingThreshold } =
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
      const extraInfoPrompt =
        `\n${fName} can't see this PS:If ${fName} asked any questions, you should answer their questions only based on the concepts discussed in this conversation. Do not answer any question that is irrelevant.` +
        `Always separate your response to ${fName}'s last message from your next question using "\n~~~~~~~~\n".` +
        (!!nextFlashcard
          ? `Respond to ${fName} and then ask them a question about the following concept:
        {
          title: "${nextFlashcard.title}",
          content: "${nextFlashcard.content}"
        }
        Note that you can repeat asking the same question about a concept that the student previously had difficulties with. Also ${fName} has not read the concept yet. They will read the concept only after answering your question.`
          : "");
      const furtherExplainPrompt =
        furtherExplain && conversationData.previousFlashcard
          ? `Further explain the content of the following concept:{
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
      const { mergedMessages, mergedMessagesMinusFurtherExplain } = mergeDividedMessages([
        ...conversationData.messages,
      ]);
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
        relevanceResponse = await checkIfTheMessageIsRelevant(mergedMessagesMinusFurtherExplain, courseName);

        let featuredConcepts: any = [];
        let answer = "";
        conversationData.messages[conversationData.messages.length - 1].deviatingMessage = true;
        if (relevanceResponse) {
          res.write(
            `You're deviating from the topic of the current session. For a thoughtful response, I need to take some time to find relevant parts of the course.keepLoading`
          );
          // call other agent to respond
          const { paragraphs, allParagraphs, sections }: any = await getChapterRelatedToResponse(message);
          let sectionsString = "";
          sections.map((s: string) => {
            sectionsString += `- ${s}\n`;
          });
          if (paragraphs.length > 0) {
            res.write(`I'm going to respond to you based on the following sections:\n\n ${sectionsString} keepLoading`);

            const prompt = `Respond to the student (user)'s last message based on the following JSON array of paragraphs.  
        ${JSON.stringify(paragraphs)}
        Always respond a JSON object with the following structure:
        {
        "response": "Your response to the student's last message based on the sentences.",
        "sentences": [An array of the sentences that you used to respond to the student's last message.],
        "paragraphs": [An array of paragraphs that you used to respond to the student's last message]
        }
        }`;

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
              if (!fullMessage.includes(`"sentences":`) && fullMessage.includes(`"response":`)) {
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
            featuredConcepts = await extractFlashcards(fullMessage, allParagraphs, sections, uname);
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
        answer = answer.replace(`{ "response":`, "");
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
        t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });
        return;
      }

      let completeMessage = "";
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

      console.log({ deviatingResponse: deviating });
      const response = await openai.chat.completions.create({
        messages: mergedMessages,
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
      t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });

      mergedMessagesMinusFurtherExplain.push({
        role: "assistant",
        content: !answer ? completeMessage : answer,
        divided: !!answer ? divideId : false,
        sentAt: new Date(),
        mid: db.collection("tutorConversations").doc().id,
      });
      deviating = await checkIfUserIsDeviating(mergedMessagesMinusFurtherExplain, true);
      if (deviating) {
        console.log({ deviatingAfterResponse: deviating });

        relevanceResponse = await checkIfTheMessageIsRelevant(mergedMessagesMinusFurtherExplain, courseName);

        let featuredConcepts: any = [];
        let answer = "";
        conversationData.messages[conversationData.messages.length - 3].deviatingMessage = true;
        conversationData.messages[conversationData.messages.length - 2].deviatingMessage = true;
        if (relevanceResponse) {
          res.write(
            `You're deviating from the topic of the current session. For a thoughtful response, I need to take some time to find relevant parts of the course.keepLoading`
          );
          // call other agent to respond
          const { paragraphs, allParagraphs, sections }: any = await getChapterRelatedToResponse(message);
          let sectionsString = "";
          sections.map((s: string) => {
            sectionsString += `- ${s}\n`;
          });
          if (paragraphs.length > 0) {
            res.write(`I'm going to respond to you based on the following sections:\n\n ${sectionsString} keepLoading`);

            const prompt = `Respond to the student (user)'s last message based on the following JSON array of paragraphs.  
        ${JSON.stringify(paragraphs)}
        Always respond a JSON object with the following structure:
        {
        "response": "Your response to the student's last message based on the sentences.",
        "sentences": [An array of the sentences that you used to respond to the student's last message.],
        "paragraphs": [An array of paragraphs that you used to respond to the student's last message]
        }
        }`;

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
              if (!fullMessage.includes(`"sentences":`) && fullMessage.includes(`"response":`)) {
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
            featuredConcepts = await extractFlashcards(fullMessage, allParagraphs, sections, uname);
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
        answer = answer.replace(`{ "response":`, "");
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
        t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });
        return;
      }

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

            console.log({ lateResponse });
          } catch (error) {
            console.log(error);
          }
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
      if (lateResponse.learning_summary) {
        conversationData.learningSummary = lateResponse.learning_summary;
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
      };
      conversationData.usedFlashcards = Array.from(new Set(conversationData.usedFlashcards));
      t.set(newConversationRef, { ...conversationData, updatedAt: new Date() });
      console.log("Done", conversationId);
    });
    const newLogRef = db.collection("logs").doc();
    await newLogRef.set({
      uname: uname || "",
      severity: "default",
      where: "assistant tutor endpoint",
      conversationId,
      deviating,
      relevanceResponse,
      createdAt: new Date(),
    });
  } catch (error: any) {
    console.log("error at handler", {
      uname: uname || "",
      severity: "error",
      where: "assistant tutor endpoint",
      conversationId,
      deviating,
      relevanceResponse,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
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

const roundNum = (num: number) => Number(Number.parseFloat(Number(num).toFixed(2)));

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
  const filePath = "/tmp/flashcards.json";
  fs.writeFileSync(filePath, JSON.stringify(flashcardsJSON, null, 2));

  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });
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
        mergedMessage.content += "\n~~~~~~~~\n" + (message?.content || "").trim();
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

const concatenateParagraphs = (paragraphs: any) => {
  let pText = "";
  for (let paragraph of paragraphs) {
    pText += `${paragraph.text}\n\n`;
  }
  return pText;
};

const getInteractedParagraphs = (paragraphs: any, ids: string[]) => {
  return paragraphs.filter((p: { ids: string[] }) => ids.includes(p.ids[0]));
};
const getExposedParagraphs = (concepts: any, exposedCardsIds: string[]) => {
  let ids: string[] = [];
  console.log(concepts);
  for (let id of exposedCardsIds) {
    const concept = concepts.find((c: any) => c?.id === id);
    ids = [...ids, ...concept.paragraphs];
  }
  return Array.from(new Set(ids));
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
  Only generate a JSON response with this structure: {"deviating_topic": Is the student's last message about a topic different from the topic of conversation with the tutor? Only answer "Yes" or "No", "deviating_evidence": "Your reasoning for why you think the student's last message is about a topic different from the topic of conversation with the tutor}`;
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
Only generate a JSON response with this structure: {"deviating_topic": Is the tutor's last message indicating that the student was deviating from the topic of conversation with the tutor? Only answer "Yes" or "No", "deviating_evidence": "Your reasoning for why you think the tutor's last message indicates that the student was deviating from the topic of conversation with the tutor}`;
  }
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
  console.log(response);
  return !!response && response.deviating_topic.toLowerCase() === "yes";
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

const getChapterRelatedToResponse = async (message: string) => {
  try {
    const units: { [key: string]: string } = {
      "01": "Prosperity, inequality, and planetary limits",
      "02": "Technology and incentives",
      "03": "Doing the best you can: Scarcity, wellbeing, and working hours",
      "04": "Strategic interactions and social dilemmas",
      "05": "The rules of the game: Who gets what and why",
      "06": "The firm and its employees",
      "07": "The firm and its customers",
      "08": "Supply and demand: Markets with many buyers and sellers",
      "09": "Lenders and borrowers and differences in wealth",
      "10": "Market successes and failures: The societal effects of private decisions",
    };
    const chaptersBookDocs = await db.collection("chaptersBook").where("chapter", "in", ["01", "02", "03", "04"]).get();
    const chaptersMap: { chapter: string; subchapters: string[] }[] = [];
    for (let chapterDoc of chaptersBookDocs.docs) {
      const chapterData = chapterDoc.data();
      const chapterIdx = chaptersMap.findIndex(c => c.chapter === units[chapterData.chapter]);
      if (chapterIdx !== -1) {
        chaptersMap[chapterIdx].subchapters.push(chapterData.sectionTitle);
      } else {
        chaptersMap.push({
          chapter: units[chapterData.chapter],
          subchapters: [chapterData.sectionTitle],
        });
      }
    }
    const prompt = `
    You are an expert on [the Economy].
    The following is the table of contents, including the titles of chapters and sub-chapters within the book [the Economy]:
    ${JSON.stringify(chaptersMap)}
    The user asks you a question and you should respond an array of strings ["____", "____", ...] of  the titles of the sub-sections of the book the user should study to learn the answer to their question.`;
    const response = await sendGPTPrompt("gpt-4-turbo-preview", [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: message,
      },
    ]);
    console.log(response);
    if (response) {
      const sections = JSON.parse(response);
      const paragraphs = [];
      let allParagraphs: any = [];
      for (let section of sections) {
        const chaptersBookDocs = await db.collection("chaptersBook").where("sectionTitle", "==", section).get();

        const chapterDoc = chaptersBookDocs.docs[0];
        const chapterData = chapterDoc.data();
        const _paragraphs: any = [];
        chapterData.paragraphs.map((p: any) => _paragraphs.push(p.text));
        allParagraphs = [...allParagraphs, ...chapterData.paragraphs];
        paragraphs.push({
          section,
          paragraphs: _paragraphs,
        });
      }
      console.log("paragraphs.length", paragraphs.length);
      return { paragraphs, allParagraphs, sections };
    }

    return {
      allParagraphs: [],
      paragraphs: [],
    };
  } catch (error) {
    console.log(error);
  }
};
const extractFlashcards = async (response: string, chaptersParagraphs: any, sections: string[], uname: string) => {
  const responseJson = JSON.parse(response);
  let pIds: string[] = [];
  responseJson.paragraphs.map((p: string) => {
    const pIdx = chaptersParagraphs.findIndex((_p: any) => _p.text === p);
    if (pIdx !== -1) pIds = [...pIds, ...chaptersParagraphs[pIdx].ids];
  });
  const flashcardsDocs = await db
    .collection("flashcards")
    .where("paragraphs", "array-contains-any", pIds)
    .where("instructor", "==", uname)
    .where("sectionTitle", "in", sections)
    .get();
  const concepts = [];
  for (let flashcardDoc of flashcardsDocs.docs) {
    const flashcardData = flashcardDoc.data();
    concepts.push({ ...flashcardData, cardId: flashcardDoc.id });
    addScoreToSavedCard(0, flashcardDoc.id, uname, false);
  }
  return concepts;
};

const checkIfTheMessageIsRelevant = async (messages: any, courseName: string) => {
  console.log("checkIfTheMessageIsRelevant");
  let _messages = [...messages];
  _messages.pop();
  const lastMessage = _messages.pop();
  _messages = _messages.filter((m: any) => m.role !== "system");

  const deviatingPrompt = `
    The following is a conversation between a student and a tutor:
    '''
    ${generateListMessagesText(_messages)}
    '''
    The student just responded:
    '''
    ${lastMessage.content}
    '''
    Is the student's message relevant to ${courseName}? Your response should be only a JSON object with this structure {"reason": "Your reasoning for why you think it is relevant/irrelevant.", "relevant": "Yes" if it is relevant, "No": if it is irrelevant}`;
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

  return !!response && response.relevant.toLowerCase() === "yes";
};
