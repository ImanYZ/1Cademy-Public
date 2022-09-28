const collection = "notifications";

const data: any[] = [
  {
    documentId: "00eWLT9LFIoAEfs3YGzu",
    uname: "1man",
    createdAt: new Date(),
    aType: "Correct",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F1Sh0DsamQINmarN5CEiiIDhXhdh2%2FThu%2C%2010%20Mar%202022%2015%3A23%3A51%20GMT.jpg?alt=media&token=dfb61e49-0006-4359-b4d4-94116a84e1a8",
    proposer: "aampiahb",
    oType: "Node",
    nodeId: "FJfzAX7zbgQS8jU5XcEk",
    checked: false,
  },
  {
    documentId: "00fLmckPv62pwu0AD1PG",
    uname: "Julia Costa",
    proposer: "ajreardon",
    checked: true,
    nodeId: "Pkd4Ff4Cz8whReycYnYn",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FK29gvApGnmdkmCWuB8rdXCHMpCD2%2FFri%2C%2021%20Aug%202020%2001%3A31%3A46%20GMT.jpeg?alt=media&token=c2e62677-6fc4-4abe-9921-abd0d184af09",
    aType: "Wrong",
    createdAt: new Date(),
    oType: "Node",
  },
  {
    documentId: "hPTTEieXjdYNI99dW0zb",
    uname: "A_wei",
    proposer: "ajreardon",
    checked: true,
    nodeId: "Pkd4Ff4Cz8whReycYnYn",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FK29gvApGnmdkmCWuB8rdXCHMpCD2%2FFri%2C%2021%20Aug%202020%2001%3A31%3A46%20GMT.jpeg?alt=media&token=c2e62677-6fc4-4abe-9921-abd0d184af09",
    aType: "Wrong",
    createdAt: new Date(),
    oType: "Node",
  },
];

const notificationsData = {
  data,
  collection,
};

export default notificationsData;
