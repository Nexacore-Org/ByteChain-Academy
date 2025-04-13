import Title from "@/components/atoms/Title";

export default function WhoItsFor() {
  return (
    <section className="flex flex-col justify-center items-center mb-5 ">
      <div className="bg-[#98E5FE] flex flex-col justify-center items-center space-y-7 pt-4 pb-8 rounded-[20px] shadow-lg  w-full">
        <Title className="rotate-[-15deg]">Who It&apos;s For</Title>
        <p className="md:px-16 text-xl pt-5">
          Are you a newcomer to Web3, a developer exploring blockchain
          integration, or a crypto enthusiast seeking deeper insights? ByteChain
          Academy is tailored for busy professionals, financial analysts needing
          historical currency data, and anyone who prefers learning in
          bite-sized, digestible chunks rather than lengthy courses.
        </p>
      </div>
    </section>
  );
}
