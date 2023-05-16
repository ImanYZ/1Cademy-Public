import { NARRATE_WORKER_TERMINATED } from "@/lib/utils/constants";
import { TVoiceAssistantRef } from "src/nodeBookTypes";
import { INarrateWorkerMessage } from "src/types/IAssistant";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";

export const firstWeekMonthDays = (thisDate?: any) => {
  let today = new Date();
  if (thisDate) {
    today = new Date(thisDate.getTime());
  }
  let theDay = today;
  // daysDiff gives us the first day of the week
  const daysDiff = theDay.getDate() - theDay.getDay();
  let firstWeekDay: any = new Date(theDay.setDate(daysDiff));
  firstWeekDay = firstWeekDay.getMonth() + 1 + "-" + firstWeekDay.getDate() + "-" + firstWeekDay.getFullYear();
  theDay = today;
  let firstMonthDay = theDay.getMonth() + 1 + "-" + 1 + "-" + theDay.getFullYear();
  return { firstWeekDay, firstMonthDay };
};

export const MIN_ACCEPTED_VERSION_POINT_WEIGHT = 0.1;

export type DetachCallback = () => Promise<void>;

// we defined it like this because, we need to control behaviour of this in tests
// maybe we implement queues from it in future
export const detach = async (callback: DetachCallback) => {
  setImmediate(callback);
};

export const doNeedToDeleteNode = (corrects: number, wrongs: number, locked: boolean = false) => {
  return corrects < wrongs && !locked;
};

export const isVersionApproved = ({ corrects, wrongs, nodeData }: any) => {
  try {
    if (nodeData?.locked) return false; // if node is locked, new versions can't be accepted
    const nodeRating = nodeData.corrects - nodeData.wrongs;
    const versionRating = corrects - wrongs;
    if (versionRating >= nodeRating / 2) {
      return nodeData;
    }
    return false;
  } catch (err) {
    console.error(err);
    return err;
  }
};

export const getNodeTypesFromNode = (nodeData: INode): INodeType[] => {
  const _nodeTypes: INodeType[] = nodeData.nodeTypes || [];
  _nodeTypes.push(nodeData.nodeType);
  return Array.from(new Set(_nodeTypes));
};

// speechSynthesis works only with 100 characters
export const narrateLargeTexts = async (message: string) => {
  const messages = message.split(".");
  // const messages = ["hi everyone", "good morning"];
  console.log("narrateLargeTexts", messages);
  for (const messageItem of messages) {
    await narrateText2(messageItem);
  }
  // (messages.map(c => async () => await narrateText2(c)) as (() => Promise<void>)[]).reduce(
  //   (p, fn) => p.then(fn),
  //   Promise.resolve()
  // );

  // return await Promise.all(messages.map(async cur => await narrateText2(cur)));
};

export const narrateText2 = async (message: string) => {
  return new Promise(resolve => {
    const speech = new SpeechSynthesisUtterance(message);
    // window.speechSynthesis.cancel();
    speech.addEventListener("end", event => {
      resolve(true);
    });
    window.speechSynthesis.speak(speech);
  });
};

export const narrateText = async (message: SpeechSynthesisUtterance) => {
  return new Promise(resolve => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(message);
    // e: SpeechSynthesisEvent
    const endListener = () => {
      message.removeEventListener("end", endListener);
      resolve(true);
    };
    message.addEventListener("end", endListener);
  });
};
