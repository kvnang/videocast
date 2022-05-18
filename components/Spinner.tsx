export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <span className={`${className}`}>
      <svg
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="animate-spin"
      >
        <path
          d="M100 50c0-27.609-22.391-50-50-50S0 22.391 0 50h100ZM8.478 50C8.478 27.174 26.956 8.478 50 8.478c23.043 0 41.522 18.696 41.522 41.522"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
