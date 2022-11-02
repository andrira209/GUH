import { PropsWithChildren } from "react";

export default function PageHeading({ children }: PropsWithChildren<{}>) {
  return (
    <h3 className="text-3xl my-4 font-bold dark:text-white">
      {children}
    </h3>
  );
}
