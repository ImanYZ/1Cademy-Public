jest.mock("src/utils/helpers", () => {
  const original = jest.requireActual("src/utils/helpers");
  return {
    ...original,
    detach: jest.fn().mockImplementation(async (callback: any) => {
      return callback();
    }),
  };
});

import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import { ISemester } from "src/types/ICourse";
import { IInstitution } from "src/types/IInstitution";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, getDefaultNode } from "testUtils/fakers/node";
import { getDefaultUser } from "testUtils/fakers/user";

import { db } from "../../../src/lib/firestoreServer/admin";
import handler from "../../../src/pages/api/signup";
import createPostReq from "../../../testUtils/helpers/createPostReq";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { creditsData, MockData, tagsData } from "../../../testUtils/mockCollections";

describe("/signup", () => {
  const institutions = [
    createInstitution({
      name: "Franklin College Switzerland",
      domain: "@1cademy.edu",
    }),
    createInstitution({
      name: "Franklin Switzerland College",
      domain: "@1cad123emy.edu",
    }),
  ];
  const collects = [
    new MockData(institutions, "institutions"),
    new MockData([], "bookmarkNums"),
    new MockData([], "credits"),
    new MockData([], "notificationNums"),
    new MockData([], "pendingPropsNums"),
    new MockData([], "reputations"),
    new MockData([], "userNodes"),
    new MockData([], "userNodesLog"),
    new MockData([], "users"),
    tagsData,
    creditsData,
  ];
  beforeAll(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  const body = {
    data: {
      uname: "uname423",
      email: "test@1cademy.edu",
      fName: "first name",
      lName: "last name",
      password: "12345678",
      lang: "English",
      country: "United States",
      state: "Alaska",
      city: "Aleutians East Borough",
      gender: "Female",
      birthDate: "2001-08-04T00:00:00.000Z",
      foundFrom: "Online searching",
      education: "Doctoral degree (MD, Ph.D., ...)",
      occupation: "graduate",
      ethnicity: ["White / Caucasian"],
      reason: "test",
      chooseUname: false,
      clickedConsent: false,
      clickedTOS: false,
      clickedPP: false,
      clickedCP: false,
      tag: "Information Theory",
      tagId: "C7L3gNbNp5reFjQf8vAb",
      deMajor: "Animal Sciences",
      deInstit: "Franklin College Switzerland",
      theme: "Dark",
      background: "Image",
      consented: true,
    },
  };

  it("Should give error if email doesn't match with institute.", async () => {
    body.data.email = "test@1cad123emy.edu";
    const { req, res } = createPostReq(body);
    await handler(req, res);
    expect(JSON.parse(res._getData()).errorMessage).toEqual(
      "Your institution does not match with your email address. Please enter your institutional email address or change the institution name in the form."
    );
    body.data.email = "test@1cademy.edu";
  });

  it("Should signup a new user.", async () => {
    const { req, res } = createPostReq(body);
    await handler(req, res);

    // it should create a user in the firebase Auth.
    const createdUser = await getAuth().getUserByEmail(body.data.email);
    expect(createdUser).toEqual(
      expect.objectContaining({
        email: body.data.email,
        displayName: body.data.uname,
      })
    );

    // it should create a user document in the firestore database.
    const userDocument = await db.collection("users").doc(body.data.uname).get();
    expect(userDocument.exists).toBeTruthy();
    expect(userDocument.data()).toEqual(
      expect.objectContaining({
        email: body.data.email,
        uname: body.data.uname,
      })
    );

    //it should return 201 response code.
    expect(res._getStatusCode()).toBe(201);
  });

  it("institution collection should be present in usersNum and users", async () => {
    const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
    const institutionData = institution.data() as IInstitution;
    expect(institutionData.usersNum).toEqual(1);
    expect(institutionData.users.includes(body.data.uname)).toBeTruthy();
  });

  let notebookId: string = "";
  it("new user should have a default notebook", async () => {
    const notebooks = await db.collection("notebooks").where("owner", "==", body.data.uname).limit(1).get();
    expect(notebooks.docs.length).toEqual(1);
    notebookId = notebooks.docs[0].id;
  });

  it("root userNode should have expanded on default notebook", async () => {
    const userNodes = await db
      .collection("userNodes")
      .where("notebooks", "array-contains", notebookId)
      .where("user", "==", body.data.uname)
      .where("node", "==", body.data.tagId)
      .limit(1)
      .get();
    expect(userNodes.docs.length).toEqual(1);
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});

describe("/signup as student", () => {
  const institutions = [
    createInstitution({
      name: "Franklin College Switzerland",
      domain: "@1cademy.edu",
    }),
    createInstitution({
      name: "Franklin Switzerland College",
      domain: "@1cad123emy.edu",
    }),
  ];

  const users = [
    getDefaultUser({
      institutionName: institutions[0].name,
    }),
  ];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  const questionNode = createNode({
    parents: [nodes[0]],
    nodeType: "Question",
    choices: [],
    admin: users[0],
  });
  nodes[0].children.push({
    node: questionNode.documentId!,
    title: questionNode.title,
    type: "Question",
  });

  nodes.push(questionNode);

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);

  const semestersCollection = new MockData(
    [
      {
        documentId: nodes[0].documentId,
        tagId: nodes[0].documentId,
        students: [],
        days: 1,
        cTagId: "",
        cTitle: "",
        dTagId: "",
        dTitle: "",
        pTagId: "",
        pTitle: "",
        uTagId: "",
        uTitle: "",
        instructors: [],
        startDate: Timestamp.now(),
        endDate: Timestamp.now(),
        isCastingVotesRequired: false,
        isGettingVotesRequired: false,
        isProposalRequired: false,
        isQuestionProposalRequired: false,
        nodeProposals: {
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          numPoints: 0,
          numProposalPerDay: 0,
          totalDaysOfCourse: 0,
        },
        questionProposals: {
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          numPoints: 0,
          numQuestionsPerDay: 0,
          totalDaysOfCourse: 0,
        },
        votes: {
          onReceiveDownVote: 0,
          onReceiveStar: 0,
          onReceiveVote: 0,
          pointDecrementOnAgreement: 0,
          pointIncrementOnAgreement: 0,
        },
        dailyPractice: {
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          numPoints: 1,
          numQuestionsPerDay: 1,
          totalDaysOfCourse: 0,
        },
        isDailyPracticeRequired: true,
        syllabus: [],
        title: nodes[0].title,
        root: nodes[0].documentId!,
        deleted: false,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      } as ISemester,
    ],
    "semesters"
  );
  const semesterStudentStatsCollection = new MockData([], "semesterStudentStats");
  const semesterStudentVoteStatsCollection = new MockData([], "semesterStudentVoteStats");

  const collects = [
    new MockData(institutions, "institutions"),
    new MockData(nodes, "nodes"),
    new MockData(users, "users"),
    tagsData,
    creditsData,
    semestersCollection,
    semesterStudentStatsCollection,
    semesterStudentVoteStatsCollection,
  ];
  let semesterId: string = "";

  const body = {
    data: {
      uname: "uname423",
      email: "test@1cademy.edu",
      fName: "first name",
      lName: "last name",
      password: "12345678",
      lang: "English",
      country: "United States",
      state: "Alaska",
      city: "Aleutians East Borough",
      gender: "Female",
      birthDate: "2001-08-04T00:00:00.000Z",
      foundFrom: "Online searching",
      education: "Doctoral degree (MD, Ph.D., ...)",
      occupation: "graduate",
      ethnicity: ["White / Caucasian"],
      reason: "test",
      chooseUname: false,
      clickedConsent: false,
      clickedTOS: false,
      clickedPP: false,
      clickedCP: false,
      tag: "Information Theory",
      tagId: "C7L3gNbNp5reFjQf8vAb",
      deMajor: "Animal Sciences",
      deInstit: "Franklin College Switzerland",
      theme: "Dark",
      background: "Image",
      consented: true,
      course: semesterId,
    },
  };

  beforeAll(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
    const semesterRef = await db.collection("semesters").get();
    semesterId = semesterRef.docs[0].id;
    body.data.course = semesterId;
  });

  it("course should be assign to user", async () => {
    const { req, res } = createPostReq(body);
    await handler(req, res);
    const semesterRef = db.collection("semesters").doc(semesterId);
    const semesterData = (await semesterRef.get()).data();
    expect((await semesterRef.get()).exists).toBeTruthy();
    expect(semesterData?.students[0]).toMatchObject({
      uname: body.data.uname,
      chooseUname: body.data.chooseUname,
      fName: body.data.fName,
      lName: body.data.lName,
      email: body.data.email,
    });
  });

  it("practices should be created semester students", async () => {
    const semesterDoc = await db.collection("semesters").doc(semesterId).get();
    const semesterData = semesterDoc.data() as ISemester;
    for (const student of semesterData.students) {
      const practices = await db
        .collection("practice")
        .where("user", "==", student.uname)
        .where("tagId", "==", semesterDoc.id)
        .get();
      expect(practices.docs.length).toEqual(1);
    }
  });

  it("user role should be student", async () => {
    const createdUser = await getAuth().getUserByEmail(body.data.email);
    expect(createdUser.customClaims).toEqual({ student: true });
  });

  it("semesterStudentStats should be create when use is student", async () => {
    const semesterStudentStatsRef = await db
      .collection("semesterStudentStats")
      .where("uname", "==", body.data.uname)
      .get();
    expect(semesterStudentStatsRef.docs[0].data().uname).toEqual(body.data.uname);
  });

  it("semesterStudentVoteStats should be create when use is student", async () => {
    const semesterStudentVoteStatsRef = await db
      .collection("semesterStudentVoteStats")
      .where("uname", "==", body.data.uname)
      .get();
    expect(semesterStudentVoteStatsRef.docs[0].data().uname).toEqual(body.data.uname);
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
