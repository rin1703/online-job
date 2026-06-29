/**
 * Enum cho các mức thời gian ban tài khoản
 */
export enum BanDuration {
     FIFTEEN_MINUTES = "15_minutes",
     THIRTY_MINUTES = "30_minutes",
     ONE_HOUR = "1_hour",
     SIX_HOURS = "6_hours",
     TWELVE_HOURS = "12_hours",
     TWENTY_FOUR_HOURS = "24_hours",
     THREE_DAYS = "3_days",
     SEVEN_DAYS = "7_days",
     FIFTEEN_DAYS = "15_days",
     ONE_MONTH = "1_month",
     THREE_MONTHS = "3_months",
     SIX_MONTHS = "6_months",
     ONE_YEAR = "1_year",
   }
   
   /**
    * Mapping từ BanDuration sang milliseconds
    */
   export const BAN_DURATION_MS: Record<BanDuration, number> = {
     [BanDuration.FIFTEEN_MINUTES]: 15 * 60 * 1000, // 15 phút
     [BanDuration.THIRTY_MINUTES]: 30 * 60 * 1000, // 30 phút
     [BanDuration.ONE_HOUR]: 1 * 60 * 60 * 1000, // 1 giờ
     [BanDuration.SIX_HOURS]: 6 * 60 * 60 * 1000, // 6 giờ
     [BanDuration.TWELVE_HOURS]: 12 * 60 * 60 * 1000, // 12 giờ
     [BanDuration.TWENTY_FOUR_HOURS]: 24 * 60 * 60 * 1000, // 24 giờ
     [BanDuration.THREE_DAYS]: 3 * 24 * 60 * 60 * 1000, // 3 ngày
     [BanDuration.SEVEN_DAYS]: 7 * 24 * 60 * 60 * 1000, // 7 ngày
     [BanDuration.FIFTEEN_DAYS]: 15 * 24 * 60 * 60 * 1000, // 15 ngày
     [BanDuration.ONE_MONTH]: 30 * 24 * 60 * 60 * 1000, // 1 tháng (30 ngày)
     [BanDuration.THREE_MONTHS]: 90 * 24 * 60 * 60 * 1000, // 3 tháng (90 ngày)
     [BanDuration.SIX_MONTHS]: 180 * 24 * 60 * 60 * 1000, // 6 tháng (180 ngày)
     [BanDuration.ONE_YEAR]: 365 * 24 * 60 * 60 * 1000, // 1 năm (365 ngày)
   };
   
   /**
    * Mapping từ BanDuration sang label tiếng Việt
    */
   export const BAN_DURATION_LABELS: Record<BanDuration, string> = {
     [BanDuration.FIFTEEN_MINUTES]: "15 phút",
     [BanDuration.THIRTY_MINUTES]: "30 phút",
     [BanDuration.ONE_HOUR]: "1 tiếng",
     [BanDuration.SIX_HOURS]: "6 tiếng",
     [BanDuration.TWELVE_HOURS]: "12 tiếng",
     [BanDuration.TWENTY_FOUR_HOURS]: "24 tiếng",
     [BanDuration.THREE_DAYS]: "3 ngày",
     [BanDuration.SEVEN_DAYS]: "7 ngày",
     [BanDuration.FIFTEEN_DAYS]: "15 ngày",
     [BanDuration.ONE_MONTH]: "1 tháng",
     [BanDuration.THREE_MONTHS]: "3 tháng",
     [BanDuration.SIX_MONTHS]: "6 tháng",
     [BanDuration.ONE_YEAR]: "1 năm",
   };
   
   /**
    * Convert BanDuration thành milliseconds
    */
   export function getBanDurationInMilliseconds(duration: BanDuration): number {
     return BAN_DURATION_MS[duration];
   }
   
   /**
    * Get label tiếng Việt cho BanDuration
    */
   export function getBanDurationLabel(duration: BanDuration): string {
     return BAN_DURATION_LABELS[duration];
   }
   
   
   
   
   