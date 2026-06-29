'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Copy, Flag, Heart, MapPin, MessageCircle, Share2, X } from 'lucide-react';

import { Button } from '@/components/ui/Btn.tsx'; // Import Job type

import JobDetailHeader from '@/features/job-seeker/components/jobs/job-detail/JobDetailHeader.tsx';
import SimilarJobs from '@/features/job-seeker/components/jobs/job-detail/SimilarJobs.tsx';
import ReportJobModal from '@/features/job-seeker/components/reports/ReportJobModal';
import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';
import { useFavoriteJobs } from '@/features/job-seeker/api/useFavoriteJobs';

interface JobDetailViewProps {
  job: Job;
  similarJobs: Job[];
}

const workTypeLabels = {
  onsite: 'Onsite',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

const levelColors = {
  staff: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  manager: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  director: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
};

export default function JobDetailView({ job, similarJobs }: JobDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Use favorite jobs hook for save functionality
  const { isFavorite, toggleFavorite, isTogglingFavorite } = useFavoriteJobs();
  const isSaved = isFavorite(job.id, job.isFavorite);

  // Safely extract location - handle both string and object types
  const locationString = typeof job.location === 'string'
    ? job.location
    : (job.location as any)?.address
      ? `${(job.location as any).address}, ${(job.location as any).district}, ${(job.location as any).city}`
      : 'Unknown Location';

  const formatSalary = (salary: number) => {
    return (salary / 1000000).toFixed(0);
  };

  const getSalaryString = (salary: Job['salary']) => {
    if (typeof salary === 'object' && salary !== null) {
      return `${formatSalary(salary.min)}M - ${formatSalary(salary.max)}M`;
    }
    return salary;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = async () => {
    await toggleFavorite(job.id);
  };

  console.log("[JobDetailView] Rendering job:", job.id, "Recruiter:", job.recruiterId, job.recruiterName);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 mt-28 rounded-2xl p-4">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Link to="/jobs">
          <button
            className={
              'flex flex-row justify-around items-center gap-2 mb-6 px-0 text-orange-600 hover:underline'
            }
          >
            <X size={18} />
            <span>Back</span>
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SimilarJobs similarJobs={similarJobs} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <JobDetailHeader job={job} />

            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              {/* Job Categories */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {job.industry}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${levelColors[job.level]}`}
                  >
                    {job.level}
                  </span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {workTypeLabels[job.workType]}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h3>
                <p className="text-gray-700 leading-relaxed text-base">{job.description}</p>
              </div>

              {/* Requirements */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Candidate Requirements</h3>
                <ul className="space-y-3 text-gray-700 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                    <span>Minimum {job.experience} of experience in the field</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                    <span>Good communication and teamwork skills</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                    <span>Ability to solve problems quickly</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                    <span>Willingness to learn and develop new skills</span>
                  </li>
                </ul>
              </div>

              {/* Specific Salary */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Specific Salary</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {getSalaryString(job.salary)} VND/month
                  </p>
                  <p className="text-sm text-gray-600">
                    Further negotiation based on experience and ability
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Benefits</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Full social, health, and unemployment insurance</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>13th-month salary + annual performance bonus</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>Career development opportunities</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span>A professional working environment</span>
                  </li>
                </ul>
              </div>

              {/* Exact Location */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Exact Location</h3>
                <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
                  <p className="flex items-center gap-3 text-gray-800 font-semibold mb-2">
                    <MapPin size={20} className="text-orange-600 flex-shrink-0" />
                    {locationString}
                  </p>
                  <p className="text-base text-gray-600 pl-8">
                    123 ABC Street, XYZ Ward, District 1, HCMC
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Working Hours</h3>
                <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
                  <p className="flex items-center gap-3 text-gray-800 font-semibold mb-2">
                    <Clock size={20} className="text-orange-600 flex-shrink-0" />
                    {workTypeLabels[job.workType]}
                  </p>
                  <p className="text-base text-gray-700 pl-8">Monday - Friday: 8:00 AM - 5:30 PM</p>
                  <p className="text-base text-gray-700 pl-8">Saturday, Sunday: Off</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sticky bottom-6 bg-white border border-gray-200 rounded-lg p-4 shadow-lg mt-8">
              <Button
                onClick={handleToggleSave}
                disabled={isTogglingFavorite}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${isSaved
                  ? 'bg-red-100 text-red-600 border border-red-300 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
              >
                <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                {isTogglingFavorite ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
              </Button>
              <Button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'Copied' : 'Copy'}
              </Button>



              <Link
                to={`/chat?partnerId=${job.recruiterId}&partnerName=${encodeURIComponent(job.recruiterName || job.company)}&partnerRole=recruiter`}
                onClick={() => console.log("Navigating to chat with partnerId:", job.recruiterId)}
              >
                <Button className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition">
                  <MessageCircle size={20} />
                </Button>
              </Link>
              <Button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
              >
                <Flag size={20} />
              </Button>

              <Link to={`/job/${job.id}/apply`} className="flex-1">
                <Button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-xl text-lg disabled:opacity-50">
                  ✨ Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      <ReportJobModal
        jobId={job.id}
        jobTitle={job.title}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
