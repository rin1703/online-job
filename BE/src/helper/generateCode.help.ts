export const generateOrderCode = (): number => Date.now(); // unique & numeric ✅

export const generatePublicCode = (orderCode: number): string => {
  return `JJOB-${orderCode.toString(36).toUpperCase()}`; // gọn & dễ đọc
};
