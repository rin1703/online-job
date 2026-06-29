import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGetCompanyByIdAdminQuery } from "../api/companies.service";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  CheckCircle2,
  FileText,
  Copy,
  XCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "../lib/ultils";
import { toast } from "sonner";

interface CompanyDetailDialogProps {
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyDetailDialog({ companyId, open, onOpenChange }: CompanyDetailDialogProps) {
  const {
    data: response,
    isLoading,
    isError,
  } = useGetCompanyByIdAdminQuery(companyId!, {
    skip: !companyId || !open,
  });

  const company = response?.data;

  // SỬA 1: Thêm || "" vào company.name
  const logoSrc = company
    ? `https://ui-avatars.com/api/?name=${getInitials(company.name || "")}&background=random&color=fff&size=256`
    : "/placeholder-company.png";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
            <CheckCircle2 className="w-4 h-4" /> Verified
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
            <XCircle className="w-4 h-4" /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
            <Clock className="w-4 h-4" /> Pending
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : isError || !company ? (
          <div className="text-center py-20 text-red-500">Failed to load company details.</div>
        ) : (
          <>
            <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 px-6 pt-8 pb-6 border-b">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 shrink-0 rounded-2xl border-2 border-white bg-white shadow-md overflow-hidden">
                  <img src={logoSrc} alt={company.name} className="w-full h-full object-contain" />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {company.name}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Vietnam</span>
                      </div>
                    </div>
                    {renderStatusBadge(company.verificationStatus)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
              {/* Left Column */}
              <div className="lg:col-span-2 p-6 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-semibold tracking-wider">
                      <Building2 className="w-3.5 h-3.5" /> Industry
                    </div>
                    <div
                      className="font-medium text-gray-900 truncate"
                      title={company.industry?.name}
                    >
                      {company.industry?.name || "N/A"}
                    </div>
                    <div
                      className="font-medium text-gray-400 truncate"
                      title={company.industry?.description}
                    >
                      {company.industry?.description || "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-semibold tracking-wider">
                      <Users className="w-3.5 h-3.5" /> Size
                    </div>
                    <div className="font-medium text-gray-900">
                      {company.employeeCount || "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-semibold tracking-wider">
                      <Calendar className="w-3.5 h-3.5" /> Founded
                    </div>
                    <div className="font-medium text-gray-900">{company.foundedYear || "N/A"}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    About Company
                  </h3>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {company.description || (
                      <span className="italic text-gray-400">No description provided.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-gray-50/50 p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
                    Contact Info
                  </h4>

                  <div className="group">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Website
                    </div>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-medium hover:underline truncate block"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>

                  <div className="group">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    {company.email ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${company.email}`}
                          className="text-gray-900 font-medium hover:text-blue-600 truncate text-sm"
                        >
                          {company.email}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          // SỬA 2: Thêm || "" vào company.email
                          onClick={() => handleCopy(company.email || "", "Email")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>

                  <div className="group">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </div>
                    {company.phone ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium text-sm">{company.phone}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          // SỬA 3: Thêm || "" vào company.phone
                          onClick={() => handleCopy(company.phone || "", "Phone")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
                    Legal Info
                  </h4>

                  <div className="group p-3 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Tax Code
                      </div>
                      {company.taxCode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-400 hover:text-gray-700"
                          // SỬA 4: Thêm || "" vào company.taxCode
                          onClick={() => handleCopy(company.taxCode || "", "Tax Code")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="font-mono text-gray-900 font-medium break-all">
                      {company.taxCode || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
