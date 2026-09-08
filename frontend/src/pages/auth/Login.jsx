import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
            <div><label className="label" htmlFor="login-password">Password</label><div className="relative"><input id="login-password" className="input pr-12" type={showPassword ? "text" : "password"} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
            <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign in"}</button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">Don't have an account? <Link className="font-semibold text-blue-600" to="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
