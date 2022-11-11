import { Tooltip } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import Products from "../components/Products";
import SiteHeading from "../components/SiteHeading";

export default function Home() {
  return (
    <div className="relative flex flex-col items-stretch max-w-4xl gap-8 pt-24 m-auto">
      <SiteHeading>Crypto Cash Point</SiteHeading>
      <div className="flex items-center">
        <p className="text-md dark:text-white mr-2">{"DWLT -> DST"}</p>
        <Tooltip content="In the transaction requeest, user sends the WL token to the merchant and in return gets 0.0001 SOL and Store-specific token.">
          <HiInformationCircle className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" />
        </Tooltip>
      </div>
      <Products submitTarget="/checkout" enabled={true} />
    </div>
  );
}
