import { Button, TextInput } from "flowbite-react";
import { KeyboardEvent, RefObject, useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";

interface Props {
  name: string;
  formRef: RefObject<HTMLFormElement>;
}

export default function NumberInput({ name, formRef }: Props) {
  const [number, setNumber] = useState(0);

  const increment = () => setNumber((n) => n + 1);

  const decrement = () => setNumber((n) => (n > 0 ? n - 1 : 0));

  const handleKeyboard = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
    } else if (e.key === "Enter") {
      e.preventDefault();
      formRef.current?.submit();
    }
  };

  return (
    <div className="w-36 border-2 rounded-md flex flex-row items-center">
      <Button
        tabIndex={-1}
        className="basis-1/3 focus:outline-none"
        color="light"
        onClick={decrement}
        onKeyDown={handleKeyboard}
      >
        <HiMinus />
      </Button>
      <TextInput
        type="number"
        name={name}
        value={number}
        min={0}
        className="w-12 border-none focus:ring-0 text-center"
        onChange={(e) => setNumber(Number(e.target.value))}
      />
      <Button
        tabIndex={-1}
        className="basis-1/3 focus:outline-none"
        color="light"
        onClick={increment}
        onKeyDown={handleKeyboard}
      >
        <HiPlus />
      </Button>
    </div>
  );
}
