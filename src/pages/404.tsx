import BackLink from "../components/BackLink";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center gap-8">
      <p className="text-xl font-bold dark:text-white mt-8">404 — Not Found</p>
      <BackLink href="/">Go back home</BackLink>
    </div>
  );
}
