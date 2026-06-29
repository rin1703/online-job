import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileControlContent from "@/features/job-seeker/components/profile/components/ProfileViewContent";
import { ProfileSidebar } from "@/features/job-seeker/components/profile/components/ProfileSidebar";
import { useGetJobSeekerProfileQuery, useGetRecruiterProfileQuery } from "@/redux/features/profile/profileApi";
import { Briefcase, MapPin, Mail, Phone, Globe } from "lucide-react";

export default function PublicProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") || "job_seeker";

    // Scroll to top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, []);

    // Fetch data based on role
    const { data: jobSeekerData, isLoading: isLoadingJobSeeker, error: jobSeekerError } = useGetJobSeekerProfileQuery(id!, {
        skip: !id || role !== "job_seeker",
    });

    const { data: recruiterData, isLoading: isLoadingRecruiter, error: recruiterError } = useGetRecruiterProfileQuery(id!, {
        skip: !id || role !== "recruiter",
    });

    const isLoading = role === "job_seeker" ? isLoadingJobSeeker : isLoadingRecruiter;
    const error = role === "job_seeker" ? jobSeekerError : recruiterError;

    useEffect(() => {
        console.log("[PublicProfilePage] Params:", { id, role });
        if (jobSeekerData) console.log("[PublicProfilePage] JobSeeker Data:", jobSeekerData);
        if (recruiterData) console.log("[PublicProfilePage] Recruiter Data:", recruiterData);
        if (error) console.error("[PublicProfilePage] Error:", error);
    }, [id, role, jobSeekerData, recruiterData, error]);

    if (isLoading) {
        return (
            <div className="relative mx-auto max-w-7xl w-full h-screen flex items-center justify-center">
                <div className="space-y-4 w-full max-w-2xl p-10">
                    <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    // Render Recruiter Profile (Company Info)
    if (role === "recruiter" && recruiterData) {
        const company = recruiterData.companyId || {};

        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                        <div className="px-8 pb-8">
                            <div className="relative flex items-end -mt-12 mb-6">
                                <div className="p-1 bg-white rounded-full">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden border-4 border-white shadow-lg">
                                        {recruiterData.avatar ? (
                                            <img src={recruiterData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            (recruiterData.firstName?.[0] || "R")
                                        )}
                                    </div>
                                </div>
                                <div className="ml-6 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {recruiterData.firstName} {recruiterData.lastName}
                                    </h1>
                                    <p className="text-gray-600 font-medium">Recruiter at {company.name || "Unknown Company"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-blue-600" />
                                            About Company
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            {company.description || "No description available."}
                                        </p>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Contact Info</h3>
                                        <div className="space-y-3">
                                            {company.location && (
                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mt-0.5" />
                                                    <span>{company.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <a href={`mailto:${recruiterData.email}`} className="hover:text-blue-600">
                                                    {recruiterData.email}
                                                </a>
                                            </div>
                                            {recruiterData.phoneNumber && (
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{recruiterData.phoneNumber}</span>
                                                </div>
                                            )}
                                            {company.website && (
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <Globe className="w-4 h-4" />
                                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                                        Website
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render Job Seeker Profile
    if (role === "job_seeker" && jobSeekerData) {
        const profileData = {
            ...jobSeekerData,
            socialLinks: jobSeekerData.socialLinks || [],
            jobSkills: jobSeekerData.jobSkills || [],
            workExperiences: jobSeekerData.workExperiences || [],
            education: jobSeekerData.education || [],
            projects: jobSeekerData.projects || [],
            certificates: jobSeekerData.certificates || [],
            name: jobSeekerData.name || `${jobSeekerData.user?.firstName || ''} ${jobSeekerData.user?.lastName || ''}`.trim(),
            avatar: jobSeekerData.avatar || "",
            title: jobSeekerData.title || "",
            company: jobSeekerData.company || "",
            bio: jobSeekerData.bio || "",
            location: jobSeekerData.location || "",
            email: jobSeekerData.email || "",
            phone: jobSeekerData.phone || "",
            careerObjective: jobSeekerData.careerObjective || "",
            cv: jobSeekerData.cv || "",
            cvUrl: jobSeekerData.cvUrl || jobSeekerData.cv || "",
            expectedSalary: jobSeekerData.expectedSalary || 0,
        };

        return (
            <div className="relative min-h-screen overflow-hidden">
                {/* Fixed background */}
                <div
                    aria-hidden="true"
                    className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
                />

                <main className="relative mx-auto max-w-7xl h-full pt-4 pb-20 px-4 lg:px-0 ">
                    <div className="pt-32 flex flex-col lg:flex-row space-x-10 justify-around w-full">
                        <div className="animate-slideInLeft animate-duration-slow lg:w-1/4 w-full">
                            <ProfileSidebar profile={profileData} />
                        </div>
                        <div className="w-full lg:w-8/10 animate-slideInRight animate-duration-slow mt-10 lg:mt-0">
                            <ProfileControlContent
                                profile={profileData}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Profile Not Found</h2>
                <p className="text-gray-600 mt-2">The user profile you are looking for does not exist or is private.</p>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm max-w-md mx-auto">
                        <p className="font-bold">Error Details:</p>
                        <pre className="mt-2 whitespace-pre-wrap text-left">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
