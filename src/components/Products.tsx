import { Button, useTheme } from "flowbite-react";
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
            <div
              key={product.id}
              className="rounded-xl bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 text-left p-8"
            >
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p className="my-4">
                <span className="text-xl font-bold">${product.priceUSD}</span>
                {product.unitName && (
                  <span className="text-sm"> /{product.unitName}</span>
                )}
              </p>
              <div className="mt-4">
                <NumberInput name={product.id} formRef={formRef} />
              </div>
            </div>
          ))}
        </div>
        <Button disabled={!enabled} color="light">
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
