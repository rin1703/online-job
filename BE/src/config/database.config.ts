/**
 * Cấu hình Database
 * Quản lý kết nối MongoDB bằng Mongoose
 */

import mongoose from "mongoose";

const DATABASE_CONNECTION_TIMEOUT = 10000; // 10 giây

/**
 * Thiết lập kết nối đến cơ sở dữ liệu MongoDB
 * Sử dụng chuỗi kết nối từ biến môi trường
 * Thoát tiến trình nếu kết nối thất bại
 * 
 * @throws Error nếu MONGODB_URI không được cấu hình hoặc kết nối thất bại
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongodbUri = getMongoDBUri();
    
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: DATABASE_CONNECTION_TIMEOUT,
    });
    
    logSuccessfulConnection();
  } catch (error) {
    handleConnectionError(error);
  }
};

/**
 * Lấy URI kết nối MongoDB từ môi trường
 * 
 * @returns Chuỗi kết nối MongoDB
 * @throws Error nếu MONGODB_URI không được cấu hình
 */
function getMongoDBUri(): string {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error("❌ MONGODB_URI is missing in environment variables!");
  }
  
  return uri;
}

/**
 * Ghi log kết nối cơ sở dữ liệu thành công
 */
function logSuccessfulConnection(): void {
  console.log("✅ Successfully connected to MongoDB");
}

/**
 * Xử lý lỗi kết nối cơ sở dữ liệu
 * Ghi log chi tiết lỗi và thoát tiến trình
 * 
 * @param error - Đối tượng lỗi từ lần thử kết nối
 */
function handleConnectionError(error: any): void {
  console.error("❌ Failed to connect to MongoDB:", error.message);
  console.error("   Please check your MONGODB_URI and network connection");
  
  process.exit(1);
}

// Duy trì khả năng tương thích ngược với tên hàm cũ
export const connect = connectToDatabase;
