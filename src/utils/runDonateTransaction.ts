import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import base58 from "bs58";
import { MyTransactionStatus } from "../types";

export async function runDonateTransaction(
  connection: Connection,
  wallet: WalletContextState,
  amount: BigNumber,
  reference: PublicKey
): Promise<MyTransactionStatus> {
  try {
    if (amount.toNumber() === 0) {
      return {
        status: false,
        message: "Can't checkout with charge of 0",
      };
    }

    if (!wallet.publicKey) {
      return {
        status: false,
        message: "No account provided",
      };
    }

    if (!reference) {
      return {
        status: false,
        message: "No reference provided",
      };
    }

    const shopPrivateKey = process.env.NEXT_PUBLIC_SHOP_PRIVATE_KEY as string;
    if (!shopPrivateKey) {
      return {
        status: false,
        message: "Shop private key is not available",
      };
    }

    const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
    const buyerPublicKey = wallet.publicKey;
    const shopPublicKey = shopKeypair.publicKey;

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
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });

    // Add all instructions to the transaction
    transaction.add(transferSolInstruction);

    await wallet.sendTransaction(transaction, connection, {
      preflightCommitment: "confirmed",
    });

    return {
      status: true,
      message: "Thanks for your donation! 🥰",
    };
  } catch (err) {
    console.error(err);

    return {
      status: false,
      // @ts-ignore
      message: err.toString(),
    };
  }
}
