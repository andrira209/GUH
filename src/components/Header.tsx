import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { DarkThemeToggle, Navbar } from "flowbite-react";
import Image from "next/image";

export default function Header() {
  return (
    <Navbar
      fluid={true}
      className="border-b border-gray-200 dark:border-gray-800"
    >
      <Navbar.Brand href="https://flowbite.com/">
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
        <WalletMultiButton className="my-button"/>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/">Home</Navbar.Link>
        <Navbar.Link href="/faucet">Faucet</Navbar.Link>
        <Navbar.Link href="/shop">Shop</Navbar.Link>
        <Navbar.Link href="/donate">Donate</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
