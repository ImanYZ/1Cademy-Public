jest.mock("src/utils/helpers", () => {
  const original = jest.requireActual("src/utils/helpers");
  return {
    ...original,
    detach: jest.fn().mockImplementation(async (callback: any) => {
      return callback();
    }),
  };
});

import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import moment from "moment";
import { admin, db } from "src/lib/firestoreServer/admin";
import settingHandler, {
  InstructorSemesterSettingPayload,
} from "src/pages/api/instructor/students/[semesterId]/setting";
import { ISemester, ISemesterSyllabusItem } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { createCourse, createInstructor, createSemester } from "testUtils/fakers/course";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/instructor/students/:semesterId/setting", () => {
  const users = [getDefaultUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);

  const universityNode = createNode({
    admin: users[0],
    isTag: true,
    corrects: 1,
  });
  const departmentNode = createNode({
    admin: users[0],
    parents: [universityNode],
    isTag: true,
    corrects: 1,
  });
  universityNode.children.push({
    node: String(departmentNode.documentId),
    title: departmentNode.title,
    nodeType: departmentNode.nodeType,
  });

  const programNode = createNode({
    admin: users[0],
    parents: [departmentNode],
    isTag: true,
    corrects: 1,
  });
  departmentNode.children.push({
    node: String(programNode.documentId),
    title: programNode.title,
    nodeType: programNode.nodeType,
  });

  const courseNode = createNode({
    admin: users[0],
    parents: [programNode],
    isTag: true,
    corrects: 1,
  });
  programNode.children.push({
    node: String(courseNode.documentId),
    title: courseNode.title,
    nodeType: courseNode.nodeType,
  });

  const semesterNode = createNode({
    admin: users[0],
    parents: [courseNode],
    isTag: true,
    corrects: 1,
  });
  courseNode.children.push({
    node: String(semesterNode.documentId),
    title: semesterNode.title,
    nodeType: semesterNode.nodeType,
  });

  nodes.push(universityNode);
  nodes.push(departmentNode);
  nodes.push(programNode);
  nodes.push(courseNode);
  nodes.push(semesterNode);

  const course = createCourse({
    documentId: courseNode.documentId,
    course: courseNode,
    semester: semesterNode,
    university: universityNode,
    program: programNode,
  });

  const semester = createSemester({
    documentId: semesterNode.documentId,
    title: semesterNode.title,
    tagId: String(semesterNode.documentId),
    course: courseNode,
    program: programNode,
    university: universityNode,
  });

  const instructor = createInstructor({
    instructor: users[0],
    semester: semester,
  });

  semester.instructors[0] = instructor.uname;

  const userNodes = [
    createUserNode({
      node: nodes[0],
      correct: true,
    }),
  ];
  const nodeVersions = [
    // first accepted proposal
    createNodeVersion({
      node: nodes[0],
      accepted: true,
      proposer: users[0],
      corrects: 1,
      nodeType: "Concept",
    }),
  ];

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  // reputations
  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const usersCollection = new MockData(users, "users");
  const creditsCollection = new MockData(credits, "credits");
  const nodeVersionsCollection = new MockData(nodeVersions, "versions");
  const reputationsCollection = new MockData(reputations, "reputations");

  const coursesCollection = new MockData([course], "courses");
  const semestersCollection = new MockData([semester], "semesters");
  const instructorsCollection = new MockData([instructor], "instructors");

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    reputationsCollection,

    coursesCollection,
    semestersCollection,
    instructorsCollection,
    new MockData([], "relationVersions"),
  ];

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);

  let accessToken: string = "";

  beforeAll(async () => {
    const user = await auth.createUser({
      email: users[0].email,
      password: mockPassword,
      disabled: false,
      emailVerified: true,
    });
    await auth.setCustomUserClaims(user.uid, {
      instructor: true,
    });

    const r = await signInWithEmailAndPassword(getAuth(), users[0].email, mockPassword);
    accessToken = await r.user.getIdToken(false);
    users[0].userId = user.uid;

    await Promise.all(collects.map(collect => collect.populate()));
  });

  describe("should be able to update syllabus", () => {
    beforeAll(async () => {
      const startDate = moment().format("YYYY-MM-DD");
      const endDate = moment().add(1, "day").format("YYYY-MM-DD");
      const body = {
        startDate,
        endDate,
        nodeProposals: {
          startDate: startDate,
          endDate: endDate,
          numPoints: 1,
          numProposalPerDay: 1,
          totalDaysOfCourse: 30,
        },
        questionProposals: {
          startDate: startDate,
          endDate: endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: 30,
        },
        votes: {
          pointDecrementOnAgreement: 1,
          pointIncrementOnAgreement: 1,
          onReceiveDownVote: 1,
          onReceiveVote: 1,
          onReceiveStar: 1,
        },
        syllabus: [
          {
            title: "Mock Chapter 1",
            children: [
              {
                title: "Mock Chapter 1.1",
              },
              {
                title: "Mock Chapter 1.2",
              },
            ],
          },
          {
            title: "Mock Chapter 2",
            children: [
              {
                title: "Mock Chapter 2.1",
              },
            ],
          },
          {
            title: "Mock Chapter 3",
            children: [
              {
                title: "Mock Chapter 3.1",
              },
              {
                title: "Mock Chapter 3.2",
              },
            ],
          },
        ],
        isProposalRequired: true,
        isQuestionProposalRequired: true,
        isCastingVotesRequired: true,
        isGettingVotesRequired: true,
        dailyPractice: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        isDailyPracticeRequired: true,
        root: nodes[0].documentId!,
      } as InstructorSemesterSettingPayload;

      const req: any = HttpMock.createRequest({
        method: "POST",
        query: {
          semesterId: semester.documentId,
        },
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await settingHandler(req, res as any);
    });

    it("check if syllabus node are created", async () => {
      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;
      const testNodeIds = async (syllabusItem: ISemesterSyllabusItem) => {
        expect(syllabusItem.node?.length).toBeGreaterThan(0);

        const nodeDoc = await db.collection("nodes").doc(String(syllabusItem.node)).get();
        expect(nodeDoc.exists).toBeTruthy();

        if (syllabusItem.children && syllabusItem.children.length) {
          for (const _syllabusItem of syllabusItem.children) {
            await testNodeIds(_syllabusItem);
          }
        }
      };

      for (const syllabusItem of semesterData.syllabus) {
        await testNodeIds(syllabusItem);
      }
    });

    it("check if flag removed node as deleted in syllabus", async () => {
      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;

      const nodeId = semesterData.syllabus[0].node;
      delete semesterData.syllabus[0].node;

      const startDate = moment().format("YYYY-MM-DD");
      const endDate = moment().add(1, "day").format("YYYY-MM-DD");

      const body = {
        startDate,
        endDate,
        nodeProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numProposalPerDay: 1,
          totalDaysOfCourse: 30,
        },
        questionProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: 30,
        },
        votes: semesterData.votes,
        syllabus: semesterData.syllabus,
        isProposalRequired: true,
        isQuestionProposalRequired: true,
        isCastingVotesRequired: true,
        isGettingVotesRequired: true,
        dailyPractice: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        isDailyPracticeRequired: true,
      } as InstructorSemesterSettingPayload;

      const req: any = HttpMock.createRequest({
        method: "POST",
        query: {
          semesterId: semester.documentId,
        },
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await settingHandler(req, res as any);

      const node = (await db.collection("nodes").doc(String(nodeId)).get()).data() as INode;
      expect(node.deleted).toEqual(true);

      const _semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const _semesterData = _semesterDoc.data() as ISemester;
      expect(_semesterData.syllabus[0].node?.length).toBeGreaterThan(0);
    });

    it("check if changes in syllabus change node title as well", async () => {
      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;

      semesterData.syllabus[0].title = "TEST TITLE";

      const startDate = moment().format("YYYY-MM-DD");
      const endDate = moment().add(1, "day").format("YYYY-MM-DD");

      const body = {
        startDate,
        endDate,
        nodeProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numProposalPerDay: 1,
          totalDaysOfCourse: 30,
        },
        questionProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: 30,
        },
        votes: semesterData.votes,
        syllabus: semesterData.syllabus,
        isProposalRequired: true,
        isQuestionProposalRequired: true,
        isCastingVotesRequired: true,
        isGettingVotesRequired: true,
        dailyPractice: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        isDailyPracticeRequired: true,
      } as InstructorSemesterSettingPayload;

      const req: any = HttpMock.createRequest({
        method: "POST",
        query: {
          semesterId: semester.documentId,
        },
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await settingHandler(req, res as any);

      const node = (await db.collection("nodes").doc(String(semesterData.syllabus[0].node)).get()).data() as INode;

      expect(node.title).toEqual(`Ch.1 TEST TITLE - ${semesterNode.title}`);
    });

    it("check if instructor has usernodes for every chapter and subchapter", async () => {
      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;

      const getNodeIds = (syllabusItem: ISemesterSyllabusItem, nodeIds: string[]) => {
        nodeIds.push(String(syllabusItem.node));

        if (syllabusItem.children && syllabusItem.children.length) {
          for (const _syllabusItem of syllabusItem.children) {
            getNodeIds(_syllabusItem, nodeIds);
          }
        }
      };

      const nodeIds: string[] = [];
      for (const item of semesterData.syllabus) {
        getNodeIds(item, nodeIds);
      }

      for (const nodeId of nodeIds) {
        const userNodes = await db
          .collection("userNodes")
          .where("user", "==", users[0].uname)
          .where("node", "==", nodeId)
          .get();
        expect(userNodes.docs.length).toEqual(1);
        expect(userNodes.docs[0].data()?.visible).toBeTruthy();
      }
    });

    it("check if removed node and its usernodes flagged as deleted", async () => {
      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;

      const items = semesterData.syllabus[0].children?.splice(0, 1) as ISemesterSyllabusItem[];

      const startDate = moment().format("YYYY-MM-DD");
      const endDate = moment().add(1, "day").format("YYYY-MM-DD");

      const body = {
        startDate,
        endDate,
        nodeProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numProposalPerDay: 1,
          totalDaysOfCourse: 30,
        },
        questionProposals: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: 30,
        },
        votes: semesterData.votes,
        syllabus: semesterData.syllabus,
        isProposalRequired: true,
        isQuestionProposalRequired: true,
        isCastingVotesRequired: true,
        isGettingVotesRequired: true,
        dailyPractice: {
          startDate,
          endDate,
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: moment(endDate).diff(moment(startDate), "days"),
        },
        isDailyPracticeRequired: true,
      } as InstructorSemesterSettingPayload;

      const req: any = HttpMock.createRequest({
        method: "POST",
        query: {
          semesterId: semester.documentId,
        },
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await settingHandler(req, res as any);

      const removedNodeId = String(items[0].node);
      const userNodes = await db
        .collection("userNodes")
        .where("user", "==", users[0].uname)
        .where("node", "==", removedNodeId)
        .get();
      for (const userNode of userNodes.docs) {
        expect(userNode.data()?.deleted).toBeTruthy();
      }
    });
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
