# Funny Solana Pay

Funny Solana Pay is the test project for using Solana Pay easily on Solana devnet.
[Funny Solana Pay](https://funny-solana-pay.netlify.app)

## Getting Started

**Mint Spl-token:**

Please use [ming-fungible-spl-token](https://github.com/curest0x1021/mint-fungible-spl-token) to mint spl-token easily.

**Setup environment file:**

Create `.env` file from `.env.example`.
```bash
cp .env.example .env
```

Set your environment values in `.env` file
```
NEXT_PUBLIC_SHOP_PRIVATE_KEY=
NEXT_PUBLIC_DEVNET_NODE=
```

You can use Solana public rpc node such as `https://api.devnet.solana.com` or use your private rpc node.
Check out [RPC provides](https://docs.metaplex.com/resources/rpc-providers) for more details.

**Install dependencies:**

```bash
npm install
# or
yarn install
```

**Run the development server:**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Deploy on Netlify
The another way to deploy your Next.js app is to use the [Netlify Platform](https://www.netlify.com/with/nextjs/).

Check out [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/overview/) for more details.
