// Function to convert File to Base64 string and then to the required part structure
export const fileToGenerativePart = async (fileURL: string): Promise<any> => {
  const response = await fetch(fileURL);
  const blob = await response.blob();

  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = "";

  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }

  const base64Data = btoa(binaryString);

  const fileType = blob.type.split("/")[0];
  let result;

  if (fileType === "image") {
    result = {
      type: "image_url",
      image_url: {
        url: `data:${blob.type};base64,${base64Data}`,
      },
    };
  } else if (fileType === "application" && blob.type.split("/")[1] === "pdf") {
    result = {
      type: "document_url",
      document_url: {
        url: `data:${blob.type};base64,${base64Data}`,
      },
    };
  }
  return result;
};
