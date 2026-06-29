import { Types } from "mongoose";
// @ts-nocheck
import CompanyLocation from "../models/companyLocation.model";

type EnsureCompanyLocationParams = {
  companyId: Types.ObjectId;
  address: string;
  district: string;
  city: string;
  isHeadquarters?: boolean;
};

/** Ensure CompanyLocation tồn tại (không dùng transaction) */
export async function ensureCompanyLocation(
  params: EnsureCompanyLocationParams
) {
  const address = params.address.trim();
  const district = params.district.trim();
  const city = params.city.trim();

  // 1) Tìm sẵn có
  let loc = await CompanyLocation.findOne({
    company: params.companyId,
    "location.address": address,
    "location.district": district,
    "location.city": city,
  });

  if (loc) {
    // Nâng lên HQ nếu cần
    if ((params as any).isHeadquarters && !(loc as any).isHeadquarters) {
      try {
        await CompanyLocation.updateOne(
          { _id: loc._id },
          { $set: { isHeadquarters: true } }
        );
        await CompanyLocation.updateMany(
          {
            company: params.companyId,
            _id: { $ne: loc._id },
            isHeadquarters: true,
          },
          { $set: { isHeadquarters: false } }
        );
        (loc as any).isHeadquarters = true;
      } catch (e: any) {
        if (e.code !== 11000) throw e;
        // unique HQ va chạm -> đọc lại trạng thái mới nhất
        loc = await CompanyLocation.findOne({
          company: params.companyId,
          "location.address": address,
          "location.district": district,
          "location.city": city,
        });
      }
    }
    return { doc: loc!, created: false };
  }

  // 2) Chưa có -> tạo
  try {
    loc = await CompanyLocation.create({
      company: params.companyId,
      location: { address, district, city },
      isHeadquarters: !!(params as any).isHeadquarters,
    });

    if ((params as any).isHeadquarters) {
      // Best-effort: đảm bảo chỉ 1 HQ
      await CompanyLocation.updateMany(
        {
          company: params.companyId,
          _id: { $ne: loc._id },
          isHeadquarters: true,
        },
        { $set: { isHeadquarters: false } }
      );
    }

    return { doc: loc, created: true };
  } catch (e: any) {
    if (e.code === 11000) {
      // race: ai đó vừa tạo -> đọc lại
      const existing = await CompanyLocation.findOne({
        company: params.companyId,
        "location.address": address,
        "location.district": district,
        "location.city": city,
      });
      if (existing) return { doc: existing, created: false };
    }
    throw e;
  }
}


