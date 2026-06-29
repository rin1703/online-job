function calculateEndDate(startDate: Date, value: number, unit: string): Date {
  const endDate = new Date(startDate);
  switch (unit) {
    case "day":
      endDate.setDate(endDate.getDate() + value);
      break;
    case "month":
      endDate.setMonth(endDate.getMonth() + value);
      break;
    case "year":
      endDate.setFullYear(endDate.getFullYear() + value);
      break;
    default:
      throw new Error("Invalid duration unit");
  }
  return endDate;
}

function limitDescription(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.substring(0, maxLength - 3) + "..."; // thêm "..."
}
export { calculateEndDate, limitDescription };
