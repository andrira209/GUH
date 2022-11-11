import { PropsWithChildren } from "react";

export default function SiteHeading({ children }: PropsWithChildren<{}>) {
  return (
    <p className="text-4xl mb-8 font-bold text-center text-gray-900 dark:text-gray-100">
      {children}
    </p>
  );
}
