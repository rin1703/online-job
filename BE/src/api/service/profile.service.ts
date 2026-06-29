import { Profile } from "../models/profile.model";
import { UpsertProfileDTO } from "../dto/profile/profile.dto";
import { Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                              GET PROFILE                                   */
/* -------------------------------------------------------------------------- */

export async function getProfileByUser(userId: string) {
  return Profile.findOne({ user: convertToObjectId(userId) }).lean();
}

export async function getProfileForViewing(userId: string) {
  return Profile.findOne({ user: convertToObjectId(userId) }).lean();
}

/* -------------------------------------------------------------------------- */
/*                                   PUT                                      */
/* -------------------------------------------------------------------------- */

export async function upsertProfile(data: UpsertProfileDTO) {
  const userObjectId = convertToObjectId(data.userId);

  const payload = buildFullProfilePayload(userObjectId, data);

  return Profile.findOneAndUpdate(
    { user: userObjectId },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PATCH                                     */
/* -------------------------------------------------------------------------- */

export async function patchProfile(
  userId: string,
  partial: Partial<UpsertProfileDTO>
) {
  const userObjectId = convertToObjectId(userId);

  const current = await Profile.findOne({ user: userObjectId });

  // Nếu profile chưa tồn tại → tạo mới bằng upsert
  if (!current) {
    const newPayload = buildFullProfilePayload(userObjectId, {
      userId,
      ...partial
    } as UpsertProfileDTO);

    return Profile.findOneAndUpdate(
      { user: userObjectId },
      { $set: newPayload },
      { new: true, upsert: true }
    );
  }

  const updateFields = buildPartialUpdatePayload(current, partial);

  return Profile.findOneAndUpdate(
    { user: userObjectId },
    { $set: updateFields },
    { new: true }
  );
}

/* -------------------------------------------------------------------------- */
/*                           WORK EXPERIENCE CRUD                             */
/* -------------------------------------------------------------------------- */

export async function addWorkExperience(userId: string, exp: any) {
  return Profile.findOneAndUpdate(
    { user: convertToObjectId(userId) },
    { $push: { workExperiences: formatWorkExperience(exp) } },
    { new: true }
  );
}

export async function updateWorkExperience(
  userId: string,
  expId: string,
  update: any
) {
  const formatted = formatWorkExperience(update);

  const updateQuery = Object.fromEntries(
    Object.entries(formatted).map(([k, v]) => [`workExperiences.$.${k}`, v])
  );

  return Profile.findOneAndUpdate(
    {
      user: convertToObjectId(userId),
      "workExperiences._id": convertToObjectId(expId),
    },
    { $set: updateQuery },
    { new: true }
  );
}

export async function deleteWorkExperience(userId: string, expId: string) {
  return Profile.findOneAndUpdate(
    { user: convertToObjectId(userId) },
    { $pull: { workExperiences: { _id: convertToObjectId(expId) } } },
    { new: true }
  );
}

/* -------------------------------------------------------------------------- */
/*                             HELPER FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

function convertToObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

/* ----------------------------- FULL BUILD (PUT) ---------------------------- */

function buildFullProfilePayload(userId: Types.ObjectId, data: UpsertProfileDTO) {
  return {
    user: userId,
    name: data.name,
    avatar: data.avatar,
    title: data.title,
    company: data.company,
    bio: data.bio,
    location: data.location,
    email: data.email,
    phone: data.phone,
    cv: data.cv,
    expectedSalary: data.expectedSalary,
    careerObjective: data.careerObjective,

    socialLinks: data.socialLinks ?? [],
    jobSkills: data.jobSkills ?? {},

    workExperiences: data.workExperiences
      ? data.workExperiences.map(formatWorkExperience)
      : [],

    education: data.education ? data.education.map(formatEducation) : [],

    projects: data.projects ?? [],

    certificates: data.certificates
      ? data.certificates.map(formatCertificate)
      : [],
  };
}

/* ---------------------------- PARTIAL BUILD (PATCH) ---------------------------- */

function buildPartialUpdatePayload(current: any, partial: Partial<UpsertProfileDTO>) {
  const update: any = {};

  const simpleFields = [
    "name",
    "avatar",
    "title",
    "company",
    "bio",
    "location",
    "email",
    "phone",
    "cv",
    "expectedSalary",
    "careerObjective",
    "socialLinks",
    "jobSkills",
  ];

  // Simple fields
  for (const field of simpleFields) {
    if (partial[field] !== undefined) update[field] = partial[field];
  }

  /* --------------------------- Complex Array Fields --------------------------- */

  // EDUCATION
  if (partial.education) {
    update.education = mergeArrayById(
      current.education,
      partial.education.map(formatEducation)
    );
  }

  // WORK EXPERIENCES
  if (partial.workExperiences) {
    update.workExperiences = mergeArrayById(
      current.workExperiences,
      partial.workExperiences.map(formatWorkExperience)
    );
  }

  // CERTIFICATES
  if (partial.certificates) {
    update.certificates = mergeArrayById(
      current.certificates,
      partial.certificates.map(formatCertificate)
    );
  }

  // PROJECTS (simple object array)
  if (partial.projects) {
    update.projects = mergeArrayById(current.projects, partial.projects);
  }

  return update;
}

/* ---------------------------- ARRAY MERGE LOGIC ---------------------------- */
// Merge theo _id: update item cũ, thêm item mới
function mergeArrayById(oldArr: any[], newArr: any[]) {
  const map = new Map<string, any>();

  // add old
  oldArr?.forEach((item) => map.set(item._id?.toString(), item));

  // update / add new
  newArr?.forEach((item: any) => {
    if (item._id) {
      map.set(item._id.toString(), { ...map.get(item._id.toString()), ...item });
    } else {
      // new item → generate new ObjectId
      map.set(new Types.ObjectId().toString(), { ...item, _id: new Types.ObjectId() });
    }
  });

  return [...map.values()];
}

/* ----------------------------- FORMAT FUNCTIONS ----------------------------- */

function formatWorkExperience(exp: any) {
  return {
    ...exp,
    startDate: exp.startDate ? new Date(exp.startDate) : undefined,
    endDate: exp.endDate ? new Date(exp.endDate) : undefined,
  };
}

function formatEducation(e: any) {
  return {
    ...e,
    startDate: e.startDate ? new Date(e.startDate) : undefined,
    endDate: e.endDate ? new Date(e.endDate) : undefined,
  };
}

function formatCertificate(c: any) {
  return {
    ...c,
    issueDate: c.issueDate ? new Date(c.issueDate) : undefined,
  };
}
