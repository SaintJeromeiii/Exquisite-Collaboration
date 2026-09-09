import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center px-8">
      <h1 className="font-cond text-4xl tracking-wide text-gold-2">Not on the board</h1>
      <p className="mt-2 max-w-md text-[13px] text-muted">
        That page is not here. Go back to the board.
      </p>
      <Link href="/" className="mt-4 text-[13px] text-gold no-underline">
        Board
      </Link>
    </div>
  );
}
