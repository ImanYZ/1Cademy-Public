import { admin, checkRestartBatchWriteCounts, db } from "../lib/firestoreServer/admin";
import { firstWeekMonthDays } from ".";
import { convertToTGet } from "./";
import {
  CollectionReference,
  Query,
  DocumentReference,
  WriteBatch,
  Transaction,
  Timestamp,
} from "firebase-admin/firestore";
import { TransactionWrite } from "src/types";
import { IReputation } from "src/types/IReputationPoint";

export type IComReputationUpdates = {
  [tagId: string]: {
    [reputationType: string]: {
      docRef: DocumentReference<any>;
      docData: any;
      isNew: boolean;
    };
  };
};

export const initializeNewReputationData = ({
  tagId,
  tag,
  updatedAt,
  createdAt,
}: {
  tagId: string;
  tag: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}): any => ({
  // for Concept nodes
  cnCorrects: 0,
  cnInst: 0,
  cnWrongs: 0,
  // for Code nodes
  cdCorrects: 0,
  cdInst: 0,
  cdWrongs: 0,
  // for Question nodes
  qCorrects: 0,
  qInst: 0,
  qWrongs: 0,
  //  for Profile nodes
  pCorrects: 0,
  pInst: 0,
  pWrongs: 0,
  //  for Sequel nodes
  sCorrects: 0,
  sInst: 0,
  sWrongs: 0,
  //  for Advertisement nodes
  aCorrects: 0,
  aInst: 0,
  aWrongs: 0,
  //  for Reference nodes
  rfCorrects: 0,
  rfInst: 0,
  rfWrongs: 0,
  //  for News nodes
  nCorrects: 0,
  nInst: 0,
  nWrongs: 0,
  //  for Idea nodes
  iCorrects: 0,
  iInst: 0,
  iWrongs: 0,
  //  for Relation nodes
  mCorrects: 0,
  mInst: 0,
  mWrongs: 0,

  lterm: 0,
  ltermDay: 0,

  positives: 0,
  negatives: 0,
  totalPoints: 0,

  isAdmin: false,
  tagId,
  tag,
  updatedAt,
  createdAt,
});

//  calculate positives, negatives, and total. If they do not exist then create them
export const calculatePositivesNegativesTotals = (rep_Points: any) => {
  if (!("positives" in rep_Points)) {
    rep_Points.positives =
      // for Concept nodes
      rep_Points.cnCorrects +
      rep_Points.cnInst +
      // for Code nodes
      rep_Points.cdCorrects +
      rep_Points.cdInst +
      // for Question nodes
      rep_Points.qCorrects +
      rep_Points.qInst +
      //  for Profile nodes
      rep_Points.pCorrects +
      rep_Points.pInst +
      //  for Sequel nodes
      rep_Points.sCorrects +
      rep_Points.sInst +
      //  for Advertisement nodes
      rep_Points.aCorrects +
      rep_Points.aInst +
      //  for Reference nodes
      rep_Points.rfCorrects +
      rep_Points.rfInst +
      //  for News nodes
      rep_Points.nCorrects +
      rep_Points.nInst +
      //  for Idea nodes
      rep_Points.iCorrects +
      rep_Points.iInst +
      //  for Relation nodes
      rep_Points.mCorrects +
      rep_Points.mInst +
      rep_Points.lterm;
  }
  if (!("negatives" in rep_Points)) {
    rep_Points.negatives =
      // for Concept nodes
      rep_Points.cnWrongs +
      // for Code nodes
      rep_Points.cdWrongs +
      // for Question nodes
      rep_Points.qWrongs +
      //  for Profile nodes
      rep_Points.pWrongs +
      //  for Sequel nodes
      rep_Points.sWrongs +
      //  for Advertisement nodes
      rep_Points.aWrongs +
      //  for Reference nodes
      rep_Points.rfWrongs +
      //  for News nodes
      rep_Points.nWrongs +
      //  for Idea nodes
      rep_Points.iWrongs +
      //  for Relation nodes
      rep_Points.mWrongs;
  }
  if (!("totalPoints" in rep_Points)) {
    rep_Points.totalPoints = rep_Points.positives - rep_Points.negatives;
  }
};

export type ReputationType = "All Time" | "Monthly" | "Weekly" | "Others" | "Others Monthly" | "Others Weekly";

