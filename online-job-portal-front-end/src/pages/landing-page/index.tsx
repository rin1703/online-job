"use client";
import { useNavigate } from "react-router-dom";

import FeaturesSection from "@/features/landing-page/components/FeaturesSection";
import FeedbackSection from "@/features/landing-page/components/FeedbackSection";
import HeroSection from "@/features/landing-page/components/HeroSection";
import JobPicksSection from "@/features/landing-page/components/JobPicksSection";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLoadMore = () => {
    navigate("/jobs");
  };

  return (
    <>
      <HeroSection />
      <JobPicksSection onLoadMore={handleLoadMore} />
      <FeaturesSection />
      <FeedbackSection />
    </>
  );
}
