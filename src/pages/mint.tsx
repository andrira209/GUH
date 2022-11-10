import { GatewayProvider } from "@civic/solana-gateway-react";
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Commitment, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { Button, Card, Progress, useTheme } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Countdown from "react-countdown";
import { Id } from "react-toastify";
import MintButton from "../components/MintButton";
import {
  CANDY_MACHINE_PROGRAM_ID,
  MY_CANDY_MACHINE_ID,
} from "../data/addresses";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  createAccountsForMint,
  DEFAULT_TIMEOUT,
  getAtaForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  notifyLoading,
  notifyUpdate,
  SetupState,
  throwConfetti,
  toDate,
} from "../utils";

const decimals = 6;
const splTokenName = "DST";
const candyMachineId = MY_CANDY_MACHINE_ID;

export default function MintPage() {
  const [balance, setBalance] = useState<number>();
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
  const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
  const [itemsAvailable, setItemsAvailable] = useState<number>(0);
  const [itemsRedeemed, setItemsRedeemed] = useState<number>(0);
  const [itemsRemaining, setItemsRemaining] = useState<number>(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [payWithSplToken, setPayWithSplToken] = useState(false);
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState<string>("");
  const [whitelistPrice, setWhitelistPrice] = useState(0);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [isBurnToken, setIsBurnToken] = useState(false);
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [isPresale, setIsPresale] = useState(false);
  const [isWLOnly, setIsWLOnly] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();

  const { mode } = useTheme();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const rpcHost = connection.rpcEndpoint;
  const solFeesEstimation = 0.012; // approx of account creation fees
  const wallet = useWallet();

  let toastId: Id;

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(
    async (commitment: Commitment = "confirmed") => {
      if (!anchorWallet) return;

      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );

        setCandyMachine(cndy);
        setItemsAvailable(cndy.state.itemsAvailable);
        setItemsRemaining(cndy.state.itemsRemaining);
        setItemsRedeemed(cndy.state.itemsRedeemed);

        let divider = 1;
        if (decimals) {
          divider = +("1" + new Array(decimals).join("0").slice() + "0");
        }

        // detect if using spl-token to mint
        if (cndy.state.tokenMint) {
          setPayWithSplToken(true);
          // Customize your SPL-TOKEN Label HERE
          // TODO: get spl-token metadata name
          setPriceLabel(splTokenName);
          setPrice(cndy.state.price.toNumber() / divider);
          setWhitelistPrice(cndy.state.price.toNumber() / divider);
        } else {
          setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
          setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
        }

        // fetch whitelist token balance
        if (cndy.state.whitelistMintSettings) {
          setWhitelistEnabled(true);
          setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
          setIsPresale(cndy.state.whitelistMintSettings.presale);
          setIsWLOnly(
            !isPresale &&
              cndy.state.whitelistMintSettings.discountPrice === null
          );

          if (
            cndy.state.whitelistMintSettings.discountPrice !== null &&
            cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price
          ) {
            if (cndy.state.tokenMint) {
              setWhitelistPrice(
                cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                  divider
              );
            } else {
              setWhitelistPrice(
                cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                  LAMPORTS_PER_SOL
              );
            }
          }

          let balance = 0;
          try {
            const tokenBalance = await connection.getTokenAccountBalance(
              (
                await getAtaForMint(
                  cndy.state.whitelistMintSettings.mint,
                  anchorWallet.publicKey
                )
              )[0]
            );

            balance = tokenBalance?.value?.uiAmount || 0;
          } catch (e) {
            console.error(e);
            balance = 0;
          }
          if (commitment !== "processed") {
            setWhitelistTokenBalance(balance);
          }
          setIsActive(isPresale && !isEnded && balance > 0);
        } else {
          setWhitelistEnabled(false);
        }

        // end the mint when date is reached
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number));
          if (
            cndy.state.endSettings.number.toNumber() <
            new Date().getTime() / 1000
          ) {
            setIsEnded(true);
            setIsActive(false);
          }
        }
        // end the mint when amount is reached
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable
          );
          setItemsAvailable(limit);
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
            setIsEnded(true);
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        if (cndy.state.isSoldOut) {
          setIsActive(false);
        }

        const [collectionPDA] = await getCollectionPDA(candyMachineId);
        const collectionPDAAccount = await connection.getAccountInfo(
          collectionPDA
        );

        const txnEstimate =
          892 +
          (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
          (cndy.state.tokenMint ? 66 : 0) +
          (cndy.state.whitelistMintSettings ? 34 : 0) +
          (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
          (cndy.state.gatekeeper ? 33 : 0) +
          (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

        setNeedTxnSplit(txnEstimate > 1230);
      } catch (e) {
        if (e instanceof Error) {
          if (
            e.message === `Account does not exist ${candyMachineId.toBase58()}`
          ) {
            notifyUpdate(
              toastId,
              `Couldn't fetch candy machine state from candy machine with address: ${candyMachineId.toBase58()}, using rpc: ${rpcHost}! You probably typed the REACT_APP_CANDY_MACHINE_ID value wrong in your .env file, or you are using the wrong RPC!`,
              "error"
            );
          } else if (e.message.startsWith("failed to get info about account")) {
            notifyUpdate(
              toastId,
              `Couldn't fetch candy machine state with rpc: ${rpcHost}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
              "error"
            );
          }
        } else {
          notifyUpdate(toastId, `${e}`, "error");
        }
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [anchorWallet, connection, isEnded, isPresale, rpcHost]
  );

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = []
  ) => {
    toastId = notifyLoading("Transaction in progress. Please wait...", mode);
    try {
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setIsMinting(true);
        let setupMint: SetupState | undefined;
        if (needTxnSplit && setupTxn === undefined) {
          setupMint = await createAccountsForMint(
            candyMachine,
            wallet.publicKey
          );
          let status: any = { err: true };
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(
              setupMint.transaction,
              DEFAULT_TIMEOUT,
              connection,
              true
            );
          }
          if (status && !status.err) {
            setSetupTxn(setupMint);
          } else {
            notifyUpdate(toastId, "Mint failed! Please try again!", "error");
            setIsMinting(false);
            return;
          }
        }

        const setupState = setupMint ?? setupTxn;
        const mint = setupState?.mint ?? anchor.web3.Keypair.generate();
        const mintResult = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          mint,
          beforeTransactions,
          afterTransactions,
          setupState
        );

        let status: any = { err: true };
        let metadataStatus = null;
        if (mintResult) {
          status = await awaitTransactionSignatureConfirmation(
            mintResult.mintTxId,
            DEFAULT_TIMEOUT,
            connection,
            true
          );

          metadataStatus =
            await candyMachine.program.provider.connection.getAccountInfo(
              mintResult.metadataKey,
              "processed"
            );
          console.log("Metadata status: ", !!metadataStatus);
        }
        if (status && !status.err && metadataStatus) {
          notifyUpdate(toastId, "Congratulations! Mint succeeded!", "success");

          // update front-end amounts
          displaySuccess(mint.publicKey);
          refreshCandyMachineState("processed");
        } else if (status && !status.err) {
          notifyUpdate(
            toastId,
            "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.",
            "error"
          );
          refreshCandyMachineState();
        } else {
          notifyUpdate(toastId, "Mint failed! Please try again!", "error");
          refreshCandyMachineState();
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction timeout! Please try again.";
        } else if (error.message.indexOf("0x137")) {
          console.log(error);
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          console.log(error);
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      notifyUpdate(toastId, message, "error");
      // updates the candy machine state to reflect the latest
      // information on chain
      refreshCandyMachineState();
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [anchorWallet, connection, isEnded, isPresale, refreshCandyMachineState]);

  useEffect(() => {
    (async () => {
      if (anchorWallet) {
        const balance = await connection.getBalance(anchorWallet!.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [anchorWallet, connection]);

  const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
    return (
      <div>
        <Card>
          <h1>{days}</h1>Days
        </Card>
        <Card>
          <h1>{hours}</h1>
          Hours
        </Card>
        <Card>
          <h1>{minutes}</h1>Mins
        </Card>
        <Card>
          <h1>{seconds}</h1>Secs
        </Card>
      </div>
    );
  };

  const renderEndDateCounter = ({ days, hours, minutes }: any) => {
    let label = "";
    if (days > 0) {
      label += days + " days ";
    }
    if (hours > 0) {
      label += hours + " hours ";
    }
    label += minutes + 1 + " minutes left to MINT.";
    return (
      <div>
        <h3>{label}</h3>
      </div>
    );
  };

  function displaySuccess(mintPublicKey: any, qty: number = 1): void {
    let remaining = itemsRemaining - qty;
    setItemsRemaining(remaining);
    setIsSoldOut(remaining === 0);
    if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
      let balance = whitelistTokenBalance - qty;
      setWhitelistTokenBalance(balance);
      setIsActive(isPresale && !isEnded && balance > 0);
    }
    setSetupTxn(undefined);
    setItemsRedeemed(itemsRedeemed + qty);
    if (!payWithSplToken && balance && balance > 0) {
      setBalance(
        balance -
          (whitelistEnabled ? whitelistPrice : price) * qty -
          solFeesEstimation
      );
    }
    setSolanaExplorerLink(
      "https://solscan.io/token/" + mintPublicKey + "?cluster=devnet"
    );
    setIsMinting(false);
    throwConfetti();
  }

  return (
    <div className="relative flex flex-col items-center gap-8 mt-12 dark:text-white">
      <Card>
        <p className="text-2xl font-bold text-center">Funny Eye</p>
        <div className="flex gap-4">
          <span>Mint Price:</span>
          <span className="text-md font-semibold">
            {isActive && whitelistEnabled && whitelistTokenBalance > 0
              ? whitelistPrice + " " + priceLabel
              : price + " " + priceLabel}
          </span>
        </div>
        <Image
          src="/nft.gif"
          alt="NFT To Mint"
          width={400}
          height={400}
          className="rounded-lg border border-gray-200 shadow-md dark:border-gray-700"
          unoptimized={true}
        />
        {wallet &&
          isActive &&
          whitelistEnabled &&
          whitelistTokenBalance > 0 &&
          isBurnToken && (
            <h3>
              You own {whitelistTokenBalance} WL mint{" "}
              {whitelistTokenBalance > 1 ? "tokens" : "token"}.
            </h3>
          )}
        {wallet &&
          isActive &&
          whitelistEnabled &&
          whitelistTokenBalance > 0 &&
          !isBurnToken && <h3>You are whitelisted and allowed to mint.</h3>}
        {wallet && isActive && endDate && Date.now() < endDate.getTime() && (
          <Countdown
            date={toDate(candyMachine?.state?.endSettings?.number)}
            onMount={({ completed }) => completed && setIsEnded(true)}
            onComplete={() => {
              setIsEnded(true);
            }}
            renderer={renderEndDateCounter}
          />
        )}
        {wallet && isActive && (
          <p className="text-sm dark:text-white text-center">
            TOTAL MINTED : {itemsRedeemed} / {itemsAvailable}
          </p>
        )}
        {wallet && isActive && (
          <Progress
            size="sm"
            progress={100 - (itemsRemaining * 100) / itemsAvailable}
          />
        )}
        <div className="flex flex-col justify-center">
          {!isActive &&
          !isEnded &&
          candyMachine?.state.goLiveDate &&
          (!isWLOnly || whitelistTokenBalance > 0) ? (
            <Countdown
              date={toDate(candyMachine?.state.goLiveDate)}
              onMount={({ completed }) => completed && setIsActive(!isEnded)}
              onComplete={() => {
                setIsActive(!isEnded);
              }}
              renderer={renderGoLiveDateCounter}
            />
          ) : !wallet.connected ? (
            <Button onClick={() => setVisible(true)}>Connect Wallet</Button>
          ) : !isWLOnly || whitelistTokenBalance > 0 ? (
            candyMachine?.state.gatekeeper &&
            wallet.publicKey &&
            wallet.signTransaction ? (
              <GatewayProvider
                wallet={{
                  publicKey: wallet.publicKey || CANDY_MACHINE_PROGRAM_ID,
                  //@ts-ignore
                  signTransaction: wallet.signTransaction,
                }}
                gatekeeperNetwork={
                  candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                }
                clusterUrl={rpcHost}
                cluster={"devnet"}
                options={{ autoShowModal: false }}
              >
                <MintButton
                  candyMachine={candyMachine}
                  isMinting={isMinting}
                  isActive={isActive}
                  isEnded={isEnded}
                  isSoldOut={isSoldOut}
                  onMint={onMint}
                />
              </GatewayProvider>
            ) : (
              <MintButton
                candyMachine={candyMachine}
                isMinting={isMinting}
                isActive={isActive}
                isEnded={isEnded}
                isSoldOut={isSoldOut}
                onMint={onMint}
              />
            )
          ) : (
            <h1>Mint is private.</h1>
          )}
        </div>
        {wallet && isActive && solanaExplorerLink && (
          <Link
            href={solanaExplorerLink}
            target="_blank"
            rel="noreferer"
            className="text-green-500 text-center hover:underline"
          >
            View on Solscan
          </Link>
        )}
      </Card>
    </div>
  );
}
