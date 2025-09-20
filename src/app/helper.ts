export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file); // converts to base64
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function isValidURL(str: string) {
  const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
  return pattern.test(str);
}

export const bytesToMB = (bytes: number) => {
  return bytes / (1024 * 1024); // 1 MB = 1024 * 1024 bytes
};

export const getIcon = (type: string) => {
  switch (type) {
    case "text":
      return "/regular-note.png";
    case "document":
      return "/uploaded-document.png";
    case "link":
      return "/link-note.png";
    default:
      return "/regular-note.png";
  }
};

export const blobToBase64 = async (imageBlob: any) => {
  const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

  if (!imageBlob?.type) return "";

  let imageBase64 =
    "data:" + imageBlob.type + ";base64," + imageBuffer.toString("base64");

  return imageBase64;
};

export const convertFileTypes = (mimeType: string) => {
  let type = "";
  const docs = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (docs.includes(mimeType)) {
    type = "doc";
  } else if (mimeType.includes("text")) {
    type = "txt";
  } else if (mimeType.includes("pdf")) {
    type = "pdf";
  }

  return type;
};
