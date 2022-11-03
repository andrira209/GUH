import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";
import { couponAddress } from "../../data/addresses";
import {
  ErrorOutput,
  MakeTransactionGetResponse,
  MakeTransactionInputData,
  MakeTransactionOutputData,
} from "../../types";
import { getConnection } from "../../utils";

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {
    const { account } = req.body as MakeTransactionInputData;
    if (!account) {
      res.status(400).json({ error: "No account provided" });
      return;
    }

    const shopPrivateKey = process.env.NEXT_PUBLIC_SHOP_PRIVATE_KEY as string;
    if (!shopPrivateKey) {
      res.status(400).json({ error: "Shop private key is not available" });
      return;
    }

    const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
    const shopPublicKey = shopKeypair.publicKey;
    const buyerPublicKey = new PublicKey(account);

    const connection = getConnection();
    const buyerCouponAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      shopKeypair,
      couponAddress,
      buyerPublicKey
    );
    const shopCouponAddress = await getAssociatedTokenAddress(
      couponAddress,
      shopPublicKey
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");

    const transaction = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: shopPublicKey,
    });

    const couponInstruction = createTransferCheckedInstruction(
      shopCouponAddress,
      couponAddress,
      buyerCouponAccount.address,
      shopPublicKey,
      2 * 10 ** 6,
      6
    );

    couponInstruction.keys.push({
      pubkey: buyerPublicKey,
      isSigner: true,
      isWritable: false,
    });

    transaction.add(couponInstruction);
    transaction.partialSign(shopKeypair);

    const serializedTransaction = transaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    res.status(200).json({
      transaction: serializedTransaction,
      message: "Successful airdrop!",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: "error creating transaction" });
    return;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput
  >
) {
  if (req.method === "post") {
    return post(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
