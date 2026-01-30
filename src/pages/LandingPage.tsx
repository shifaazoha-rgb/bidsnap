import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-background)]">
      <main className="max-w-lg w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-2">
          BidSnap
        </h1>
        <p className="text-lg text-[var(--color-neutral)] mb-8">
          Instant AI estimates for contractors. Create professional quotes in minutes.
        </p>
        <Link
          to="/estimate"
          className="inline-block px-8 py-4 rounded-[var(--radius-md)] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-[var(--shadow-md)]"
        >
          Create Estimate
        </Link>
      </main>
    </div>
  );
}
