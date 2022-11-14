import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* <!-- HTML Meta Tags --> */}
          <meta name="description" content="Solana Pay decentralized application" />

          {/* <!-- Facebook Meta Tags --> */}
          <meta property="og:url" content="https://funny-solana-pay.netlify.app" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Funny Solana Pay" />
          <meta property="og:description" content="Solana Pay decentralized application" />
          <meta property="og:image" content="https://funny-solana-pay.netlify.app/page.png" />

          {/* <!-- Twitter Meta Tags --> */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="funny-solana-pay.netlify.app" />
          <meta property="twitter:url" content="https://funny-solana-pay.netlify.app" />
          <meta name="twitter:title" content="Funny Solana Pay" />
          <meta name="twitter:description" content="Solana Pay decentralized application" />
          <meta name="twitter:image" content="https://funny-solana-pay.netlify.app/page.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
