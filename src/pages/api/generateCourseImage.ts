import axios, { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import * as path from "path";
import * as fs from "fs";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import { generateImage } from "./openAI/helpers";
const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";

const storage = new Storage({
  credentials: {
    private_key: process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
    client_id: process.env.ONECADEMYCRED_CLIENT_ID,
  },
});

const generateImagePrompt = (
  title: string,
  content: string
  // courseTitle: string,
  // courseDescription: string,
  // targetLearners: any,
  // sessions: number,
  // prerequisiteKnowledge: any,
  // objectives: any,
  // syllabus: any
) => {
  const prompt = `Generate an image to help students in the course [Course Title goes here] learn the following topic:
  **title:** ${title}
  **content:** ${content}
  The image should be minimalistic and should not include any text.
  A team will evaluate the image that you generate. If they identify it as helpful, they'll pay you $1,000. If they find it unhelpful, you'll lose $1,000.`;
  return prompt;
};

const createAxiosInstance = () => {
  return axios.create({
    responseType: "stream",
  });
};

const downloadImage = async (url: string, dest: string, axiosInstance: AxiosInstance): Promise<void> => {
  const response = await axiosInstance.get(url);
  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const removeFileFromStorage = async (filename: string) => {
  try {
    const file = storage.bucket(bucket).file(filename);
    const exists = await file.exists();
    if (!exists[0]) console.log(`File ${filename} deleted from Google Cloud Storage.`);
    await file.delete();
  } catch (error) {
    console.error("Error removing file from Google Cloud Storage:", error);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { title, content, prevUrl } = req.body;
    const prompt = generateImagePrompt(title, content);
    const response: string = (await generateImage(prompt)) || "";
    const axiosInstance = createAxiosInstance();
    const ext = path.extname(response.split("?")[0]);
    const tempFilePath = path.join(__dirname, `temp-image${ext}`);
    const destinationPath = `ai-images/${uuidv4()}${ext}`;
    if (prevUrl) {
      removeFileFromStorage(prevUrl);
    }
    await downloadImage(response, tempFilePath, axiosInstance);
    await storage.bucket(bucket).upload(tempFilePath, {
      destination: destinationPath,
    });
    return res.json({
      imageUrl: `https://storage.cloud.google.com/${bucket}/${destinationPath}`,
      filename: destinationPath,
    });
  } catch (error) {
    console.error(error, "Error uploading logo to GCS:");
    return res.status(500).json({ success: false });
  }
}

export default fbAuth(handler);
