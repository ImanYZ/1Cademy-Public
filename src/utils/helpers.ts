import { NARRATE_WORKER_TERMINATED } from "@/lib/utils/constants";
import { resolve } from "path";
import { VoiceAssistant } from "src/nodeBookTypes";
import { INarrateWorkerMessage } from "src/types/IAssistant";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";
import { splitSentenceIntoChunks } from "../lib/utils/string.utils";
import { delay } from "../lib/utils/utils";
import { diffChars } from "diff";

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

/**
 * speechSynthesis works only with 100 characters
 * message will be splitted by .
 */
export const narrateLargeTexts = (message: string) => {
  const id = Math.round(Math.random() * 999);
  const controller = new AbortController();
  const signal = controller.signal;

  const narratorPromise = () =>
    new Promise<boolean>(async resolve => {
      console.log("narrateLargeTexts:", message, id);
      // const messages = message.split(".");

      const maxCharacters = 99;
      const messages = message
        .split(/[.,]/)
        .reduce(
          (a: string[], c) => (c.length <= maxCharacters ? [...a, c] : [...a, ...splitSentenceIntoChunks(c)]),
          []
        );
      console.log({ messages }, id);
      let googleVoice: any;
      let tries = 0;
      while (tries < 10 && !googleVoice) {
        tries++;
        let voices = speechSynthesis.getVoices();
        googleVoice = voices.find(voice => voice.name.includes("Google US English"));
        await delay(100);
      }
      messages.forEach(messageItem => {
        const speech = new SpeechSynthesisUtterance(messageItem);
        console.log("VoiceFound:" + googleVoice ? "YES" : "NOE");
        if (googleVoice) speech.voice = googleVoice;
        window.speechSynthesis.speak(speech);
      });
      console.log("loop", id);
      let isNarrating = window.speechSynthesis.pending || window.speechSynthesis.speaking;
      const intervalId = setInterval(() => {
        isNarrating = window.speechSynthesis.pending || window.speechSynthesis.speaking;
        console.log({ pending: window.speechSynthesis.pending, speaking: window.speechSynthesis.speaking }, id);
        if (!isNarrating) {
          clearInterval(intervalId);
          console.log("will resolve", id);
          resolve(true);
        }
      }, 500);

      signal.addEventListener("abort", () => {
        // clearTimeout(timeoutId);
        // reject(new Error("Promise aborted"));
        console.log("abort", isNarrating, id);
        // isNarrating = false;
        clearInterval(intervalId);
        resolve(false);
      });
    }); /* as Promise<boolean> & { abort: () => void }; */

  // promise.abort = () => controller.abort();

  // return promise;
  return { narratorPromise, abortPromise: () => controller.abort() };
};

export const narrateText = async (message: string) => {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      window.speechSynthesis.cancel();
      resolve(true);
    }, 10000);
    const speech = new SpeechSynthesisUtterance(message);
    speech.addEventListener("end", () => {
      clearTimeout(timeout);
      resolve(true);
    });

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  });
};

export const showDifferences = (oldText: string, proposalText: string): string => {
  const diffContent = diffChars(oldText, proposalText);
  let newText = "";
  diffContent.forEach((part: any) => {
    const color = part.added ? "green" : part.removed ? "red" : "gray";

    if (part.removed) {
      newText += `<del style="color: ${color}; text-decoration: line-through; text-decoration-color: black;">${part.value}</del>`;
    } else {
      newText += `<span style="color: ${color}">${part.value}</span>`;
    }
  });
  return newText;
};

export const childrenParentsDifferences = (current: any[], proposal: any[]): any => {
  // console.log({ current, proposal });
  const added = proposal.filter((c: any) => !current.find((cp: any) => c.node === cp.node));
  added.forEach((c: any) => {
    c.added = true;
  });
  const _current = [...current, ...added];

  for (let c of _current) {
    if (!proposal.find((cp: any) => c.node === cp.node)) {
      c.removed = true;
    }
  }

  return _current;
};

export const tagsRefDifferences = (current: any, proposal: any): any => {
  const removed = current.filter((t: any) => !proposal.includes(t));
  const added = proposal.filter((t: any) => !current.includes(t));
  return { added, removed };
};
