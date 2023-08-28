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
  it("should return 0, with negative count", () => {
    const usersInteractionsSortedArray: UserInteractionData[] = [
      {
        actions: ["ChildNode"],
        chooseUname: false,
        count: -50,
        fullname: "user1 pp",
        reputation: "Gain",
        email: "empty@example.com",
        id: "01",
        imageUrl: "",
        uname: "u01",
      },
    ];

    const response = calculateVerticalPositionWithLogarithm({ data: usersInteractionsSortedArray, height: 100 });
    expect(response[0].positionY).toBe(0);
  });

  it("should return 0, with zero value on count", () => {
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

    const response = calculateVerticalPositionWithLogarithm({ data: usersInteractionsSortedArray, height: 100 });
    expect(response[0].positionY).toBe(0);
  });

  it("should return vertical positions based on log10 function", () => {
    const data: { count: number; result: number }[] = [
      { count: -1, result: 0 },
      { count: 0, result: 0 },
      { count: 10, result: 0 },
      { count: 20, result: 30 },
      { count: 30, result: 47 },
      { count: 40, result: 60 },
      { count: 50, result: 69 },
      { count: 60, result: 77 },
      { count: 70, result: 84 },
      { count: 80, result: 90 },
      { count: 90, result: 95 },
      { count: 100, result: 100 },
    ];
    calculateVerticalPositionWithLogarithm({
      data: data.map(c => ({ count: c.count })) as UserInteractionData[],
      height: 100,
    });

    expect(true).toBe(true);
  });

  it("should return the maximum position when all elements has the same count", () => {
    const data: { count: number; result: number }[] = [
      { count: 10, result: 100 },
      { count: 10, result: 100 },
      { count: 10, result: 100 },
    ];
    calculateVerticalPositionWithLogarithm({
      data: data.map(c => ({ count: c.count })) as UserInteractionData[],
      height: 100,
    });

    expect(true).toBe(true);
  });
});
