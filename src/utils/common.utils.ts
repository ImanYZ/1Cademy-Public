import { db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { IActionTrack } from "src/types/IActionTrack";
import { IUser } from "src/types/IUser";

export const roundNum = (num: any) => Number(Number.parseFloat(Number(num).toFixed(2)));

type CreateActionTrackArgs = Partial<Pick<IActionTrack, "accepted" | "type" | "action" | "nodeId" | "receivers">> & {
  userData: IUser;
};
export const createActionTrack = async ({ userData, ...actionTrackProps }: CreateActionTrackArgs) => {
  const actionRef = db.collection("actionTracks").doc();
  return actionRef.create({
    imageUrl: userData.imageUrl,
    createdAt: Timestamp.now(),
    doer: userData.uname,
    chooseUname: userData.chooseUname,
    fullname: `${userData.fName} ${userData.lName}`,
    email: userData.email,
    ...actionTrackProps,
  } as IActionTrack);
};
