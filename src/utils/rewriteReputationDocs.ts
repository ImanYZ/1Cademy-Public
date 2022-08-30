import {
  checkRestartBatchWriteCounts,
  db,
} from "../lib/firestoreServer/admin";
import { baseReputationObj } from '.';

export const rewriteReputationDocs = async ({ batch, reputationsType, reputationsDict, writeCounts }: any) => {
  let firstDayType: any;
  let newBatch = batch;
  let reputationRef, proposerPoints, bReputationObj;
  const oldReputations: any = {};
  if (!["reputations", "othersReputations"].includes(reputationsType)) {
    firstDayType = ["weeklyReputations", "othWeekReputations"].includes(reputationsType)
      ? "firstWeekDay"
      : "firstMonthDay";
  }
  const reputationDocs = await db.collection(reputationsType).get();
  for (let reputationDoc of reputationDocs.docs) {
    const reputationData = reputationDoc.data();
    const dateTimes = {
      createdAt: reputationData.createdAt,
      updatedAt: reputationData.updatedAt,
    };
    if (firstDayType) {
      if (reputationData.tagId in oldReputations) {
        if (reputationData.proposer in oldReputations[reputationData.tagId]) {
          oldReputations[reputationData.tagId][reputationData.proposer][firstDayType] = dateTimes;
        } else {
          oldReputations[reputationData.tagId][reputationData.proposer] = {
            [firstDayType]: dateTimes,
          };
        }
      } else {
        oldReputations[reputationData.tagId] = {
          [reputationData.proposer]: {
            [firstDayType]: dateTimes,
          },
        };
      }
    } else {
      if (reputationData.tagId in oldReputations) {
        oldReputations[reputationData.tagId][reputationData.proposer] = dateTimes;
      } else {
        oldReputations[reputationData.tagId] = {
          [reputationData.proposer]: dateTimes,
        };
      }
    }
    reputationRef = db.collection(reputationsType).doc(reputationDoc.id);
    newBatch.delete(reputationRef);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  if (["reputations", "othersReputations"].includes(reputationsType)) {
    for (let tagId in reputationsDict) {
      for (let proposer in reputationsDict[tagId]) {
        proposerPoints = reputationsDict[tagId][proposer];
        reputationRef = db.collection(reputationsType).doc();
        bReputationObj = baseReputationObj({ points: proposerPoints, tag: proposerPoints.tag, tagId });
        if (
          proposerPoints.tagId in oldReputations &&
          proposer in oldReputations[proposerPoints.tagId]
        ) {
          if (bReputationObj.createdAt > oldReputations[proposerPoints.tagId][proposer].createdAt) {
            bReputationObj.createdAt = oldReputations[proposerPoints.tagId][proposer].createdAt;
          }
          if (bReputationObj.updatedAt < oldReputations[proposerPoints.tagId][proposer].updatedAt) {
            bReputationObj.updatedAt = oldReputations[proposerPoints.tagId][proposer].updatedAt;
          }
        }
        newBatch.set(reputationRef, {
          ...bReputationObj,
          uname: proposer,
          isAdmin: proposerPoints.isAdmin,
        });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  } else {
    for (let tagId in reputationsDict) {
      for (let proposer in reputationsDict[tagId]) {
        for (let firstDayVal in reputationsDict[tagId][proposer]) {
          proposerPoints = reputationsDict[tagId][proposer][firstDayVal];
          reputationRef = db.collection(reputationsType).doc();

          bReputationObj = baseReputationObj({ points: proposerPoints, tag: proposerPoints.tag, tagId });
          if (
            proposerPoints.tag in oldReputations &&
            proposer in oldReputations[proposerPoints.tag] &&
            firstDayVal in oldReputations[proposerPoints.tag][proposer]
          ) {
            if (
              bReputationObj.createdAt >
              oldReputations[proposerPoints.tagId][proposer][firstDayVal].createdAt
            ) {
              bReputationObj.createdAt =
                oldReputations[proposerPoints.tagId][proposer][firstDayVal].createdAt;
            }
            if (
              bReputationObj.updatedAt <
              oldReputations[proposerPoints.tagId][proposer][firstDayVal].updatedAt
            ) {
              bReputationObj.updatedAt =
                oldReputations[proposerPoints.tagId][proposer][firstDayVal].updatedAt;
            }
          }
          newBatch.set(reputationRef, {
            ...bReputationObj,
            [firstDayType]: firstDayVal,
            uname: proposer,
            isAdmin: proposerPoints.isAdmin,
          });
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
        }
      }
    }
  }
  console.log("Done with " + reputationsType);
  return [newBatch, writeCounts];
};