import * as anchor from "@project-serum/anchor";
import {
  createMintNftInstruction,
  MintNftInstructionAccounts,
  MintNftInstructionArgs,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  CANDY_MACHINE_OWNER,
  CANDY_MACHINE_PROGRAM_ID,
  MY_CANDY_MACHINE_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "../data/addresses";

interface CandyMachineState {
  authority: PublicKey;
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  treasury: PublicKey;
  tokenMint: null | PublicKey;
  isSoldOut: boolean;
  isActive: boolean;
  isPresale: boolean;
  isWhitelistOnly: boolean;
  goLiveDate: null | anchor.BN;
  price: anchor.BN;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: PublicKey;
  };
  endSettings: null | {
    number: anchor.BN;
    endSettingType: any;
  };
  whitelistMintSettings: null | {
    mode: any;
    mint: PublicKey;
    presale: boolean;
    discountPrice: null | anchor.BN;
  };
  hiddenSettings: null | {
    name: string;
    uri: string;
    hash: Uint8Array;
  };
  retainAuthority: boolean;
}

export interface CandyMachineAccount {
  id: PublicKey;
  program: anchor.Program;
  state: CandyMachineState;
}

const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};

const getMasterEdition = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};

const getAtaForMint = async (
  payer: PublicKey,
  mint: PublicKey
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [payer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );
};

const getCandyMachineCreator = async (
  candyMachine: PublicKey
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [Buffer.from("candy_machine"), candyMachine.toBuffer()],
    CANDY_MACHINE_PROGRAM_ID
  );
};

export const createSetupInstructions = async (
  connection: Connection,
  payer: PublicKey,
  mintFor: PublicKey,
  mint: PublicKey
): Promise<TransactionInstruction[]> => {
  const minimumBalance = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );
  const userTokenAccountAddress = (await getAtaForMint(mintFor, mint))[0];

  return [
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint,
      space: MintLayout.span,
      lamports: minimumBalance,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mint,
      0, // decimals
      mintFor, // mint authority
      mintFor // freeze authority
    ),
    createAssociatedTokenAccountInstruction(
      payer, // payer,
      userTokenAccountAddress, // associated token,
      mintFor, // owner,
      mint // mint
    ),
    createMintToInstruction(
      mint, // mint,
      userTokenAccountAddress, // destination,
      mintFor, // authority,
      1 // amount
    ),
  ];
};

export const createMetaplexMintInstruction = async (
  payer: PublicKey,
  mintFor: PublicKey,
  mint: PublicKey
): Promise<TransactionInstruction> => {
  const metadata = await getMetadata(mint);
  const masterEdition = await getMasterEdition(mint);
  const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
    MY_CANDY_MACHINE_ID
  );

  const accounts: MintNftInstructionAccounts = {
    candyMachine: MY_CANDY_MACHINE_ID,
    candyMachineCreator: candyMachineCreator,
    payer: payer,
    wallet: CANDY_MACHINE_OWNER,
    metadata: metadata,
    mint: mint,
    mintAuthority: mintFor,
    updateAuthority: mintFor,
    masterEdition: masterEdition,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    clock: SYSVAR_CLOCK_PUBKEY,
    recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
    instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
  };
  const args: MintNftInstructionArgs = { creatorBump };

  return createMintNftInstruction(accounts, args);
};
