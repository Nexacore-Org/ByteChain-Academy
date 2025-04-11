"use client";

import Signup from "@/components/organisms/auth/signup";
import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


export default function SignUpForm() {
 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

 

  if (isLoading) {
    return (
      <div className="w-full min-h-screen max-w-md mx-auto py-11 space-y-5 px-4">
        <div className="flex justify-center md:justify-start relative md:-left-14">
          <Skeleton width={270} height={90} />
        </div>
        <div className="space-y-6">
          <Skeleton height={30} />
          <Skeleton height={50} />
          <Skeleton height={30} />
          <Skeleton height={50} />
          <Skeleton height={30} />
          <Skeleton height={50} />
          <Skeleton height={30} />
          <Skeleton height={50} />
          <Skeleton height={60} className="rounded-[30px]" />
        </div>
        <div className="text-center mt-8">
          <Skeleton width={200} height={20} />
        </div>
      </div>
    );
  }

  return (
    <Signup />
  );
}
