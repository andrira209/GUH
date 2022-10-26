import type { AppProps } from "next/app";
import Head from "next/head";
import AppContext from "../contexts";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppContext>
      <>
        <Head>
          <title>Solana Pay Demo</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <Component {...pageProps} />
      </>
    </AppContext>
  );
}
