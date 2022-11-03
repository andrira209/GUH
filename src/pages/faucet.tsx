import { useConnection } from "@solana/wallet-adapter-react";
import { Badge, Button, TextInput } from "flowbite-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import SiteHeading from "../components/SiteHeading";
import { runFaucetTransaction, validSolanaAddress } from "../utils";

type FormProps = {
  account: string;
};

export default function FaucetPage() {
  const [isValid, setIsValid] = useState(true);
  const { connection } = useConnection();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormProps>();
  const onSubmit = async (data: FormProps) => {
    const { account } = data;
    if (validSolanaAddress(account)) {
      const result = await runFaucetTransaction(connection, account);
      console.log(result);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="relative flex flex-col items-stretch max-w-5xl gap-8 pt-24 m-auto">
      <SiteHeading>DWLT Faucet</SiteHeading>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="my-2 text-xl dark:text-white">
          Airdrop 2 WL token(DWLT) to Solana Devnet
        </p>
        <TextInput
          {...register("account", {
            required: true,
            minLength: 44,
            maxLength: 44,
            pattern: /^[A-Za-z0-9]+$/i,
          })}
          placeholder="Enter Solana account address..."
          onChange={(e) => setIsValid(true)}
        />
        {(errors.account || !isValid) && (
          <Badge color="failure">Invalid address</Badge>
        )}
        <Button type="submit">Faucet</Button>
      </form>
    </div>
  );
}
