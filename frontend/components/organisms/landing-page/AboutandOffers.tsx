
const AboutAndOffers = () => {
  return (
    <section className="py-3 md:py-10 px-3 md:px-16 bg-white text-gray-900">
      <div className="md:max-w-5xl mx-auto">
        {/* About Us Section */}
        <div className="text-left text-xl mb-16 flex flex-col items-center justify-center">
          <h2 className="text-white rounded-full rotate-[-15deg] my-4 bg-[#0066CC] px-6 py-4 w-fit">
            About Us
          </h2>
          <p className="my-4">
            <span className="font-bold">ByteChain Academy </span> bridges the
            gap between complex blockchain technology and busy professionals.
            Founded on the principle that everyone deserves access to quality
            Web3 education regardless of their schedule, we&apos;ve created a unique
            two-pronged approach to blockchain learning.
          </p>
          <p>
            Our microlearning platform breaks down complex Web3 concepts into
            digestible 5-10 minute lessons, allowing you to learn at your own
            pace without overwhelming commitments. Meanwhile, our decentralized
            currency knowledge hub provides comprehensive historical data on
            both traditional and digital currencies, offering context that
            transforms understanding into practical insight.
          </p>
          <button
            className="self-end mt-4 md:mr-20 px-6 py-3 text-[#7FBFD4] border border-[#98E5FE] font-semibold rounded-lg
              hover:bg-[#98E5FE] hover:text-white transition-all duration-300"
          >
            Learn More
          </button>
        </div>

        {/* What We Offer Section */}
        <div className="text-left text-xl mb-16 flex flex-col items-center justify-center">
          <h2 className="text-white rounded-full rotate-[15deg] my-4 bg-[#0066CC] px-6 py-4 w-fit">
            What We Offer
          </h2>

          <p className="my-4">
            <span className="font-bold">ByteChain Academy </span> delivers a
            streamlined approach to blockchain education through two
            complementary services:{" "}
          </p>
          <h3 className="font-bold self-start">Microlearning Platform </h3>
          <p>
            Concise, focused lessons on Web3 concepts delivered in just 5-10
            minutes. Each module includes straightforward explanations,
            interactive quizzes, and practical challenges designed to build your
            blockchain knowledge efficiently without demanding excessive time
            commitments.
          </p>
          <h3 className="font-bold self-start mt-4">
            Decentralized Currency Knowledge Hub{" "}
          </h3>
          <p>
            A comprehensive, searchable database of historical information on
            global currencies - both traditional and crypto. Access verified
            data on economic events, market trends, and blockchain metrics, all
            maintained through community-driven governance that ensures accuracy
            and relevance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutAndOffers;
