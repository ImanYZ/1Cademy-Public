import { firestore } from "firebase-admin";

import { db } from ".";

const getBestOf = (data: { [key: string]: number }) => {
  const items = Object.keys(data).map(key => [key, data[key]]);
  items.sort((first, second) => (second[1] as number) - (first[1] as number));
  const keys = items.map(el => el[0]);
  return keys.slice(0, 10);
};

const mostImportantOnes = async () => {
  const users: { [key: string]: number } = {};
  const institutions: { [key: string]: number } = {};
  const tags: { [key: string]: number } = {};

  const nodesDocs = await db.collection("nodes").get();
  nodesDocs.forEach(doc => {
    const data = doc.data();
    const contribNames = (data.contribNames || []) as string[];
    for (let contributor of contribNames) {
      users[contributor] = (users[contributor] || 0) + 1;
    }
    const institNames = (data.institNames || []) as string[];
    for (let institution of institNames) {
      institutions[institution] = (institutions[institution] || 0) + 1;
    }

    const isTag = data.isTag || false;
    if (isTag) {
      tags[data.title] = (tags[data.title] || 0) + 1;
    }
  });
  const bestTags = getBestOf(tags);
  const bestContributors = getBestOf(users);
  const bestInstitutions = getBestOf(institutions);
  console.log("bestContributors", bestContributors);
  console.log("bestInstitutions", bestInstitutions);
  console.log("bestTags", bestTags);
};

export const getBestContributors = async () => {
  const users = [
    "elijah-fox",
    "1man",
    "winnifer",
    "Grae",
    "brk1112",
    "Shabana L. Gupta",
    "ybroderson",
    "Clouds of Dawn",
    "Nini",
    "Carlaschwartz"
  ];
  const usersDocs = await db.collection("users").where(firestore.FieldPath.documentId(), "in", users).get();
  const defaultUsers = [] as any;
  usersDocs.forEach(doc => {
    const data = doc.data();
    defaultUsers.push({ id: doc.id, name: `${data.fName || ""} ${data.lName || ""}`, imageUrl: data.imageUrl });
  });
  console.log("Best contributors", defaultUsers);
};

export const getBestInstitutions = async () => {
  const institutions = [
    "University of Michigan - Ann Arbor",
    "Smith College",
    "Michigan State University",
    "Ohio State University, Columbus",
    "San Jose State University",
    "University of California, Davis",
    "University of Michigan",
    "Rutgers University, Newark",
    "Grinnell College",
    "University of California, Berkeley"
  ];
  const docs = await db.collection("institutions").where("name", "in", institutions).get();
  const response = [] as any;
  docs.forEach(doc => {
    const data = doc.data();
    response.push({ id: doc.id, name: data.name, imageUrl: data.logoURL });
  });
  console.log("bestIntitutions", response);
};

// getBestContributors()
//   .then(() => console.log("Done getting best contributors"))
//   .catch(err => console.log({ err }));

getBestInstitutions()
  .then(() => console.log("Done getting best institutions"))
  .catch(err => console.log({ err }));

mostImportantOnes()
  .then(() => {
    console.log("done");
  })
  .catch(err => {
    console.log("err", err);
  });
