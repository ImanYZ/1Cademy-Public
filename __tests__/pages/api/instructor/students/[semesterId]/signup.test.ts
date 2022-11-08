import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getAuth as adminGetAuth } from "firebase-admin/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import signupHandler, { InstructorSemesterSignUpPayload } from "src/pages/api/instructor/students/[semesterId]/signup";
import { ISemester } from "src/types/ICourse";
import { createCourse, createInstructor, createSemester } from "testUtils/fakers/course";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/instructor/students/:semesterId/signup", () => {
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
  const instructorsCollection = new MockData([semester], "instructors");

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

  describe("should be able to call signup", () => {
    const students = [
      {
        email: "ameer@1cademy.com",
        fName: "Ameer",
        lName: "Hamza",
      },
      {
        email: "sam@1cademy.com",
        fName: "Sam",
        lName: "Ouhra",
      },
      {
        email: "haroon@1cademy.com",
        fName: "Haroon",
        lName: "Waheed",
      },
    ];
    beforeAll(async () => {
      const body = {
        students,
      } as InstructorSemesterSignUpPayload;

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
      await signupHandler(req, res as any);
    });

    it("check if users got created", async () => {
      for (const student of students) {
        const userDocs = await db.collection("users").where("email", "==", student.email).get();
        expect(userDocs.docs.length).toEqual(1);
        expect(userDocs.docs[0].data()?.email).toEqual(student.email);
        expect(userDocs.docs[0].data()?.fName).toEqual(student.fName);
        expect(userDocs.docs[0].data()?.lName).toEqual(student.lName);
      }
    });

    it("created users should have auth attached to them", async () => {
      for (const student of students) {
        const user = await adminGetAuth().getUserByEmail(student.email);
        const userDocs = await db.collection("users").where("userId", "==", user.uid).get();
        expect(userDocs.docs.length).toEqual(1);
      }
    });

    it("check if by added increment student in array, new account gets created and other retains", async () => {
      students.push({
        email: "waleed@1cademy.com",
        fName: "Waleed",
        lName: "Ahmad",
      });
      const body = {
        students,
      } as InstructorSemesterSignUpPayload;

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
      await signupHandler(req, res as any);

      for (const student of students) {
        const userDocs = await db.collection("users").where("email", "==", student.email).get();
        expect(userDocs.docs.length).toEqual(1);
        expect(userDocs.docs[0].data()?.email).toEqual(student.email);
        expect(userDocs.docs[0].data()?.fName).toEqual(student.fName);
        expect(userDocs.docs[0].data()?.lName).toEqual(student.lName);
      }

      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;
      const filteredStudents = semesterData.students.filter(
        student => student.email === students[students.length - 1].email
      );
      expect(filteredStudents.length).toEqual(1);
    });

    it("check if by added increment student in array, new account gets created and other retains", async () => {
      const removedStudents = students.splice(students.length - 1, 1);
      const body = {
        students,
      } as InstructorSemesterSignUpPayload;

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
      await signupHandler(req, res as any);

      const userDocs = await db.collection("users").where("email", "==", removedStudents[0].email).get();
      expect(userDocs.docs.length).toEqual(1);

      const semesterDoc = await db.collection("semesters").doc(String(semester.documentId)).get();
      const semesterData = semesterDoc.data() as ISemester;
      const filteredStudents = semesterData.students.filter(student => student.email === removedStudents[0].email);
      expect(filteredStudents.length).toEqual(0);
    });
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
