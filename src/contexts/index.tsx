import { Flowbite } from "flowbite-react";
import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";

const SolanaProvider = dynamic(
  () => import("./SolanaContext").then(({ SolanaProvider }) => SolanaProvider),
  { ssr: false }
);

export default function AppContext({ children }: PropsWithChildren<{}>) {
  return (
    <Flowbite>
      <SolanaProvider>{children}</SolanaProvider>
    </Flowbite>
  );
}
