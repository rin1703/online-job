import { type VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  status: string;
  className?: string;
}

const getStatusBadgeVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status?.toLowerCase()) {
    case "active":
      return "green";
    case "draft":
      return "yellow";
    case "hidden":
      return "gray";
    case "closed":
      return "destructive";
    default:
      return "outline";
  }
};

export default function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  return (
    <Badge variant={getStatusBadgeVariant(status)} className={cn("w-20 text-center", className)}>
      {status}
    </Badge>
  );
}
