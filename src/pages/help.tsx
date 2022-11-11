import { Accordion, Card } from "flowbite-react";
import Link from "next/link";
import SiteHeading from "../components/SiteHeading";

export default function HelpPage() {
  return (
    <div className="relative w-1/2 pt-24 m-auto">
      <SiteHeading>How to use Funny Solana Pay</SiteHeading>
      <Card>
        <Accordion flush={true}>
          <Accordion.Panel>
            <Accordion.Title>How to airdrop WL token(DWLT)?</Accordion.Title>
            <Accordion.Content>
              <p className="text-gray-500 dark:text-gray-400">
                In{" "}
                <Link
                  href="/faucet"
                  className="text-blue-600 hover:underline dark:text-blue-500"
                >
                  Faucet
                </Link>{" "}
                page, users airdrop 2 WL token (DWLT) into their wallets.
              </p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>Our Crypto Cash Point</Accordion.Title>
            <Accordion.Content>
              <p className="text-gray-500 dark:text-gray-400">
                In{" "}
                <Link
                  href="/"
                  className="text-blue-600 hover:underline dark:text-blue-500"
                >
                  Home
                </Link>{" "}
                page, user sends the WL token to the merchant and in return
                gets:
              </p>
              <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">
                <li>
                  <p>
                    <span className="font-semibold">0.0001 SOL. </span>
                    To cover independent TX fees on the blockchain.
                    <br />
                    User might want to send some tokens to his friend or do some
                    in wallet swap.
                  </p>
                </li>
                <li>
                  <p>
                    <span className="font-semibold">Store token(DST). </span>
                    User can purchase goods in the store or mint NFT by using
                    this token.
                    <br />
                    This can be anything from a merchant specific token to
                    stablecoins.
                  </p>
                </li>
              </ul>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>
              How to donate into Funny Solana Pay?
            </Accordion.Title>
            <Accordion.Content>
              <p className="text-gray-500 dark:text-gray-400">
                In{" "}
                <Link
                  href="/donate"
                  className="text-blue-600 hover:underline dark:text-blue-500"
                >
                  Donate
                </Link>{" "}
                page, user can donate SOL into Funnay Solana Pay.
              </p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>How to mint NFT?</Accordion.Title>
            <Accordion.Content>
              <p className="text-gray-500 dark:text-gray-400">
                In{" "}
                <Link
                  href="/mint"
                  className="text-blue-600 hover:underline dark:text-blue-500"
                >
                  Mint
                </Link>{" "}
                page, user can mint NFT using Store token(DST).
              </p>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </Card>
    </div>
  );
}
