import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { BadRequestException } from "../../exceptions/index.js";

export const localFileUpload = ({ maxFileSize = 5 } = {}) => {
  const storage = multer.memoryStorage();

  // fileFilter always runs before storage even if it comes after storage
  return multer({
    // fileFilter,
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};

export const processFile = async ({
  customPath = "general",
  file,
  validation = [],
} = {}) => {
  const result = await fileTypeFromBuffer(file.buffer);

  if (!validation.includes(result.mime)) {
    throw BadRequestException({ message: "Invalid file format" });
  } else {
    // Create folder
    await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
    // Create Unique Path Name
    const filePath = `./assets/${customPath}/${randomUUID()}.${result.ext}`;
    // Write File
    await writeFile(filePath, file.buffer);
    // Update File
    file.path = filePath;
    return file;
  }
};

export const processMulterUpload = async ({
  customPath,
  validation = [],
  req,
} = {}) => {
  // Case 1: One File Upload.
  if (req.file) {
    const file = await processFile({
      customPath,
      file: req.file,
      validation,
    });
    req.file = file;

    // Case 2: Multiple File Uploads (Array)
  } else if (Array.isArray(req.files)) {
    // return only the resolve process. If one failed, then all will fail.
    const files = await Promise.allSettled(
      req.files.map((file) => processFile({ customPath, file, validation })),
    );

    const hasRejected = files.some((file) => file.status === "rejected");
    if (hasRejected) {
      files.map(async (file) => {
        if (file.status === "fulfilled") {
          await unlink(file.value.path);
        }
      });
      throw BadRequestException({ message: "Invalid file format" });
    }
    req.files = files.map((file) => file.value);

    // Case 3: Upload Fields (More than Object)
  } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
    const files = await Promise.all(
      Object.entries(req.files).map(async ([key, file]) => {
        const processedFiles = await Promise.all(
          file.map((file) => processFile({ customPath, file, validation })),
        );
        return [key, processedFiles];
      }),
    );
    req.files = Object.fromEntries(files);
  }
};
