import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Globe, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Btn";
import type { Company } from "../api/company.type";
import { getInitials } from "../lib/ultils";

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const logoSrc = `https://ui-avatars.com/api/?name=${getInitials(company.name)}&background=random&color=fff&size=128`;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:border-primary/30 transition-all duration-300">
            <img
              src={logoSrc}
              alt={`${company.name} logo`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3
                className="font-default font-bold text-lg text-gray-900 truncate group-hover:text-primary transition-colors duration-300"
                title={company.name}
              >
                {company.name}
              </h3>
              {company.verificationStatus === "verified" && (
                <div className="relative">
                  <BadgeCheck
                    className="w-5 h-5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-300"
                    fill="currentColor"
                    color="white"
                  />
                  <div className="absolute inset-0 bg-blue-400 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                </div>
              )}
            </div>

            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-primary flex items-center gap-1.5 w-fit transition-all duration-300 group/link"
              >
                <Globe className="w-3.5 h-3.5 group-hover/link:rotate-12 transition-transform duration-300" />
                <span className="truncate max-w-[150px] group-hover/link:underline">
                  {company.website.replace(/^https?:\/\//, "")}
                </span>
              </a>
            ) : (
              <div className="text-xs text-gray-400 flex items-center gap-1.5 w-fit cursor-default">
                <Globe className="w-3.5 h-3.5 opacity-50" />
                <span className="italic">Website not updated</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
            {company.description || "Company description is currently being updated."}
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-4">
            <div className="flex items-center gap-2 group/meta">
              <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-primary/10 transition-colors duration-300">
                <Users className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors duration-300" />
              </div>
              <span className="font-medium">
                {company.employeeCount ? company.employeeCount : "N/A"}
              </span>
            </div>

            {company.foundedYear && (
              <div className="flex items-center gap-2 group/meta">
                <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-primary/10 transition-colors duration-300">
                  <Building2 className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                </div>
                <span className="font-medium">Since {company.foundedYear}</span>
              </div>
            )}
          </div>
        </div>

        <Link to={`/companies/${company._id}`} className="mt-auto">
          <Button
            variant="outline"
            className="w-full border-2 border-gray-200 text-gray-700 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 group/btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
              View Details
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-hover translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
