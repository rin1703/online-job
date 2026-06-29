import mongoose, { Schema } from "mongoose";
import { STANDARD_SCHEMA_OPTIONS } from "./common/schemaConfig";

const CompanyLocationSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: {
      address: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
    },
    isHeadquarters: { type: Boolean, default: false },
  },
  STANDARD_SCHEMA_OPTIONS
);

// ✅ Avoid duplicates in same company (đổi lại index dùng 'company')
CompanyLocationSchema.index(
  {
    company: 1,
    "location.address": 1,
    "location.district": 1,
    "location.city": 1,
  },
  { unique: true }
);

// ✅ One HQ per company (đổi lại company thay vì companyId)
CompanyLocationSchema.index(
  { company: 1, isHeadquarters: 1 },
  { unique: true, partialFilterExpression: { isHeadquarters: true } }
);

const CompanyLocation = mongoose.model(
  "CompanyLocation",
  CompanyLocationSchema,
  "companylocations"
);

export default CompanyLocation;
export { CompanyLocationSchema };
