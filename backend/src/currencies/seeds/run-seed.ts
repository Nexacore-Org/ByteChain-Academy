import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CurrencyEntry, CurrencyType, HistoricalPrice } from '../entities/currency-entry.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [CurrencyEntry],
  synchronize: true,
});

const CURRENCIES: Partial<CurrencyEntry>[] = [
  {
    name: 'Bitcoin', symbol: 'BTC', type: CurrencyType.CRYPTO, launchYear: 2009,
    description: 'Bitcoin is the world\'s first decentralized cryptocurrency, introduced in 2009 by the pseudonymous Satoshi Nakamoto through a whitepaper titled "Bitcoin: A Peer-to-Peer Electronic Cash System." It operates on a public blockchain ledger secured by a proof-of-work consensus mechanism, where miners compete to validate transactions and earn newly minted BTC as rewards. With a hard-capped supply of 21 million coins, Bitcoin is often referred to as "digital gold" due to its scarcity and store-of-value properties. It has inspired thousands of subsequent cryptocurrencies and fundamentally changed how the world thinks about money, trust, and financial sovereignty.',
  },
  {
    name: 'Ethereum', symbol: 'ETH', type: CurrencyType.CRYPTO, launchYear: 2015,
    description: 'Ethereum is a decentralized, open-source blockchain platform launched in 2015 by Vitalik Buterin and a team of co-founders. It introduced programmable smart contracts, enabling developers to build decentralized applications (dApps) without relying on intermediaries. Ether (ETH) is the native currency used to pay for computation on the network, commonly referred to as "gas." In 2022, Ethereum transitioned from proof-of-work to proof-of-stake via "The Merge," dramatically reducing its energy consumption. Ethereum hosts the majority of DeFi protocols, NFT marketplaces, and Layer-2 scaling solutions, making it the backbone of the modern decentralized web ecosystem.',
  },
  {
    name: 'Stellar', symbol: 'XLM', type: CurrencyType.CRYPTO, launchYear: 2014,
    description: 'Stellar is an open-source, decentralized payment protocol founded in 2014 by Jed McCaleb and Joyce Kim. It is designed to facilitate fast, low-cost cross-border transactions and currency exchanges between any pair of currencies, including both fiat and digital assets. The Stellar Consensus Protocol (SCP) enables quick transaction finality without the energy costs of proof-of-work mining. Stellar\'s native token, Lumens (XLM), is used to pay transaction fees and maintain accounts on the network. The Stellar Development Foundation (SDF) actively partners with financial institutions and NGOs to promote financial inclusion in underserved regions around the world.',
  },
  {
    name: 'BNB', symbol: 'BNB', type: CurrencyType.CRYPTO, launchYear: 2017,
    description: 'BNB, originally launched as Binance Coin in 2017 during Binance\'s ICO, has evolved far beyond a simple exchange utility token. It powers the BNB Chain ecosystem, which includes BNB Smart Chain (BSC), a high-throughput blockchain compatible with the Ethereum Virtual Machine. BNB is used to pay trading fees on Binance at a discount, participate in token sales on Binance Launchpad, and fuel transactions on BNB Chain. Binance periodically burns BNB tokens to reduce the total supply, creating deflationary pressure. With a vibrant DeFi ecosystem and millions of active users, BNB has become one of the most widely used utility tokens in the crypto industry.',
  },
  {
    name: 'Solana', symbol: 'SOL', type: CurrencyType.CRYPTO, launchYear: 2020,
    description: 'Solana is a high-performance blockchain platform founded by Anatoly Yakovenko and launched in 2020. It combines proof-of-stake with a novel proof-of-history mechanism, allowing the network to process thousands of transactions per second with sub-second finality and extremely low fees. SOL is the native token used for transaction fees, staking, and governance. Solana has attracted a large ecosystem of DeFi protocols, NFT projects, and Web3 gaming applications. Despite facing network outages in its early years, Solana has continued to grow and is widely regarded as one of the most technically ambitious blockchains, competing directly with Ethereum for developer mindshare and user activity.',
  },
  {
    name: 'Cardano', symbol: 'ADA', type: CurrencyType.CRYPTO, launchYear: 2017,
    description: 'Cardano is a third-generation proof-of-stake blockchain platform founded by Charles Hoskinson, one of Ethereum\'s co-founders, and developed by IOHK. Launched in 2017, Cardano distinguishes itself through a research-driven, peer-reviewed development approach. Its Ouroboros consensus protocol is one of the first provably secure proof-of-stake algorithms. ADA, the native token, is used for transactions, staking, and governance. Cardano\'s roadmap is divided into named eras—Byron, Shelley, Goguen, Basho, and Voltaire—each introducing new capabilities such as smart contracts and decentralized governance. The platform aims to provide financial services to the unbanked population, particularly in Africa and developing nations.',
  },
  {
    name: 'USD Coin', symbol: 'USDC', type: CurrencyType.CRYPTO, launchYear: 2018,
    description: 'USD Coin (USDC) is a fully-reserved stablecoin launched in 2018 by Circle and Coinbase through the Centre Consortium. Each USDC token is backed 1:1 by US dollars or short-duration US Treasury instruments held in regulated financial institutions, with monthly attestations published by major accounting firms. USDC runs on multiple blockchains including Ethereum, Solana, Avalanche, and others, making it one of the most interoperable stablecoins available. It is widely used in DeFi protocols, cross-border payments, and as a safe haven during crypto market volatility. USDC has become a critical piece of infrastructure for the digital dollar economy and institutional crypto adoption.',
  },
  {
    name: 'Dogecoin', symbol: 'DOGE', type: CurrencyType.CRYPTO, launchYear: 2013,
    description: 'Dogecoin was created in December 2013 by software engineers Billy Markus and Jackson Palmer as a lighthearted parody of the cryptocurrency craze, featuring the popular Shiba Inu "Doge" meme as its mascot. Despite its humorous origins, Dogecoin developed a passionate and generous community known for charitable fundraising and tipping content creators online. It uses a Scrypt-based proof-of-work algorithm with no hard supply cap, producing 10,000 new coins per minute. Dogecoin gained mainstream attention in 2021 following endorsements from Elon Musk and a surge of retail investor interest. It remains one of the most recognized and traded cryptocurrencies in the world.',
  },
  {
    name: 'Litecoin', symbol: 'LTC', type: CurrencyType.CRYPTO, launchYear: 2011,
    description: 'Litecoin was created in October 2011 by former Google engineer Charlie Lee as a "lite version of Bitcoin." It shares much of Bitcoin\'s codebase but offers faster block generation times of 2.5 minutes compared to Bitcoin\'s 10 minutes, and uses the Scrypt hashing algorithm instead of SHA-256. With a maximum supply of 84 million coins, Litecoin was designed to handle a higher volume of transactions. It was one of the first cryptocurrencies to implement Segregated Witness (SegWit) and the Lightning Network. Often described as the silver to Bitcoin\'s gold, Litecoin has maintained a strong presence in the crypto market and is widely accepted by merchants and exchanges worldwide.',
  },
  {
    name: 'XRP', symbol: 'XRP', type: CurrencyType.CRYPTO, launchYear: 2012,
    description: 'XRP is the native digital asset of the XRP Ledger, an open-source blockchain created by Ripple Labs in 2012. Unlike most cryptocurrencies, XRP does not rely on mining; instead, it uses a consensus protocol involving a network of trusted validators to confirm transactions in 3–5 seconds with negligible fees. XRP is primarily designed to serve as a bridge currency for international money transfers, enabling financial institutions to settle cross-border payments faster and cheaper than traditional SWIFT transfers. Ripple has partnered with hundreds of banks and payment providers globally. Despite a prolonged legal battle with the US SEC, XRP has maintained significant market capitalization and global utility.',
  },
  {
    name: 'US Dollar', symbol: 'USD', type: CurrencyType.FIAT, launchYear: 1792,
    description: 'The United States Dollar (USD) is the official currency of the United States of America and the world\'s primary reserve currency. Established by the Coinage Act of 1792, it has undergone significant evolution, including the abandonment of the gold standard in 1971 under President Nixon. The Federal Reserve, established in 1913, manages monetary policy and controls the money supply. The USD is used in the majority of global trade transactions, commodity pricing (including oil and gold), and foreign exchange reserves held by central banks worldwide. Its dominance in international finance gives the United States significant geopolitical influence, a phenomenon economists refer to as the "exorbitant privilege."',
  },
  {
    name: 'Euro', symbol: 'EUR', type: CurrencyType.FIAT, launchYear: 1999,
    description: 'The Euro (EUR) is the official currency of the Eurozone, comprising 20 of the 27 European Union member states. Introduced as an accounting currency in 1999 and as physical banknotes and coins in 2002, the Euro replaced numerous national currencies including the Deutsche Mark, French Franc, and Italian Lira. It is managed by the European Central Bank (ECB) based in Frankfurt, Germany. The Euro is the second most traded currency in the foreign exchange market and the second largest reserve currency globally. It symbolizes European economic integration and facilitates seamless trade and travel across member states, though it has also faced challenges during sovereign debt crises.',
  },
  {
    name: 'British Pound Sterling', symbol: 'GBP', type: CurrencyType.FIAT, launchYear: 800,
    description: 'The British Pound Sterling (GBP) is the official currency of the United Kingdom and its territories, and is the oldest currency in continuous use in the world, with origins dating back to Anglo-Saxon England around 800 AD. It is managed by the Bank of England, one of the world\'s oldest central banks, founded in 1694. The pound is the fourth most traded currency in the global foreign exchange market. Following Brexit in 2020, the UK retained the pound rather than adopting the Euro. GBP is widely used as a reserve currency and is a key component of the IMF\'s Special Drawing Rights (SDR) basket, reflecting the UK\'s continued importance in global finance.',
  },
  {
    name: 'Nigerian Naira', symbol: 'NGN', type: CurrencyType.FIAT, launchYear: 1973,
    description: 'The Nigerian Naira (NGN) is the official currency of the Federal Republic of Nigeria, Africa\'s largest economy by GDP. It was introduced on January 1, 1973, replacing the Nigerian pound at a rate of 2 naira to 1 pound. The Central Bank of Nigeria (CBN) is responsible for issuing and regulating the naira. Nigeria\'s economy is heavily dependent on oil exports, making the naira sensitive to global oil price fluctuations. The currency has experienced significant depreciation over the decades due to inflation, foreign exchange shortages, and economic pressures. Despite challenges, Nigeria\'s large population and growing fintech sector make the naira a currency of increasing regional and continental significance.',
  },
  {
    name: 'Japanese Yen', symbol: 'JPY', type: CurrencyType.FIAT, launchYear: 1871,
    description: 'The Japanese Yen (JPY) is the official currency of Japan and the third most traded currency in the global foreign exchange market, after the US Dollar and Euro. Established by the Meiji government in 1871 as part of Japan\'s modernization efforts, the yen replaced a complex system of feudal currencies. It is managed by the Bank of Japan, which has maintained ultra-low or negative interest rate policies for decades to combat deflation and stimulate economic growth. The yen is considered a "safe haven" currency, often appreciating during global financial uncertainty as investors seek stability. Japan\'s export-driven economy means the yen\'s exchange rate has significant implications for major corporations like Toyota and Sony.',
  },
];

