import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompanyStatusBadgeProps {
  status: string;
  className?: string;
}

export default function CompanyStatusBadge({ status, className }: CompanyStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "green" | "yellow" | "gray" =
    "outline";

  switch (status?.toLowerCase()) {
    case "verified":
      variant = "green";
      break;
    case "pending":
      variant = "yellow";
      break;
    case "rejected":
    case "no_tax_code":
      variant = "destructive";
      break;
    default:
      variant = "gray";
  }

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {status === "no_tax_code" ? "No Tax Code" : status}
    </Badge>
  );
}
