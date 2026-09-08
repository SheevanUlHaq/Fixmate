import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await verifyEmail({ email, code });
      toast.success("Email verified");
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not verify the code");
    } finally { setLoading(false); }
  };

  const resend = async () => {
    setResending(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend the code");
    } finally { setResending(false); }
  };

  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><form onSubmit={submit} className="card w-full max-w-md p-8"><div className="text-2xl font-black">Fix<span className="text-blue-600">Mate</span></div><h1 className="mt-7 text-3xl font-black">Verify your email</h1><p className="mt-2 text-sm text-slate-500">Enter the six-digit code sent to your FixMate company email.</p><div className="mt-7 space-y-4"><div><label className="label" htmlFor="verify-email">Company email</label><input id="verify-email" className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></div><div><label className="label" htmlFor="verification-code">Verification code</label><input id="verification-code" className="input text-center text-lg tracking-[0.4em]" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}/></div><button disabled={loading} className="btn-primary w-full">{loading ? "Verifying..." : "Verify and join FixMate"}</button><button type="button" disabled={resending || !email} onClick={resend} className="btn-secondary w-full">{resending ? "Sending..." : "Resend code"}</button></div><p className="mt-6 text-center text-sm text-slate-500">Already verified? <Link className="font-semibold text-blue-600" to="/login">Sign in</Link></p></form></div>;
}
