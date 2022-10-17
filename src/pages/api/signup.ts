import { getAuth } from "firebase-admin/auth";
import { Timestamp, WriteBatch } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { SignUpData } from "src/knowledgeTypes";

import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import { isEmail, isEmpty } from "@/lib/utils/utils";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";

const addPracticeQuestions = async (
  batch: WriteBatch,
  user: string,
  tagId: string,
  tag: string,
  nodeIds: string[],
  currentTimestamp: Timestamp,
  writeCounts: number
): Promise<[WriteBatch, number]> => {
  let newBatch = batch;
  let practiceRef;
  for (let nodeId of nodeIds) {
    practiceRef = db.collection("practice").doc();
    newBatch.set(practiceRef, {
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      eFactor: 2.5,
      iInterval: 0,
      lastCompleted: null,
      lastPresented: null,
      nextDate: currentTimestamp,
      node: nodeId,
      q: 0,
      tag,
      tagId,
      user,
    });
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

export const unameExists = async (uname: string) => {
  try {
    const userDoc = await db.collection("users").where("uname", "==", uname).get();
    if (userDoc.docs.length > 0) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const checkEmailInstitution = async (email: string, checkFirestore: boolean) => {
  try {
    const domainName = email.match("@(.+)$")?.[0];
    const institutionDoc = await db
      .collection("institutions")
      .where("domains", "array-contains", domainName)
      .limit(1)
      .get();
    try {
      if (checkFirestore) {
        const userDocs = await db.collection("users").where("email", "==", email).limit(1).get();
        if (userDocs.docs.length === 0) {
          throw "The user does not exist";
        }
      } else {
        await admin.auth().getUserByEmail(email);
      }
    } catch (err) {
      if (institutionDoc && institutionDoc.docs.length > 0) {
        const institutionData = institutionDoc.docs[0].data();
        return institutionData;
      }
      return "Not Found";
    }
  } catch (err) {}
  return false;
};

const validateSignupData = (data: SignUpData) => {
  const errors: string[] = [];

  if (isEmpty(data.email)) {
    errors.push("Your email address provided by your academic institutions is required.");
  } else if (!isEmail(data.email)) {
    errors.push("Please enter a valid email address.");
    // } else if (
    //   data.email.substring(data.email.length - 3, data.email.length) !== "edu"
    // ) {
    //   errors.email =
    //     "At this point, only members of academic institutions can join us. If you've enterred the email address provided by your academic institution, but you see this message, contact oneweb@umich.edu";
  }

  return {
    errors: errors.join(" "),
    valid: errors.length === 0 ? true : false,
  };
};

const initializeReputationObj = () => {
  return {
    ltermDay: 0,
    lterm: 0,
    cnCorrects: 0,
    cnWrongs: 0,
    cnInst: 0,
    cdCorrects: 0,
    cdWrongs: 0,
    cdInst: 0,
    qCorrects: 0,
    qWrongs: 0,
    qInst: 0,
    pCorrects: 0,
    pWrongs: 0,
    pInst: 0,
    sCorrects: 0,
    sWrongs: 0,
    sInst: 0,
    aCorrects: 0,
    aWrongs: 0,
    aInst: 0,
    rfCorrects: 0,
    rfWrongs: 0,
    rfInst: 0,
    nCorrects: 0,
    nWrongs: 0,
    nInst: 0,
    mCorrects: 0,
    mWrongs: 0,
    mInst: 0,
    iCorrects: 0,
    iWrongs: 0,
    iInst: 0,
    positives: 0,
    negatives: 0,
    totalPoints: 0,
    isAdmin: false,
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let writeCounts = 0;
    let batch = db.batch();
    const data = req.body.data as SignUpData;
    const tag = data.tag || "";
    const tagId = data.tagId || "";

    if (req.method !== "POST") {
      return res.status(200).end();
    }

    const { valid, errors } = validateSignupData(data);
    if (!valid) {
      return res.status(400).json({ errorMessage: errors });
    }

    const institution = await checkEmailInstitution(data.email, true);
    if (!institution) {
      return res.status(400).json({ errorMessage: "This email address is already in use" });
    }

    if (institution === "Not Found") {
      return res.status(400).json({
        errorMessage:
          "At this point, only members of academic/research institutions can join us. If you've enterred the email address provided by your academic/research institution, but you see this message, contact oneweb@umich.edu",
      });
    }

    const userAlreadyExists = await unameExists(data.uname);
    if (userAlreadyExists) {
      return res.status(400).json({ errorMessage: "This username is already in use" });
    }
    let userData, credits;
    const deCredits = 3;
    const defaultImageUrl = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";
    const userRef = db.doc(`/users/${data.uname}`);
    if ((await userRef.get()).exists) {
      return res.status(500).json({ errorMessage: "This username is already taken." });
    }
    const userRecord = await getAuth().createUser({
      email: data.email,
      displayName: data.uname,
      password: data.password,
    });
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    userData = {
      uname: data.uname,
      email: data.email,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      fName: data.fName,
      lName: data.lName,
      lang: data.lang,
      country: data.country,
      state: data.state,
      city: data.city,
      gender: data.gender,
      birthDate: admin.firestore.Timestamp.fromDate(new Date(data.birthDate || "")),
      foundFrom: data.foundFrom,
      education: data.education,
      occupation: data.occupation,
      ethnicity: data.ethnicity,
      reason: data.reason,
      imageUrl: defaultImageUrl,
      chooseUname: data.chooseUname,
      color: "#36cd96",
      clickedConsent: data.clickedConsent,
      clickedTOS: data.clickedTOS,
      clickedPP: data.clickedPP,
      clickedCP: data.clickedCP,
      blocked: false,
      deCredits,
      tag,
      tagId,
      deCourse: "SI691",
      deMajor: data.deMajor,
      deInstit: data.deInstit,
      theme: data.theme,
      background: data.background,
      practicing: false,
      userId: userRecord.uid,
      consented: data.consented,
    };

    batch.set(userRef, userData);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    const rootTitles = { r98BjyFDCe4YyLA3U8ZE: "1Cademy", [tagId]: tag };
    for (let rootId in rootTitles) {
      const reputationQuery = db
        .collection("reputations")
        .where("uname", "==", userData.uname)
        .where("tagId", "==", rootId)
        .limit(1);
      const reputationDocs = await reputationQuery.get();
      if (reputationDocs.docs.length === 0) {
        const reputations = {
          ...initializeReputationObj(),
          uname: userData.uname,
          tagId: rootId,
          tag: rootTitles[rootId],
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        };
        const reputationsRef = db.collection("reputations").doc();
        batch.set(reputationsRef, reputations);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }

      const userNodeQuery = db
        .collection("userNodes")
        .where("user", "==", userData.uname)
        .where("node", "==", rootId)
        .limit(1);
      const userNodeDocs = await userNodeQuery.get();
      let userNodeData, userNodeRef, userNodeLogRef;
      if (userNodeDocs.docs.length > 0) {
        userNodeData = userNodeDocs.docs[0].data();
        //  if for some reason userNode is deleted, or not open, or not visible, reset it
        if (userNodeData.deleted || !userNodeData.open || !userNodeData.visible) {
          userNodeRef = db.collection("userNodes").doc(userNodeDocs.docs[0].id);
          const userNodeUpdates = {
            deleted: false,
            open: true,
            visible: true,
            updatedAt: currentTimestamp,
          };
          batch.update(userNodeRef, userNodeUpdates);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          userNodeLogRef = db.collection("userNodesLog").doc();
          batch.set(userNodeLogRef, {
            ...userNodeData,
            ...userNodeUpdates,
          });
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      } else {
        //  if the userNode doesn't exist, create it
        userNodeData = {
          changed: false,
          correct: false,
          deleted: false,
          isStudied: false,
          bookmarked: false,
          node: rootId,
          open: true,
          user: userData.uname,
          visible: true,
          wrong: false,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        };
        userNodeRef = db.collection("userNodes").doc();
        batch.set(userNodeRef, userNodeData);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        userNodeLogRef = db.collection("userNodesLog").doc();
        batch.set(userNodeLogRef, userNodeData);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
    }

    const questionsRef = db
      .collection("nodes")
      .where("nodeType", "==", "Question")
      .where("tagIds", "array-contains", tagId);
    const questionsDocs = await questionsRef.get();
    const nodeIds: string[] = [];
    questionsDocs.forEach(questionDoc => {
      nodeIds.push(questionDoc.id);
    });
    [batch, writeCounts] = await addPracticeQuestions(
      batch,
      data.uname,
      tagId,
      tag,
      nodeIds,
      currentTimestamp,
      writeCounts
    );

    const notificationNumsRef = db.collection("notificationNums").doc(data.uname);
    batch.set(notificationNumsRef, { nNum: 0 });

    const pendingPropsNumsRef = db.collection("pendingPropsNums").doc();
    batch.set(pendingPropsNumsRef, {
      uname: data.uname,
      tagId,
      pNum: 0,
    });

    const bookmarkNumsRef = db.collection("bookmarkNums").doc(data.uname);
    batch.set(bookmarkNumsRef, { bNum: 0 });
    await commitBatch(batch);
    const creditsRef = db.collection("credits").where("credits", "==", deCredits).where("tagId", "==", tagId).limit(1);
    const creditsData = await creditsRef.get();

    credits = creditsData.docs[0].data();
    delete credits.createdAt;
    delete credits.credits;
    delete credits.tag;

    const resObj = initializeReputationObj();
    // Repurpose the variable userData for returning it to the client.
    userData = {
      ...resObj,
      ...credits,
      deCourse: userData.deCourse,
      deInstit: data.deInstit,
      deMajor: userData.deMajor,
      tag: userData.tag,
      tagId: userData.tagId,
      deCredits: userData.deCredits,
      fName: userData.fName,
      lName: userData.lName,
      imageUrl: defaultImageUrl,
      chooseUname: userData.chooseUname,
      lang: userData.lang,
      uname: userData.uname,
      theme: "theme" in userData ? userData.theme : "Dark",
      background: "background" in userData ? userData.background : "Image",
      practicing: userData.practicing,
      createdAt: userData.createdAt.toDate(),
    };
    return res.status(201).json({ user: userData });
  } catch (error: any) {
    let errorMessage = "Error on Signup";
    if (error.code && typeof error.code === "string" && (error.code as string).startsWith("auth/")) {
      errorMessage = getFirebaseFriendlyError(error);
    }
    console.error(error);
    res.status(500).json({ message: errorMessage });
  }
}

export default handler;
