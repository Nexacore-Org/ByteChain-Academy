"use client";
import { Skeleton } from "../atoms/skeleton";

export default function LoginSkeleton() {
  return (
    <div className="w-full min-h-screen max-w-md mx-auto py-11 space-y-5 px-4">
      <div className="">
        <Skeleton className=" w-[150px] h-[60px] rounded-full" />
      </div>
      <div className="">
        <Skeleton className=" w-28 h-[25px] rounded-full mb-1 mt-5" />
        <Skeleton className=" w-full h-[40px] rounded-full mt-5 " />
        <Skeleton className=" w-28 h-[25px] rounded-full mb-1 mt-5" />
        <Skeleton className=" w-full h-[40px] rounded-full mt-5 " />
        <Skeleton className=" w-28 h-[25px] rounded-full mb-1 mt-5" />
        <Skeleton className=" w-[85%] h-[50px] rounded-full mb-1 mt-5 mx-auto" />
      </div>
      <div className="text-center mt-8">
        <Skeleton className=" w-[70%] h-[25px] rounded-full mx-auto" />
      </div>
    </div>
  );
}
