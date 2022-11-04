import { PublicKey } from "@solana/web3.js";

export function validSolanaAddress(address: string): boolean {
  try {
    const publicKey = new PublicKey(address);
    const isSolana = PublicKey.isOnCurve(publicKey.toBuffer());
    return isSolana;
  } catch (err) {
    return false;
  }
}
