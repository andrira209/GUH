import { PropsWithChildren } from "react";

export default function SiteHeading({ children }: PropsWithChildren<{}>) {
  return (
    <h1 className="text-5xl my-4 font-bold self-center dark:text-white">
      {children}
    </h1>
  );
}
