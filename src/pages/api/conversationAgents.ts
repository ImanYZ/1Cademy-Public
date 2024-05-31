import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./openAI/helpers";
import { MODEL } from "@/lib/utils/constants";
import fbAuth from "src/middlewares/fbAuth";
import { db } from "@/lib/firestoreServer/admin";

export const fetchCompilation = async (res: NextApiResponse, threadId: string, assistant_id: string) => {
  let completeMessage = "";
  return new Promise(async (resolve, reject) => {
    await openai.beta.threads.runs
      .stream(threadId, {
        assistant_id,
      })
      .on("textDelta", (textDelta: any, snapshot: any) => {
        //   console.log(textDelta.value);
        res.write(textDelta.value);
        completeMessage += textDelta.value;
        // process.stdout.write(textDelta.value);
      })
      .on("end", () => {
        resolve(completeMessage);
      });
  });
};

const createAssistant = async (instructions: string, name: string, uname: string) => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
  });
  const findAssistantIdx = myAssistants.data.findIndex(
    (assistant: any) => assistant.name === name && assistant.metadata.uname === uname
  );
  if (findAssistantIdx !== -1) {
    console.log("Assistant found");
    const assistantId = myAssistants.data[findAssistantIdx].id;
    await openai.beta.assistants.update(assistantId, {
      instructions,
    });
    return myAssistants.data[findAssistantIdx].id;
  } else {
    //create a new Assistant
    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      tools: [{ type: "code_interpreter" }],
      model: MODEL,
      metadata: { uname },
    });
    return assistant.id;
  }
};
const getThreadsIds = async (conversationId: string): Promise<any> => {
  try {
    const conversationDoc = await db.collection("tutorConversations").doc(conversationId).get();
    const conversationData: any = conversationDoc.data();
    let { threadId1, threadId2 } = conversationData;
    if (!threadId1 || !threadId2) {
      console.log("threads not found");
      threadId1 = (await openai.beta.threads.create()).id;
      threadId2 = (await openai.beta.threads.create()).id;
    }
    conversationDoc.ref.update({
      threadId1,
      threadId2,
    });
    return { steveThreadId: threadId1, katyThreadId: threadId2 };
  } catch (error) {
    console.log(error);
  }
};
const getInstructions = (instructor: string, course: string, fName: string, concept: any, reaction: string) => {
  const conversationType = reaction === "Debatable" ? "debate" : "conversation";
  const otherInstructor = instructor === "Steve" ? "Katy" : "Steve";
  return `
    You are ${instructor}, an instructor of the course "${course}".
    You are having a ${conversationType} with ${otherInstructor}, the other instructor, and ${fName}, a student, about one of the topics covered in the course.
    The topic of your ${conversationType} is "${concept.title}".
    A brief description of this topic is: "${concept.content}".
    Your messages should be very concise and informative. Do not write more than 4 sentences.
    Your objective is to motivate ${fName} to engage in the ${conversationType} and learn more about the topic.
    You can also provide additional information to help ${fName} understand the topic better.
    ${fName} thinks this topic is ${reaction}, but may decide not to participate in the ${conversationType} or join it late. Do not assume any message from ${fName} and do not send any message on ${fName} 's behalf. If ${fName} sends a message, you would see it in the thread of ${conversationType}.
    You should start every one of your messages with your name and a colon, like this: ${instructor}: Hello, how are you?
    ${otherInstructor} and ${fName} would also start their messages with their names and a colon, like this: ${fName}: Hello, how are you?
    Each message should be only from one single person (instructor or student).`;
};
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fName, uname } = req.body?.data?.user?.userData;
    const { concept, course, images, lastMessage, conversationId, reaction } = req.body;
    console.log("concept=>", { concept, course, images, lastMessage, conversationId, reaction });
    const instructionsSteve = concept ? getInstructions("Steve", course, fName, concept, reaction) : "";
    const instructionsKaty = concept ? getInstructions("Katy", course, fName, concept, reaction) : "";
    //===

    //
    const { steveThreadId, katyThreadId } = await getThreadsIds(conversationId);
    console.log("lastMessage==>", lastMessage);
    let threadId = steveThreadId;
    console.log("lastMessage.name ===>", lastMessage.name);
    if (lastMessage.name.toLowerCase() === "steve") {
      threadId = katyThreadId;
      if (lastMessage.content) {
        if (lastMessage.role === "user") {
          await openai.beta.threads.messages.create(katyThreadId, {
            role: "user",
            content: `${fName}: ` + lastMessage.content,
          });
        } else {
          await openai.beta.threads.messages.create(katyThreadId, {
            role: "assistant",
            content: "Steve: " + lastMessage.content,
          });
        }
      }
    } else if (!!(lastMessage.content || "").trim()) {
      if (lastMessage.role === "user") {
        await openai.beta.threads.messages.create(steveThreadId, {
          role: "user",
          content: `${fName}: ` + lastMessage.content,
        });
      } else {
        await openai.beta.threads.messages.create(steveThreadId, {
          role: "assistant",
          content: "Katy: " + lastMessage.content,
        });
      }
    }
    const assistantJohnId = await createAssistant(instructionsSteve, "Steve", uname);
    const assistantMaryId = await createAssistant(instructionsKaty, "Katy", uname);
    const assistantId = lastMessage.name === "Steve" ? assistantMaryId : assistantJohnId;
    await fetchCompilation(res, threadId, assistantId);
    res.end();
  } catch (error) {
    console.log(error);
  }
}

export default fbAuth(handler);
