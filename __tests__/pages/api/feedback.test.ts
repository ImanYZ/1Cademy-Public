import HttpMock from "node-mocks-http";

import { db } from "../../../src/lib/firestoreServer/admin";
import feedbackHandler from "../../../src/pages/api/feedback";
import { createFeedback } from "../../../testUtils/fakers/feedback";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/feedback", () => {
  const feedbacks = [createFeedback({})];
  const feedbacksCollection = new MockData(feedbacks, "feedback");
  afterEach(async () => {
    await feedbacksCollection.clean();
  });

  it("Should be able to create new feedback", async () => {
    const req: any = HttpMock.createRequest({
      method: "POST",
      body: { data: feedbacks[0] },
    });
    const res: any = HttpMock.createResponse();
    await feedbackHandler(req, res);
    const feedbackDoc = await db.collection("feedback").where("email", "==", feedbacks[0].email).get();
    const feedbackData = feedbackDoc.docs[0].data();
    expect(feedbackData).toMatchObject({ email: feedbacks[0].email });
  });
});
