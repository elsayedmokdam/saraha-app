import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, writeFile } from "node:fs/promises";
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

const validateFile = async ({ file, validation = [] } = {}) => {
  const result = await fileTypeFromBuffer(file.buffer);

  if (!validation.includes(result.mime)) {
    throw BadRequestException({ message: "Invalid file format" });
  }
  return result;
};

// Handle File
export const processFile = async ({
  customPath = "general",
  file,
  validation = [],
} = {}) => {
  // Validate File
  const result = await validateFile({ file, validation });
  // Create folder
  await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
  // Create Unique Path Name
  const filePath = `./assets/${customPath}/${randomUUID()}.${result.ext}`;
  // Write File
  await writeFile(filePath, file.buffer);
  // Update File
  file.path = filePath;
  return file;
};

// Handle Files
export const processFiles = async ({
  customPath = "general",
  files = [],
  validation = [],
} = {}) => {
  // Validate Files Before Processing
  await Promise.all(
    files.map(async (file) => validateFile({ file, validation })),
  );

  // Process Files
  const assets = await Promise.all(
    files.map((file) => processFile({ customPath, file, validation })),
  );
  return assets;
};

// Handle Fields
export const processFields = async ({
  customPath = "general",
  fields = [],
  validation = [],
} = {}) => {
  // Validate Files Before Processing
  await Promise.all(
    Object.entries(fields).map(async ([key, files]) => {
      await Promise.all(
        files.map(async (file) => validateFile({ file, validation })),
      );
    }),
  );
  // Process Files
  const assets = await Promise.all(
    Object.entries(fields).map(async ([key, files]) => {
      const processedFiles = await Promise.all(
        files.map((file) => processFile({ customPath, file, validation })),
      );
      return [key, processedFiles];
    }),
  );
  return Object.fromEntries(assets);
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
    const files = await processFiles({
      customPath,
      files: req.files,
      validation,
    });
    req.files = files;

    // Case 3: Upload Fields (More than Object)
  } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
    const files = await processFields({
      customPath,
      fields: req.files,
      validation,
    });
    req.files = files;
  }
};
