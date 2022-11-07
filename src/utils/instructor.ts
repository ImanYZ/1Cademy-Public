import { db } from "@/lib/firestoreServer/admin";

export const searchAvailableUnameByEmail = async (email: string) => {
  let parts = email.match(/^[^@]+/) || ["-"];
  let baseUname = parts[0].replace(/([\/\.]|__)/g, "");
  if (!(await db.collection("users").doc(baseUname).get()).exists) {
    return baseUname;
  }
  let i = 1;
  while (true) {
    let selectedUname = `${baseUname}${i}`;
    if (!(await db.collection("users").doc(selectedUname).get()).exists) {
      return selectedUname;
    }
    i++;
  }
};
