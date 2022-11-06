import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ErrorOutput,
  MakeTransactionGetResponse,
  MakeTransactionInputData,
  MakeTransactionOutputData
} from "../../types";
import { calculateSolPrice, getConnection } from "../../utils";

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: "Donating SOL",
    icon: "https://i.postimg.cc/MZhCwyjk/logo.png",
  });
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {
    const amount = calculateSolPrice(req.query);
    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "Can't checkout with charge of 0" });
      return;
    }

    const { reference } = req.query;
    if (!reference) {
      res.status(400).json({ error: "No reference provided" });
      return;
    }

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
    const buyerPublicKey = new PublicKey(account);
    const shopPublicKey = shopKeypair.publicKey;

    const connection = getConnection();

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    const transaction = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: buyerPublicKey,
    });

    // Instraction to send SOL from the buyer to the shop
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: shopPublicKey,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
    });

    transferSolInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    });

    // Add all instructions to the transaction
    transaction.add(transferSolInstruction);

    const serializedTransaction = transaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    // Return the serialized transaction
    res.status(200).json({
      transaction: serializedTransaction,
      message: "Thanks for your donation! 🥰",
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
  if (req.method === "get") {
    return get(res);
  } else if (req.method === "post") {
    return post(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
