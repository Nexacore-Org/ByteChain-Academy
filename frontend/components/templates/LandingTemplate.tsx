"use client";
import { useState, useEffect } from "react";
import CurrencyHub from "../organisms/landing-page/CurrencyHub";

import AboutAndOffers from "../organisms/landing-page/AboutandOffers";
import CoursesSection from "../organisms/landing-page/CoursesSection";
import LandingPageSkeleton from "../skeleton/LandingPageSkeleton";
import WhoItsFor from "../organisms/landing-page/WhoItsFor";


export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Set the duration of your loader
    return () => clearTimeout(timer); // Cleanup on component unmount
  }, []);

  return (
    <>
      {/* Conditionally render LandingPageSkeleton or content */}
      {isLoading ? (
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
