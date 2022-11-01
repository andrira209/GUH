import Link from "next/link";
import { PropsWithChildren } from "react";
import { HiArrowLeft } from "react-icons/hi";

interface Props {
  href: string;
}

export default function BackLink({ children, href }: PropsWithChildren<Props>) {
  return (
    <Link href={href} className="text-md dark:text-white">
      <HiArrowLeft />
      <span className="hover:underline">{children}</span>
    </Link>
  );
}
