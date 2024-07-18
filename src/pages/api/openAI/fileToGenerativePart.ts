// Function to convert File to Base64 string and then to the required part structure
export const fileToGenerativePart = async (file: File): Promise<any> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString().split(",")[1] || "");
      } else {
        reject("Failed to read file");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64Data = await base64EncodedDataPromise;
  const fileType = file.type.split("/")[0];

  if (fileType === "image") {
    return {
      type: "image_url",
      image_url: {
        url: `data:${file.type};base64,${base64Data}`,
      },
    };
  } else if (fileType === "application" && file.type.split("/")[1] === "pdf") {
    return {
      type: "document_url",
      document_url: {
        url: `data:${file.type};base64,${base64Data}`,
      },
    };
  } else {
    throw new Error("Unsupported file type");
  }
};
