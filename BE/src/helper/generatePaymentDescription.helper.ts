/**
 * Generate short description for PayOS (max 25 characters)
 * @param packageType - Type of subscription package
 * @param duration - Duration value
 * @param unit - Duration unit (day/month/year)
 * @returns Short description for PayOS
 */
export const generatePayOSDescription = (
  packageType: string,
  duration: number,
  unit: string
): string => {
  const typeMap: { [key: string]: string } = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
    enterprise: "Enterprise",
    plus: "Plus",
  };

  const unitMap: { [key: string]: string } = {
    day: "d",
    month: "m",
    year: "y",
  };

  const shortType = typeMap[packageType] || "Package";
  const shortUnit = unitMap[unit] || unit;

  // Format: "Premium 1m" hoặc "Basic 3m"
  return `${shortType} ${duration}${shortUnit}`;
};

/**
 * Generate full description for database storage
 * @param packageName - Full name of package
 * @param duration - Duration value
 * @param unit - Duration unit
 * @returns Full description
 */
export const generateFullDescription = (
  packageName: string,
  duration: number,
  unit: string
): string => {
  const unitText: { [key: string]: string } = {
    day: "ngày",
    month: "tháng",
    year: "năm",
  };

  return `Mua gói ${packageName} - ${duration} ${unitText[unit] || unit}`;
};

// Examples:
// generatePayOSDescription("premium", 1, "month") => "Premium 1m" (11 chars ✅)
// generatePayOSDescription("basic", 3, "month") => "Basic 3m" (8 chars ✅)
// generatePayOSDescription("enterprise", 1, "year") => "Enterprise 1y" (13 chars ✅)