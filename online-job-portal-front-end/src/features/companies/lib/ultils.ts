export const getInitials = (name: string) => {
  const cleanName = name.replace(/[^\w\s]/gi, "").trim();
  const words = cleanName.split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return cleanName.substring(0, 2).toUpperCase();
};
