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
  isEnded: boolean;
  isActive: boolean;
  isSoldOut: boolean;
}

export default function MintButton({
  onMint,
  candyMachine,
  isMinting,
  isEnded,
  isActive,
  isSoldOut,
}: Props) {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [isVerifying, setIsVerifying] = useState(false);
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setIsVerifying(false);
    if (
      gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION &&
      clicked
    ) {
      // when user approves wallet verification txn
      setIsVerifying(true);
    } else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
      console.log("Verified human, now minting...");
      onMint();
      setClicked(false);
    }
  }, [clicked, gatewayStatus, onMint]);

  return (
    <Button
      disabled={
        clicked ||
        candyMachine?.state.isSoldOut ||
        isSoldOut ||
        isMinting ||
        isEnded ||
        !isActive ||
        isVerifying
      }
      onClick={async () => {
        if (
          isActive &&
          candyMachine?.state.gatekeeper &&
          gatewayStatus !== GatewayStatus.ACTIVE
        ) {
          console.log("Requesting gateway token");
          setClicked(true);
          await requestGatewayToken();
        } else {
          console.log("Minting...");
          await onMint();
        }
      }}
    >
      {!candyMachine ? (
        "CONNECTING..."
      ) : candyMachine?.state.isSoldOut || isSoldOut ? (
        "SOLD OUT"
      ) : isActive ? (
        isVerifying ? (
          "VERIFYING..."
        ) : isMinting || clicked ? (
          <Spinner />
        ) : (
          "MINT"
        )
      ) : isEnded ? (
        "ENDED"
      ) : candyMachine?.state.goLiveDate ? (
        "SOON"
      ) : (
        "UNAVAILABLE"
      )}
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
