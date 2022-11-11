import { Tooltip } from "flowbite-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex w-full justify-center border-t border-gray-200 dark:border-gray-800 py-4 z-10">
      <Link
        href="https://github.com/curest0x1021/SolanaPay.git"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Tooltip content="View on GitHub">
          <FaGithub size={28} />
        </Tooltip>
      </Link>
      <span className="ml-4 text-gray-500 dark:text-gray-400">
        © 2022 Curest0x1021, GitHub.
      </span>
    </footer>
  );
}
