"use client";

import Image from "next/image";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Formik, Form } from "formik";
import { loginValidationSchema } from "@/utils/validationSchema";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/molecules/InputLabel";
import Link from "next/link";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Login submitted:", values);
    alert("Login successful!");
  };

  return (
    <div className="w-full min-h-screen max-w-md mx-auto py-11 space-y-5 px-4 transition-opacity duration-500">
      <div className="flex justify-center md:justify-start relative md:-left-14">
        <Image
          src="/icons/bytechain.svg"
          width={270}
          height={90}
          className="w-[270px] md:w-[220px] h-[90px] md:h-[70px]"
          alt="bytechain logo"
        />
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => (
          <Form className="space-y-6">
            {/* Email Field */}
            <InputWithLabel
              label="Email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              type="email"
            />

            {/* Password Field */}
            <div className="relative">
              <InputWithLabel
                label="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                type={showPassword ? "text" : "password"}
                className="!mb-0"
              />
              <div className="absolute right-3 top-4 h-full flex items-center justify-center pointer-events-none">
                <button
                  type="button"
                  className="pointer-events-auto"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEye className="text-xl" />
                  ) : (
                    <FaEyeSlash className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-left -mt-3">
              <Link href="#" className="text-sm text-red-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <div className="flex justify-center w-[85%] mx-auto">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-2xl w-full py-7 rounded-[20px] bg-[#00D4FF] text-[#004755] hover:bg-[#00D4FF]/50"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </div>

            {/* Sign Up Link */}
            <p className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-blue-500 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
