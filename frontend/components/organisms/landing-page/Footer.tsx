import Link from "next/link";
import {
  RiFacebookLine,
  RiInstagramLine,
  RiTwitterXLine,
} from "react-icons/ri";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#98E5FE] text-[#1A2C38] rounded-t-[40px] shadow-inner py-6 w-full">
      <div className="flex flex-col gap-8 md:flex-row justify-center items-center">
        <div className="text-sm text-gray-600">
          © 2025. All rights reserved. Nexacore Org.
        </div>
        <p className="h-7 md:block hidden w-0.5 bg-gray-600"></p>
        <div className="flex space-x-4 items-center">
          {/* instagram */}
          <Link href="#" className="text-gray-600 hover:text-gray-900">
            <RiInstagramLine className="text-2xl" />
          </Link>
          {/* twitter */}
          <Link href="#" className="text-gray-600 hover:text-gray-900">
            <RiTwitterXLine className="text-2xl" />
          </Link>
          {/* facebook */}
          <Link href="#" className="text-gray-600 hover:text-gray-900">
            <RiFacebookLine className="text-2xl" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
