import { getAuth } from "firebase-admin/auth";

import {  db } from "../../../src/lib/firestoreServer/admin";
import handler from "../../../src/pages/api/signup";
import createPostReq from "../../../testUtils/helpers/createPostReq";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import {
  bookmarkNumsData,
  creditsData,
  institutionsData,
  notificationNumsData,
  pendingPropsNumsData,
  reputationsData,
  tagsData,
  userNodesData,
  userNodesLogData,
  usersData,
} from "../../../testUtils/mockData";

describe("/signup", () => {
  beforeEach(async () => {
    await institutionsData.populate();
    await tagsData.populate();
    await creditsData.populate();
  });

  it("Should signup a new user.", async () => {
    const body = {
      data: {
        uname: "uname",
        email: "test@usf.edu",
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

  afterEach(async () => {
    await deleteAllUsers();
    await usersData.clean();
    await institutionsData.clean();
    await tagsData.clean();
    await creditsData.clean();
    await bookmarkNumsData.clean();
    await notificationNumsData.clean();
    await pendingPropsNumsData.clean();
    await reputationsData.clean();
    await userNodesData.clean();
    await userNodesLogData.clean();
  });
});
