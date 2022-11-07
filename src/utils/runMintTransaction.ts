import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import base58 from "bs58";
import { tokenAddress } from "../data/addresses";
import { MyTransactionStatus } from "../types";
import {
  createMetaplexMintInstruction,
  createSetupInstructions,
} from "./mintUtils";

export const runMintTransaction = async (
  connection: Connection,
  wallet: WalletContextState,
  amount: BigNumber,
  reference: PublicKey
): Promise<MyTransactionStatus> => {
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

    const tokenMint = await getMint(connection, tokenAddress);
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

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    const transaction = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: shopPublicKey,
    });

    // Instruction to send the token from the buyer to the shop
    const transferInstruction = createTransferCheckedInstruction(
      buyerTokenAccount.address,
      tokenAddress,
      shopTokenAddress,
      buyerPublicKey,
      amount.multipliedBy(10 ** tokenMint.decimals).toNumber(),
      tokenMint.decimals
    );

    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });

    // Instruction to send SOL from the buyer to the shop
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      lamports: 1000000,
      toPubkey: shopPublicKey,
    });

    transferSolInstruction.keys.push({
      pubkey: buyerPublicKey,
      isSigner: true,
      isWritable: false,
    });

    const mint = Keypair.generate();

    // Create the mint setup instrauction
    const mintSetupInstructions = await createSetupInstructions(
      connection,
      shopPublicKey,
      buyerPublicKey,
      mint.publicKey
    );

    // Create the mint NFT instruction
    const mintNFTInstruction = await createMetaplexMintInstruction(
      shopPublicKey,
      buyerPublicKey,
      mint.publicKey
    );

    // Add all instructions to the transaction
    transaction.add(
      transferSolInstruction,
      ...mintSetupInstructions,
      mintNFTInstruction,
      transferInstruction
    );

    transaction.partialSign(mint, shopKeypair);

    await wallet.sendTransaction(transaction, connection, {
      preflightCommitment: "confirmed",
    });

    return {
      status: true,
      message: "Thanks for your mint! 🥰",
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      // @ts-ignore
      message: err.toString(),
    };
  }
};
