import { ArrowRight, ShieldCheck, Wrench, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-black">Fix<span className="text-blue-600">Mate</span></div>
        <div className="flex gap-3"><Link className="btn-secondary" to="/login">Sign in</Link><Link className="btn-primary" to="/register">Get started</Link></div>
      </header>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 text-center">
        <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-700">Internal service operations</span>
        <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">Report. Assign. Resolve.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">FixMate turns everyday maintenance issues into clear, accountable workflows from the first report to final resolution.</p>
        <div className="mt-9 flex justify-center gap-3"><Link className="btn-primary px-6 py-3" to="/register">Create a request workspace <ArrowRight size={18}/></Link></div>
      </section>
      <section className="bg-slate-50 py-20"><div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-3">
        {[
          [Wrench,"Simple reporting","Employees can report issues with one image and clear context."],
          [Users,"Clear ownership","Admins assign work while technicians see only what they need."],
          [ShieldCheck,"Accountable resolution","Status history, comments, notifications and ratings keep everyone aligned."]
        ].map(([Icon,title,text]) => <div className="card p-7" key={title}><div className="mb-5 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon/></div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}
      </div></section>
      <Footer />
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">FixMate · Internal service request management</footer>
    </div>
  );
}
