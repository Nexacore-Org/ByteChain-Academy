import React from "react";
import { Skeleton } from "../atoms/skeleton";

const SignUpSkeleton = () => {
  return (
    <div className="w-full min-h-screen max-w-md mx-auto py-11 space-y-5 px-4">
      <div className="flex justify-center md:justify-start relative md:-left-14">
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
      </div>
      <div className="text-center mt-8">
        <Skeleton className="bg-[#94A3B8] w-full h-[25px] rounded-full" />
      </div>
    </div>
  );
};

export default SignUpSkeleton;
