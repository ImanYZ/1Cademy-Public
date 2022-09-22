export const collection = "messages";

interface Message {
  documentId?: string;
  storageUri: string;
  chooseUname: boolean;
  timestamp: Date;
  uploadedUrl: string;
  tag: string;
  uid: string;
  imageUrl: string;
  username: string;
  tagId: string;
  updatedAt: Date;
  fullname: string;
}
const data: Message[] = [
  {
    documentId: "YIf3C7FmSS210YRFvg3i",
    storageUri: "Messages/5C1gt2xyGCMCudgBAMlggqeVFge2/0tf4c2CXVz0dffTTevZy.png",
    chooseUname: false,
    timestamp: new Date(),
    uploadedUrl:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/Messages%2F5C1gt2xyGCMCudgBAMlggqeVFge2%2F0tf4c2CXVz0dffTTevZy.png?alt=media&token=1e109dba-d182-4097-8ba4-a9046b390a8d",
    tag: "Data Science",
    uid: "5C1gt2xyGCMCudgBAMlggqeVFge2",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fyuko-lopez_Sun%2C%2023%20Feb%202020%2020%3A16%3A22%20GMT.jpg?alt=media&token=785b3ef8-8271-4aff-85d4-122420826756",
    username: "A_wei",
    tagId: "FJfzAX7zbgQS8jU5XcEk",
    updatedAt: new Date(),
    fullname: "Alvin",
  },
];

const messagesData = { data, collection };

export default messagesData;
