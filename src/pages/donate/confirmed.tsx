import ReactConfetti from "react-confetti";
import BackLink from "../../components/BackLink";
import PageHeading from "../../components/PageHeading";

export default function ConfirmedPage() {
  return (
    <div className="relative flex flex-col items-center gap-8">
      <BackLink href="/donate">Next order</BackLink>
      <PageHeading>Thank you, hope to see you again!</PageHeading>
      <ReactConfetti />
    </div>
  );
}
