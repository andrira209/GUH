/* eslint-disable @next/next/no-img-element */
import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      <Header />
      <main className="flex flex-col mb-auto overflow-auto pb-8">
        <img
          src="/wave.svg"
          alt="background"
          className="absolute w-full bottom-0 z-0"
        />
        {children}
      </main>
      <Footer />
    </div>
  );
}
