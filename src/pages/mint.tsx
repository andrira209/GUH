import { useCallback, useEffect, useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import {
  AlertState,
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  createAccountsForMint,
  DEFAULT_TIMEOUT,
  getAtaForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  SetupState,
  toDate,
} from "../utils";
import {
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Commitment, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { CANDY_MACHINE_PROGRAM_ID, MY_CANDY_MACHINE_ID } from "../data/addresses";
import { Button, Card, Progress } from "flowbite-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import confetti from "canvas-confetti";
import Countdown from "react-countdown";
import Link from "next/link";
import MintButton from "../components/MintButton";
import { GatewayProvider } from "@civic/solana-gateway-react";

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
  const [priceLabel, setPriceLabel] = useState<string>("SOL");
  const [whitelistPrice, setWhitelistPrice] = useState(0);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [isBurnToken, setIsBurnToken] = useState(false);
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [isPresale, setIsPresale] = useState(false);
  const [isWLOnly, setIsWLOnly] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });
  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();

  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const rpcHost = connection.rpcEndpoint;
  const solFeesEstimation = 0.012; // approx of account creation fees
  const wallet = useWallet();

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
            setAlertState({
              open: true,
              message: `Couldn't fetch candy machine state from candy machine with address: ${candyMachineId.toBase58()}, using rpc: ${rpcHost}! You probably typed the REACT_APP_CANDY_MACHINE_ID value wrong in your .env file, or you are using the wrong RPC!`,
              severity: "error",
              hideDuration: null,
            });
          } else if (e.message.startsWith("failed to get info about account")) {
            setAlertState({
              open: true,
              message: `Couldn't fetch candy machine state with rpc: ${rpcHost}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
              severity: "error",
              hideDuration: null,
            });
          }
        } else {
          setAlertState({
            open: true,
            message: `${e}`,
            severity: "error",
            hideDuration: null,
          });
        }
        console.log(e);
      }
    },
    [anchorWallet, connection, isEnded, isPresale, rpcHost]
  );

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = []
  ) => {
    try {
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setIsMinting(true);
        let setupMint: SetupState | undefined;
        if (needTxnSplit && setupTxn === undefined) {
          setAlertState({
            open: true,
            message: "Please sign account setup transaction",
            severity: "info",
          });
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
            setAlertState({
              open: true,
              message:
                "Setup transaction succeeded! Please sign minting transaction",
              severity: "info",
            });
          } else {
            setAlertState({
              open: true,
              message: "Mint failed! Please try again!",
              severity: "error",
            });
            setIsMinting(false);
            return;
          }
        } else {
          setAlertState({
            open: true,
            message: "Please sign minting transaction",
            severity: "info",
          });
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
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });

          // update front-end amounts
          displaySuccess(mint.publicKey);
          refreshCandyMachineState("processed");
        } else if (status && !status.err) {
          setAlertState({
            open: true,
            message:
              "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.",
            severity: "error",
            hideDuration: 8000,
          });
          refreshCandyMachineState();
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
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

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
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

  function throwConfetti(): void {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  return (
    <div className="relative flex flex-col items-center gap-8">
      <Card>
        <h2>Funny Eye</h2>
        <Card imgSrc="/nft.gif" imgAlt="NFT To Mint" className="absolute">
          <p>
            {isActive && whitelistEnabled && whitelistTokenBalance > 0
              ? whitelistPrice + " " + priceLabel
              : price + " " + priceLabel}
          </p>
        </Card>
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
          <h3>
            TOTAL MINTED : {itemsRedeemed} / {itemsAvailable}
          </h3>
        )}
        {wallet && isActive && (
          <Progress
            size="sm"
            progress={100 - (itemsRemaining * 100) / itemsAvailable}
          />
        )}
        <div>
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
          ) : !wallet ? (
            <Button onClick={() => setVisible(true)}>Connect Wallet</Button>
          ) : !isWLOnly || whitelistTokenBalance > 0 ? (
            candyMachine?.state.gatekeeper &&
            wallet.publicKey &&
            wallet.signTransaction ? (
              <GatewayProvider
                wallet={{
                  publicKey:
                    wallet.publicKey || CANDY_MACHINE_PROGRAM_ID,
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
          <Link href={solanaExplorerLink} target="_blank" rel="noreferer">
            View on Solscan
          </Link>
        )}
      </Card>
    </div>
  );
}

const getCountdownDate = (
  candyMachine: CandyMachineAccount
): Date | undefined => {
  if (
    candyMachine.state.isActive &&
    candyMachine.state.endSettings?.endSettingType.date
  ) {
    return toDate(candyMachine.state.endSettings.number);
  }

  return toDate(
    candyMachine.state.goLiveDate
      ? candyMachine.state.goLiveDate
      : candyMachine.state.isPresale
      ? new anchor.BN(new Date().getTime() / 1000)
      : undefined
  );
};
