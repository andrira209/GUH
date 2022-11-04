import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction
} from "@solana/web3.js";
import base58 from "bs58";
import { couponAddress } from "../data/addresses";
import { MyTransactionStatus } from "../types";

export async function runFaucetTransaction(
  connection: Connection,
  account: string
): Promise<MyTransactionStatus> {
  try {
    const shopPrivateKey = process.env.NEXT_PUBLIC_SHOP_PRIVATE_KEY as string;
    if (!shopPrivateKey) {
      return {
        status: false,
        message: "Shop private key is not available",
      };
    }

    const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
    const shopPublicKey = shopKeypair.publicKey;
    const buyerPublicKey = new PublicKey(account);

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
      isSigner: false,
      isWritable: false,
    });

    transaction.add(couponInstruction);

    await sendAndConfirmTransaction(connection, transaction, [shopKeypair], {
      commitment: "confirmed",
    });

    return {
      status: true,
      message: `Successful airdrop 2 DWLT to ${buyerPublicKey.toString()}`,
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