export const getRepBaseQueries = (
  reputationType: ReputationType
): { reputationsQueryBase: CollectionReference; comPointsQueryBase: CollectionReference } => {
  let reputationsQueryBase: CollectionReference, comPointsQueryBase: CollectionReference;
  switch (reputationType) {
    case "All Time":
      reputationsQueryBase = db.collection("reputations");
      comPointsQueryBase = db.collection("comPoints");
      break;
    case "Monthly":
      reputationsQueryBase = db.collection("monthlyReputations");
      comPointsQueryBase = db.collection("comMonthlyPoints");
      break;
    case "Weekly":
      reputationsQueryBase = db.collection("weeklyReputations");
      comPointsQueryBase = db.collection("comWeeklyPoints");
      break;
    case "Others":
      reputationsQueryBase = db.collection("othersReputations");
      comPointsQueryBase = db.collection("comOthersPoints");
      break;
    case "Others Monthly":
      reputationsQueryBase = db.collection("othMonReputations");
      comPointsQueryBase = db.collection("comOthMonPoints");
      break;
    case "Others Weekly":
      reputationsQueryBase = db.collection("othWeekReputations");
      comPointsQueryBase = db.collection("comOthWeekPoints");
      break;
    default:
      throw new Error("[getRepBaseQueries]: Strange reputationType: " + reputationType);
  }

  return {
    reputationsQueryBase,
    comPointsQueryBase,
  };
};

export const makeQueryBaseWhere = (
  reputationType: ReputationType,
  baseCollection: CollectionReference,
  firstWeekDay: string,
  firstMonthDay: string
): Query => {
  let repQuery: Query;
  if (["Monthly", "Others Monthly"].includes(reputationType)) {
    repQuery = baseCollection.where("firstMonthDay", "==", firstMonthDay);
  } else if (["Weekly", "Others Weekly"].includes(reputationType)) {
    repQuery = baseCollection.where("firstWeekDay", "==", firstWeekDay);
  } else {
    return baseCollection;
  }
  return repQuery;
};

