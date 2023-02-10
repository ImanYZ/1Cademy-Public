import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();
import { admin, db } from "src/lib/firestoreServer/admin";
import { getDefaultNode } from "testUtils/fakers/node";
import { getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

import assignCourseToUserHandler from "@/pages/api/assignCourseToUser";

describe("POST /api/assignCourseToUser", () => {
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

  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);
  const usersCollection = new MockData(users, "users");
  const coursesCollection = new MockData([], "courses");
  const creditsCollection = new MockData([], "credits");
  const semestersCollection = new MockData([{ students: [] }], "semesters");
  const semesterStudentStatsCollection = new MockData([], "semesterStudentStats");
  const semesterStudentVoteStatsCollection = new MockData([], "semesterStudentVoteStats");
  const reputationsCollection = new MockData(reputations, "reputations");

  const collects = [
    usersCollection,
    coursesCollection,
    semestersCollection,
    reputationsCollection,
    creditsCollection,
    semesterStudentStatsCollection,
    semesterStudentVoteStatsCollection,
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

    const r = await signInWithEmailAndPassword(getAuth(), users[0].email, mockPassword);
    accessToken = await r.user.getIdToken(false);
    users[0].userId = user.uid;

    await Promise.all(collects.map(collect => collect.populate()));
  });

  describe("should be assign course to existing user using api", () => {
    let semesterId: string = "";
    beforeAll(async () => {
      const semesterRef = await db.collection("semesters").get();
      semesterId = semesterRef.docs[0].id;
      const body = {
        course: semesterId,
      } as any;
      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await assignCourseToUserHandler(req, res as any);
    });

    it("course should be assign to user", async () => {
      const semesterRef = db.collection("semesters").doc(semesterId);
      const semesterData = (await semesterRef.get()).data();
      expect((await semesterRef.get()).exists).toBeTruthy();
      expect(semesterData?.students[0]).toMatchObject({
        uname: users[0]?.uname,
        chooseUname: users[0]?.chooseUname,
        imageUrl: users[0]?.imageUrl,
        fName: users[0]?.fName,
        lName: users[0]?.lName,
        email: users[0]?.email,
      });
    });

    it("semesterStudentStats should be create when use is student", async () => {
      const semesterStudentStatsRef = await db
        .collection("semesterStudentStats")
        .where("uname", "==", users[0]?.uname)
        .get();
      expect(semesterStudentStatsRef.docs[0].data().uname).toEqual(users[0]?.uname);
    });

    it("semesterStudentVoteStats should be create when use is student", async () => {
      const semesterStudentVoteStatsRef = await db
        .collection("semesterStudentVoteStats")
        .where("uname", "==", users[0]?.uname)
        .get();
      expect(semesterStudentVoteStatsRef.docs[0].data().uname).toEqual(users[0]?.uname);
    });
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
