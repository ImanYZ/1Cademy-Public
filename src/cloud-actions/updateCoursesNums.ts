import { db } from "./utils/admin";

exports.updateCoursesNums = async () => {
  try {
    const semsters = await db.collection("semesters").get();
    for (const semster of semsters.docs) {
      const semsterData = semster.data();
      const tagId = semsterData.cTagId;
      const totalNodesQ = await db.collection("nodes").where("tagIds", "array-contains", tagId).get();
      const totalNodes = totalNodesQ.docs.length;
      const totalProposalsQ = await db.collection("versions").where("tagIds", "array-contains", tagId).get();
      const totalProposals = totalProposalsQ.docs.length;
      const updatedStudentsList = [];
      for (const student of semsterData.students) {
        const totalStudentNodes = totalNodesQ.docs.filter(
          studentNode =>
            studentNode.data()?.contribNames?.includes(student.uname) || studentNode.data()?.admin == student.uname
        ).length;
        const totalStudentProposals = totalProposalsQ.docs.filter(
          studentNode => studentNode.data()?.proposer === student.uname
        ).length;
        updatedStudentsList.push({
          ...student,
          totalNodes: totalStudentNodes,
          totalProposals: totalStudentProposals,
        });
      }
      console.log(totalNodes, "totalNodes");
      console.log(totalProposals, "totalProposals");
      console.log(updatedStudentsList, "updatedStudentsList");
      await semster.ref.update({
        totalNodes: totalNodes,
        totalProposals: totalProposals,
        students: updatedStudentsList,
      });
    }
  } catch (error) {
    console.log("cleanOpenAiAssistants", error);
  }
};
