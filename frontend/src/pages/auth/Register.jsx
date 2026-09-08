import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const companyDomain =
    import.meta.env.VITE_COMPANY_EMAIL_DOMAIN || "fixmate.com";

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must contain at least 6 characters");
    setLoading(true);
    try {
      const { email, expiresAt } = await register(form);
      sessionStorage.setItem("fixmate_pending_verification_email", email);
      if (expiresAt) {
        sessionStorage.setItem(
          "fixmate_pending_verification_expires_at",
          new Date(expiresAt).toISOString(),
        );
      }
      navigate("/verify-email", { state: { email, expiresAt } });
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <div className="text-2xl font-black">
          Fix<span className="text-blue-600">Mate</span>
        </div>
        <h1 className="mt-7 text-3xl font-black">Create employee account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use your @{companyDomain} company email. Technician and admin accounts
          are provisioned by administrators.
        </p>
        <div className="mt-7 space-y-4">
          {[
            ["name", "Full name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "text"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                required={key !== "phone"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="label" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                className="input pr-12"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-600" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
