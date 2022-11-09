import { Button, Card, useTheme } from "flowbite-react";
import Image from "next/image";
import { useRef } from "react";
import NumberInput from "./NumberInput";

interface Props {
  submitTarget: string;
  enabled: boolean;
}

export default function Donate({ submitTarget, enabled }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { mode } = useTheme();

  return (
    <form method="get" action={submitTarget} ref={formRef}>
      <div className="flex flex-col gap-8">
        <Card className="w-80 rounded-xl bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 text-left">
          <p className="text-xl font-bold">Donate SOL</p>
          <p>Welcome to donate in Solana Pay</p>
          <div className="mt-4">
            <NumberInput name="SOL" formRef={formRef} />
          </div>
        </Card>
        <Button
          type="submit"
          disabled={!enabled}
          color="light"
          className="w-80 self-center"
        >
          <Image
            src={
              mode === "light"
                ? "/solana-pay-light.svg"
                : "/solana-pay-dark.svg"
            }
            width="86"
            height="32"
            alt="Solana Pay"
          />
        </Button>
      </div>
    </form>
  );
}
