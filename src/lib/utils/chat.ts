export const generateChannelName = (members: any, user: any) => {
  const name = [];
  for (let mId in members) {
    if (name.length === 2) {
      name.push(` ...`);
      break;
    }
    if (Object.keys(members).length === 1) {
      name.push(members[mId].fullname);
      break;
    }

    if (mId !== user?.uname) name.push((name.length > 0 ? ", " : "") + members[mId].fullname);
  }
  return name.join("");
};
