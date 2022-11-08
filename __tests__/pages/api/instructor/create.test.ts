import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import { ISemester } from "src/types/ICourse";
import { createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

import createCourseHandler, { InstructorCourseCreatePayload } from "@/pages/api/instructor/course/create";

describe("POST /api/instructor/course/create", () => {
  const users = [getDefaultUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);

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

  const coursesCollection = new MockData([], "courses");
  const semestersCollection = new MockData([], "semesters");
  const instructorsCollection = new MockData([], "instructors");

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    new MockData([], "relationVersions"),
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

  describe("should be able to create course using api", () => {
    /*
    const courseCode = "SI691";
    const semesterName = "Fall 2020";
    const programName = "MSI";
    const departmentName = "Information Science";
    
    const instructorId = "1man";
    const universityTitle = "University of Michigan - Ann Arbor";
    */

    let semesterId: string = "";
    beforeAll(async () => {
      const body = {
        courseCode: "SI691",
        semesterName: "Fall 2020",
        programName: "MSI",
        departmentName: "Information Science",
        universityName: "University of Michigan - Ann Arbor",
      } as InstructorCourseCreatePayload;

      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await createCourseHandler(req, res as any);
      semesterId = res._getJSONData().semesterId;
    });

    it("semester document should be created", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      expect((await semesterRef.get()).exists).toBeTruthy();
    });

    it("university node should be created", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      const semesterData = (await semesterRef.get()).data() as ISemester;
      const universityNodeRef = db.collection("nodes").doc(semesterData.uTagId);
      expect((await universityNodeRef.get()).exists).toBeTruthy();
    });

    it("department node should be created", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      const semesterData = (await semesterRef.get()).data() as ISemester;
      const departmentNodeRef = db.collection("nodes").doc(semesterData.dTagId);
      expect((await departmentNodeRef.get()).exists).toBeTruthy();
    });

    it("program node should be created", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      const semesterData = (await semesterRef.get()).data() as ISemester;
      const programNodeRef = db.collection("nodes").doc(semesterData.pTagId);
      expect((await programNodeRef.get()).exists).toBeTruthy();
    });

    it("course node should be created", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      const semesterData = (await semesterRef.get()).data() as ISemester;
      const courseNodeRef = db.collection("nodes").doc(semesterData.cTagId);
      expect((await courseNodeRef.get()).exists).toBeTruthy();
    });

    it("semester node should be created", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      const semesterData = (await semesterRef.get()).data() as ISemester;
      const semesterNodeRef = db.collection("nodes").doc(semesterData.tagId);
      expect((await semesterNodeRef.get()).exists).toBeTruthy();
    });
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
