import { commitBatch, db } from "@/lib/firestoreServer/admin";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { ICourse, IInstructor, ISemester } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";

export type InstructorCourseCreatePayload = {
  startDate: string;
  endDate: string;
  courseCode: string;
  semesterName: string;
  programName: string;
  departmentName: string;
  universityName: string;
};

async function createNodeVersion(nodeRef: DocumentReference, node: INode, instructor: IUser) {
  return {
    versionRef: db.collection("relationVersions").doc(),
    versionData: {
      content: node.content,
      title: node.title,
      fullname: `${instructor.fName} ${instructor.lName}`,
      children: node.children,
      addedInstitContris: false,
      accepted: true,
      imageUrl: instructor.imageUrl,
      updatedAt: new Date(),
      chooseUname: instructor.chooseUname,
      node: nodeRef.id,
      parents: node.parents,
      addedParents: false,
      deleted: false,
      corrects: 1,
      proposer: instructor.uname,
      viewers: 1,
      proposal: "",
      removedParents: false,
      awards: 0,
      summary: "",
      nodeImage: "",
      referenceIds: node.referenceIds,
      references: node.references,
      referenceLabels: node.referenceLabels,
      wrongs: 0,
      createdAt: new Date(),
      tags: node.tags,
      tagIds: node.tagIds,
    },
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  let batch = db.batch();

  if (!req.body?.data?.user?.instructor) {
    throw new Error("your are not instructor");
  }
  const userData = req?.body?.data?.user?.userData as IUser;

  const payload = req.body as InstructorCourseCreatePayload;

  const startDate = moment(payload.startDate);
  const endDate = moment(payload.endDate);

  const courseCode = payload.courseCode;
  const semesterName = payload.semesterName;
  const programName = payload.programName;
  const departmentName = payload.departmentName;

  const instructorId = userData.uname;
  const universityTitle = payload.universityName;
  // SI691 - Fall 2020 @ MSI in Information Science @ University of Michigan

  const departmentTitle = `${departmentName} @ ${universityTitle}`;
  const programTitle = `${programName} in ${departmentTitle}`; // setup node for it
  const courseTitle = `${courseCode} @ ${programTitle}`;
  const semesterTitle = `${courseCode} - ${semesterName} @ ${programName} in ${departmentTitle}`;

  // 1. Instructor setup
  const instructors = await db.collection("instructors").where("uname", "==", instructorId).get();
  let _instructorId = "";
  let instructor: IInstructor;
  if (instructors.docs.length) {
    const _instructor = instructors.docs[0];
    _instructorId = _instructor.id;
    instructor = _instructor.data() as IInstructor;
  } else {
    instructor = {
      uname: instructorId,
      courses: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const _instructor = db.collection("instructors").doc();
    _instructorId = _instructor.id;
    batch.set(_instructor, instructor);
  }

  // 2. University Relation Node setup
  const unodes = await db.collection("nodes").where("title", "==", universityTitle).where("deleted", "==", false).get();
  let universityNodeId = "";
  let university: INode;
  const relationUNodes = unodes.docs.filter(udoc => udoc.data().nodeType === "Relation");
  if (relationUNodes.length) {
    universityNodeId = relationUNodes[0].id;
    university = relationUNodes[0].data() as INode;
  } else {
    const userFullName = `${userData.fName} ${userData.lName}`;
    const _universityNode = db.collection("nodes").doc();
    universityNodeId = _universityNode.id;
    university = {
      aChooseUname: userData.chooseUname,
      aImgUrl: userData.imageUrl,
      aFullname: userFullName,
      admin: userData.uname,
      corrects: 0,
      wrongs: 0,
      nodeType: "Relation",
      contribNames: [userFullName],
      contributors: {
        [`${userData.uname}`]: {
          imageUrl: userData.imageUrl,
          fullname: userFullName,
          reputation: 0,
          chooseUname: userData.chooseUname,
        },
      },
      title: universityTitle,
      isTag: true,
      nodeImage: "",
      comments: 0,
      deleted: false,
      content: "",
      choices: [],
      viewers: 0,
      versions: 1,
      tags: [],
      tagIds: [],
      height: 0,
      studied: 0,
      references: [],
      referenceLabels: [],
      referenceIds: [],
      parents: [],
      children: [],
      institNames: [universityTitle],
      institutions: {
        [universityTitle]: {
          reputation: 0,
        },
      },
      locked: true,
      changedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      maxVersionRating: 0,
    };
    batch.set(_universityNode, university);

    const userNodeRef = db.collection("userNodes").doc();
    batch.set(userNodeRef, {
      visible: true,
      open: false,
      bookmarked: false,
      changed: false,
      correct: false,
      createdAt: new Date(),
      deleted: false,
      isStudied: false,
      node: _universityNode.id,
      updatedAt: new Date(),
      user: instructorId,
      wrong: false,
    });

    const { versionRef, versionData } = await createNodeVersion(_universityNode, university, userData);
    batch.set(versionRef, versionData);
  }

  // 3. Create Department Node
  const dnodes = await db.collection("nodes").where("title", "==", departmentTitle).where("deleted", "==", false).get();
  let departmentNodeId = "";
  let department: INode;
  const relationDNodes = dnodes.docs.filter(ddoc => ddoc.data().nodeType === "Relation");
  if (relationDNodes.length) {
    department = relationDNodes[0].data() as INode;
    departmentNodeId = relationDNodes[0].id;
  } else {
    const userFullName = `${userData.fName} ${userData.lName}`;
    const _departmentNode = db.collection("nodes").doc();
    departmentNodeId = _departmentNode.id;
    department = {
      aChooseUname: userData.chooseUname,
      aImgUrl: userData.imageUrl,
      aFullname: userFullName,
      admin: userData.uname,
      corrects: 0,
      wrongs: 0,
      nodeType: "Relation",
      contribNames: [userFullName],
      contributors: {
        [`${userData.uname}`]: {
          imageUrl: userData.imageUrl,
          fullname: userFullName,
          reputation: 0,
          chooseUname: userData.chooseUname,
        },
      },
      title: departmentTitle,
      isTag: true,
      nodeImage: "",
      comments: 0,
      deleted: false,
      content: "",
      choices: [],
      viewers: 0,
      versions: 1,
      tags: [universityTitle],
      tagIds: [universityNodeId],
      height: 0,
      studied: 0,
      references: [],
      referenceLabels: [],
      referenceIds: [],
      parents: [
        {
          node: universityNodeId,
          title: universityTitle,
          type: "Relation",
          label: "",
        },
      ],
      children: [],
      institNames: [universityTitle],
      institutions: {
        [universityTitle]: {
          reputation: 0,
        },
      },
      locked: true,
      changedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      maxVersionRating: 0,
    };
    batch.set(_departmentNode, department);

    const userNodeRef = db.collection("userNodes").doc();
    batch.set(userNodeRef, {
      visible: true,
      open: false,
      bookmarked: false,
      changed: false,
      correct: false,
      createdAt: new Date(),
      deleted: false,
      isStudied: false,
      node: _departmentNode.id,
      updatedAt: new Date(),
      user: instructorId,
      wrong: false,
    });

    const { versionRef, versionData } = await createNodeVersion(_departmentNode, department, userData);
    batch.set(versionRef, versionData);
  }

  // 4. Create Program Node
  const pnodes = await db.collection("nodes").where("title", "==", programTitle).where("deleted", "==", false).get();
  let programNodeId = "";
  let program: INode;
  const relationPNodes = pnodes.docs.filter(pdoc => pdoc.data().nodeType === "Relation");
  if (relationPNodes.length) {
    program = relationPNodes[0].data() as INode;
    programNodeId = relationPNodes[0].id;
  } else {
    const userFullName = `${userData.fName} ${userData.lName}`;
    const _programNode = db.collection("nodes").doc();
    programNodeId = _programNode.id;
    program = {
      aChooseUname: userData.chooseUname,
      aImgUrl: userData.imageUrl,
      aFullname: userFullName,
      admin: userData.uname,
      corrects: 0,
      wrongs: 0,
      nodeType: "Relation",
      contribNames: [userFullName],
      contributors: {
        [`${userData.uname}`]: {
          imageUrl: userData.imageUrl,
          fullname: userFullName,
          reputation: 0,
          chooseUname: userData.chooseUname,
        },
      },
      title: programTitle,
      isTag: true,
      nodeImage: "",
      comments: 0,
      deleted: false,
      content: "",
      choices: [],
      viewers: 0,
      versions: 1,
      tags: [universityTitle, departmentTitle],
      tagIds: [universityNodeId, departmentNodeId],
      height: 0,
      studied: 0,
      references: [],
      referenceLabels: [],
      referenceIds: [],
      parents: [
        {
          node: departmentNodeId,
          title: departmentTitle,
          type: "Relation",
          label: "",
        },
      ],
      children: [],
      institNames: [universityTitle],
      institutions: {
        [universityTitle]: {
          reputation: 0,
        },
      },
      locked: true,
      changedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      maxVersionRating: 0,
    };
    batch.set(_programNode, program);

    const userNodeRef = db.collection("userNodes").doc();
    batch.set(userNodeRef, {
      visible: true,
      open: false,
      bookmarked: false,
      changed: false,
      correct: false,
      createdAt: new Date(),
      deleted: false,
      isStudied: false,
      node: _programNode.id,
      updatedAt: new Date(),
      user: instructorId,
      wrong: false,
    });

    const { versionRef, versionData } = await createNodeVersion(_programNode, program, userData);
    batch.set(versionRef, versionData);
  }

  // 5. Create Course Node
  const cnodes = await db.collection("nodes").where("title", "==", courseTitle).where("deleted", "==", false).get();
  let courseNodeId = "";
  let course: INode;
  const relationCNodes = cnodes.docs.filter(cdoc => cdoc.data().nodeType === "Relation");
  if (relationCNodes.length) {
    courseNodeId = relationCNodes[0].id;
    course = relationCNodes[0].data() as INode;
  } else {
    const userFullName = `${userData.fName} ${userData.lName}`;
    const _courseNode = db.collection("nodes").doc();
    courseNodeId = _courseNode.id;
    course = {
      aChooseUname: userData.chooseUname,
      aImgUrl: userData.imageUrl,
      aFullname: userFullName,
      admin: userData.uname,
      corrects: 0,
      wrongs: 0,
      nodeType: "Relation",
      contribNames: [userFullName],
      contributors: {
        [`${userData.uname}`]: {
          imageUrl: userData.imageUrl,
          fullname: userFullName,
          reputation: 0,
          chooseUname: userData.chooseUname,
        },
      },
      title: courseTitle,
      isTag: true,
      nodeImage: "",
      comments: 0,
      deleted: false,
      content: "",
      choices: [],
      viewers: 0,
      versions: 1,
      tags: [universityTitle, departmentTitle, programTitle],
      tagIds: [universityNodeId, departmentNodeId, programNodeId],
      height: 0,
      studied: 0,
      references: [],
      referenceLabels: [],
      referenceIds: [],
      parents: [
        {
          node: programNodeId,
          title: programTitle,
          type: "Relation",
          label: "",
        },
      ],
      children: [],
      institNames: [universityTitle],
      institutions: {
        [universityTitle]: {
          reputation: 0,
        },
      },
      locked: true,
      changedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      maxVersionRating: 0,
    };
    batch.set(_courseNode, course);

    const userNodeRef = db.collection("userNodes").doc();
    batch.set(userNodeRef, {
      visible: true,
      open: false,
      bookmarked: false,
      changed: false,
      correct: false,
      createdAt: new Date(),
      deleted: false,
      isStudied: false,
      node: _courseNode.id,
      updatedAt: new Date(),
      user: instructorId,
      wrong: false,
    });

    const { versionRef, versionData } = await createNodeVersion(_courseNode, course, userData);
    batch.set(versionRef, versionData);
  }

  // 6. Create Semester Node
  const snodes = await db.collection("nodes").where("title", "==", semesterTitle).where("deleted", "==", false).get();
  let semesterNodeId = "";
  let semester: INode;
  const relationSNodes = snodes.docs.filter(sdoc => sdoc.data().nodeType === "Relation");
  if (relationSNodes.length) {
    semesterNodeId = relationSNodes[0].id;
    semester = relationSNodes[0].data() as INode;
  } else {
    const userFullName = `${userData.fName} ${userData.lName}`;
    const _semesterNode = db.collection("nodes").doc();
    semesterNodeId = _semesterNode.id;
    semester = {
      aChooseUname: userData.chooseUname,
      aImgUrl: userData.imageUrl,
      aFullname: userFullName,
      admin: userData.uname,
      corrects: 0,
      wrongs: 0,
      nodeType: "Relation",
      contribNames: [userFullName],
      contributors: {
        [`${userData.uname}`]: {
          imageUrl: userData.imageUrl,
          fullname: userFullName,
          reputation: 0,
          chooseUname: userData.chooseUname,
        },
      },
      title: semesterTitle,
      isTag: true,
      nodeImage: "",
      comments: 0,
      deleted: false,
      content: "",
      choices: [],
      viewers: 0,
      versions: 1,
      tags: [universityTitle, departmentTitle, programTitle, courseTitle],
      tagIds: [universityNodeId, departmentNodeId, programNodeId, courseNodeId],
      height: 0,
      studied: 0,
      references: [],
      referenceLabels: [],
      referenceIds: [],
      parents: [
        {
          node: courseNodeId,
          title: courseTitle,
          type: "Relation",
          label: "",
        },
      ],
      children: [],
      institNames: [universityTitle],
      institutions: {
        [universityTitle]: {
          reputation: 0,
        },
      },
      locked: true,
      changedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      maxVersionRating: 0,
    };
    batch.set(_semesterNode, semester);

    const userNodeRef = db.collection("userNodes").doc();
    batch.set(userNodeRef, {
      visible: true,
      open: false,
      bookmarked: false,
      changed: false,
      correct: false,
      createdAt: new Date(),
      deleted: false,
      isStudied: false,
      node: _semesterNode.id,
      updatedAt: new Date(),
      user: instructorId,
      wrong: false,
    });

    const { versionRef, versionData } = await createNodeVersion(_semesterNode, semester, userData);
    batch.set(versionRef, versionData);
  }

  await commitBatch(batch);

  batch = db.batch();

  // Attaching department with university
  const universityNodeRef = db.collection("nodes").doc(universityNodeId);
  const universityChildren = university.children.filter(child => child.node === departmentNodeId);
  if (!universityChildren.length) {
    university.children.push({
      node: departmentNodeId,
      title: departmentTitle,
      type: "Relation",
      label: "",
    });
    batch.set(universityNodeRef, university);
  }

  // Attaching program with department
  const departmentNodeRef = db.collection("nodes").doc(departmentNodeId);
  const departmentChildren = department.children.filter(child => child.node === programNodeId);
  if (!departmentChildren.length) {
    department.children.push({
      node: programNodeId,
      title: programTitle,
      type: "Relation",
      label: "",
    });
    batch.set(departmentNodeRef, department);
  }

  // Attaching course with program
  const programNodeRef = db.collection("nodes").doc(programNodeId);
  const programChildren = program.children.filter(child => child.node === courseNodeId);
  if (!programChildren.length) {
    program.children.push({
      node: courseNodeId,
      title: courseTitle,
      type: "Relation",
      label: "",
    });
    batch.set(programNodeRef, program);
  }

  // Attaching semester with course
  const courseNodeRef = db.collection("nodes").doc(courseNodeId);
  const courseChildren = course.children.filter(child => child.node === semesterNodeId);
  if (!courseChildren.length) {
    course.children.push({
      node: semesterNodeId,
      title: semesterTitle,
      type: "Relation",
      label: "",
    });
    batch.update(courseNodeRef, course);
  }

  // Add semester to Instructor document
  const _instructor = db.collection("instructors").doc(_instructorId);
  if (!instructor.courses.filter(course => course.tagId === semesterNodeId).length) {
    instructor.courses.push({
      uTagId: universityNodeId,
      uTitle: universityTitle,
      pTagId: programNodeId,
      pTitle: `${programName} in ${departmentName}`,
      cTagId: courseNodeId,
      cTitle: courseCode,
      tagId: semesterNodeId,
      title: semesterName,
    });
    batch.update(_instructor, instructor);
  }

  // Add course details in courses
  const _courseRef = db.collection("courses").doc(courseNodeId);
  if (!(await _courseRef.get()).exists) {
    await _courseRef.set({
      title: courseCode,
      node: courseNodeId,
      uTagIds: [universityNodeId],
      uTitles: [universityTitle],
      sTagIds: [semesterNodeId],
      sTitles: [semesterName],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as ICourse);
  } else {
    const _courseData: ICourse = (await _courseRef.get()).data() as ICourse;
    if (_courseData.sTagIds.indexOf(semesterNodeId) === -1) {
      batch.update(_courseRef, {
        sTagIds: [..._courseData.sTagIds, semesterNodeId],
        sTitles: [..._courseData.sTitles, semesterName],
        updatedAt: Timestamp.now(),
      });
    }
  }

  // Add Semester in semesters collection
  const _semesterRef = db.collection("semesters").doc(semesterNodeId);
  if (!(await _semesterRef.get()).exists) {
    batch.set(_semesterRef, {
      instructors: [instructorId],
      title: semesterName,
      tagId: semesterNodeId,
      uTagId: universityNodeId,
      uTitle: universityTitle,
      dTagId: departmentNodeId,
      dTitle: departmentName,
      cTagId: courseNodeId,
      cTitle: courseCode,
      pTitle: `${programName} in ${departmentName}`, // program tile
      pTagId: programNodeId, // program tag id
      syllabus: [],
      startDate: Timestamp.fromDate(startDate.toDate()),
      endDate: Timestamp.fromDate(endDate.toDate()),
      days: endDate.diff(startDate, "days"),
      nodeProposals: {
        startDate: Timestamp.fromDate(startDate.toDate()),
        endDate: Timestamp.fromDate(endDate.toDate()),
        numPoints: 1,
        numProposalPerDay: 1,
        totalDaysOfCourse: 1,
      },
      questionProposals: {
        startDate: Timestamp.fromDate(startDate.toDate()),
        endDate: Timestamp.fromDate(endDate.toDate()),
        numPoints: 1,
        numQuestionsPerDay: 1,
        totalDaysOfCourse: 1,
      },
      votes: {
        pointIncrementOnAgreement: 1,
        pointDecrementOnAgreement: 1,
        onReceiveVote: 1,
        onReceiveDownVote: 1,
        onReceiveStar: 1,
      },
      isProposalRequired: false,
      isQuestionProposalRequired: false,
      isCastingVotesRequired: false,
      isGettingVotesRequired: false,
      deleted: false,
      students: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as ISemester);
  }

  await commitBatch(batch);

  res.status(201).json({
    semesterId: semesterNodeId,
  });
}

export default fbAuth(handler);
