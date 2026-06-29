import { useParams, useNavigate } from "react-router-dom";
import { useGetCompanyByIdQuery } from "@/features/companies/api/companies.service";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Share2,
  Flag,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/features/companies/lib/ultils";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: response,
    isLoading,
    isError,
  } = useGetCompanyByIdQuery(id || "", {
    skip: !id,
  });

  const company = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="h-64 bg-gray-200 rounded-t-2xl animate-pulse" />
          <div className="bg-white rounded-b-2xl p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="w-32 h-32 bg-gray-300 rounded-xl -mt-20 border-4 border-white" />
              <div className="w-1/3 h-8 bg-gray-200 rounded" />
              <div className="w-2/3 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Building2 className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-800">Company not found</h2>
        <Button onClick={() => navigate("/companies")} variant="outline">
          Back to list
        </Button>
      </div>
    );
  }

  const logoSrc = `https://ui-avatars.com/api/?name=${getInitials(company.name)}&background=random&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="relative h-[300px] w-full">
        <div className="absolute top-40 left-38 z-20 container mx-auto max-w-6xl">
          <Button
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm shadow-sm border border-gray-200"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative -mt-24 z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-white p-1 shadow-lg border border-gray-100 overflow-hidden">
                <img
                  src={logoSrc}
                  alt={company.name}
                  className="w-full h-full object-contain rounded-lg bg-gray-50"
                />
              </div>
              {company.verificationStatus === "verified" && (
                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-blue-500 fill-blue-50" />
                </div>
              )}
            </div>

            <div className="flex-1 flex-row pt-2 md:pt-12 space-y-3">
              <div className="flex flex-row justify-between items-start gap-4">
                <div className="flex flex-col">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {company.name}
                  </h1>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  {company.website && (
                    <Button
                      className="gap-2 bg-primary hover:bg-primary/90"
                      onClick={() => window.open(company.website, "_blank")}
                    >
                      Website <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {company.employeeCount || "Updating"} employees
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span>
                    Founded: <span className="font-medium">{company.foundedYear || "N/A"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Vietnam</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                About Company
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {company.description || "No detailed description available."}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Open Positions</h2>
                <Button variant="link" className="text-primary">
                  View all
                </Button>
              </div>
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">Job listing feature is coming soon...</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 border-b pb-4">Contact Information</h3>

              <div className="space-y-5">
                {company.website && (
                  <div className="group">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1 block">
                      Website
                    </p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 font-medium hover:underline truncate"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                {company.email && (
                  <div className="group">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1 block">
                      Email Address
                    </p>
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-2 text-gray-700 font-medium hover:text-primary transition-colors truncate"
                    >
                      <Mail className="w-4 h-4 shrink-0" />
                      {company.email}
                    </a>
                  </div>
                )}

                {company.phone && (
                  <div className="group">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1 block">
                      Phone Number
                    </p>
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Phone className="w-4 h-4 shrink-0" />
                      {company.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
