import { signUpValidationSchema } from "@/utils/validationSchema";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { EyeOff, EyeIcon, Link } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const Signup = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form submitted:", values);
    alert("Sign up successful!");
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
        validationSchema={signUpValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="block text-lg font-bold">
                Full Name
              </label>
              <Field
                id="fullName"
                name="fullName"
                type="text"
                className={`w-full px-3 py-4 border ${
                  errors.fullName && touched.fullName
                    ? "border-red-500"
                    : "border-[#00D4FF]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50`}
                aria-invalid={
                  errors.fullName && touched.fullName ? "true" : "false"
                }
                aria-describedby={
                  errors.fullName && touched.fullName
                    ? "fullName-error"
                    : undefined
                }
              />
              <ErrorMessage name="fullName">
                {(msg) => (
                  <p
                    id="fullName-error"
                    className="text-red-500 text-sm mt-1"
                    aria-live="assertive"
                  >
                    {msg}
                  </p>
                )}
              </ErrorMessage>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-lg font-bold">
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                className={`w-full px-3 py-4 border ${
                  errors.email && touched.email
                    ? "border-red-500"
                    : "border-[#00D4FF]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50`}
                aria-invalid={errors.email && touched.email ? "true" : "false"}
                aria-describedby={
                  errors.email && touched.email ? "email-error" : undefined
                }
              />
              <ErrorMessage name="email">
                {(msg) => (
                  <p
                    id="email-error"
                    className="text-red-500 text-sm mt-1"
                    aria-live="assertive"
                  >
                    {msg}
                  </p>
                )}
              </ErrorMessage>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-lg font-bold">
                Password
              </label>
              <div className="relative">
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-3 py-4 border ${
                    errors.password && touched.password
                      ? "border-red-500"
                      : "border-[#00D4FF]"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50`}
                  aria-invalid={
                    errors.password && touched.password ? "true" : "false"
                  }
                  aria-describedby={
                    errors.password && touched.password
                      ? "password-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
              <ErrorMessage name="password">
                {(msg) => (
                  <p
                    id="password-error"
                    className="text-red-500 text-sm mt-1"
                    aria-live="assertive"
                  >
                    {msg}
                  </p>
                )}
              </ErrorMessage>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-lg font-bold"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-3 py-4 border ${
                    errors.confirmPassword && touched.confirmPassword
                      ? "border-red-500"
                      : "border-[#00D4FF]"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50`}
                  aria-invalid={
                    errors.confirmPassword && touched.confirmPassword
                      ? "true"
                      : "false"
                  }
                  aria-describedby={
                    errors.confirmPassword && touched.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
              <ErrorMessage name="confirmPassword">
                {(msg) => (
                  <p
                    id="confirmPassword-error"
                    className="text-red-500 text-sm mt-1"
                    aria-live="assertive"
                  >
                    {msg}
                  </p>
                )}
              </ErrorMessage>
            </div>

            {/* Submit Button */}
            <div className="px-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#00D4FF] text-2xl w-full font-normal text-[#004755] py-5 px-4 rounded-[30px] transition-colors 
                ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#00D4FF]/90"
                }`}
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Login Redirect */}
      <div className="text-center mt-8">
        <p className="text-gray-700">
          Already Have An Account?{" "}
          <Link href="/sign-in" className="text-[#0066CC] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
