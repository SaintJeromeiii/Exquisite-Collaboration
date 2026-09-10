export function ShoeMark({
  ticker,
  className = "h-8 w-11",
}: {
  ticker: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-gold/10 ${className}`}
      title={ticker}
      aria-hidden
    >
      <svg
        viewBox="0 0 96 64"
        className="h-[72%] w-[80%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 40c1.6-8.4 9-16.8 22.6-18.6 8.6-1.2 16.8.2 24.2 2.2 6.2 1.6 11.4 5.4 17.4 7.2 3.8 1.2 9.4 1.4 12.2 4.2 1.8 1.8.6 4-2.2 4.8L20.4 43.2C13.6 43.4 11.4 41.6 14 40z"
          fill="#c9a227"
        />
        <path
          d="M32 25.2c2.4 3.2 3.8 6.6 4 10.2M40 24.4c2 3.4 3.2 6.8 3.4 10.4M48 24.2c1.8 3.4 2.8 6.8 3 10.4"
          stroke="#0a0e14"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M22 34.2c3.2-1.6 7.6-2 12-1.4"
          stroke="#e6c35c"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M16 44.6c2.8 3.8 11.2 6.4 33.8 6.2 18.6-.2 29.4-1.6 37-4.2 2.6-1 2.4-3.2-.2-3.8L19.2 40.6c-4.2.2-5.8 1.8-3.2 4z"
          fill="#8a6e18"
        />
      </svg>
    </span>
  );
}
