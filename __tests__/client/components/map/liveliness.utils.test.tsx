import {
  calculateVerticalPositionWithLogarithm,
  getNumberOfUsersNoVisibleAbove,
  getNumberOfUsersNoVisibleBellow,
  getUsersAbove,
  getUsersBellow,
  UserInteractionData,
} from "@/components/map/Liveliness/liveliness.utils";

describe("should test utils functions of relative Liveliness Bar", () => {
  it("should return the 3 users above the logged user from user interactions", async () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 2,
        fullname: "user2 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "02",
        imageUrl: "",
        uname: "u02",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 3,
        fullname: "user3 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "03",
        imageUrl: "",
        uname: "u03",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 4,
        fullname: "user4 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "04",
        imageUrl: "",
        uname: "u04",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 5,
        fullname: "user4 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "05",
        imageUrl: "",
        uname: "u05",
      },
    ];

    const response = getUsersAbove({ usersInteractionsSortedArray, uname: "u01" });
    expect(response.length).toBe(3);
    expect(response[0].uname).toBe("u02");
    expect(response[1].uname).toBe("u03");
    expect(response[2].uname).toBe("u04");
  });

  it("should return only 1 user above the logged user from user interactions", async () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 2,
        fullname: "user2 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "02",
        imageUrl: "",
        uname: "u02",
      },
    ];

    const response = getUsersAbove({ usersInteractionsSortedArray, uname: "u01" });
    expect(response.length).toBe(1);
    expect(response[0].uname).toBe("u02");
  });

  it("should return the 3 users bellow the logged user from user interactions", async () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 2,
        fullname: "user2 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "02",
        imageUrl: "",
        uname: "u02",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 3,
        fullname: "user3 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "03",
        imageUrl: "",
        uname: "u03",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 4,
        fullname: "user4 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "04",
        imageUrl: "",
        uname: "u04",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 5,
        fullname: "user4 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "05",
        imageUrl: "",
        uname: "u05",
      },
    ];

    const response = getUsersBellow({ usersInteractionsSortedArray, uname: "u04" });
    expect(response.length).toBe(3);
    expect(response[0].uname).toBe("u01");
    expect(response[1].uname).toBe("u02");
    expect(response[2].uname).toBe("u03");
  });

  it("should return only 1 user bellow the logged user from user interactions", async () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 2,
        fullname: "user2 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "02",
        imageUrl: "",
        uname: "u02",
      },
    ];

    const response = getUsersBellow({ usersInteractionsSortedArray, uname: "u02" });
    expect(response.length).toBe(1);
    expect(response[0].uname).toBe("u01");
  });
});

describe("should return the number of not visible users above", () => {
  it("should return 0 users no visible above", () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
    ];

    const response = getNumberOfUsersNoVisibleAbove({ usersInteractionsSortedArray, uname: "u01" });
    expect(response).toBe(0);
  });

  it("should return 1 users no visible above", () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 1,
        fullname: "user2 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "02",
        imageUrl: "",
        uname: "u02",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 2,
        fullname: "user3 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "03",
        imageUrl: "",
        uname: "u03",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 3,
        fullname: "user4 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "04",
        imageUrl: "",
        uname: "u04",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 4,
        fullname: "user5 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "05",
        imageUrl: "",
        uname: "u05",
      },
    ];

    const response = getNumberOfUsersNoVisibleAbove({ usersInteractionsSortedArray, uname: "u01" });
    expect(response).toBe(1);
  });
});

describe("should return the number of not visible users bellow", () => {
  it("should return 0 users no visible bellow", () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
    ];

    const response = getNumberOfUsersNoVisibleBellow({ usersInteractionsSortedArray, uname: "u01" });
    expect(response).toBe(0);
  });

  it("should return 1 users no visible bellow", () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 1,
        fullname: "user2 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "02",
        imageUrl: "",
        uname: "u02",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 2,
        fullname: "user3 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "03",
        imageUrl: "",
        uname: "u03",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 3,
        fullname: "user4 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "04",
        imageUrl: "",
        uname: "u04",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 4,
        fullname: "user5 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "05",
        imageUrl: "",
        uname: "u05",
      },
    ];

    const response = getNumberOfUsersNoVisibleBellow({ usersInteractionsSortedArray, uname: "u05" });
    expect(response).toBe(1);
  });
});

describe("should calculate vertical positions with logarithm function", () => {
  it("should return 0 and 100, with the only 2 elements", () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 0,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: 10,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
    ];

    const response = calculateVerticalPositionWithLogarithm({ data: usersInteractionsSortedArray, maxHeight: 100 });
    expect(response[0].positionY).toBe(0);
    expect(response[0].positionY).toBe(100);
  });
});