const PRICE_RANGES: Record<string, [number, number]> = {
  BTC: [40000, 70000], ETH: [2000, 4000], XLM: [0.08, 0.25], BNB: [250, 650],
  SOL: [20, 200], ADA: [0.25, 1.2], USDC: [0.99, 1.01], DOGE: [0.05, 0.2],
  LTC: [55, 110], XRP: [0.35, 0.75], USD: [1, 1], EUR: [1.05, 1.15],
  GBP: [1.2, 1.4], NGN: [0.00065, 0.0013], JPY: [0.0063, 0.0075],
};

function generateHistoricalData(min: number, max: number): HistoricalPrice[] {
  const data: HistoricalPrice[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const price = parseFloat((Math.random() * (max - min) + min).toFixed(6));
    data.push({ date: date.toISOString().split('T')[0], price, marketCap: Math.round(price * 1_000_000), circulatingSupply: 1_000_000 });
  }
  return data;
}

async function seedCurrencies(dataSource: DataSource) {
  const repo = dataSource.getRepository(CurrencyEntry);
  let created = 0;
  for (const data of CURRENCIES) {
    const exists = await repo.findOne({ where: { symbol: data.symbol } });
    if (exists) continue;
    const [min, max] = PRICE_RANGES[data.symbol!] ?? [1, 1];
    await repo.save(repo.create({ ...data, historicalData: generateHistoricalData(min, max) }));
    created++;
  }
  console.log(created > 0 ? `Seeded ${created} currencies.` : 'Already seeded. Nothing to do.');
}

AppDataSource.initialize()
  .then(async (ds) => {
    await seedCurrencies(ds);
    await ds.destroy();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
