import NFTs from "../../components/NFTs";
import SiteHeading from "../../components/SiteHeading";

export default function ShopPage() {
  return (
    <div className="relative flex flex-col items-stretch w-full gap-8 p-24 m-auto">
      <SiteHeading>NFT Market</SiteHeading>
      <NFTs />
    </div>
  );
}
