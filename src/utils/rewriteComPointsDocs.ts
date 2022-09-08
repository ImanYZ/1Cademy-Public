import { checkRestartBatchWriteCounts, db } from "../lib/firestoreServer/admin";
import { baseReputationObj } from ".";

export const rewriteComPointsDocs = async ({ batch, comPointsType, comPointsDict, writeCounts }: any) => {
  let newBatch = batch;
  let firstDayType: any;
  let comRef, cPoints, bReputationObj, bComPointsObj: any;
  const oldComPoints: any = {};
  if (!["comPoints", "comOthersPoints"].includes(comPointsType)) {
    firstDayType = ["comWeeklyPoints", "comOthWeekPoints"].includes(comPointsType) ? "firstWeekDay" : "firstMonthDay";
  }
  const comDocs = await db.collection(comPointsType).get();
  for (let comDoc of comDocs.docs) {
    const comData = comDoc.data();
    const dateTimes = {
      createdAt: comData.createdAt,
      updatedAt: comData.updatedAt,
    };
    if (["comPoints", "comOthersPoints"].includes(comPointsType)) {
      oldComPoints[comData.tagId] = dateTimes;
    } else {
      if (comData.tagId in oldComPoints) {
        oldComPoints[comData.tagId][firstDayType] = dateTimes;
      } else {
        oldComPoints[comData.tagId] = {
          [firstDayType]: dateTimes,
        };
      }
    }
    comRef = db.collection(comPointsType).doc(comDoc.id);
    newBatch.delete(comRef);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  if (["comPoints", "comOthersPoints"].includes(comPointsType)) {
    for (let tagId in comPointsDict) {
      comRef = db.collection(comPointsType).doc();
      cPoints = comPointsDict[tagId];
      bComPointsObj = baseReputationObj({ points: cPoints, tag: cPoints.tag, tagId });
      if (tagId in oldComPoints) {
        if (bComPointsObj.createdAt > oldComPoints[tagId].createdAt) {
          bComPointsObj.createdAt = oldComPoints[tagId].createdAt;
        }
        if (bComPointsObj.updatedAt < oldComPoints[tagId].updatedAt) {
          bComPointsObj.updatedAt = oldComPoints[tagId].updatedAt;
        }
      }
      newBatch.set(comRef, {
        ...bComPointsObj,
        admin: cPoints.admin,
        aImgUrl: cPoints.aImgUrl,
        aFullname: cPoints.aFullname,
        aChooseUname: cPoints.aChooseUname,
        adminPoints: parseFloat(cPoints.adminPoints.toFixed(3)),
      });
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  } else {
    for (let tagId in comPointsDict) {
      for (let firstDayVal in comPointsDict[tagId]) {
        comRef = db.collection(comPointsType).doc();
        cPoints = comPointsDict[tagId][firstDayVal];
        bReputationObj = baseReputationObj({ points: cPoints, tag: cPoints.tag, tagId });
        if (tagId in oldComPoints && firstDayVal in oldComPoints[tagId]) {
          if (bComPointsObj.createdAt > oldComPoints[tagId][firstDayVal].createdAt) {
            bComPointsObj.createdAt = oldComPoints[tagId][firstDayVal].createdAt;
          }
          if (bComPointsObj.updatedAt < oldComPoints[tagId][firstDayVal].updatedAt) {
            bComPointsObj.updatedAt = oldComPoints[tagId][firstDayVal].updatedAt;
          }
        }
        newBatch.set(comRef, {
          ...bReputationObj,
          [firstDayType]: firstDayVal,
          admin: cPoints.admin,
          aImgUrl: cPoints.aImgUrl,
          aFullname: cPoints.aFullname,
          aChooseUname: cPoints.aChooseUname,
          adminPoints: parseFloat(cPoints.adminPoints.toFixed(3)),
        });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};
