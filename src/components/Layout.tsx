import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      <Header />
      <main className="flex flex-col h-full mb-auto overflow-hidden">
        {children}
        <Footer />
      </main>
    </div>
  );
}
