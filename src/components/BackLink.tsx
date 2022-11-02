import Link from "next/link";
import { PropsWithChildren } from "react";
import { HiArrowLeft } from "react-icons/hi";

interface Props {
  href: string;
}

export default function BackLink({ children, href }: PropsWithChildren<Props>) {
  return (
    <Link href={href} className="flex items-center my-2 text-md dark:text-white">
      <HiArrowLeft />
      <span className="ml-2 hover:underline">{children}</span>
    </Link>
  );
}
