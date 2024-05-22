import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { getTheNextQuestion, sortConcepts } from "./assistantTutor";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { concepts } = req.body;
    if (concepts.length <= 0) {
      return res.status(500).json({});
    }
    const concept = sortConcepts(concepts)[0];
    const response = await getTheNextQuestion({
      title: concept.title,
      content: concept.content,
    });
    console.log(response);
    const question = {
      content: response.question,
      audioURL: response.audioQuestion,
      concept: {
        title: concept.title,
        content: concept.content,
        id: concept.id,
        paragraphs: concept.paragraphs,
      },
    };
    return res.status(200).json({ question });
  } catch (error) {
    console.log(error);
  }
}
export default fbAuth(handler);
