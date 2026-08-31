import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="card w-full max-w-lg p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <SearchX size={32} />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Error 404</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-500">The page you requested does not exist or may have moved.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" to="/"><Home size={17} />Go to home</Link>
          <button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={17} />Go back</button>
        </div>
      </section>
    </main>
  );
}
