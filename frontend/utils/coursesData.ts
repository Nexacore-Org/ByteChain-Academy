type coursesDataProps = {
  title: string;
  duration: string;
  description: string;
  imageAlt: string;
};

export const coursesData: coursesDataProps[] = [
  {
    title: "Blockchain Fundamentals",
    duration: "10mins",
    description:
      "Core Concepts Behind Distributed Ledger Technology, Consensus Mechanisms, And Cryptographic Principles.",
    imageAlt: "Professional in business attire smiling",
  },
  {
    title: "Web3 Security",
    duration: "8mins",
    description:
      "Identifying Common Vulnerabilities, Audit Practices, And Protecting Digital Assets From Exploits",
    imageAlt: "Professional in business attire smiling",
  },
  {
    title: "DeFi Essentials",
    duration: "5mins",
    description:
      "Understanding Decentralized Finance Protocols, Yield Farming, Liquidity Pools, And Financial Primitives",
    imageAlt: "Professional in business attire smiling",
  },
  {
    title: "NFTs And Digital Ownership",
    duration: "7mins",
    description:
      "Exploring Non-Fungible Tokens, Digital Scarcity, And Applications Beyond Digital Art",
    imageAlt: "Professional in business attire smiling",
  },
];
