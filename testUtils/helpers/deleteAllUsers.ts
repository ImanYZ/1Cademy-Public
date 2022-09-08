import { getAuth } from "firebase-admin/auth";

import isTestEnv from "./isTest";

const deleteAllUsers = async () => {
  if (!isTestEnv()) return;

  const auth = getAuth();
  const list = await auth.listUsers();
  await auth.deleteUsers(list.users.map(u => u.uid));
};

export default deleteAllUsers;
