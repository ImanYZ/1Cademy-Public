import { db } from "../../src/lib/firestoreServer/admin"
import { getNode } from "../../src/utils"
import dropCollection from "../../testUtils/helpers/dropCollection"

const mockData = {
  title: "Testing Node",
}

describe("getNode", () => {
  let nodeId = ""
  beforeEach(async () => {
    const nodeDoc = db.collection("nodes").doc()
    await nodeDoc.set(mockData)
    nodeId = nodeDoc.id
  })

  it("Should return nodeRef and nodeData of a given Id.", async () => {
    const result = await getNode({ nodeId })

    expect(result).toHaveProperty("nodeData")
    expect(result).toHaveProperty("nodeRef")

    expect(result.nodeRef.id as string).toEqual(nodeId)

    expect(result.nodeData).toMatchObject(mockData)
  })

  // after each test suite
  afterEach(async () => {
    await dropCollection("nodes")
  })
})
