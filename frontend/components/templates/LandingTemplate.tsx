"use client";
import { useEffect } from "react";
import CurrencyHub from "../organisms/landing-page/CurrencyHub";
import AboutAndOffers from "../organisms/landing-page/AboutandOffers";
import CoursesSection from "../organisms/landing-page/CoursesSection";
import LandingPageSkeleton from "../skeleton/LandingPageSkeleton";
import WhoItsFor from "../organisms/landing-page/WhoItsFor";
import { useLoadingStore } from "@/store/useLoadingStore";

export default function LandingPage() {
  const { loading, setLoading } = useLoadingStore();

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Set the duration of your loader
    return () => clearTimeout(timer); // Cleanup on component unmount
  }, [setLoading]);

  return (
    <>
      {/* Conditionally render LandingPageSkeleton or content */}
      {loading ? (
        <LandingPageSkeleton />
      ) : (
        <main className='flex flex-col gap-4 md:gap-8 items-center"'>
          <div className="fade-in">
            <AboutAndOffers />
          </div>
          <div className="fade-in">
            <CoursesSection />
          </div>
          <div className="fade-in">
            <CurrencyHub />
          </div>
          <div className="fade-in">
            <WhoItsFor />
          </div>
        </main>
      )}
    </>
  );
}
