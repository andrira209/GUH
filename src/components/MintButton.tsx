import { GatewayStatus, useGateway } from "@civic/solana-gateway-react";
import {
  findGatewayToken,
  getGatewayTokenAddressForOwnerAndGatekeeperNetwork,
  onGatewayTokenChange,
  removeAccountChangeListener,
} from "@identity.com/solana-gateway-ts";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Button, Spinner } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { CIVIC_GATEKEEPER_NETWORK } from "../data/addresses";
import { CandyMachineAccount } from "../utils";

interface Props {
  onMint: () => Promise<void>;
  candyMachine?: CandyMachineAccount;
  isMinting: boolean;
  setIsMinting: (val: boolean) => void;
  isActive: boolean;
}

export default function MintButton({
  onMint,
  candyMachine,
  isMinting,
  setIsMinting,
  isActive,
}: Props) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [verified, setVerified] = useState(false);
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [webSocketSubscriptionId, setWebSocketSubscriptionId] = useState(-1);
  const [clicked, setClicked] = useState(false);
  const [waitForActiveToken, setWaitForActiveToken] = useState(false);

  const getMintButtonContent = () => {
    if (candyMachine?.state.isSoldOut) {
      return "SOLD OUT";
    } else if (isMinting) {
      return <Spinner />;
    } else if (
      candyMachine?.state.isPresale ||
      candyMachine?.state.isWhitelistOnly
    ) {
      return "WHITELIST MINT";
    }
    return "MINT";
  };

  useEffect(() => {
    const mint = async () => {
      await removeAccountChangeListener(connection, webSocketSubscriptionId);
      await onMint();

      setClicked(false);
      setVerified(false);
    };

    if (verified && clicked) {
      mint();
    }
  }, [clicked, connection, onMint, verified, webSocketSubscriptionId]);

  const previousGatewayStatus = usePrevious(gatewayStatus);

  useEffect(() => {
    const fromStatus = [
      GatewayStatus.NOT_REQUESTED,
      GatewayStatus.REFRESH_TOKEN_REQUIRED,
    ];
    const invalidToState = [...fromStatus, GatewayStatus.UNKNOWN];
    if (
      fromStatus.find((state) => previousGatewayStatus === state) &&
      !invalidToState.find((state) => gatewayStatus === state)
    ) {
      setIsMinting(true);
    }
    console.log("change: ", GatewayStatus[gatewayStatus]);
  }, [gatewayStatus, previousGatewayStatus, setIsMinting]);

  useEffect(() => {
    if (waitForActiveToken && gatewayStatus === GatewayStatus.ACTIVE) {
      console.log("Minting after token active");
      setWaitForActiveToken(false);
      onMint();
    }
  }, [gatewayStatus, onMint, waitForActiveToken]);

  return (
    <Button
      disabled={isMinting || !isActive}
      onClick={async () => {
        if (candyMachine?.state.isActive && candyMachine?.state.gatekeeper) {
          const network =
            candyMachine.state.gatekeeper.gatekeeperNetwork.toBase58();
          if (network === CIVIC_GATEKEEPER_NETWORK) {
            if (gatewayStatus == GatewayStatus.ACTIVE) {
              await onMint();
            } else {
              setWaitForActiveToken(true);
              await requestGatewayToken();
              console.log("after: ", gatewayStatus);
            }
          } else if (
            network === "ttib7tuX8PTWPqFsmUFQTj78MbRhUmqxidJRDv4hRRE" ||
            network === "tibePmPaoTgrs929rWpu755EXaxC7M3SthVCf6GzjZt"
          ) {
            setClicked(true);
            const gatewayToken = await findGatewayToken(
              connection,
              wallet.publicKey!,
              candyMachine.state.gatekeeper.gatekeeperNetwork
            );

            if (gatewayToken?.isValid()) {
              await onMint();
            } else {
              window.open(
                `https://verify.encore.fans/?gkNetwork=${network}`,
                "_blank"
              );

              const gatewayTokenAddress =
                await getGatewayTokenAddressForOwnerAndGatekeeperNetwork(
                  wallet.publicKey!,
                  candyMachine.state.gatekeeper.gatekeeperNetwork
                );

              setWebSocketSubscriptionId(
                onGatewayTokenChange(
                  connection,
                  candyMachine.state.gatekeeper.gatekeeperNetwork,
                  () => setVerified(true),
                  "confirmed"
                )
              );
            }
          } else {
            setClicked(false);
            throw new Error(`Unknown Gatekeeper Network: ${network}`);
          }
        } else {
          await onMint();
          setClicked(false);
        }
      }}
    >
      {getMintButtonContent()}
    </Button>
  );
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
