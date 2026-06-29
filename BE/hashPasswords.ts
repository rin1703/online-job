import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/api/models/user.model"; // ⚠️ đường dẫn tới model User

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/online_job_portal";

const hashPasswords = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find();
    console.log(`🔍 Found ${users.length} users`);

    for (const user of users) {
      if (!(user as any).password.startsWith("$2b$")) { // tránh hash trùng
        const hashed = await bcrypt.hash((user as any).password, 10);
        (user as any).password = hashed;
        await user.save();
        console.log(`🔒 Updated password for ${(user as any).email}`);
      } else {
        console.log(`⏭️ Skipped ${(user as any).email} (already hashed)`);
      }
    }

    console.log("✅ All passwords processed successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error while hashing passwords:", err);
  }
};

hashPasswords();
