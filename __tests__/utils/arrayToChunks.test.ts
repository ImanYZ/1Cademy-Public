import { arrayToChunks } from "../../src/utils/arrayToChunks";

describe("arrayToChunks", () => {
  it("Should 5 chunks 2000 items", () => {
    const arr = Array.from(Array(2000).keys());
    const result = arrayToChunks(arr);
    expect(result.length).toEqual(5);
  });
});
