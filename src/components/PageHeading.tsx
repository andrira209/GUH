import { PropsWithChildren } from "react";

export default function PageHeading({ children }: PropsWithChildren<{}>) {
  return (
    <h1 className="text-4xl my-4 font-bold self-center dark:text-white">
      {children}
    </h1>
  );
}
