import { NextApiRequest, NextApiResponse } from "next";

import { commitBatch, db } from "../../lib/firestoreServer/admin";
import {
  comPointTypes,
  firstWeekMonthDays,
  getTypedCollections,
  initializeNewReputationData,
  reputationTypes,
  rewriteComPointsDocs,
  rewriteReputationDocs,
} from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    //  dictionary of dictionary -> reputations[tag.node][proposer]
    const reputations: any = {};
    //  dictionary of dictionary of dictionary -> monthlyReputations[tag.node][proposer][month]
    const monthlyReputations: any = {};
    //  dictionary of dictionary of dictionary -> weeklyReputations[tag.node][proposer][week]
    const weeklyReputations: any = {};
    //  same as reputations, cannot be self-vote
    const othersReputations: any = {};
    //  same as monthlyReputations, cannot be self-vote
    const othMonReputations: any = {};
    //  same as weeklyReputations, cannot be self-vote
    const othWeekReputations: any = {};

    //  dictionary -> comPoints[tag.node]
    const comPoints: any = {};
    //  dictionary of dictionary -> comPoints[tag.node][month]
    const comMonthlyPoints: any = {};
    //  dictionary of dictionary -> comPoints[tag.node][week]
    const comWeeklyPoints: any = {};
    //  same as comPoints, cannot be self-vote
    const comOthersPoints: any = {};
    //  same as comMonthlyPoints, cannot be self-vote
    const comOthMonPoints: any = {};
    //  same as comWeeklyPoints, cannot be self-vote
    const comOthWeekPoints: any = {};

    let updatedAt, createdAt, uname, correctVal, wrongVal, instVal;
    const nodesDocs = await db.collection("nodes").get();
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      const nodeId = nodeDoc.id;
      const nodeType = nodeData.nodeType;
      // Get a reference to versions or userVersions collections based on the node type.
      const { versionsColl }: any = getTypedCollections({ nodeType });
      const versionsDocs = await versionsColl.where("node", "==", nodeId).get();
      for (let versionDoc of versionsDocs.docs) {
        const versionData = versionDoc.data();
        const versionId = versionDoc.id;
        const proposer = versionData.proposer;
        const corrects = versionData.corrects;
        const wrongs = versionData.wrongs;
        const awards = versionData.awards;
        createdAt = versionData.createdAt;
        console.log({ versionData });
        const tagIds = [...versionData.tagIds];
        const tags = [...versionData.tags];
        //  if not 1Cademy tag, add to list of tempTags
        if (!tagIds.includes("r98BjyFDCe4YyLA3U8ZE")) {
          tagIds.push("r98BjyFDCe4YyLA3U8ZE");
          tags.push("1Cademy");
        }
        let userVersionLogDocs: any = await db
          .collection("userVersionsLog")
          .where("nodeType", "==", nodeType)
          .where("version", "==", versionId)
          .get();
        userVersionLogDocs = userVersionLogDocs.docs;
        let totalCorrects = 0;
        let totalWrongs = 0;
        let totalAwards = 0;
        for (let tagIdx = 0; tagIdx < tagIds.length; tagIdx++) {
          const tagId = tagIds[tagIdx];
          const tag = tags[tagIdx];
          for (
            let userVersionLogDocIdx = 0;
            userVersionLogDocIdx <= userVersionLogDocs.length;
            userVersionLogDocIdx++
          ) {
            if (userVersionLogDocIdx < userVersionLogDocs.length) {
              const userVersionLogDoc = userVersionLogDocs[userVersionLogDocIdx];
              const userVersionLogData = userVersionLogDoc.data();
              uname = userVersionLogData.user;
              correctVal = userVersionLogData.correct;
              totalCorrects += correctVal;
              wrongVal = userVersionLogData.wrong;
              totalWrongs += wrongVal;
              instVal = userVersionLogData.award;
              totalAwards += instVal;
              updatedAt = userVersionLogData.createdAt.toDate();
            } else {
              // In the last iteration, we calculate the points based on what is left on the version that this person proposed.
              // The remainder indicates the votes that other users cast on nodes that indirectly affect the accepted proposals proportionately.
              uname = "-1-1-1Others-1-1-1";
              correctVal = Math.max(corrects - totalCorrects, 0);
              wrongVal = Math.max(wrongs - totalWrongs, 0);
              instVal = Math.max(awards - totalAwards, 0);
              updatedAt = new Date();
            }
            const { firstWeekDay, firstMonthDay } = firstWeekMonthDays(updatedAt);

            //
            // Initializing differnt types of reputations dictionary accumulators.
            //
            //  if tagId or proposer do not exist, initialize them
            if (!(tagId in reputations)) {
              reputations[tagId] = {
                // { { tagId, tag, updatedAt, createdAt } }
                [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
              };
            } else if (!(proposer in reputations[tagId])) {
              reputations[tagId][proposer] = initializeNewReputationData({
                tagId,
                tag,
                updatedAt,
                createdAt
              });
            }
            if (!(tagId in monthlyReputations)) {
              monthlyReputations[tagId] = {
                [proposer]: {
                  [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                },
              };
            } else if (!(proposer in monthlyReputations[tagId])) {
              monthlyReputations[tagId][proposer] = {
                [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
              };
            } else if (!(firstMonthDay in monthlyReputations[tagId][proposer])) {
              monthlyReputations[tagId][proposer][firstMonthDay] = initializeNewReputationData({
                tagId,
                tag,
                updatedAt,
                createdAt
              });
            }
            if (!(tagId in weeklyReputations)) {
              weeklyReputations[tagId] = {
                [proposer]: {
                  [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                },
              };
            } else if (!(proposer in weeklyReputations[tagId])) {
              weeklyReputations[tagId][proposer] = {
                [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
              };
            } else if (!(firstWeekDay in weeklyReputations[tagId][proposer])) {
              weeklyReputations[tagId][proposer][firstWeekDay] = initializeNewReputationData({
                tagId,
                tag,
                updatedAt,
                createdAt
              });
            }
            //  if the user did not self-vote
            if (proposer !== uname) {
              if (!(tagId in othersReputations)) {
                othersReputations[tagId] = {
                  [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                };
              } else if (!(proposer in othersReputations[tagId])) {
                othersReputations[tagId][proposer] = initializeNewReputationData({
                  tagId,
                  tag,
                  updatedAt,
                  createdAt
                });
              }
              if (!(tagId in othMonReputations)) {
                othMonReputations[tagId] = {
                  [proposer]: {
                    [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                  },
                };
              } else if (!(proposer in othMonReputations[tagId])) {
                othMonReputations[tagId][proposer] = {
                  [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                };
              } else if (!(firstMonthDay in othMonReputations[tagId][proposer])) {
                othMonReputations[tagId][proposer][firstMonthDay] = initializeNewReputationData({
                  tagId,
                  tag,
                  updatedAt,
                  createdAt
                });
              }
              if (!(tagId in othWeekReputations)) {
                othWeekReputations[tagId] = {
                  [proposer]: {
                    [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                  },
                };
              } else if (!(proposer in othWeekReputations[tagId])) {
                othWeekReputations[tagId][proposer] = {
                  [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                };
              } else if (!(firstWeekDay in othWeekReputations[tagId][proposer])) {
                othWeekReputations[tagId][proposer][firstWeekDay] = initializeNewReputationData({
                  tagId,
                  tag,
                  updatedAt,
                  createdAt
                });
              }

              //
              // Initializing differnt types of comOthersPoints dictionary accumulators excluding self-votes.
              //
              if (!(tagId in comOthersPoints)) {
                comOthersPoints[tagId] = initializeNewReputationData({
                  tagId,
                  tag,
                  updatedAt,
                  createdAt
                });
                comOthersPoints[tagId].adminPoints = 0;
              }
              if (!(tagId in comOthMonPoints)) {
                comOthMonPoints[tagId] = {
                  [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                };
                comOthMonPoints[tagId][firstMonthDay].adminPoints = 0;
              } else if (!(firstMonthDay in comOthMonPoints[tagId])) {
                comOthMonPoints[tagId][firstMonthDay] = initializeNewReputationData({
                  tagId,
                  tag,
                  updatedAt,
                  createdAt
                });
                comOthMonPoints[tagId][firstMonthDay].adminPoints = 0;
              }
              if (!(tagId in comOthWeekPoints)) {
                comOthWeekPoints[tagId] = {
                  [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
                };
                comOthWeekPoints[tagId][firstWeekDay].adminPoints = 0;
              } else if (!(firstWeekDay in comOthWeekPoints[tagId])) {
                comOthWeekPoints[tagId][firstWeekDay] = initializeNewReputationData({
                  tagId,
                  tag,
                  updatedAt,
                  createdAt
                });
                comOthWeekPoints[tagId][firstWeekDay].adminPoints = 0;
              }
            }

            //
            // Initializing differnt types of comOthersPoints dictionary accumulators.
            //
            if (!(tagId in comPoints)) {
              comPoints[tagId] = initializeNewReputationData({ tagId, tag, updatedAt, createdAt });
              comPoints[tagId].adminPoints = 0;
            }
            if (!(tagId in comMonthlyPoints)) {
              comMonthlyPoints[tagId] = {
                [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
              };
              comMonthlyPoints[tagId][firstMonthDay].adminPoints = 0;
            } else if (!(firstMonthDay in comMonthlyPoints[tagId])) {
              comMonthlyPoints[tagId][firstMonthDay] = initializeNewReputationData({
                tagId,
                tag,
                updatedAt,
                createdAt
              });
              comMonthlyPoints[tagId][firstMonthDay].adminPoints = 0;
            }
            if (!(tagId in comWeeklyPoints)) {
              comWeeklyPoints[tagId] = {
                [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
              };
              comWeeklyPoints[tagId][firstWeekDay].adminPoints = 0;
            } else if (!(firstWeekDay in comWeeklyPoints[tagId])) {
              comWeeklyPoints[tagId][firstWeekDay] = initializeNewReputationData({
                tagId,
                tag,
                updatedAt,
                createdAt
              });
              comWeeklyPoints[tagId][firstWeekDay].adminPoints = 0;
            }

            // Array of dictionaries. Allows us to iterate through the array and based on the type of reputation/community points, we will be able
            // to update proposerPoints and cPoints.
            const proposerComObjects = [
              {
                proposerPoints: reputations[tagId][proposer],
                cPoints: comPoints[tagId],
              },
              {
                proposerPoints: monthlyReputations[tagId][proposer][firstMonthDay],
                cPoints: comMonthlyPoints[tagId][firstMonthDay],
              },
              {
                proposerPoints: weeklyReputations[tagId][proposer][firstWeekDay],
                cPoints: comWeeklyPoints[tagId][firstWeekDay],
              },
            ];
            if (proposer !== uname) {
              proposerComObjects.push({
                proposerPoints: othersReputations[tagId][proposer],
                cPoints: comOthersPoints[tagId],
              });
              proposerComObjects.push({
                proposerPoints: othMonReputations[tagId][proposer][firstMonthDay],
                cPoints: comOthMonPoints[tagId][firstMonthDay],
              });
              proposerComObjects.push({
                proposerPoints: othWeekReputations[tagId][proposer][firstWeekDay],
                cPoints: comOthWeekPoints[tagId][firstWeekDay],
              });
            }
            //  iterate through reputations, monthly reputations, weekly reputations, othersReputations, othersMonthReputations
            //  in proposerComObjects
            // update reputation and community points based on the computed values and node types
            for (let { proposerPoints, cPoints } of proposerComObjects) {
              switch (nodeType) {
                case "Concept":
                  proposerPoints.cnCorrects += correctVal;
                  proposerPoints.cnInst += instVal;
                  proposerPoints.cnWrongs += wrongVal;
                  cPoints.cnCorrects += correctVal;
                  cPoints.cnInst += instVal;
                  cPoints.cnWrongs += wrongVal;
                  break;
                case "Code":
                  proposerPoints.cdCorrects += correctVal;
                  proposerPoints.cdInst += instVal;
                  proposerPoints.cdWrongs += wrongVal;
                  cPoints.cdCorrects += correctVal;
                  cPoints.cdInst += instVal;
                  cPoints.cdWrongs += wrongVal;
                  break;
                case "Question":
                  proposerPoints.qCorrects += correctVal;
                  proposerPoints.qInst += instVal;
                  proposerPoints.qWrongs += wrongVal;
                  cPoints.qCorrects += correctVal;
                  cPoints.qInst += instVal;
                  cPoints.qWrongs += wrongVal;
                  break;
                case "Profile":
                  proposerPoints.pCorrects += correctVal;
                  proposerPoints.pInst += instVal;
                  proposerPoints.pWrongs += wrongVal;
                  cPoints.pCorrects += correctVal;
                  cPoints.pInst += instVal;
                  cPoints.pWrongs += wrongVal;
                  break;
                case "Sequel":
                  proposerPoints.sCorrects += correctVal;
                  proposerPoints.sInst += instVal;
                  proposerPoints.sWrongs += wrongVal;
                  cPoints.sCorrects += correctVal;
                  cPoints.sInst += instVal;
                  cPoints.sWrongs += wrongVal;
                  break;
                case "Advertisement":
                  proposerPoints.aCorrects += correctVal;
                  proposerPoints.aInst += instVal;
                  proposerPoints.aWrongs += wrongVal;
                  cPoints.aCorrects += correctVal;
                  cPoints.aInst += instVal;
                  cPoints.aWrongs += wrongVal;
                  break;
                case "Reference":
                  proposerPoints.rfCorrects += correctVal;
                  proposerPoints.rfInst += instVal;
                  proposerPoints.rfWrongs += wrongVal;
                  cPoints.rfCorrects += correctVal;
                  cPoints.rfInst += instVal;
                  cPoints.rfWrongs += wrongVal;
                  break;
                case "News":
                  proposerPoints.nCorrects += correctVal;
                  proposerPoints.nInst += instVal;
                  proposerPoints.nWrongs += wrongVal;
                  cPoints.nCorrects += correctVal;
                  cPoints.nInst += instVal;
                  cPoints.nWrongs += wrongVal;
                  break;
                case "Idea":
                  proposerPoints.iCorrects += correctVal;
                  proposerPoints.iInst += instVal;
                  proposerPoints.iWrongs += wrongVal;
                  cPoints.iCorrects += correctVal;
                  cPoints.iInst += instVal;
                  cPoints.iWrongs += wrongVal;
                  break;
                case "Relation":
                  proposerPoints.mCorrects += correctVal;
                  proposerPoints.mInst += instVal;
                  proposerPoints.mWrongs += wrongVal;
                  cPoints.mCorrects += correctVal;
                  cPoints.mInst += instVal;
                  cPoints.mWrongs += wrongVal;
                  break;
                default:
                  console.log("[recalculateAllReputations]: Strange nodeType: " + nodeType);
              }
              proposerPoints.positives += correctVal + instVal;
              proposerPoints.negatives += wrongVal;
              proposerPoints.totalPoints += correctVal + instVal - wrongVal;
              cPoints.positives += correctVal + instVal;
              cPoints.negatives += wrongVal;
              cPoints.totalPoints += correctVal + instVal - wrongVal;
              // In case that the admin of the community has never been initialized, even if the reputation points of this user is negative they should be the admin.
              if (proposerPoints.totalPoints >= cPoints.adminPoints) {
                cPoints.admin = proposer;
                cPoints.aImgUrl = versionData.imageUrl;
                cPoints.aFullname = versionData.fullname;
                cPoints.aChooseUname = versionData.chooseUname;
                cPoints.adminPoints = proposerPoints.totalPoints;
              }
              proposerPoints.isAdmin = proposer === cPoints.admin;
              // We are iterating through all the votes on the versions that a proposer has proposed (or all the versions in a specific community).
              // Every time a vote is cast the corresponding reputation points and community points should be updated.
              // updatedAt in both reputations and comPoints should always indicate the last date and time that a vote was cast affecting that document.
              // So, we take the most recent updatedAt value for each reputions or comPoints document.
              proposerPoints.createdAt =
                proposerPoints.createdAt > createdAt ? createdAt : proposerPoints.createdAt;
              cPoints.createdAt = cPoints.createdAt > createdAt ? createdAt : cPoints.createdAt;
              proposerPoints.updatedAt =
                proposerPoints.updatedAt < updatedAt ? updatedAt : proposerPoints.updatedAt;
              cPoints.updatedAt = cPoints.updatedAt < updatedAt ? updatedAt : cPoints.updatedAt;
              // if (
              //   proposer === "catgrillo" &&
              //   (tag === "User Experience (UX) Research" ||
              //     tagId === "0OcDwfPChQuXFRnNCH9G")
              // ) {
              //   console.log({ i, correctVal, instVal, wrongVal, proposerPoints });
              // }
            }
            // if (
            //   proposer === "catgrillo" &&
            //   (tag === "User Experience (UX) Research" ||
            //     tagId === "0OcDwfPChQuXFRnNCH9G")
            // ) {
            //   console.log({ tagTitle: tag });
            //   console.log({ tagId: tagId });
            //   console.log(
            //     "reputations["0OcDwfPChQuXFRnNCH9G"]['catgrillo']: ",
            //     reputations["0OcDwfPChQuXFRnNCH9G"]["catgrillo"]
            //   );
            // }
          }
        }
      }
      console.log({ nodeId });
    }

    let batch = db.batch();
    let writeCounts = 0;
    // We delete all the reputations and comPoints docs because even for those with current values want
    // to restructure them from dCorrects, dWrongs, ... to points corresponding to each type of nodes.
    for (let reputationsType of reputationTypes) {
      let reputationsDict = reputations;
      switch (reputationsType) {
        case "monthlyReputations":
          reputationsDict = monthlyReputations;
          break;
        case "weeklyReputations":
          reputationsDict = weeklyReputations;
          break;
        case "othersReputations":
          reputationsDict = othersReputations;
          break;
        case "othMonReputations":
          reputationsDict = othMonReputations;
          break;
        case "othWeekReputations":
          reputationsDict = othWeekReputations;
          break;
        default:
          reputationsDict = reputations;
      }
      [batch, writeCounts] = await rewriteReputationDocs({
        batch,
        reputationsType,
        reputationsDict,
        writeCounts
      });
    }
    for (let comPointsType of comPointTypes) {
      let comPointsDict = comPoints;
      switch (comPointsType) {
        case "comMonthlyPoints":
          comPointsDict = comMonthlyPoints;
          break;
        case "comWeeklyPoints":
          comPointsDict = comWeeklyPoints;
          break;
        case "comOthersPoints":
          comPointsDict = comOthersPoints;
          break;
        case "comOthMonPoints":
          comPointsDict = comOthMonPoints;
          break;
        case "comOthWeekPoints":
          comPointsDict = comOthWeekPoints;
          break;
        default:
          comPointsDict = comPoints;
      }
      [batch, writeCounts] = await rewriteComPointsDocs({
        batch,
        comPointsType,
        comPointsDict,
        writeCounts
      });
    }
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;