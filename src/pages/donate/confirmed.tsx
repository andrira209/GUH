import { useEffect } from "react";
import BackLink from "../../components/BackLink";
import PageHeading from "../../components/PageHeading";
import { throwConfetti } from "../../utils";

export default function ConfirmedPage() {
  useEffect(() => {
    throwConfetti();
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-8">
      <BackLink href="/donate">Next order</BackLink>
      <PageHeading>Thank you, hope to see you again!</PageHeading>
    </div>
  );
}
