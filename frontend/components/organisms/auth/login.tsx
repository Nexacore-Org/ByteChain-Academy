// "use client";
// import Image from "next/image";
// import { useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";

// export default function Login() {
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <div className="flex justify-center items-center min-h-screen text-black bg-white">
//       <div
//         className="flex flex-col items-center bg-white shadow-lg"
//         style={{
//           width: "754px",
//           height: "584px",
//           paddingTop: "12px",
//           paddingRight: "47px",
//           paddingBottom: "12px",
//           paddingLeft: "47px",
//           gap: "32px",
//         }}
//       >
//         <form className="space-y-4 w-full max-w-[400px]">
//           <Image
//             src="/icons/bytechain.svg"
//             alt="ByteChain Logo"
//             // className="w-28"
//             width={100}
//             height={100}
//           />

//           {/* Email Field */}
//           <div>
//             <label className="block text-base font-semibold text-black">
//               Email
//             </label>

//             <input
//               type="email"
//               className="p-3 w-full rounded-md border outline-none focus:ring focus:ring-blue-300 max-w-[300px] h-[60px]"
//             />
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-base font-semibold text-black">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="p-2 w-full rounded-md border outline-none focus:ring focus:ring-blue-300 max-w-[300px] h-[60px]"
//               />
//               <button
//                 type="button"
//                 className="flex absolute inset-y-0 right-3 items-center text-gray-500"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </button>
//             </div>
//           </div>

//           {/* Forgot Password Link */}
//           <div className="text-left">
//             <a href="#" className="text-sm text-red-500 hover:underline">
//               Forgot password?
//             </a>
//           </div>

//           {/* Login Button */}
//           <div className="flex justify-center">
//             <button className="text-white bg-blue-400 transition hover:bg-blue-500 w-[250px] h-[50px] rounded-[30px]">
//               Login
//             </button>
//           </div>

//           {/* Sign Up Link */}
//           <p className="text-sm text-center text-gray-600">
//             Don&apos;t have an account?{" "}
//             <a href="#" className="font-medium text-blue-500 hover:underline">
//               Sign Up
//             </a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

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
            <div className="flex justify-center md:justify-start relative md:-left-14">
              <Image
                src="/icons/bytechain.svg"
                width={270}
                height={90}
                className="w-[270px] md:w-[220px] h-[90px] md:h-[70px]"
                alt="bytechain logo"
              />
            </div>

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
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
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
