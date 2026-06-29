import multer from "multer";
import cloudinary from "../../config/cloudinary.config";
import { Readable } from "stream";
import {
  UPLOAD_CONSTANTS,
  ERROR_MESSAGES,
} from "../../helper/constants.helper";

// ==================== Avatar Upload Configuration ====================

/**
 * Multer middleware for avatar image uploads
 * Accepts only image files up to 2MB
 */
const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_CONSTANTS.MAX_AVATAR_SIZE_BYTES },
  fileFilter: validateImageFile,
});

/**
 * Validates that uploaded file is an image
 */
function validateImageFile(
  req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  const isImageFile = file.mimetype.startsWith("image/");

  if (!isImageFile) {
    callback(new Error(ERROR_MESSAGES.IMAGE_FILES_ONLY));
    return;
  }

  callback(null, true);
}

// ==================== CV Upload Configuration ====================

/**
 * Multer middleware for CV (PDF) uploads
 * Accepts only PDF files up to 5MB
 */
const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_CONSTANTS.MAX_CV_SIZE_BYTES },
  fileFilter: validatePDFFile,
});

/**
 * Validates that uploaded file is a PDF
 */
function validatePDFFile(
  req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  const isPDFFile = file.mimetype === UPLOAD_CONSTANTS.ALLOWED_CV_MIME_TYPE;

  if (!isPDFFile) {
    callback(new Error(ERROR_MESSAGES.PDF_FILES_ONLY));
    return;
  }

  callback(null, true);
}

// ==================== Cloudinary Upload ====================

/**
 * Uploads file buffer to Cloudinary
 * Handles both images (avatars) and documents (CVs)
 * 
 * @param fileBuffer - File data as Buffer
 * @param uploadOptions - Cloudinary upload options
 * @returns Promise with Cloudinary upload result
 */
export const uploadToCloudinary = (buffer: Buffer, options: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const isCVFile = isCVFolder(options.folder);
    const cloudinaryOptions = buildCloudinaryUploadOptions(options, isCVFile);

    const uploadStream = cloudinary.uploader.upload_stream(
      cloudinaryOptions,
      handleUploadResult(resolve, reject)
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Checks if folder path indicates CV upload
 */
function isCVFolder(folderPath?: string): boolean {
  return folderPath?.includes("cv-applications") ?? false;
}

/**
 * Xây dựng tùy chọn tải lên Cloudinary dựa trên loại tệp
 * 
 * @param options - Tùy chọn do người dùng cung cấp
 * @param isCVFile - Liệu tệp có phải là CV hay không
 * @returns Tùy chọn tải lên Cloudinary đầy đủ
 */
function buildCloudinaryUploadOptions(options: any, isCVFile: boolean): any {
  const baseOptions = {
    folder: options.folder || UPLOAD_CONSTANTS.CLOUDINARY_AVATAR_FOLDER,
    resource_type: options.resource_type || "auto",
    public_id: generatePublicId(isCVFile),
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  // Thêm tối ưu hóa hình ảnh cho avatar
  if (!isCVFile) {
    return {
      ...baseOptions,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
  }

  return baseOptions;
}

/**
 * Tạo ID công khai duy nhất cho tệp được tải lên
 * Bao gồm phần mở rộng tệp cho CV
 * 
 * @param isCVFile - Liệu tệp có phải là CV hay không
 * @returns ID công khai đã tạo
 */
function generatePublicId(isCVFile: boolean): string {
  const timestamp = Date.now();
  const randomString = generateRandomString();

  if (isCVFile) {
    return `cv_${timestamp}_${randomString}.pdf`;
  }

  return `avatar_${timestamp}_${randomString}`;
}

/**
 * Tạo chuỗi ngẫu nhiên chữ và số
 * 
 * @returns Random 9-character string
 */
function generateRandomString(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Creates callback handler for Cloudinary upload
 * 
 * @param resolve - Promise resolve function
 * @param reject - Promise reject function
 * @returns Upload callback function
 */
function handleUploadResult(
  resolve: (value: any) => void,
  reject: (error: any) => void
) {
  return (error: any, result: any) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  };
}

export { uploadAvatar, uploadCV };
