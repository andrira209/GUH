import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import Layout from "../components/Layout";
import AppContext from "../contexts";

import "@solana/wallet-adapter-react-ui/styles.css";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppContext>
      <Layout>
        <Head>
          <title>Solana Pay Demo</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <Component {...pageProps} />
        <ToastContainer />
      </Layout>
    </AppContext>
  );
}
