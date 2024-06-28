import { NARRATE_WORKER_TERMINATED } from "@/lib/utils/constants";
import { resolve } from "path";
import { VoiceAssistant } from "src/nodeBookTypes";
import { INarrateWorkerMessage } from "src/types/IAssistant";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";
import { splitSentenceIntoChunks } from "../lib/utils/string.utils";
import { delay } from "../lib/utils/utils";
import { diffChars } from "diff";
import { ISemester } from "src/types/ICourse";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firestoreClient/firestoreClient.config";
import { arrayToChunks } from "./arrayToChunks";
import { IUserNode } from "src/types/IUserNode";
import { USER_VERSIONS, getTypedCollections } from "./getTypedCollections";
import { IUserNodeVersion } from "src/types/IUserNodeVersion";

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

export const doNeedToDeleteNode = (
  corrects: number,
  wrongs: number,
  locked: boolean = false,
  instantDelete: boolean,
  isInstructor: boolean
) => {
  return ((isInstructor && instantDelete) || corrects < wrongs) && !locked;
};

export const isVersionApproved = ({
  corrects,
  wrongs,
  nodeData,
  instantApprove,
  isInstructor,
}: {
  corrects: any;
  wrongs: any;
  nodeData: any;
  instantApprove: boolean;
  isInstructor: boolean;
}): boolean => {
  try {
    if (nodeData?.locked) return false; // if node is locked, new versions can't be accepted
    const nodeRating = nodeData.corrects - nodeData.wrongs;
    const versionRating = corrects - wrongs;
    return (isInstructor && instantApprove) || versionRating >= nodeRating / 2;
  } catch (err) {
    console.error(err);
    return false;
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
  const removed = current.filter((t: any) => !proposal.some(cp => cp.node === t.node));
  const added = proposal.filter((t: any) => !current.some(cp => cp.node === t.node));
  return { added, removed };
};

export const tagsRefDifferences = (current: any, proposal: any): any => {
  const removed = current.filter((t: any) => !proposal.includes(t));
  const added = proposal.filter((t: any) => !current.includes(t));
  return { added, removed };
};
export const getSemestersByIds = async (semesterIds: string[]) => {
  const semestersByIds: {
    [semesterId: string]: ISemester;
  } = {};

  const semesterIdsChunks = arrayToChunks(Array.from(new Set(semesterIds)), 30);
  for (const semesterIds of semesterIdsChunks) {
    const semesters = await getDocs(query(collection(db, "semesters"), where("__name__", "in", semesterIds)));
    for (const semester of semesters.docs) {
      semestersByIds[semester.id] = semester.data() as ISemester;
    }
  }

  return semestersByIds;
};

export const checkInstantDeleteForNode = async (
  tagIds: string[],
  uname: string,
  nodeId: string
): Promise<{ instantDelete: boolean; isInstructor: boolean; courseExist: boolean }> => {
  const semestersByIds = await getSemestersByIds(tagIds);

  let isInstructor = false;
  const instructorDocs = await getDocs(query(collection(db, "instructors"), where("uname", "==", uname)));

  if (instructorDocs.docs.length > 0) {
    isInstructor = true;
  }

  if (!Object.keys(semestersByIds).length) {
    return {
      isInstructor,
      courseExist: false,
      instantDelete: true,
    };
  }
  const userNodes = await getDocs(query(collection(db, "userNodes"), where("node", "==", nodeId)));

  const instructorVotes: {
    [uname: string]: boolean;
  } = {};

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    semester.instructors.forEach(instructor => (instructorVotes[instructor] = false));
  }

  instructorVotes[uname] = true;

  for (const userNode of userNodes.docs) {
    const userNodeData = userNode.data() as IUserNode;
    if (instructorVotes.hasOwnProperty(userNodeData.user) && userNodeData.wrong) {
      instructorVotes[userNodeData.user] = true;
    }
  }

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    if (!semester.instructors.some(instructor => instructorVotes[instructor])) {
      return {
        isInstructor,
        courseExist: true,
        instantDelete: false,
      };
    }
  }
  return {
    courseExist: true,
    instantDelete: true,
    isInstructor,
  };
};

export const checkInstantApprovalForProposalVote = async (nodeId: string, uname: string, versionId: string) => {
  const nodeDoc = await getDoc(doc(db, "nodes", nodeId));
  const tagIds = nodeDoc.data()?.tagIds;
  const semestersByIds = await getSemestersByIds(tagIds);

  let isInstructor = false;
  const instructorDocs = await getDocs(query(collection(db, "instructors"), where("uname", "==", uname)));

  if (instructorDocs.docs.length > 0) {
    isInstructor = true;
  }

  if (!Object.keys(semestersByIds).length) {
    return {
      isInstructor,
      courseExist: false,
      instantApprove: true,
    };
  }

  const userVersions = await getDocs(query(collection(db, "userVersions"), where("version", "==", versionId)));

  const instructorVotes: {
    [uname: string]: boolean;
  } = {};

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    semester.instructors.forEach(instructor => (instructorVotes[instructor] = false));
  }

  instructorVotes[uname] = true;

  for (const userVersion of userVersions.docs) {
    const userVersionData = userVersion.data() as IUserNodeVersion;
    if (instructorVotes.hasOwnProperty(userVersionData.user) && userVersionData.correct) {
      instructorVotes[userVersionData.user] = true;
    }
  }

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    if (!semester.instructors.some(instructor => instructorVotes[instructor])) {
      return {
        isInstructor,
        courseExist: true,
        instantApprove: false,
      };
    }
  }

  return {
    isInstructor,
    courseExist: true,
    instantApprove: true,
  };
};

//we call this function to check if an instructor is creating a new version of a node
//if yes we approve the version automatically
export const shouldInstantApprovalForProposal = async ({ tagIds, uname }: any) => {
  const semestersByIds = await getSemestersByIds(tagIds);
  let isInstructor = false;
  const instructorDocs = await getDocs(query(collection(db, "instructors"), where("uname", "==", uname)));
  if (instructorDocs.docs.length > 0) {
    isInstructor = true;
  }
  if (!Object.keys(semestersByIds).length) {
    return {
      isInstructor,
      courseExist: false,
      instantApprove: true,
    };
  }
  for (const semester of Object.values(semestersByIds)) {
    if (!semester.instructors.includes(uname)) {
      return {
        isInstructor,
        courseExist: true,
        instantApprove: false,
      };
    }
  }
  return {
    isInstructor,
    courseExist: true,
    instantApprove: true,
  };
};
