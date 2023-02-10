import { getAuth } from "firebase-admin/auth";
import { IInstitution } from "src/types/IInstitution";
import { createInstitution } from "testUtils/fakers/institution";

import { db } from "../../../src/lib/firestoreServer/admin";
import handler from "../../../src/pages/api/signup";
import createPostReq from "../../../testUtils/helpers/createPostReq";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import {
  bookmarkNumsData,
  creditsData,
  MockData,
  notificationNumsData,
  pendingPropsNumsData,
  reputationsData,
  tagsData,
  userNodesData,
  userNodesLogData,
  usersData,
} from "../../../testUtils/mockCollections";

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
  const collects = [new MockData(institutions, "institutions"), tagsData, creditsData];
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

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
    await usersData.clean();
    await bookmarkNumsData.clean();
    await notificationNumsData.clean();
    await pendingPropsNumsData.clean();
    await reputationsData.clean();
    await userNodesData.clean();
    await userNodesLogData.clean();
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
  const semestersCollection = new MockData([{ students: [] }], "semesters");
  const collects = [new MockData(institutions, "institutions"), tagsData, creditsData, semestersCollection];
  let semesterId: string = "";
  beforeAll(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
    const semesterRef = await db.collection("semesters").get();
    semesterId = semesterRef.docs[0].id;
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
      course: semesterId,
    },
  };

  it("course should be assign to user", async () => {
    body.data.course = semesterId;
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

  it("user role should be student", async () => {
    const createdUser = await getAuth().getUserByEmail(body.data.email);
    expect(createdUser.customClaims).toEqual({ student: true });
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
    await usersData.clean();
    await bookmarkNumsData.clean();
    await notificationNumsData.clean();
    await pendingPropsNumsData.clean();
    await reputationsData.clean();
    await userNodesData.clean();
    await userNodesLogData.clean();
  });
});
