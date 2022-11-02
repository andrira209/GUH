import PageHeading from "../components/PageHeading";
import Products from "../components/Products";

export default function Home() {
  return (
    <div className="relative flex flex-col items-stretch max-w-4xl gap-8 pt-24 m-auto">
      <PageHeading>Solana Pay Demo</PageHeading>
      <Products submitTarget="/checkout" enabled={true} />
    </div>
  );
}
