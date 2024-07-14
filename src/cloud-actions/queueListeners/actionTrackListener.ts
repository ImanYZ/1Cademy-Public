import { IActionTrack } from "src/types/IActionTrack";
import { IUser } from "src/types/IUser";
import { createActionTrack } from "src/utils/common.utils";

import { db } from "@/lib/firestoreServer/admin";

type Args = {
  uname: string;
} & Partial<IActionTrack>;

export const actionTrackListener = async ({ uname, ...actionTrackProps }: Args) => {
  const user = await db.collection("users").doc(uname).get();
  const userData = user.data() as IUser;
  await createActionTrack({
    userData,
    ...actionTrackProps,
  });
};
