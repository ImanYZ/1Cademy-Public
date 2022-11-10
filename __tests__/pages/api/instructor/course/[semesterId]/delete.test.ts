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

import { admin, db } from "src/lib/firestoreServer/admin";
import { createCourse, createInstructor, createSemester } from "testUtils/fakers/course";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

import deleteSemesterHandler from "@/pages/api/instructor/course/[semesterId]/delete";

describe("POST /api/instructor/course/[semesterId]/delete", () => {
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
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");
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

  describe("should be able to delete semester using api", () => {
    beforeAll(async () => {
      const req: any = HttpMock.createRequest({
        method: "POST",
        query: {
          semesterId: semesterNode.documentId,
        },
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await deleteSemesterHandler(req, res as any);
    });

    it("semester document should be deleted", async () => {
      const semesterDoc = await db.collection("semesters").doc(String(semesterNode.documentId)).get();
      const semesterNodeDoc = await db.collection("nodes").doc(String(semesterNode.documentId)).get();
      expect(semesterDoc.data()?.deleted).toBeTruthy();
      expect(semesterNodeDoc.data()?.deleted).toBeTruthy();
    });
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
