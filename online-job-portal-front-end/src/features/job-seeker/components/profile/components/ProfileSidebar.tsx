import type { JSX } from "react";
import {
  DollarSign,
  FacebookIcon,
  GithubIcon,
  Globe,
  InstagramIcon,
  Linkedin,
  MapPin,
} from "lucide-react";

import type { Profile } from "../types/profile.types.tsx";

function ProfileHeader({
  imageUrl,
  name,
  company,
  bio,
}: Readonly<{ imageUrl: string; name: string; company: string; bio: string }>) {
  return (
    <div className="flex flex-col items-center text-center lg:flex-col">
      {/* Image */}
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32"
        />
      </div>

      {/* Info */}
      <div className="mt-4 lg:mt-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-xl lg:text-2xl">{name}</h2>
        <p className="mt-1 text-sm text-gray-600 lg:text-base">{company}</p>
        <hr className="my-3" />
        <p className="mt-2 text-xs text-gray-500 sm:text-sm lg:mt-4">{bio}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: Readonly<{
  icon: JSX.Element;
  label: string;
  value: string | number;
}>) {
  return (
    <div className="flex items-center justify-around gap-4 rounded-xl bg-gray-50 px-3 py-3 transition-all hover:bg-gray-100 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {icon}
        <span className="text-xs font-black text-gray-700 sm:text-sm">{label}</span>
      </div>
      <span className="text-xs font-light text-gray-800 sm:text-sm">{value}</span>
    </div>
  );
}

function SocialLinks({ links }: { links: Profile["socialLinks"] }) {
  // Helper function to get icon based on platform (case-insensitive)
  const getIconForPlatform = (platform: string): JSX.Element => {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes("github")) {
      return (
        <GithubIcon className="h-5 w-5 text-gray-800 transition-all group-hover:text-orange-500 sm:h-6 sm:w-6" />
      );
    } else if (platformLower.includes("linkedin")) {
      return (
        <Linkedin className="h-5 w-5 text-gray-800 transition-all group-hover:text-orange-500 sm:h-6 sm:w-6" />
      );
    } else if (platformLower.includes("facebook")) {
      return (
        <FacebookIcon className="h-5 w-5 text-gray-800 transition-all group-hover:text-orange-500 sm:h-6 sm:w-6" />
      );
    } else if (platformLower.includes("instagram")) {
      return (
        <InstagramIcon className="h-5 w-5 text-gray-800 transition-all group-hover:text-orange-500 sm:h-6 sm:w-6" />
      );
    } else {
      // Default: website or other platforms
      return (
        <Globe className="h-5 w-5 text-gray-800 transition-all group-hover:text-orange-500 sm:h-6 sm:w-6" />
      );
    }
  };

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
      {links.map((link, index) => (
        <a
          key={`${link.platform}-${index}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="group flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-gray-200 transition-all hover:bg-orange-50 sm:h-12 sm:w-12"
          title={link.platform}
        >
          {getIconForPlatform(link.platform)}
        </a>
      ))}
    </div>
  );
}
export function ProfileSidebar({ profile }: { profile: Profile }) {
  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(profile.name || "User") +
    "&background=F97A00&color=fff&size=200";

  return (
    <div className="w-full scrollbar-hide scrollbar-hide::-webkit-scrollbar rounded-2xl bg-white p-4 shadow-lg sm:p-6 lg:h-[calc(100vh-15rem)] lg:overflow-auto">
      <ProfileHeader
        imageUrl={profile.avatar || defaultAvatar}
        name={profile.name || "User"}
        company={profile.company || "Add your company"}
        bio={profile.bio || "Tell us about yourself..."}
      />

      <div className="mt-6 space-y-3">
        <InfoRow
          icon={<MapPin className="h-4 w-4 text-orange-500" />}
          label="Location"
          value={profile.location || "Add location"}
        />
        {
          <InfoRow
            icon={<DollarSign className="h-4 w-4 text-orange-500" />}
            label="Expected Salary"
            value={profile.expectedSalary ? `$${profile.expectedSalary}` : "Not set"}
          />
        }
      </div>

      <SocialLinks links={profile.socialLinks} />

      {/*/!* Profile Completeness Indicator *!/*/}
      {/*<div className="mt-6">*/}
      {/*  <ProfileCompletenessIndicator profile={profile} />*/}
      {/*</div>*/}
    </div>
  );
}
