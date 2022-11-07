import Image from "next/image";
import { useRouter } from "next/router";
import { nfts } from "../data/nfts";

export default function NFTs() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-8">
      {nfts.map((nft) => (
        <div key={nft.mint}>
          <div className="rounded-xl overflow-hidden border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <Image src={nft.image} width={290} height={290} alt={nft.name} />
            <div className="p-4">
              <p className="font-bold dark:text-white">{nft.name}</p>
              <p className="text-green-500">{nft.symbol}</p>
              <div className="flex items-center">
                <Image src="/logo.png" width={24} height={24} alt="DST" />
                <p className="ml-2 font-bold dark:text-white">{nft.price}</p>
                <button
                  type="button"
                  className="ml-auto px-4 py-1 rounded-md border border-gray-400 dark:border-gray-500 dark:text-white hover:text-green-500 dark:hover:text-green-500"
                  onClick={() => router.push(`/shop/checkout?DST=${nft.price}`)}
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
