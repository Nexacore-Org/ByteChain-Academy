import { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="max-w-[1440px] overflow-x-hidden mx-auto text-[#1A2C38]">
      {children}
    </main>
  );
};

export default RootLayout;
