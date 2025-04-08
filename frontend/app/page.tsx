"use client"
import { useState, useEffect } from 'react';
import AboutAndOffers from '@/components/AboutandOffers/AboutandOffers';
import CurrencyHub from '@/components/CurrencyHub';
import Footer from '@/components/Footer';
import WhoItsFor from '@/components/WhoItsFor';
import CoursesSection from '@/components/CoursesSection';
import LandingPageSkeleton from '@/components/ui/LandingPageSkeleton';

export default function Home() {
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
          <div className="fade-in">
            <Footer />
          </div>
        </main>
      )}
    </>
  );
}
