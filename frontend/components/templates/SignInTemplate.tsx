"use client";
import { useEffect } from "react";
import Login from "../organisms/auth/login";
import LoginSkeleton from "../skeleton/LoginSkeleton";
import { useLoadingStore } from "@/store/useLoadingStore";


export default function SignInTemplate() {
 const {loading, setLoading} = useLoadingStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  if (loading) {
    return <LoginSkeleton />;
  }

  return (
    <Login/>
  );
  
}
