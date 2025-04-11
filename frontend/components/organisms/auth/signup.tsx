import { signUpValidationSchema } from "@/utils/validationSchema";
import { Formik, Form } from "formik";
import { EyeOff, EyeIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InputWithLabel } from "@/components/molecules/InputLabel";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          isSubmitting,
        }) => (
          <Form className="space-y-4">
            {/* full anme */}
            <InputWithLabel
              label="Full Name"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
              touched={touched.fullName}
            />

            {/* email */}
            <InputWithLabel
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />

            {/* Password */}
            <div className="relative">
              <InputWithLabel
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                className="!mt-0"
              />
              <button
                type="button"
                className="absolute right-3 top-2/4  text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeIcon size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <InputWithLabel
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                className="!mt-0"
              />
              <button
                type="button"
                className="absolute right-3 top-2/4"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <EyeIcon size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className="md:w-[85%] mx-auto">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-2xl w-full py-7 rounded-[20px] bg-[#00D4FF] text-[#004755] hover:bg-[#00D4FF]/50"
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="text-center mt-5">
        <p className="">
          Already Have An Account?{" "}
          <Link href="/sign-in" className="text-[#0066CC]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
