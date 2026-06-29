import type { RecruiterJobPosting } from "@/features/jobs/api/job.type";

export const filterJobs = (
  jobs: RecruiterJobPosting[],
  searchTerm: string,
  selectedFilter: string,
  approvalStatus: string,
): RecruiterJobPosting[] => {
  return jobs.filter((post) => {
    const isDeletedPost = post.isDeleted === true;
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || post.status === selectedFilter;
    const matchesApprovalStatus = post.approvalStatus === approvalStatus;

    return matchesSearch && matchesFilter && matchesApprovalStatus && !isDeletedPost;
  });
};
