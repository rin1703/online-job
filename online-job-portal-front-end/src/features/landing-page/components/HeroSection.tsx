import heroImg from '@/assets/hero.png';
import heroImgMb from '@/assets/hero-mobile.png';
import jobSeekerImg from '@/assets/user.jpg';
import { Button } from '@/components/ui/Btn';
import { Plus, MailIcon, ArrowUpFromLine, Search, MapPin } from 'lucide-react';

function HeroSection() {
  const JobSeekerStats = () => {
    const jobSeekers = Array(4).fill(0);
    return (
      <div className="flex -space-x-1">
        {jobSeekers.map((_, index) => (
          <div key={index} className="w-5 h-5 rounded-full overflow-hidden">
            <img
              src={jobSeekerImg}
              alt={`Job Seeker ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="w-5 h-5 rounded-full bg-default flex content-center justify-center items-center">
          <Plus className="w-4 h-4 stroke-3 text-white"></Plus>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-section overflow-hidden">
      <div className="relative z-0 w-full 2xl:max-w-7xl  mx-0 2xl:mx-auto ">
        {/* ảnh hero */}
        <div className="w-full xl:w-3/5 flex items-center justify-center h-190">
          <img src={heroImg} alt="Hero" className="w-full h-full object-cover hidden xl:block " />
          <img
            src={heroImgMb}
            alt="Hero mobile and tablet"
            className="w-full h-full object-cover block xl:hidden "
          />
        </div>

        {/* content hero */}
        <div
          className="absolute z-50   w-full h-full xl:h-fit bottom-0 xl:top-58   flex gap-8         
                 justify-center  px-0 xl:px-20"
        >
          {/* left content */}
          <div className="hidden xl:grid grid-flow-row-dense grid-cols-2 gap-15 w-full">
            <div className="col-span-full bg-white/60 flex flex-col rounded-2xl p-4 justify-center items-center w-fit h-fit ">
              <div className="flex gap-2 font-default font-bold text-sm md:text-base xl:text-lg ">
                <p className="text-default">99k</p>
                <p>Job Seeker Get Job</p>
              </div>
              <JobSeekerStats />
            </div>
            <div className="col-span-full col-start-2 w-full h-fit font-bold font-default text-sm md:text-base xl:text-lg flex flex-col justify-end items-end ">
              <div className="text-nowrap w-fit h-fit  bg-white/20 border border-stroke shadow-xl flex flex-col rounded-2xl p-4 justify-end items-center ">
                <MailIcon className="w-6 h-6"></MailIcon>
                <p>You have got an email</p>
                <p className="text-default">Congrats</p>
              </div>
            </div>
            <div className="text-nowrap ml-10 col-span-full w-fit h-fit font-bold font-default text-sm md:text-base xl:text-lg bg-white/20 border border-stroke shadow-xl flex flex-col rounded-2xl p-4 justify-center items-center ">
              <ArrowUpFromLine className="w-6 h-6 text-default"></ArrowUpFromLine>
              <p>Upload your CV</p>
            </div>
          </div>
          {/* right content */}
          <div className="px-4 md:px-0 pb-5 flex w-full h-full xl:h-fit justify-end flex-col xl:bg-none bg-gradient-to-t from-black/50 from-20% to-white/5  gap-8 xl:gap-26 text-center xl:text-left items-center xl:items-start">
            {/* title and desc */}
            <div className="space-y-4 xl:space-y-8 font-default ">
              <p className="text-white xl:text-black text-4xl font-bold md:text-6xl">
                Find Your Dream Job
                <br />
                Hire the Perfect Fit
              </p>
              <p className="text-white/60 xl:text-text-blur font-medium text-base md:text-xl">
                Create a standout CV and explore thousands of opportunities that match your skills
                and passions.
              </p>
            </div>
            {/* seach bar */}
            <div className="flex justify-center xl:justify-start items-center w-full xl:w-fit h-fit ">
              <div className="bg-white text-text-blur border border-stroke p-5 rounded-l-2xl xl font-medium flex  w-50 gap-3 border-r-stroke pr-4">
                <Search></Search>
                <p>Search job</p>
              </div>
              <div className="bg-white w-50 xl:w-fit flex border border-stroke p-5 xl:p-3 rounded-r-2xl">
                <div className="text-text-blur font-medium w-full xl:w-50 flex gap-3 items-center">
                  <MapPin></MapPin>
                  <p>Location</p>
                </div>
                <Button variant="default" className="hidden xl:block">
                  Search
                </Button>
              </div>
            </div>
            <Button variant="default" className="block xl:hidden">
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
