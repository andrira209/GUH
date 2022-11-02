import { Tooltip } from "flowbite-react";
import { useState } from "react";
import { FiCopy } from "react-icons/fi";

interface Props {
  copyText: string;
}

export default function ClipboardCopy({ copyText }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  // This is the function we wrote earlier
  async function copyTextToClipboard(text: string) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  const onCopy = () => {
    copyTextToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex items-center rounded-md border p-2 dark:text-white dark:border-gray-500 bg-gray-100 dark:bg-gray-700">
      <span className="w-11/12 truncate">{copyText}</span>
      <Tooltip content={isCopied ? "Copied!" : "Copy"}>
        <button onClick={onCopy} className="p-2 hover:text-blue-600">
          <FiCopy />
        </button>
      </Tooltip>
    </div>
  );
}
