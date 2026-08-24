import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`);
    } catch (e) { toast.error(e.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-2xl font-black">Fix<span className="text-blue-400">Mate</span></div>
        <div className="max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-blue-400">Service operations</p>
          <h1 className="text-5xl font-black leading-tight">Keep every issue moving toward resolution.</h1>
          <p className="mt-6 text-slate-400">One workspace for employees, technicians and administrators.</p>
        </div>
        <p className="text-sm text-slate-500">Report. Assign. Resolve.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md">
          <p className="text-sm font-semibold text-blue-600">Welcome back</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Sign in to FixMate</h2>
          <p className="mt-2 text-sm text-slate-500">Access your service workspace.</p>
          <div className="mt-8 space-y-4">
            <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
            <div><label className="label">Password</label><input className="input" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
            <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign in"}</button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">Don't have an account? <Link className="font-semibold text-blue-600" to="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
