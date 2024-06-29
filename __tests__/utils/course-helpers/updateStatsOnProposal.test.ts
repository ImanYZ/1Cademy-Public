import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import createCourseHandler, { InstructorCourseCreatePayload } from "src/pages/api/instructor/course/create";
import courseSettingHandler, {
  InstructorSemesterSettingPayload,
} from "src/pages/api/instructor/students/[semesterId]/setting";
import studentSignupHandler, {
  InstructorSemesterSignUpPayload,
} from "src/pages/api/instructor/students/[semesterId]/signup";
import { updateStatsOnProposal } from "src/utils/course-helpers";
import { createInstitution } from "testUtils/fakers/institution";
import { createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import { MockData } from "testUtils/mockCollections";

import { admin, db } from "@/lib/firestoreServer/admin";

initFirebaseClientSDK();
import moment from "moment";
import { ISemester, ISemesterStudentStat, ISemesterStudentVoteStat } from "src/types/ICourse";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";

describe("updateStatsOnProposal", () => {
  const institutions = [
    createInstitution({
      domain: "@1cademy.com",
    }),
  ];

  const users = [
    // instructor
    getDefaultUser({
      institutionName: institutions[0].name,
    }),
    // student
    createUser({
      institutionName: institutions[0].name,
    }),
  ];

  const nodes = [
    // default node by instructor
    getDefaultNode({
      admin: users[0],
    }),
  ];

  const reputationPoints = [
    // default user reputation
    createReputationPoints({
      user: users[0],
      tag: nodes[0],
    }),
    // student reputation
    createReputationPoints({
      user: users[1],
      tag: nodes[0],
    }),
  ];

  const userNodes = [
    // instructor agreement on this node
    createUserNode({
      node: nodes[0],
      user: users[0],
      correct: true,
    }),
  ];

  const nodeVersions = [];
  // default node version
  nodeVersions.push(
    createNodeVersion({
      accepted: true,
      node: nodes[0],
      proposer: users[0],
      nodeType: "Concept",
    })
  );

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const versionsCollection = new MockData(nodeVersions, "versions");
  const userNodesCollection = new MockData(userNodes, "userNodes");
  const reputationsCollection = new MockData(reputationPoints, "reputations");

  const collects = [
    usersCollection,
    nodesCollection,
    versionsCollection,
    userNodesCollection,
    reputationsCollection,
    new MockData([], "credits"),
    new MockData([], "courses"),
    new MockData([], "instructors"),
    new MockData([], "versions"),
    new MockData([], "semesters"),
    new MockData([], "semesterStudentSankeys"),
    new MockData([], "semesterStudentStats"),
    new MockData([], "semesterStudentVoteStats"),
    new MockData([], "userVersions"),
  ];

  const auth = admin.auth();

  let accessToken: string = "";
  let req: any = {};
  let res: any = {};
  let semesterId: string = "";

  beforeEach(async () => {
    const instructor = await auth.createUser({
      email: users[0].email,
      password: "mockPassword",
      disabled: false,
      emailVerified: true,
      uid: users[0].userId,
      displayName: users[0].documentId,
    });
    await auth.setCustomUserClaims(instructor.uid, {
      instructor: true,
    });
    const r = await signInWithEmailAndPassword(getAuth(), users[0].email, "mockPassword");
    accessToken = await r.user.getIdToken(false);

    const student = await auth.createUser({
      email: users[1].email,
      password: "mockPassword",
      disabled: false,
      emailVerified: true,
      uid: users[1].userId,
      displayName: users[1].documentId,
    });
    await auth.setCustomUserClaims(student.uid, {
      student: true,
    });

    await Promise.all(collects.map(collect => collect.populate()));

    const startDate = moment().startOf("day").format("YYYY-MM-DD");
    const endDate = moment().startOf("day").add(90).format("YYYY-MM-DD");

    // creating course/semester
    req = HttpMock.createRequest({
      method: "POST",
      body: {
        courseCode: "TEST",
        departmentName: "D Name",
        startDate,
        endDate,
        programName: "P Name",
        semesterName: "S Name",
        universityName: institutions[0].name,
        root: nodes[0].documentId!,
      } as InstructorCourseCreatePayload,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });
    res = HttpMock.createResponse();
    await createCourseHandler(req, res as any);
    semesterId = res._getJSONData()?.semesterId;

    // register student in semester
    req = HttpMock.createRequest({
      method: "POST",
      body: {
        students: [
          {
            email: users[1].email,
            fName: users[1].fName,
            lName: users[1].lName,
          },
        ],
      } as InstructorSemesterSignUpPayload,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });
    req.query.semesterId = semesterId;
    res = HttpMock.createResponse();
    await studentSignupHandler(req, res as any);

    // creating syllabus
    req = HttpMock.createRequest({
      method: "POST",
      body: {
        startDate,
        endDate,
        isCastingVotesRequired: true,
        isGettingVotesRequired: true,
        isProposalRequired: true,
        isQuestionProposalRequired: true,
        nodeProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numProposalPerDay: 2,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        questionProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        syllabus: [
          {
            title: "title 1",
          },
          {
            title: "title 2",
          },
        ],
        votes: {
          onReceiveDownVote: 1,
          onReceiveStar: 1,
          onReceiveVote: 1,
          pointIncrementOnAgreement: 1,
          pointDecrementOnAgreement: 1,
        },
        dailyPractice: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        isDailyPracticeRequired: true,
      } as InstructorSemesterSettingPayload,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });
    req.query.semesterId = semesterId;
    res = HttpMock.createResponse();
    await courseSettingHandler(req, res as any);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("stats should be updated when proposed version is not approved (improvement - non question)", async () => {
    // creating a version for node
    const _nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        corrects: 0,
        accepted: false,
        proposer: users[1],
        nodeType: "Concept",
      }),
    ];
    await new MockData(_nodeVersions, "versions").populate();

    const semester = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semester.data() as ISemester;
    const chapterIds = semesterData.syllabus.map(syllabusItem => syllabusItem.node!);
    await updateStatsOnProposal({
      tagIds: [semester.id, ...chapterIds],
      isChild: false,
      approved: false,
      nodeType: "Concept",
      proposer: users[1].uname,
      linksUpdated: false, // as its an improvement without parent/child updates
    });

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;
    expect(semesterStudentStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentStat.days) {
      for (const chapter of statDay.chapters) {
        expect(chapter.agreementsWithInst).toEqual(0);
        expect(chapter.disagreementsWithInst).toEqual(0);
        expect(chapter.links).toEqual(0);
        expect(chapter.newNodes).toEqual(0);
        expect(chapter.nodes).toEqual(0);
        expect(chapter.proposals).toEqual(1);
        expect(chapter.questionProposals).toEqual(0);
        expect(chapter.questions).toEqual(0);
      }
      expect(statDay.chapters.length).toEqual(semesterData.syllabus.length);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
    expect(semesterStudentVoteStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentVoteStat.days) {
      expect(statDay.agreementsWithInst).toEqual(0);
      expect(statDay.disagreementsWithInst).toEqual(0);
      expect(statDay.links).toEqual(0);
      expect(statDay.newNodes).toEqual(0);
      expect(statDay.improvements).toEqual(0);
      expect(statDay.nodes).toEqual(0);
      expect(statDay.proposals).toEqual(1);
      expect(statDay.questionProposals).toEqual(0);
      expect(statDay.questions).toEqual(0);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    expect(semesterStudentVoteStat.agreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.disagreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.links).toEqual(0);
    expect(semesterStudentVoteStat.newNodes).toEqual(0);
    expect(semesterStudentVoteStat.nodes).toEqual(0);
    expect(semesterStudentVoteStat.improvements).toEqual(0);
    expect(semesterStudentVoteStat.questionProposals).toEqual(0);
    expect(semesterStudentVoteStat.questions).toEqual(0);
  });

  it("stats should be updated when proposed version is approved (improvement - non question)", async () => {
    // creating a version for node
    const _nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        corrects: 0,
        accepted: false,
        proposer: users[1],
        nodeType: "Concept",
      }),
    ];
    await new MockData(_nodeVersions, "versions").populate();

    const semester = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semester.data() as ISemester;
    const chapterIds = semesterData.syllabus.map(syllabusItem => syllabusItem.node!);
    await updateStatsOnProposal({
      tagIds: [semester.id, ...chapterIds],
      isChild: false,
      approved: true,
      nodeType: "Concept",
      proposer: users[1].uname,
      linksUpdated: false,
    });

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;
    expect(semesterStudentStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentStat.days) {
      for (const chapter of statDay.chapters) {
        expect(chapter.agreementsWithInst).toEqual(0);
        expect(chapter.disagreementsWithInst).toEqual(0);
        expect(chapter.links).toEqual(0);
        expect(chapter.newNodes).toEqual(0);
        expect(chapter.nodes).toEqual(0);
        expect(chapter.proposals).toEqual(1);
        expect(chapter.questionProposals).toEqual(0);
        expect(chapter.questions).toEqual(0);
      }
      expect(statDay.chapters.length).toEqual(semesterData.syllabus.length);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
    expect(semesterStudentVoteStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentVoteStat.days) {
      expect(statDay.agreementsWithInst).toEqual(0);
      expect(statDay.disagreementsWithInst).toEqual(0);
      expect(statDay.links).toEqual(0);
      expect(statDay.newNodes).toEqual(0);
      expect(statDay.improvements).toEqual(1);
      expect(statDay.nodes).toEqual(0);
      expect(statDay.proposals).toEqual(1);
      expect(statDay.questionProposals).toEqual(0);
      expect(statDay.questions).toEqual(0);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    expect(semesterStudentVoteStat.agreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.disagreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.links).toEqual(0);
    expect(semesterStudentVoteStat.newNodes).toEqual(0);
    expect(semesterStudentVoteStat.nodes).toEqual(0);
    expect(semesterStudentVoteStat.improvements).toEqual(1);
    expect(semesterStudentVoteStat.questionProposals).toEqual(0);
    expect(semesterStudentVoteStat.questions).toEqual(0);
  });

  it("stats should be updated when proposed version is not approved (improvement - question)", async () => {
    // creating a version for node
    const _nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        corrects: 0,
        accepted: false,
        proposer: users[1],
        nodeType: "Question",
      }),
    ];
    await new MockData(_nodeVersions, "versions").populate();

    const semester = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semester.data() as ISemester;
    const chapterIds = semesterData.syllabus.map(syllabusItem => syllabusItem.node!);
    await updateStatsOnProposal({
      tagIds: [semester.id, ...chapterIds],
      isChild: false,
      approved: false,
      nodeType: "Question",
      proposer: users[1].uname,
      linksUpdated: false, // as its an improvement without parent/child updates
    });

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;
    expect(semesterStudentStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentStat.days) {
      for (const chapter of statDay.chapters) {
        expect(chapter.agreementsWithInst).toEqual(0);
        expect(chapter.disagreementsWithInst).toEqual(0);
        expect(chapter.links).toEqual(0);
        expect(chapter.newNodes).toEqual(0);
        expect(chapter.nodes).toEqual(0);
        expect(chapter.proposals).toEqual(1);
        expect(chapter.questionProposals).toEqual(1);
        expect(chapter.questions).toEqual(0);
      }
      expect(statDay.chapters.length).toEqual(semesterData.syllabus.length);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
    expect(semesterStudentVoteStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentVoteStat.days) {
      expect(statDay.agreementsWithInst).toEqual(0);
      expect(statDay.disagreementsWithInst).toEqual(0);
      expect(statDay.links).toEqual(0);
      expect(statDay.newNodes).toEqual(0);
      expect(statDay.improvements).toEqual(0);
      expect(statDay.nodes).toEqual(0);
      expect(statDay.proposals).toEqual(1);
      expect(statDay.questionProposals).toEqual(1);
      expect(statDay.questions).toEqual(0);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    expect(semesterStudentVoteStat.agreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.disagreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.links).toEqual(0);
    expect(semesterStudentVoteStat.newNodes).toEqual(0);
    expect(semesterStudentVoteStat.nodes).toEqual(0);
    expect(semesterStudentVoteStat.improvements).toEqual(0);
    expect(semesterStudentVoteStat.questionProposals).toEqual(1);
    expect(semesterStudentVoteStat.questions).toEqual(0);
  });

  it("stats should be updated when proposed version is approved (improvement - question)", async () => {
    // creating a version for node
    const _nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        corrects: 0,
        accepted: false,
        proposer: users[1],
        nodeType: "Question",
      }),
    ];
    await new MockData(_nodeVersions, "questionVersions").populate();

    const semester = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semester.data() as ISemester;
    const chapterIds = semesterData.syllabus.map(syllabusItem => syllabusItem.node!);
    await updateStatsOnProposal({
      tagIds: [semester.id, ...chapterIds],
      isChild: false,
      approved: true,
      nodeType: "Question",
      proposer: users[1].uname,
      linksUpdated: false, // as its an improvement without parent/child updates
    });

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;
    expect(semesterStudentStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentStat.days) {
      for (const chapter of statDay.chapters) {
        expect(chapter.agreementsWithInst).toEqual(0);
        expect(chapter.disagreementsWithInst).toEqual(0);
        expect(chapter.links).toEqual(0);
        expect(chapter.newNodes).toEqual(0);
        expect(chapter.nodes).toEqual(0);
        expect(chapter.proposals).toEqual(1);
        expect(chapter.questionProposals).toEqual(1);
        expect(chapter.questions).toEqual(1);
      }
      expect(statDay.chapters.length).toEqual(semesterData.syllabus.length);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
    expect(semesterStudentVoteStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentVoteStat.days) {
      expect(statDay.agreementsWithInst).toEqual(0);
      expect(statDay.disagreementsWithInst).toEqual(0);
      expect(statDay.links).toEqual(0);
      expect(statDay.newNodes).toEqual(0);
      expect(statDay.improvements).toEqual(1);
      expect(statDay.nodes).toEqual(0);
      expect(statDay.proposals).toEqual(1);
      expect(statDay.questionProposals).toEqual(1);
      expect(statDay.questions).toEqual(1);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    expect(semesterStudentVoteStat.agreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.disagreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.links).toEqual(0);
    expect(semesterStudentVoteStat.newNodes).toEqual(0);
    expect(semesterStudentVoteStat.nodes).toEqual(0);
    expect(semesterStudentVoteStat.improvements).toEqual(1);
    expect(semesterStudentVoteStat.questionProposals).toEqual(1);
    expect(semesterStudentVoteStat.questions).toEqual(1);
  });

  it("stats should be updated when proposed version is not approved (child - question)", async () => {
    // creating a version for node
    const _nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        corrects: 0,
        accepted: false,
        proposer: users[1],
        childType: "Question",
        nodeType: "Concept",
      }),
    ];
    await new MockData(_nodeVersions, "versions").populate();

    const semester = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semester.data() as ISemester;
    const chapterIds = semesterData.syllabus.map(syllabusItem => syllabusItem.node!);
    await updateStatsOnProposal({
      tagIds: [semester.id, ...chapterIds],
      isChild: true,
      approved: false,
      nodeType: "Question",
      proposer: users[1].uname,
      linksUpdated: true,
    });

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;
    expect(semesterStudentStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentStat.days) {
      for (const chapter of statDay.chapters) {
        expect(chapter.agreementsWithInst).toEqual(0);
        expect(chapter.disagreementsWithInst).toEqual(0);
        expect(chapter.links).toEqual(1);
        expect(chapter.newNodes).toEqual(0);
        expect(chapter.nodes).toEqual(1);
        expect(chapter.proposals).toEqual(1);
        expect(chapter.questionProposals).toEqual(1);
        expect(chapter.questions).toEqual(0);
      }
      expect(statDay.chapters.length).toEqual(semesterData.syllabus.length);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
    expect(semesterStudentVoteStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentVoteStat.days) {
      expect(statDay.agreementsWithInst).toEqual(0);
      expect(statDay.disagreementsWithInst).toEqual(0);
      expect(statDay.links).toEqual(1);
      expect(statDay.newNodes).toEqual(0);
      expect(statDay.improvements).toEqual(0);
      expect(statDay.nodes).toEqual(1);
      expect(statDay.proposals).toEqual(1);
      expect(statDay.questionProposals).toEqual(1);
      expect(statDay.questions).toEqual(0);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    expect(semesterStudentVoteStat.agreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.disagreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.links).toEqual(1);
    expect(semesterStudentVoteStat.newNodes).toEqual(0);
    expect(semesterStudentVoteStat.nodes).toEqual(1);
    expect(semesterStudentVoteStat.improvements).toEqual(0);
    expect(semesterStudentVoteStat.questionProposals).toEqual(1);
    expect(semesterStudentVoteStat.questions).toEqual(0);
  });

  it("stats should be updated when proposed version is approved (child - question)", async () => {
    // creating a version for node
    const _nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        corrects: 0,
        accepted: true,
        proposer: users[1],
        childType: "Question",
        nodeType: "Concept",
      }),
    ];
    await new MockData(_nodeVersions, "versions").populate();

    const semester = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semester.data() as ISemester;
    const chapterIds = semesterData.syllabus.map(syllabusItem => syllabusItem.node!);
    await updateStatsOnProposal({
      tagIds: [semester.id, ...chapterIds],
      isChild: true,
      approved: true,
      nodeType: "Question",
      proposer: users[1].uname,
      linksUpdated: true,
    });

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;
    expect(semesterStudentStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentStat.days) {
      for (const chapter of statDay.chapters) {
        expect(chapter.agreementsWithInst).toEqual(0);
        expect(chapter.disagreementsWithInst).toEqual(0);
        expect(chapter.links).toEqual(1);
        expect(chapter.newNodes).toEqual(1);
        expect(chapter.nodes).toEqual(1);
        expect(chapter.proposals).toEqual(1);
        expect(chapter.questionProposals).toEqual(1);
        expect(chapter.questions).toEqual(1);
      }
      expect(statDay.chapters.length).toEqual(semesterData.syllabus.length);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", users[1].uname)
      .where("tagId", "==", semesterId)
      .get();

    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
    expect(semesterStudentVoteStat.uname).toEqual(users[1].uname);
    for (const statDay of semesterStudentVoteStat.days) {
      expect(statDay.agreementsWithInst).toEqual(0);
      expect(statDay.disagreementsWithInst).toEqual(0);
      expect(statDay.links).toEqual(1);
      expect(statDay.newNodes).toEqual(1);
      expect(statDay.improvements).toEqual(0);
      expect(statDay.nodes).toEqual(1);
      expect(statDay.proposals).toEqual(1);
      expect(statDay.questionProposals).toEqual(1);
      expect(statDay.questions).toEqual(1);
      expect(statDay.day).toEqual(moment().format("YYYY-MM-DD"));
    }

    expect(semesterStudentVoteStat.agreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.disagreementsWithInst).toEqual(0);
    expect(semesterStudentVoteStat.links).toEqual(1);
    expect(semesterStudentVoteStat.newNodes).toEqual(1);
    expect(semesterStudentVoteStat.nodes).toEqual(1);
    expect(semesterStudentVoteStat.improvements).toEqual(0);
    expect(semesterStudentVoteStat.questionProposals).toEqual(1);
    expect(semesterStudentVoteStat.questions).toEqual(1);
  });
});
