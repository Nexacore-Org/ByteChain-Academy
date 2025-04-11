import Footer from "@/components/organisms/landing-page/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`md:w-[90%] max-w-[1440px] mx-auto overflow-x-hidden text-[#1A2C38]`}
    >
      {children}
      <div className="fade-in">
        <Footer />
      </div>
    </main>
  );
}
