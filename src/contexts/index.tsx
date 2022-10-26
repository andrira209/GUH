import { PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeContext";

export default function AppContext({ children }: PropsWithChildren<{}>) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
