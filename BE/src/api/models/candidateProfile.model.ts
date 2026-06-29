import mongoose, { Document, Schema } from "mongoose";

interface IEducation {
  degree: string;
  institution: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
}

interface IExperience {
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

interface ISkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface ICertification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialUrl?: string;
}

interface ILanguage {
  name: string;
  proficiency: "Basic" | "Intermediate" | "Advanced" | "Fluent" | "Native";
}

interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  headline?: string;
  summary?: string;
  profilePicture?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  currentLocation?: string;
  address?: string;
  country?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  willingToRelocate: boolean;
  expectedSalary?: number;
  salaryCurrency?: string;
  availability?: string;
  education: IEducation[];
  experience: IExperience[];
  skills: ISkill[];
  certifications: ICertification[];
  languages: ILanguage[];
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    gpa: { type: Number, required: false },
  },
  { _id: false }
);

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, required: false },
  },
  { _id: false }
);

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      required: true,
    },
  },
  { _id: false }
);

const CertificationSchema = new Schema<ICertification>(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: false },
    credentialUrl: { type: String, required: false },
  },
  { _id: false }
);

const LanguageSchema = new Schema<ILanguage>(
  {
    name: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ["Basic", "Intermediate", "Advanced", "Fluent", "Native"],
      required: true,
    },
  },
  { _id: false }
);

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    headline: { type: String, required: false },
    summary: { type: String, required: false },
    profilePicture: { type: String, required: false },
    resumeUrl: { type: String, required: false },
    portfolioUrl: { type: String, required: false },
    linkedinUrl: { type: String, required: false },
    githubUrl: { type: String, required: false },
    currentLocation: { type: String, required: false },
    address: { type: String, required: false },
    country: { type: String, required: false },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      required: false,
    },
    willingToRelocate: { type: Boolean, default: false },
    expectedSalary: { type: Number, required: false },
    salaryCurrency: { type: String, default: "USD" },
    availability: { type: String, required: false },
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: [SkillSchema],
    certifications: [CertificationSchema],
    languages: [LanguageSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để tìm kiếm nhanh
CandidateProfileSchema.index({ userId: 1 }, { unique: true });
CandidateProfileSchema.index({ "skills.name": 1 });
CandidateProfileSchema.index({ currentLocation: 1 });

const CandidateProfile = mongoose.model<ICandidateProfile>(
  "CandidateProfile",
  CandidateProfileSchema,
  "candidateProfiles" // Explicitly set collection name
);

export default CandidateProfile;