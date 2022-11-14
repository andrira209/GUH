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
          <meta
            property="og:url"
            content="https://funny-solana-pay.netlify.app"
            key="ogurl"
          />
          <meta property="og:title" content="Funny Solana Pay" key="ogtitle" />
          <meta
            property="og:site_name"
            content="Funny Solana Pay"
            key="ogsitename"
          />
          <meta
            property="og:description"
            content="Solana Pay decentralized application"
            key="ogdesc"
          />
          <meta
            property="og:image"
            content="https://funny-solana-pay.netlify.app/page.png"
            key="ogimage"
          />
          <meta property="og:type" content="article" key="ogtype" />
          <meta
            name="twitter:card"
            content="summary_large_image"
            key="twcard"
          />
          <meta name="twitter:site" content="Funny Solana Pay" key="twsite" />
          <meta
            property="tw:image"
            content="https://funny-solana-pay.netlify.app/page.png"
            key="twimage"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
