// @ts-nocheck
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import User from "../api/models/user.model";
import { Profile as ProfileModel } from "../api/models/profile.model";
import { UserRole } from "../api/models/enum/userRole.enum";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      accessToken: string, 
      refreshToken: string, 
      profile: Profile, 
      done: VerifyCallback
    ) => {
      try {
        // Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          // Nếu user đã tồn tại, kiểm tra trạng thái active
          if (!user.isActive) {
            return done(null, false, { message: "Tài khoản đã bị vô hiệu hóa" });
          }

          // Ensure profile exists for existing user (in case it was missing)
          if (!user.profileId) {
            try {
              const existingProfile = await ProfileModel.findOne({ user: user._id });
              if (!existingProfile) {
                // Create profile if missing
                console.log(`[GoogleAuth] Creating missing profile for existing user: ${user.email}`);
                const fullName = `${user.firstName} ${user.lastName}`.trim();
                const newProfile = await ProfileModel.create({
                  user: user._id,
                  name: fullName,
                  email: user.email,
                  phone: user.phone,
                  avatar: null,
                  title: null,
                  company: null,
                  bio: null,
                  location: null,
                  expectedSalary: null,
                  careerObjective: null,
                  cv: null,
                  socialLinks: [],
                  jobSkills: {
                    frontend: [],
                    backend: [],
                    devops: [],
                    softSkills: [],
                  },
                  workExperiences: [],
                  education: [],
                  projects: [],
                  certificates: [],
                });
                user.profileId = newProfile._id;
                await user.save();
              } else {
                // Profile exists, just update the reference
                user.profileId = existingProfile._id;
                await user.save();
              }
            } catch (profileErr) {
              console.error(`[GoogleAuth] Error ensuring profile for user ${user.email}:`, profileErr);
              // Continue anyway, profile issue shouldn't block login
            }
          }

          return done(null, user);
        }

        // Nếu user chưa tồn tại, tạo user mới
        const newUser = new User({
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName || "User",
          lastName: profile.name?.familyName || "",
          password: Math.random().toString(36).slice(-8), // Random password (không dùng để login)
          role: UserRole.JOB_SEEKER, // Mặc định là job seeker
          birthday: new Date("2000-01-01"), // Giá trị mặc định, user có thể cập nhật sau
          phone: "0000000000", // Giá trị mặc định, user có thể cập nhật sau
          isActive: true,
          googleId: profile.id,
        });

        await newUser.save();

        // Create default profile for new Google OAuth user
        try {
          const fullName = `${newUser.firstName} ${newUser.lastName}`.trim();
          const createdProfile = await ProfileModel.create({
            user: newUser._id,
            name: fullName,
            email: newUser.email,
            phone: newUser.phone,
            avatar: null,
            title: null,
            company: null,
            bio: null,
            location: null,
            expectedSalary: null,
            careerObjective: null,
            cv: null,
            socialLinks: [],
            jobSkills: {
              frontend: [],
              backend: [],
              devops: [],
              softSkills: [],
            },
            workExperiences: [],
            education: [],
            projects: [],
            certificates: [],
          });

          // Save profileId reference back to user for quick lookups
          newUser.profileId = createdProfile._id;
          await newUser.save();
        } catch (profileError) {
          console.error("Error creating default profile for Google OAuth user:", profileError);
          // Don't fail the entire login if profile creation fails, but log it
        }

        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, false);
      }
    }
  )
);

// Tuần tự hóa người dùng
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Giải tuần tự hóa người dùng
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;