import { NextApiRequest, NextApiResponse } from "next"

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin"
import { getTypedCollections, NODE_TYPES } from "../../utils"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch()
    let writeCounts = 0
    for (let nodeType of NODE_TYPES) {
      const { versionsColl }: any = getTypedCollections({ nodeType })
      const versionsDocs = await versionsColl.get()
      for (let versionDoc of versionsDocs.docs) {
        const versionData = versionDoc.data()
        const versionUpdates: any = {}
        if ("references" in versionData && versionData.references.length > 0) {
          if (!versionData.referenceIds) {
            versionUpdates.referenceIds = versionData.references.map((r: any) => r.node)
            versionUpdates.referenceLabels = versionData.references.map((r: any) => r.label)
            versionUpdates.references = versionData.references.map((r: any) => r.title)
          }
        } else {
          versionUpdates.referenceIds = []
          versionUpdates.referenceLabels = []
          versionUpdates.references = []
        }
        if ("tags" in versionData && versionData.tags.length > 0) {
          if (!versionData.tagIds) {
            versionUpdates.tagIds = versionData.tags.map((r: any) => r.node)
            versionUpdates.tags = versionData.tags.map((r: any) => r.title)
          }
        } else {
          versionUpdates.tagIds = []
          versionUpdates.tags = []
        }
        if (Object.keys(versionUpdates).length > 0) {
          const versionRef = versionsColl.doc(versionDoc.id)
          batch.update(versionRef, versionUpdates)
          ;[batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts)
        }
      }
    }

    const messagesDocs = await db.collection("messages").get()
    for (let messageDoc of messagesDocs.docs) {
      const messageData = messageDoc.data()
      const messageUpdates: any = {}
      if (messageData.tag) {
        if (!messageData.tagId) {
          messageUpdates.tagId = messageData.tag.node
          messageUpdates.tag = messageData.tag.title
        }
      } else {
        messageUpdates.tagId = "FJfzAX7zbgQS8jU5XcEk"
        messageUpdates.tag = "Data Science"
      }
      if (Object.keys(messageUpdates).length > 0) {
        const messageRef = db.collection("messages").doc(messageDoc.id)
        batch.update(messageRef, messageUpdates)
        ;[batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts)
      }
    }

    const nodesDocs = await db.collection("nodes").get()
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data()
      const nodeUpdates: any = {}
      if ("tags" in nodeData && nodeData.tags.length > 0) {
        if (!nodeData.tagIds) {
          nodeUpdates.tagIds = nodeData.tags.map((r: any) => r.node)
          nodeUpdates.tags = nodeData.tags.map((r: any) => r.title)
        }
      } else {
        nodeUpdates.tagIds = []
        nodeUpdates.tags = []
      }
      if ("references" in nodeData && nodeData.references.length > 0) {
        if (!nodeData.referenceIds) {
          nodeUpdates.referenceIds = nodeData.references.map((r: any) => r.node)
          nodeUpdates.referenceLabels = nodeData.references.map((r: any) => r.label)
          nodeUpdates.references = nodeData.references.map((r: any) => r.title)
        }
      } else {
        nodeUpdates.referenceIds = []
        nodeUpdates.referenceLabels = []
        nodeUpdates.references = []
      }
      if (Object.keys(nodeUpdates).length > 0) {
        const nodeRef = db.collection("nodes").doc(nodeDoc.id)
        batch.update(nodeRef, nodeUpdates)
        ;[batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts)
      }
    }

    const practiceDocs = await db.collection("practice").get()
    for (let practiceDoc of practiceDocs.docs) {
      const practiceData = practiceDoc.data()
      const practiceUpdates: any = {}
      if ("tag" in practiceData) {
        if (!practiceData.tagId) {
          if (practiceData.tag.node && practiceData.tag.title) {
            practiceUpdates.tagId = practiceData.tag.node
            practiceUpdates.tag = practiceData.tag.title
          } else {
            const nodeDocs = await db.collection("nodes").where("title", "==", practiceData.tag).limit(1).get()
            if (nodeDocs.docs.length > 0) {
              practiceUpdates.tagId = nodeDocs.docs[0].id
              practiceUpdates.tag = practiceData.tag
            } else {
              throw "tag: " + practiceData.tag + " does not exist!"
            }
          }
        }
      } else {
        practiceUpdates.tagId = "FJfzAX7zbgQS8jU5XcEk"
        practiceUpdates.tag = "Data Science"
      }
      if (Object.keys(practiceUpdates).length > 0) {
        const practiceRef = db.collection("practice").doc(practiceDoc.id)
        batch.update(practiceRef, practiceUpdates)
        ;[batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts)
      }
    }

    const usersDocs = await db.collection("users").get()
    for (let userDoc of usersDocs.docs) {
      const userData = userDoc.data()
      const userUpdates: any = {}
      if (userData.deTag && !userData.tagId) {
        userUpdates.tagId = userData.deTag.node
        userUpdates.tag = userData.deTag.title
        userUpdates.deTag = admin.firestore.FieldValue.delete()
        const userRef = db.collection("users").doc(userDoc.id)
        batch.update(userRef, userUpdates)
        ;[batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts)
      }
    }

    await commitBatch(batch)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error, success: false })
  }
}

export default handler