export const updateReputationIncrement = async ({
  batch,
  uname,
  imageUrl,
  fullname,
  chooseUname,
  nodeType,
  tagId,
  tag,
  correctVal,
  wrongVal,
  instVal,
  ltermVal,
  ltermDayVal,
  reputationType,
  firstWeekDay,
  firstMonthDay,
  createdAt,
  updatedAt,
  comReputationUpdates,
  writeCounts,
  t,
  tWriteOperations,
}: {
  uname: string;
  imageUrl: string;
  fullname: string;
  chooseUname: boolean;
  tagId: string;
  tag: string;
  nodeType: string;
  correctVal: number;
  wrongVal: number;
  instVal: number;
  ltermVal: number;
  ltermDayVal: number;
  reputationType: any;
  firstWeekDay: any;
  firstMonthDay: any;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  comReputationUpdates: any;
  writeCounts: number;
  batch: WriteBatch;
  t: Transaction | null;
  tWriteOperations: TransactionWrite[];
}): Promise<[newBatch: WriteBatch, writeCounts: number]> => {
  // console.log(uname, correctVal, "correctVal")
  let newBatch = batch;

  let rep_Points = initializeNewReputationData({ tagId, tag, updatedAt, createdAt });
  let com_Points =
    comReputationUpdates?.[tagId]?.[reputationType]?.docData ||
    initializeNewReputationData({ tagId, tag, updatedAt, createdAt });
  // Only clear admin related props if its coming from initializeNewReputationData
  if (com_Points.hasOwnProperty("isAdmin")) {
    delete com_Points.isAdmin;
    com_Points.admin = null;
    com_Points.aImgUrl = null;
    com_Points.aFullname = null;
    com_Points.aChooseUname = false;
    com_Points.adminPoints = 0;
  }

  let reputationsQuery,
    // reputationsQueryBaseWhere,
    reputationDoc,
    comPointsQuery,
    // comPointsQueryBaseWhere,
    comPointDoc,
    com_reputationsDoc;

  let updateTheCommunityDoc = false,
    updateTheReputationDoc = false;

  const { reputationsQueryBase, comPointsQueryBase } = getRepBaseQueries(reputationType as ReputationType);

  const reputationsQueryBaseWhere = makeQueryBaseWhere(
    reputationType,
    reputationsQueryBase,
    firstWeekDay,
    firstMonthDay
  );
  const comPointsQueryBaseWhere = makeQueryBaseWhere(reputationType, comPointsQueryBase, firstWeekDay, firstMonthDay);

  reputationsQuery = reputationsQueryBaseWhere.where("uname", "==", uname).where("tagId", "==", tagId);

  let reputationsDoc = await convertToTGet(reputationsQuery.limit(1), t);
  //  if reputationsQuery returns a doc
  if (reputationsDoc.docs.length > 0) {
    //  define reputationDoc reference
    reputationDoc = reputationsQueryBase.doc(reputationsDoc.docs[0].id);

    //  obtain all data in the given document
    rep_Points = reputationsDoc.docs[0].data();
    //  calculate positives, negatives, and total. If they do not exist then create them
    calculatePositivesNegativesTotals(rep_Points);
    updateTheReputationDoc = true;
  } else {
    //else, reputationsQuery did not return a doc, have to create a reference
    reputationDoc = reputationsQueryBase.doc();
    rep_Points.uname = uname;
  }

  //  query community points
  comPointsQuery = comPointsQueryBaseWhere.where("tagId", "==", tagId);

  let comPointsDoc = await convertToTGet(comPointsQuery.limit(1), t);

  //  if comPointsQuery returns a doc
  if (comPointsDoc.docs.length > 0) {
    comPointDoc = comPointsQueryBase.doc(comPointsDoc.docs[0].id);
    // only replace com_Points if we are not already accumlating it
    if (!comReputationUpdates?.[tagId]?.[reputationType]) {
      com_Points = comPointsDoc.docs[0].data();
    }

    //  calculate positives, negatives. and all time, if they do not exist create them
    calculatePositivesNegativesTotals(com_Points);
    updateTheCommunityDoc = true;
  } else {
    //  else comPointsQuery did not return a doc, create a reference
    comPointDoc = comPointsQueryBase.doc();
    com_reputationsDoc = await reputationsQueryBaseWhere.where("tagId", "==", tagId).get();

    //  iterate through community reputations docs to calculate totals
    //  each user has unique com_reputationDoc
    for (let com_reputationDoc of com_reputationsDoc.docs) {
      const rData = com_reputationDoc.data();
      // Total reputation points that this specific user has earned so far in this community.
      calculatePositivesNegativesTotals(rData);
      // if the current user's points are greater than the admin's points,
      // make the current user the admin
      // We ignore updating the imageURL and aFullname because
      // after updating the com-Admin over and over again, at the end of the day
      // on line 861, we fetch them from the users collection and update them.
      if (rData.totalPoints > com_Points.adminPoints) {
        com_Points.admin = rData.uname;
        com_Points.adminPoints = rData?.totalPoints || 0;
      }

      // add current community reputation doc values to total
      // for Concept nodes
      com_Points.cnCorrects += rData?.cnCorrects || 0;
      com_Points.cnInst += rData?.cnInst || 0;
      com_Points.cnWrongs += rData?.cnWrongs || 0;
      // for Code nodes
      com_Points.cdCorrects += rData?.cdCorrects || 0;
      com_Points.cdInst += rData?.cdInst || 0;
      com_Points.cdWrongs += rData?.cdWrongs || 0;
      // for Question nodes
      com_Points.qCorrects += rData?.qCorrects || 0;
      com_Points.qInst += rData?.qInst || 0;
      com_Points.qWrongs += rData?.qWrongs || 0;
      //  for Profile nodes
      com_Points.pCorrects += rData?.pCorrects || 0;
      com_Points.pInst += rData?.pInst || 0;
      com_Points.pWrongs += rData?.pWrongs || 0;
      //  for Sequel nodes
      com_Points.sCorrects += rData?.sCorrects || 0;
      com_Points.sInst += rData?.sInst || 0;
      com_Points.sWrongs += rData?.sWrongs || 0;
      //  for Advertisement nodes
      com_Points.aCorrects += rData?.aCorrects || 0;
      com_Points.aInst += rData?.aInst || 0;
      com_Points.aWrongs += rData.aWrongs || 0;
      //  for Reference nodes
      com_Points.rfCorrects += rData?.rfCorrects || 0;
      com_Points.rfInst += rData?.rfInst || 0;
      com_Points.rfWrongs += rData?.rfWrongs || 0;
      //  for News nodes
      com_Points.nCorrects += rData?.nCorrects || 0;
      com_Points.nInst += rData?.nInst || 0;
      com_Points.nWrongs += rData?.nWrongs || 0;
      //  for Idea nodes
      com_Points.iCorrects += rData?.iCorrects || 0;
      com_Points.iInst += rData?.iInst || 0;
      com_Points.iWrongs += rData?.iWrongs || 0;
      com_Points.mCorrects += rData?.mCorrects || 0;
      //  for Relation nodes
      com_Points.mInst += rData?.mInst || 0;
      com_Points.mWrongs += rData?.mWrongs || 0;
      com_Points.lterm += rData?.lterm || 0;
      com_Points.ltermDay += rData?.ltermDay || 0;

      //  similar to above, if positives, negatives, or total do not exist, calculate them and add them to total
      com_Points.positives += rData?.positives || 0;
      com_Points.negatives += rData?.negatives || 0;
      com_Points.totalPoints += rData?.totalPoints || 0;
    }

    //  iterate through dictionary userReputations
    //  if the current user's total points is greater than current community admin's total points,
    //  make the current user the new admin
    // for (let userRep of Object.keys(userReputations)) {
    //   if (userReputations[userRep] > com_AdminPoints) {
    //     com_Admin = userRep;
    //     com_AdminPoints = userReputations[userRep];
    //   }
    // }
  }

  // initializing aggregation of community points documents
  if (!comReputationUpdates?.[tagId]?.[reputationType]) {
    if (!comReputationUpdates?.[tagId]) {
      comReputationUpdates[tagId] = {};
    }

    if (!comReputationUpdates?.[tagId]?.[reputationType]) {
      comReputationUpdates[tagId][reputationType] = {
        docRef: comPointDoc,
        docData: com_Points,
        isNew: !updateTheCommunityDoc,
      };
    }
  }

  //  update reputation by adding the changes that are referenced in the parameters of this function
  switch (nodeType) {
    case "Concept":
      // for Concept nodes
      rep_Points.cnCorrects += correctVal;
      rep_Points.cnInst += instVal;
      rep_Points.cnWrongs += wrongVal;
      com_Points.cnCorrects += correctVal;
      com_Points.cnInst += instVal;
      com_Points.cnWrongs += wrongVal;
      break;
    case "Code":
      // for Code nodes
      rep_Points.cdCorrects += correctVal;
      rep_Points.cdInst += instVal;
      rep_Points.cdWrongs += wrongVal;
      com_Points.cdCorrects += correctVal;
      com_Points.cdInst += instVal;
      com_Points.cdWrongs += wrongVal;
      break;
    case "Question":
      // for Question nodes
      rep_Points.qCorrects += correctVal;
      rep_Points.qInst += instVal;
      rep_Points.qWrongs += wrongVal;
      com_Points.qCorrects += correctVal;
      com_Points.qInst += instVal;
      com_Points.qWrongs += wrongVal;
      break;
    case "Profile":
      //  for Profile nodes
      rep_Points.pCorrects += correctVal;
      rep_Points.pInst += instVal;
      rep_Points.pWrongs += wrongVal;
      com_Points.pCorrects += correctVal;
      com_Points.pInst += instVal;
      com_Points.pWrongs += wrongVal;
      break;
    case "Sequel":
      //  for Sequel nodes
      rep_Points.sCorrects += correctVal;
      rep_Points.sInst += instVal;
      rep_Points.sWrongs += wrongVal;
      com_Points.sCorrects += correctVal;
      com_Points.sInst += instVal;
      com_Points.sWrongs += wrongVal;
      break;
    case "Advertisement":
      //  for Advertisement nodes
      rep_Points.aCorrects += correctVal;
      rep_Points.aInst += instVal;
      rep_Points.aWrongs += wrongVal;
      com_Points.aCorrects += correctVal;
      com_Points.aInst += instVal;
      com_Points.aWrongs += wrongVal;
      break;
    case "Reference":
      //  for Reference nodes
      rep_Points.rfCorrects += correctVal;
      rep_Points.rfInst += instVal;
      rep_Points.rfWrongs += wrongVal;
      com_Points.rfCorrects += correctVal;
      com_Points.rfInst += instVal;
      com_Points.rfWrongs += wrongVal;
      break;
    case "News":
      //  for News nodes
      rep_Points.nCorrects += correctVal;
      rep_Points.nInst += instVal;
      rep_Points.nWrongs += wrongVal;
      com_Points.nCorrects += correctVal;
      com_Points.nInst += instVal;
      com_Points.nWrongs += wrongVal;
      break;
    case "Idea":
      //  for Idea nodes
      rep_Points.iCorrects += correctVal;
      rep_Points.iInst += instVal;
      rep_Points.iWrongs += wrongVal;
      com_Points.iCorrects += correctVal;
      com_Points.iInst += instVal;
      com_Points.iWrongs += wrongVal;
      break;
    case "Relation":
      //  for Relation nodes
      rep_Points.mCorrects += correctVal;
      rep_Points.mInst += instVal;
      rep_Points.mWrongs += wrongVal;
      com_Points.mCorrects += correctVal;
      com_Points.mInst += instVal;
      com_Points.mWrongs += wrongVal;
      break;
    default:
      console.log("[updateReputationIncrement]: Strange nodeType: " + nodeType);
  }
  const positivePointsChange = correctVal + instVal + ltermVal;
  const totalPointsChange = positivePointsChange - wrongVal;
  rep_Points.lterm += ltermVal;
  rep_Points.ltermDay += ltermDayVal;
  com_Points.lterm += ltermVal;
  com_Points.ltermDay += ltermDayVal;
  rep_Points.positives += positivePointsChange;
  rep_Points.negatives += wrongVal;
  rep_Points.totalPoints += totalPointsChange;
  com_Points.positives += positivePointsChange;
  com_Points.negatives += wrongVal;
  com_Points.totalPoints += totalPointsChange;

  //  if the user's updated total points is greater than the community admin's total points,
  //  make the user the community admin
  if (rep_Points.totalPoints > com_Points.adminPoints) {
    com_Points.admin = uname;
    com_Points.aImgUrl = imageUrl;
    com_Points.aFullname = fullname;
    com_Points.aChooseUname = chooseUname;
    com_Points.adminPoints = rep_Points.totalPoints;
  }
  rep_Points.isAdmin = uname === com_Points.admin;

  //  create a new user object with the updated reputation values

  const reputationDoc_Obj = {
    ...rep_Points,
    // for Concept nodes
    cnCorrects: parseFloat(rep_Points?.cnCorrects?.toFixed(3) || 0),
    cnInst: parseFloat(rep_Points?.cnInst?.toFixed(3) || 0),
    cnWrongs: parseFloat(rep_Points?.cnWrongs?.toFixed(3) || 0),
    // for Code nodes
    cdCorrects: parseFloat(rep_Points?.cdCorrects?.toFixed(3) || 0),
    cdInst: parseFloat(rep_Points?.cdInst?.toFixed(3) || 0),
    cdWrongs: parseFloat(rep_Points?.cdWrongs?.toFixed(3) || 0),
    // for Question nodes
    qCorrects: parseFloat(rep_Points?.qCorrects?.toFixed(3) || 0),
    qInst: parseFloat(rep_Points?.qInst?.toFixed(3) || 0),
    qWrongs: parseFloat(rep_Points?.qWrongs?.toFixed(3) || 0),
    //  for Profile nodes
    pCorrects: parseFloat(rep_Points?.pCorrects?.toFixed(3) || 0),
    pInst: parseFloat(rep_Points?.pInst?.toFixed(3) || 0),
    pWrongs: parseFloat(rep_Points?.pWrongs?.toFixed(3) || 0),
    //  for Sequel nodes
    sCorrects: parseFloat(rep_Points?.sCorrects?.toFixed(3) || 0),
    sInst: parseFloat(rep_Points?.sInst?.toFixed(3) || 0),
    sWrongs: parseFloat(rep_Points?.sWrongs?.toFixed(3) || 0),
    //  for Advertisement nodes
    aCorrects: parseFloat(rep_Points?.aCorrects?.toFixed(3) || 0),
    aInst: parseFloat(rep_Points?.aInst?.toFixed(3) || 0),
    aWrongs: parseFloat(rep_Points?.aWrongs?.toFixed(3) || 0),
    //  for Reference nodes
    rfCorrects: parseFloat(rep_Points?.rfCorrects?.toFixed(3) || 0),
    rfInst: parseFloat(rep_Points?.rfInst?.toFixed(3) || 0),
    rfWrongs: parseFloat(rep_Points?.rfWrongs?.toFixed(3) || 0),
    //  for News nodes
    nCorrects: parseFloat(rep_Points?.nCorrects?.toFixed(3) || 0),
    nInst: parseFloat(rep_Points?.nInst?.toFixed(3) || 0),
    nWrongs: parseFloat(rep_Points?.nWrongs?.toFixed(3) || 0),
    //  for Idea nodes
    iCorrects: parseFloat(rep_Points?.iCorrects?.toFixed(3) || 0),
    iInst: parseFloat(rep_Points?.iInst?.toFixed(3) || 0),
    iWrongs: parseFloat(rep_Points?.iWrongs?.toFixed(3) || 0),
    //  for Relation nodes
    mCorrects: parseFloat(rep_Points?.mCorrects?.toFixed(3) || 0),
    mInst: parseFloat(rep_Points?.mInst?.toFixed(3) || 0),
    mWrongs: parseFloat(rep_Points?.mWrongs?.toFixed(3) || 0),
    lterm: parseFloat(rep_Points?.lterm?.toFixed(3) || 0),
    ltermDay: parseFloat(rep_Points?.ltermDay?.toFixed(3) || 0),
    positives: parseFloat(rep_Points?.positives?.toFixed(3) || 0),
    negatives: parseFloat(rep_Points?.negatives?.toFixed(3) || 0),
    totalPoints: parseFloat(rep_Points?.totalPoints?.toFixed(3) || 0),
  };
  if (reputationType === "Monthly" || reputationType === "Others Monthly") {
    reputationDoc_Obj.firstMonthDay = firstMonthDay;
  } else if (reputationType === "Weekly" || reputationType === "Others Weekly") {
    reputationDoc_Obj.firstWeekDay = firstWeekDay;
  }

  if (t) {
    tWriteOperations.push({
      objRef: reputationDoc,
      data: reputationDoc_Obj,
      operationType: updateTheReputationDoc ? "update" : "set",
    });
  } else {
    updateTheReputationDoc
      ? newBatch.update(reputationDoc, reputationDoc_Obj)
      : newBatch.set(reputationDoc, reputationDoc_Obj);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }

  //  if the admin exists, but it doesn't have a profile picture or
  // fullname in the corresponding comPoints document, retrieve it from users collection.
  if (com_Points.admin && (!com_Points.aImgUrl || !com_Points.aFullname)) {
    const userDoc = await convertToTGet(db.collection("users").doc(com_Points.admin), t);
    const userData: any = userDoc.data();
    com_Points.aImgUrl = userData.imageUrl;
    com_Points.aFullname = `${userData.fName} ${userData.lName}`;
    com_Points.aChooseUname = userData.chooseUname;
  }

  //  create a new community reputation object
  // console.log("com_Points.cdCorrects", com_Points.cdCorrects);
  const com_PointsDoc_Obj = {
    ...com_Points,
    // for Concept nodes
    cnCorrects:
      com_Points.cnCorrects !== null && com_Points.cnCorrects ? parseFloat(com_Points.cnCorrects.toFixed(3)) : 0,
    cnInst: com_Points.cnInst !== null && com_Points.cnInst ? parseFloat(com_Points.cnInst.toFixed(3)) : 0,
    cnWrongs: com_Points.cnWrongs !== null && com_Points.cnWrongs ? parseFloat(com_Points.cnWrongs.toFixed(3)) : 0,
    // for Code nodes
    cdCorrects:
      com_Points.cdCorrects !== null && com_Points.cdCorrects ? parseFloat(com_Points.cdCorrects.toFixed(3)) : 0,
    cdInst: com_Points.cdInst !== null && com_Points.cdInst ? parseFloat(com_Points.cdInst.toFixed(3)) : 0,
    cdWrongs: com_Points.cdWrongs !== null && com_Points.cdWrongs ? parseFloat(com_Points.cdWrongs.toFixed(3)) : 0,
    // for Question nodes
    qCorrects: com_Points.qCorrects !== null && com_Points.qCorrects ? parseFloat(com_Points.qCorrects.toFixed(3)) : 0,
    qInst: com_Points.qInst !== null && com_Points.qInst ? parseFloat(com_Points.qInst.toFixed(3)) : 0,
    qWrongs: com_Points.qWrongs !== null && com_Points.qWrongs ? parseFloat(com_Points.qWrongs.toFixed(3)) : 0,
    //  for Profile nodes
    pCorrects: com_Points.pCorrects !== null && com_Points.pCorrects ? parseFloat(com_Points.pCorrects.toFixed(3)) : 0,
    pInst: com_Points.pInst !== null && com_Points.pInst ? parseFloat(com_Points.pInst.toFixed(3)) : 0,
    pWrongs: com_Points.pWrongs !== null && com_Points.pWrongs ? parseFloat(com_Points.pWrongs.toFixed(3)) : 0,
    //  for Sequel nodes
    sCorrects: com_Points.sCorrects !== null && com_Points.sCorrects ? parseFloat(com_Points.sCorrects.toFixed(3)) : 0,
    sInst: com_Points.sInst !== null && com_Points.sInst ? parseFloat(com_Points.sInst.toFixed(3)) : 0,
    sWrongs: com_Points.sWrongs !== null && com_Points.sWrongs ? parseFloat(com_Points.sWrongs.toFixed(3)) : 0,
    //  for Advertisement nodes
    aCorrects: com_Points.aCorrects !== null && com_Points.aCorrects ? parseFloat(com_Points.aCorrects.toFixed(3)) : 0,
    aInst: com_Points.aInst !== null && com_Points.aInst ? parseFloat(com_Points.aInst.toFixed(3)) : 0,
    aWrongs: com_Points.aWrongs !== null && com_Points.aWrongs ? parseFloat(com_Points.aWrongs.toFixed(3)) : 0,
    //  for Reference nodes
    rfCorrects:
      com_Points.rfCorrects !== null && com_Points.rfCorrects ? parseFloat(com_Points.rfCorrects.toFixed(3)) : 0,
    rfInst: com_Points.rfInst !== null && com_Points.rfInst ? parseFloat(com_Points.rfInst.toFixed(3)) : 0,
    rfWrongs: com_Points.rfWrongs !== null && com_Points.rfWrongs ? parseFloat(com_Points.rfWrongs.toFixed(3)) : 0,
    //  for News nodes
    nCorrects: com_Points.nCorrects !== null && com_Points.nCorrects ? parseFloat(com_Points.nCorrects.toFixed(3)) : 0,
    nInst: com_Points.nInst !== null && com_Points.nInst ? parseFloat(com_Points.nInst.toFixed(3)) : 0,
    nWrongs: com_Points.nWrongs !== null && com_Points.nWrongs ? parseFloat(com_Points.nWrongs.toFixed(3)) : 0,
    //  for Idea nodes
    iCorrects: com_Points.iCorrects !== null && com_Points.iCorrects ? parseFloat(com_Points.iCorrects.toFixed(3)) : 0,
    iInst: com_Points.iInst !== null && com_Points.iInst ? parseFloat(com_Points.iInst.toFixed(3)) : 0,
    iWrongs: com_Points.iWrongs !== null && com_Points.iWrongs ? parseFloat(com_Points.iWrongs.toFixed(3)) : 0,
    //  for Relation nodes
    mCorrects: com_Points.mCorrects !== null && com_Points.mCorrects ? parseFloat(com_Points.mCorrects.toFixed(3)) : 0,
    mInst: com_Points.mInst !== null && com_Points.mInst ? parseFloat(com_Points.mInst.toFixed(3)) : 0,
    mWrongs: com_Points.mWrongs !== null && com_Points.mWrongs ? parseFloat(com_Points.mWrongs.toFixed(3)) : 0,
    lterm: com_Points.lterm !== null && com_Points.lterm ? parseFloat(com_Points.lterm.toFixed(3)) : 0,
    ltermDay: com_Points.ltermDay !== null && com_Points.ltermDay ? parseFloat(com_Points.ltermDay.toFixed(3)) : 0,
    positives: com_Points.positives !== null && com_Points.positives ? parseFloat(com_Points.positives.toFixed(3)) : 0,
    negatives: com_Points.negatives !== null && com_Points.negatives ? parseFloat(com_Points.negatives.toFixed(3)) : 0,
    totalPoints:
      com_Points.totalPoints !== null && com_Points.totalPoints ? parseFloat(com_Points.totalPoints.toFixed(3)) : 0,
    adminPoints:
      com_Points.adminPoints !== null && com_Points.adminPoints ? parseFloat(com_Points.adminPoints.toFixed(3)) : 0,
  };
  if (reputationType === "Monthly" || reputationType === "Others Monthly") {
    reputationDoc_Obj.firstMonthDay = firstMonthDay;
  } else if (reputationType === "Weekly" || reputationType === "Others Weekly") {
    reputationDoc_Obj.firstWeekDay = firstWeekDay;
  }

  if (reputationType === "Monthly" || reputationType === "Others Monthly") {
    com_PointsDoc_Obj.firstMonthDay = firstMonthDay;
  } else if (reputationType === "Weekly" || reputationType === "Others Weekly") {
    com_PointsDoc_Obj.firstWeekDay = firstWeekDay;
  }

  comReputationUpdates[tagId][reputationType].docData = com_PointsDoc_Obj;

  return [newBatch, writeCounts];
};

