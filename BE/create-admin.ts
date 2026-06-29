import dotenv from "dotenv";
import { connectToDatabase } from "./src/config/database.config";
import User from "./src/api/models/user.model";
import { UserRole } from "./src/api/models/enum/userRole.enum";
import { hashPassword } from "./src/api/modules/auth/password.helper";

dotenv.config();

const args = process.argv.slice(2);
const email = args[0] || "admin@example.com";
const password = args[1] || "Admin@1234";
const firstName = args[2] || "Admin";
const lastName = args[3] || "User";
const phone = args[4] || "0123456789";
const birthday = args[5] ? new Date(args[5]) : new Date("1990-01-01");

async function main() {
  try {
    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`Admin user already exists with email ${email}`);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);

    const adminUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName,
      lastName,
      birthday,
      phone,
      isActive: true,
      loginAttempts: 0,
      isDeleted: false,
    });

    await adminUser.save();

    console.log("✅ Admin account created successfully:");
    console.log(`   email: ${email}`);
    console.log(`   password: ${password}`);
    console.log("   role: admin");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to create admin user:", error.message || error);
    process.exit(1);
  }
}

main();
