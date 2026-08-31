import { Link } from "react-router-dom";

export default function Footer({ app = false }) {
  const year = new Date().getFullYear();

  if (app)
    return (
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500 md:px-8">
        <span className="font-bold text-slate-800">
          Fix<span className="text-blue-600">Mate</span>
        </span>
        <span className="mx-2 text-slate-300">•</span>Streamlining service
        operations<span className="mx-2 text-slate-300">•</span>© {year}
      </footer>
    );

  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black tracking-tight text-white">
            Fix<span className="text-blue-400">Mate</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6">
            A simpler way to report, manage, and resolve workplace service
            requests.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Platform</p>
          <nav className="mt-3 space-y-2 text-sm">
            <Link className="block hover:text-white" to="/">
              Home
            </Link>
            <Link className="block hover:text-white" to="/register">
              Get started
            </Link>
            <Link className="block hover:text-white" to="/login">
              Sign in
            </Link>
          </nav>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Built for teams</p>
          <p className="mt-3 text-sm leading-6">
            Clear ownership, live updates, and accountable resolutions.
          </p>
        </div>
      </div>
    </footer>
  );
}
