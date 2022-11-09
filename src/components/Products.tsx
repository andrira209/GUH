import { Button, Card, useTheme } from "flowbite-react";
import Image from "next/image";
import { useRef } from "react";
import { products } from "../data/products";
import NumberInput from "./NumberInput";

interface Props {
  submitTarget: string;
  enabled: boolean;
}

export default function Products({ submitTarget, enabled }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { mode } = useTheme();

  return (
    <form method="get" action={submitTarget} ref={formRef}>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-0 justify-items-center gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="w-80 rounded-xl bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 text-left"
            >
              <p className="text-xl font-bold">{product.name}</p>
              <p>{product.description}</p>
              <p className="font-medium">${product.priceUSD}
                {product.unitName && (
                  <span> / {product.unitName}</span>
                )}
              </p>
              <div className="mt-4">
                <NumberInput name={product.id} formRef={formRef} />
              </div>
            </Card>
          ))}
        </div>
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
