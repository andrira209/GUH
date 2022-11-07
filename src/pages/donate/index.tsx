import Donate from "../../components/Donate";
import SiteHeading from "../../components/SiteHeading";

export default function DonatePage() {
  return (
    <div className="relative flex flex-col items-stretch max-w-4xl gap-8 pt-24 m-auto">
      <SiteHeading>Donations</SiteHeading>
      <Donate submitTarget="/donate/checkout" enabled={true} />
    </div>
  );
}
