import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";
import { couponAddress, tokenAddress } from "../../data/addresses";
import {
  ErrorOutput,
  MakeTransactionGetResponse,
  MakeTransactionInputData,
  MakeTransactionOutputData
} from "../../types";
import calculatePrice from "../../utils/calculatePrice";

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: "Depositing DST",
    icon: "https://i.postimg.cc/MZhCwyjk/logo.png",
  });
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {
    const amount = calculatePrice(req.query);
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

    const shopPrivateKey = process.env.SHOP_PRIVATE_KEY as string;
    if (!shopPrivateKey) {
      res.status(400).json({ error: "Shop private key is not available" });
      return;
    }

    const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
    const buyerPublicKey = new PublicKey(account);
    const shopPublicKey = shopKeypair.publicKey;

    const connection = new Connection(
      clusterApiUrl(WalletAdapterNetwork.Devnet)
    );

    const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      shopKeypair,
      tokenAddress,
      buyerPublicKey
    );
    const shopTokenAddress = await getAssociatedTokenAddress(
      tokenAddress,
      shopPublicKey
    );
    const tokenMint = await getMint(connection, tokenAddress);
    const couponMint = await getMint(connection, couponAddress);
    const buyerCouponAddress = await getAssociatedTokenAddress(
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

    // Create the instruction to send WL token (DWLT) from the buyer to the shop
    const couponInstruction = createTransferCheckedInstruction(
      buyerCouponAddress,
      couponAddress,
      shopCouponAddress,
      buyerPublicKey,
      1 * (10 ** couponMint.decimals),
      6
    );

    couponInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    });

    // Create the instruction to send token (DST) from the shop to the buyer
    const tokenInstruction = createTransferCheckedInstruction(
      shopTokenAddress,
      tokenAddress,
      buyerTokenAccount.address,
      shopPublicKey,
      amount.multipliedBy(10 ** tokenMint.decimals).toNumber(),
      6
    );

    tokenInstruction.keys.push({
      pubkey: shopPublicKey,
      isSigner: true,
      isWritable: false,
    });

    // Instraction to send SOL from the buyer to the shop
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: shopPublicKey,
      toPubkey: buyerPublicKey,
      lamports: 1000000,
    });

    transferSolInstruction.keys.push({
      pubkey: buyerPublicKey,
      isSigner: true,
      isWritable: false,
    });

    // Add all instructions to the transaction
    transaction.add(
      tokenInstruction,
      couponInstruction,
      transferSolInstruction
    );

    transaction.partialSign(shopKeypair);
    const serializedTransaction = transaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    // Return the serialized transaction
    res.status(200).json({
      transaction: serializedTransaction,
      message: "Thanks for your purchase! 🥰",
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
