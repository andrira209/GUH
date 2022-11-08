import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { DarkThemeToggle, Navbar } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();
  return (
    <Navbar
      fluid={true}
      className="border-b border-gray-200 dark:border-gray-800"
    >
      <Navbar.Brand href="/">
        <Image
          src="/logo.png"
          className="mr-3"
          width={40}
          height={40}
          alt="App Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Solana Pay Demo
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2 gap-4">
        <DarkThemeToggle />
        <WalletMultiButton className="my-button" />
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link
          href="/"
          active={
            router.pathname === "/" ||
            router.pathname === "/checkout" ||
            router.pathname === "/confirmed"
          }
        >
          Home
        </Navbar.Link>
        <Navbar.Link
          href="/faucet"
          active={router.pathname.startsWith("/faucet")}
        >
          Faucet
        </Navbar.Link>
        <Navbar.Link href="/mint" active={router.pathname.startsWith("/mint")}>
          Mint
        </Navbar.Link>
        <Navbar.Link
          href="/donate"
          active={router.pathname.startsWith("/donate")}
        >
          Donate
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
