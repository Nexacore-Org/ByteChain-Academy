"use client";

import { useEffect } from "react";
import Signup from "../organisms/auth/signup";
import SignUpSkeleton from "../skeleton/SignUpSkeleton";
import { useLoadingStore } from "@/store/useLoadingStore";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

export default function SignUpTemplate() {
  const { loading, setLoading } = useLoadingStore();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  if (loading) {
    return <SignUpSkeleton />;
  }

  return <Signup />;
}
