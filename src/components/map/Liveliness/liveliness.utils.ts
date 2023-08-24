import { ActionsTracksChange } from "src/client/firestore/actionTracks.firestore";
import { ActionTrackType } from "src/knowledgeTypes";
import { IActionTrack } from "src/types/IActionTrack";

export type UserInteraction = {
  id: string;
  reputation: "Gain" | "Loss" | null;
  imageUrl: string;
  chooseUname: boolean;
  fullname: string;
  count: number;
  actions: ActionTrackType[];
  email?: string;
};

export type UserInteractions = {
  [uname: string]: UserInteraction;
};

export type UserInteractionData = UserInteraction & { uname: string };

export type SynchronizeActionTracksFunction = (
  prevUserInteractions: UserInteractions,
  actionTrackChange: ActionsTracksChange
) => UserInteractions;

export const synchronizeInteractions: SynchronizeActionTracksFunction = (
  prevUserInteractions,
  actionTrackChange
  // authEmail
) => {
  const docType = actionTrackChange.type;
  const curData = actionTrackChange.data as IActionTrack & { id: string };

  if (docType === "added") {
    if (!prevUserInteractions.hasOwnProperty(curData.doer)) {
      prevUserInteractions[curData.doer] = {
        id: curData.id,
        imageUrl: curData.imageUrl,
        chooseUname: curData.chooseUname,
        fullname: curData.fullname,
        count: 0,
        actions: [],
        reputation: null,
        // email: authEmail === "oneweb@umich.edu" ? curData.email : "",
      };
    }
    if (curData.type === "NodeVote") {
      if (curData.action !== "CorrectRM" && curData.action !== "WrongRM") {
        prevUserInteractions[curData.doer].actions.push(curData.action as ActionTrackType);
        prevUserInteractions[curData.doer].count += 1;
        for (const receiver of curData.receivers) {
          if (prevUserInteractions.hasOwnProperty(receiver)) {
            prevUserInteractions[receiver].reputation = curData.action === "Correct" ? "Gain" : "Loss";
          }
        }
      }
    } else if (curData.type === "RateVersion") {
      if (curData.action.includes("Correct-") || curData.action.includes("Wrong-")) {
        const currentAction: ActionTrackType = curData.action.includes("Correct-") ? "Correct" : "Wrong";
        prevUserInteractions[curData.doer].actions.push(currentAction);
        prevUserInteractions[curData.doer].count += 1;
        for (const receiver of curData.receivers) {
          if (prevUserInteractions.hasOwnProperty(receiver)) {
            prevUserInteractions[receiver].reputation = currentAction === "Correct" ? "Gain" : "Loss";
          }
        }
      }
    } else {
      prevUserInteractions[curData.doer].actions.push(curData.type as ActionTrackType);
      prevUserInteractions[curData.doer].count += 1;
    }
  }
  if (docType === "modified") {
    prevUserInteractions[curData.doer].imageUrl = curData.imageUrl;
    prevUserInteractions[curData.doer].fullname = curData.fullname;
  }

  if (docType === "removed") {
    prevUserInteractions[curData.doer].count -= 1;
    if (prevUserInteractions[curData.doer].count <= 0) delete prevUserInteractions[curData.doer];
  }
  console.log({ prevUserInteractions });
  return prevUserInteractions;
};

export const synchronizeReputations: SynchronizeActionTracksFunction = (prevUserInteractions, actionTrackChange) => {
  const docType = actionTrackChange.type;
  const curData = actionTrackChange.data as IActionTrack & { id: string };

  curData.receivers.forEach(receiverData => {
    const index = curData.receivers.indexOf(receiverData);

    if (docType === "added") {
      if (!prevUserInteractions.hasOwnProperty(receiverData)) {
        prevUserInteractions[receiverData] = {
          id: curData.id,
          imageUrl: curData.imageUrl,
          chooseUname: curData.chooseUname,
          fullname: curData.fullname,
          count: 0,
          actions: [],
          reputation: null,
        };
      }
      if (curData.type === "NodeVote") {
        if (curData.action !== "CorrectRM" && curData.action !== "WrongRM") {
          prevUserInteractions[receiverData].actions.push(curData.action as ActionTrackType);
          prevUserInteractions[receiverData].count += curData.receiverPoints
            ? Number(curData.receiverPoints[index])
            : 0;
          for (const receiver of curData.receivers) {
            if (prevUserInteractions.hasOwnProperty(receiver)) {
              prevUserInteractions[receiver].reputation = curData.action === "Correct" ? "Gain" : "Loss";
            }
          }
        }
      } else if (curData.type === "RateVersion") {
        if (curData.action.includes("Correct-") || curData.action.includes("Wrong-")) {
          const currentAction: ActionTrackType = curData.action.includes("Correct-") ? "Correct" : "Wrong";
          prevUserInteractions[receiverData].actions.push(currentAction);
          prevUserInteractions[receiverData].count += curData.action.includes("Correct-") ? 1 : -1;
          if (prevUserInteractions[receiverData].count < 0) {
            prevUserInteractions[receiverData].count = 0;
          }
          for (const receiver of curData.receivers) {
            if (prevUserInteractions.hasOwnProperty(receiver)) {
              prevUserInteractions[receiver].reputation = currentAction === "Correct" ? "Gain" : "Loss";
            }
          }
        }
      }
    }

    if (docType === "removed") {
      if (prevUserInteractions.hasOwnProperty(receiverData)) {
        prevUserInteractions[receiverData].count -= 1;
        if (prevUserInteractions[receiverData].count <= 0) {
          delete prevUserInteractions[receiverData];
        }
      }
    }
  });

  return prevUserInteractions;
};

