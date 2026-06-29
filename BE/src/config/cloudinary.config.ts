/**
 * Cấu hình Cloudinary
 * Cấu hình dịch vụ lưu trữ đám mây cho tải lên tệp (avatar, CV)
 */

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/**
 * Xác thực rằng URL Cloudinary đã được cấu hình
 * Ném lỗi nếu biến môi trường bị thiếu
 */
function validateCloudinaryConfiguration(): void {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("❌ CLOUDINARY_URL is missing in .env file!");
  }
}

/**
 * Khởi tạo Cloudinary với cấu hình môi trường
 */
function initializeCloudinary(): void {
  validateCloudinaryConfiguration();
  cloudinary.config(process.env.CLOUDINARY_URL!);
}

/**
 * Ghi log chi tiết cấu hình Cloudinary (để gỡ lỗi)
 * Che giấu thông tin nhạy cảm như API key
 */
function logCloudinaryConfiguration(): void {
  const config = cloudinary.config();
  const maskedApiKey = maskSensitiveValue(config.api_key);
  
  console.log("✅ Cloudinary Configuration Successful:");
  console.log(`  - Cloud Name: ${config.cloud_name}`);
  console.log(`  - API Key: ${maskedApiKey}`);
}

/**
 * Che giấu các giá trị cấu hình nhạy cảm để ghi log
 * Chỉ hiển thị 6 ký tự đầu tiên
 * 
 * @param value - Giá trị cần che giấu
 * @returns Giá trị được che giấu một phần
 */
function maskSensitiveValue(value?: string): string {
  if (!value) return "Not configured";
  
  const visibleCharacters = 6;
  return value.slice(0, visibleCharacters) + "...";
}

/**
 * Kiểm tra kết nối Cloudinary bằng ping
 * Ghi log thông báo thành công hoặc lỗi
 */
async function testCloudinaryConnection(): Promise<void> {
  try {
    await cloudinary.api.ping();
    console.log("✅ Cloudinary Connection Test: SUCCESS");
  } catch (error: any) {
    console.error("❌ Cloudinary Connection Test FAILED:", error.message);
  }
}

initializeCloudinary();
logCloudinaryConfiguration();
testCloudinaryConnection();

export default cloudinary;