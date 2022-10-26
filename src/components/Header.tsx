import { DarkThemeToggle, Navbar } from "flowbite-react"
import Image from "next/image"

export default function Header() {
  return (
    <Navbar fluid={true} className="border-b border-gray-200 dark:border-gray-800">
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
      <div className="flex md:order-2">
        <DarkThemeToggle />
        <Navbar.Toggle />
      </div>
    </Navbar>
  )
}