type GetUsersAboveInput = { usersInteractionsSortedArray: UserInteractionData[]; uname: string };

/**
 * usersInteractionsSortedArray: ascendant sorted array by count property
 */
export const getUsersAbove = ({ usersInteractionsSortedArray, uname }: GetUsersAboveInput) => {
  const userIndex = usersInteractionsSortedArray.findIndex(c => c.uname === uname);
  if (userIndex < 0) return usersInteractionsSortedArray;
  console.log({ usersInteractionsSortedArray, userIndex, uname });
  return usersInteractionsSortedArray.slice(userIndex + 1, userIndex + 4);
};

type GetUsersBellowInput = { usersInteractionsSortedArray: UserInteractionData[]; uname: string };

/**
 * usersInteractionsSortedArray: ascendant sorted array by count property
 */
export const getUsersBellow = ({ usersInteractionsSortedArray, uname }: GetUsersBellowInput) => {
  const userIndex = usersInteractionsSortedArray.findIndex(c => c.uname === uname);
  if (userIndex < 0) return [];
  return usersInteractionsSortedArray.slice(Math.max(userIndex - 3, 0), userIndex);
};

type NumberOfUsersNoVisibleAboveInput = { uname: string; usersInteractionsSortedArray: UserInteractionData[] };

export const getNumberOfUsersNoVisibleAbove = ({
  uname,
  usersInteractionsSortedArray,
}: NumberOfUsersNoVisibleAboveInput) => {
  const index = usersInteractionsSortedArray.findIndex(c => c.uname === uname);
  return Math.max(usersInteractionsSortedArray.length - (index + 4), 0);
};

type NumberOfUsersNoVisibleBellowInput = { uname: string; usersInteractionsSortedArray: UserInteractionData[] };

export const getNumberOfUsersNoVisibleBellow = ({
  uname,
  usersInteractionsSortedArray,
}: NumberOfUsersNoVisibleBellowInput) => {
  const index = usersInteractionsSortedArray.findIndex(c => c.uname === uname);
  return Math.max(index - 3, 0);
};

export type RelativeLivelinessTypes = "relativeInteractions" | "relativeReputations";
export type AbsoluteLivelinessTypes = "absoluteInteractions" | "absoluteReputations";

export const SYNCHRONIZE_RELATIVE: {
  [key in RelativeLivelinessTypes]: { id: string; name: string; fn: SynchronizeActionTracksFunction };
} = {
  relativeInteractions: {
    id: "relative-interaction-live-bar",
    name: "relative interaction liveliness bar",
    fn: synchronizeInteractions,
  },
  relativeReputations: {
    id: "relative-reputation-live-bar",
    name: "relative reputation liveliness bar",
    fn: synchronizeReputations,
  },
};

export const SYNCHRONIZE_ABSOLUTE: {
  [key in AbsoluteLivelinessTypes]: { id: string; name: string; fn: SynchronizeActionTracksFunction };
} = {
  absoluteInteractions: {
    id: "absolute-interaction-live-bar",
    name: "absolute interaction liveliness bar",
    fn: synchronizeInteractions,
  },
  absoluteReputations: {
    id: "absolute-reputation-live-bar",
    name: "absolute reputation liveliness bar",
    fn: synchronizeReputations,
  },
};

type CalculateVerticalPositionWithLogarithmInput = {
  data: UserInteractionData[];
  minHeight?: number;
  height: number;
};

export type UserInteractionDataProcessed = UserInteractionData & {
  positionY: number;
};

const getVerticalPosition = (item: UserInteractionData, minCount: number, range: number, height: number): number => {
  const relativeCount = item.count - minCount;
  if (relativeCount <= 0) return 0;

  const countInScale = (relativeCount * 10) / range; // between 0 to 10, to use with log10
  const logarithm = Math.abs(Math.log10(countInScale));
  const positionY = countInScale ? Math.floor(logarithm * height) : 0;
  return positionY;
};

export const calculateVerticalPositionWithLogarithm = ({
  data,
  height,
}: CalculateVerticalPositionWithLogarithmInput): UserInteractionDataProcessed[] => {
  const minCountTmp = Math.min(...data.map(item => (item.count > 0 ? item.count : 0)));
  const maxCount = Math.max(...data.map(item => item.count));
  const minCount = minCountTmp === maxCount ? 0 : minCountTmp;
  const range = maxCount - minCount;

  return data.map(item => {
    const positionY = getVerticalPosition(item, minCount, range, height);
    console.log("all", { count: item.count, positionY });
    return { ...item, positionY };
  });
};
