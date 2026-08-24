import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"" });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must contain at least 6 characters");
    setLoading(true);
    try { const user = await register(form); navigate(`/${user.role}`); }
    catch (e) { toast.error(e.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <div className="text-2xl font-black">Fix<span className="text-blue-600">Mate</span></div>
        <h1 className="mt-7 text-3xl font-black">Create employee account</h1>
        <p className="mt-2 text-sm text-slate-500">Technician and admin accounts are provisioned by administrators.</p>
        <div className="mt-7 space-y-4">
          {[
            ["name","Full name","text"],["email","Email","email"],["phone","Phone","text"],["password","Password","password"]
          ].map(([key,label,type]) => <div key={key}><label className="label">{label}</label><input className="input" type={type} required={key!=="phone"} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></div>)}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Create account"}</button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-blue-600" to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
