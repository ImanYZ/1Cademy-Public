import nextConnect from "next-connect"
import multer from "multer";

import { app } from "../../lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";
import { storage } from "firebase-admin";

const handler = nextConnect({
  onNoMatch(req: any, res: any) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
})

const uploader = multer({
  limits: {
    fieldNameSize: 1024, // 1 KB
    fileSize: 1048576 // 1MB
  }
})

const bucket = storage(app).bucket(process.env.NEXT_PUBLIC_STORAGE_BUCKET);

handler.use(uploader.single("file"))

handler.post(async (req, res) => {
  const { file } = req;

  
  const uid = req.user?.uid as string;

  const originalname = String(file?.originalname);
  const originalname_parts = originalname.split(".")
  const file_ext = originalname_parts.pop() as string;

  const allowed_exts = ["svg", "jpg", "jpeg", "png", "gif"];

  if(!~allowed_exts.indexOf(file_ext)) {
    return res.status(400).json({
      message: "invalid image supplied!"
    })
  }

  const basePath = `uploads/images/${uid}/${(new Date()).getTime()}`;

  let uploadedPath = `${basePath}/${originalname_parts.join('.')}`;
  if(file_ext !== "svg") {
    uploadedPath += "_430x1300";
  }
  uploadedPath += `.${file_ext}`;

  const filePath = `${basePath}/${originalname}`

  const uploadedFile = bucket.file(filePath);
  await uploadedFile.save(file?.buffer as Buffer)

  res.status(200).json({
    imageUrl: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_STORAGE_BUCKET}/${uploadedPath}`
  });
})


export default fbAuth(handler);

export const config = {
  api: {
    bodyParser: false
  }
}
