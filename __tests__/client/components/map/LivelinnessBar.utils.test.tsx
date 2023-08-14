import { Timestamp } from "firebase/firestore";
import { ActionsTracksChange } from "src/client/firestore/actionTracks.firestore";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { MockData } from "testUtils/mockCollections";

import { synchronizeActionsTracks, UserInteractions } from "@/components/map/Liveliness/LivelinessBar";

describe("should test utils functions of LivelinnessBar", () => {
  const users = [getDefaultUser({}), createUser({})];
  const usersCollection = new MockData(users, "users");

  const collects = [usersCollection, new MockData([], "actionTracks")];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });
  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("intercation of the past 24 hours should be added to the ", async () => {
    const userInteractions: UserInteractions = {
      user1: {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 1,
        fullname: "user11",
        reputation: "Gain",
        imageUrl: "lmsqkdlqmskd",
        email: "empty@example.com",
      },
    };
    const actionTrackChange: ActionsTracksChange = {
      data: {
        id: "chNGOoIREL83gl96zj4y",
        receivers: [],
        fullname: "jj qq",
        accepted: true,
        doer: "jjnnx",
        type: "NodeCollapse",
        chooseUname: true,
        action: "",
        nodeId: "frD6qWMkfP8QFprjc2Ud",
        createdAt: Timestamp.fromDate(new Date()),
        email: "jimy@gmail.com",
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/onecademy-dev.appspot.com/o/ProfilePictures%2FrUiApafBaWOvSRBrMhA99UCCb0h2%2FTue%2C%2009%20May%202023%2016%3A19%3A45%20GMT_430x1300.jpg?alt=media&token=aa5b4763-007d-4024-a38d-2d44865a6630",
      },
      type: "added",
    };

    const authEmail = "oneweb@umich.edu";
    const newUserInteractions = synchronizeActionsTracks(userInteractions, actionTrackChange, authEmail);
    expect(newUserInteractions).toHaveProperty("jjnnx");
    expect(newUserInteractions["jjnnx"].count).toEqual(1);
  });
});
