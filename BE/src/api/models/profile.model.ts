import { Schema, model } from "mongoose";
import { STANDARD_SCHEMA_OPTIONS, FIELD_CONSTRAINTS } from "./common/schemaConfig";

const SocialLinkSchema = new Schema({
  platform: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
}, { _id: false });

const WorkExperienceSchema = new Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.LONG_TEXT_MAX },
}, { _id: true, timestamps: false, versionKey: false });

const EducationSchema = new Schema({
  school: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.LONG_TEXT_MAX },
}, { _id: true, timestamps: false, versionKey: false });

const ProjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.LONG_TEXT_MAX },
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, trim: true },
  demoUrl: { type: String, trim: true },
}, { _id: true, timestamps: false, versionKey: false });

const CertificateSchema = new Schema({
  title: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true },
  credentialUrl: { type: String, trim: true },
}, { _id: true, timestamps: false, versionKey: false });

const ProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: FIELD_CONSTRAINTS.NAME_MAX },
  avatar: { type: String, trim: true },
  title: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.SHORT_TEXT_MAX },
  company: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.SHORT_TEXT_MAX },
  bio: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.EXTRA_LONG_TEXT_MAX },
  location: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.SHORT_TEXT_MAX },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  expectedSalary: { type: Number, min: FIELD_CONSTRAINTS.MIN_SALARY },
  careerObjective: { type: String, trim: true, maxlength: FIELD_CONSTRAINTS.EXTRA_LONG_TEXT_MAX },
  cv: {
    type: String,
    trim: true,
    default: null,
  },

  socialLinks: { type: [SocialLinkSchema], default: [] },
  jobSkills: {
    frontend: [{ type: String, trim: true }],
    backend: [{ type: String, trim: true }],
    devops: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
  },

  workExperiences: { type: [WorkExperienceSchema], default: [] },
  education: { type: [EducationSchema], default: [] },
  projects: { type: [ProjectSchema], default: [] },
  certificates: { type: [CertificateSchema], default: [] },
}, { timestamps: true, versionKey: false });

export const Profile = model("Profile", ProfileSchema);
