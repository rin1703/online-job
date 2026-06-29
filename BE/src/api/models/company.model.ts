import mongoose, { Schema } from "mongoose";
import { CompanyVerificationStatus } from "./enum/companyVerificationStatus.enum";
import {
  STANDARD_SCHEMA_OPTIONS,
  FIELD_CONSTRAINTS,
} from "./common/schemaConfig";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: FIELD_CONSTRAINTS.MEDIUM_TEXT_MAX,
    },
    normalizedName: { type: String, required: true },
    taxCode: { type: String, trim: true },
    description: {
      type: String,
      trim: true,
      maxlength: FIELD_CONSTRAINTS.LONG_TEXT_MAX,
    },
    website: { type: String, trim: true },
    websiteDomain: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    logo: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: Object.values(CompanyVerificationStatus),
      default: CompanyVerificationStatus.PENDING,
    },

    industryId: { type: Schema.Types.ObjectId, ref: "Industry" },
    employeeCount: { type: Schema.Types.Mixed },
    foundedYear: {
      type: Number,
      min: FIELD_CONSTRAINTS.MIN_YEAR,
      max: FIELD_CONSTRAINTS.MAX_YEAR,
    },
    isVerified: { type: Boolean, default: false },
  },
  STANDARD_SCHEMA_OPTIONS
);

CompanySchema.index(
  { normalizedName: 1 },
  { unique: true, collation: { locale: "en", strength: 1 } }
);

const Company = mongoose.model("Company", CompanySchema, "companies");
export default Company;
