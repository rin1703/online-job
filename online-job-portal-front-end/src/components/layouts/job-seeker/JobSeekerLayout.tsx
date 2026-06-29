import { Outlet } from "react-router";
// import JobSeekerTaskMenu from "@/components/layouts/job-seeker/JobSeekerTaskMenu.tsx";

export default function JobSeekerLayout() {
  return (
    <div className="flex min-h-screen flex-col ">
      <Outlet />
    </div>
  );
}