// Called if someone upvotes or downvotes a proposal. Call this for the proposer.
export const updateReputation = async ({
  batch,
  uname,
  imageUrl,
  fullname,
  chooseUname,
  tagIds,
  tags,
  nodeType,
  correctVal,
  wrongVal,
  instVal,
  ltermVal,
  ltermDayVal,
  voter,
  writeCounts,
  comReputationUpdates,
  t,
  tWriteOperations,
}: {
  uname: string;
  imageUrl: string;
  fullname: string;
  chooseUname: boolean;
  tagIds: string[];
  tags: string[];
  nodeType: string;
  correctVal: number;
  wrongVal: number;
  instVal: number;
  ltermVal: number;
  ltermDayVal: number;
  voter: string;
  comReputationUpdates: any;
  writeCounts: number;
  batch: WriteBatch;
  t: Transaction | null;
  tWriteOperations: TransactionWrite[];
}): Promise<[newBatch: WriteBatch, writeCounts: number]> => {
  let createdAt = admin.firestore.Timestamp.fromDate(new Date());
  let updatedAt = admin.firestore.Timestamp.fromDate(new Date());
  const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();
  const tempTagIds = [...tagIds];
  const tempTags = [...tags];

  //  if not 1Cademy tag, add to list of tempTags
  if (!tempTagIds.includes("r98BjyFDCe4YyLA3U8ZE")) {
    tempTagIds.push("r98BjyFDCe4YyLA3U8ZE");
    tempTags.push("1Cademy");
  }

  let newBatch = batch;
  //  update each tagId's all time, monthly, weekly values
  // populate data in reputationDoc_lst
  for (let tagIdx = 0; tagIdx < tempTagIds.length; tagIdx++) {
    for (let reputationType of ["All Time", "Monthly", "Weekly"]) {
      [newBatch, writeCounts] = await updateReputationIncrement({
        batch: newBatch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        nodeType,
        tagId: tempTagIds[tagIdx],
        tag: tempTags[tagIdx],
        correctVal,
        wrongVal,
        instVal,
        ltermVal,
        ltermDayVal,
        reputationType,
        firstWeekDay,
        firstMonthDay,
        createdAt,
        updatedAt,
        writeCounts,
        comReputationUpdates,
        t,
        tWriteOperations,
      });
    }

    //  if not a self-vote, update all times, monthly, and weekly for others
    if (voter !== uname) {
      for (let reputationType of ["Others", "Others Monthly", "Others Weekly"]) {
        [newBatch, writeCounts] = await updateReputationIncrement({
          batch: newBatch,
          uname,
          imageUrl,
          fullname,
          chooseUname,
          nodeType,
          tagId: tempTagIds[tagIdx],
          tag: tempTags[tagIdx],
          correctVal,
          wrongVal,
          instVal,
          ltermVal,
          ltermDayVal,
          reputationType,
          firstWeekDay,
          firstMonthDay,
          createdAt,
          updatedAt,
          writeCounts,
          comReputationUpdates,
          t,
          tWriteOperations,
        });
      }
    }
  }
  return [newBatch, writeCounts];
};
