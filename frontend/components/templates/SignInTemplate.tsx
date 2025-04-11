"use client";
import { useState, useEffect } from "react";
import Login from "../organisms/auth/login";
import LoginSkeleton from "../skeleton/LoginSkeleton";


export default function SignInTemplate() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoginSkeleton />;
  }

  return (
    <Login/>
  );
  
}
