import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, RotateCcw, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(
    location.state?.email ||
      sessionStorage.getItem("fixmate_pending_verification_email") ||
      "",
  );
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const getExpiryTime = () => {
    let exp =
      location.state?.expiresAt ||
      sessionStorage.getItem("fixmate_pending_verification_expires_at");

    if (!exp) {
      exp = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      sessionStorage.setItem("fixmate_pending_verification_expires_at", exp);
    }
    return new Date(exp).getTime();
  };

  const [expiryTimestamp, setExpiryTimestamp] = useState(getExpiryTime);
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.floor((getExpiryTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor((expiryTimestamp - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const isExpired = timeLeft <= 0;

  const submit = async (event) => {
    event.preventDefault();
    if (isExpired) {
      return toast.error("Verification code has expired. Please request a new code.");
    }
    setLoading(true);
    try {
      const user = await verifyEmail({ email, code });
      sessionStorage.removeItem("fixmate_pending_verification_email");
      sessionStorage.removeItem("fixmate_pending_verification_expires_at");
      toast.success("Email verified");
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not verify the code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      const newExpiry =
        data.data?.expiresAt ||
        new Date(Date.now() + 10 * 60 * 1000).toISOString();
      sessionStorage.setItem(
        "fixmate_pending_verification_expires_at",
        new Date(newExpiry).toISOString(),
      );
      setExpiryTimestamp(new Date(newExpiry).getTime());
      setTimeLeft(10 * 60);
      setCode("");
      toast.success(data.message || "A new verification code was sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <div className="text-2xl font-black">
          Fix<span className="text-blue-600">Mate</span>
        </div>
        <h1 className="mt-7 text-3xl font-black">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the six-digit code sent to your FixMate company email.
        </p>

        <div className="mt-7 space-y-4">
          <div>
            <p className="label">Company email</p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700">
              {email}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label mb-0" htmlFor="verification-code">
                Verification code
              </label>

              {/* Timer indicator */}
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  isExpired
                    ? "text-rose-600"
                    : timeLeft <= 60
                      ? "animate-pulse text-amber-600"
                      : "text-slate-500"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {isExpired
                    ? "Expired"
                    : `${minutes}:${seconds}`}
                </span>
              </div>
            </div>

            <input
              id="verification-code"
              className={`input mt-1.5 text-center text-lg tracking-[0.4em] font-mono ${
                isExpired ? "border-rose-200 bg-rose-50/50" : ""
              }`}
              inputMode="numeric"
              maxLength="6"
              pattern="[0-9]{6}"
              required
              disabled={isExpired}
              placeholder="••••••"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
            />
          </div>

          {/* Expiry Alert banner */}
          {isExpired && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Code has expired</p>
                <p className="mt-0.5 text-rose-600">
                  Your 10-minute code expired. Click &quot;Resend code&quot; below
                  to receive a fresh verification code.
                </p>
              </div>
            </div>
          )}

          <button
            disabled={loading || isExpired}
            className="btn-primary w-full"
          >
            {loading
              ? "Verifying..."
              : isExpired
                ? "Code expired"
                : "Verify and join FixMate"}
          </button>

          <button
            type="button"
            disabled={resending || !email}
            onClick={resend}
            className={`w-full flex items-center justify-center gap-2 ${
              isExpired
                ? "btn bg-blue-600 text-white hover:bg-blue-700"
                : "btn-secondary"
            }`}
          >
            <RotateCcw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already verified?{" "}
          <Link className="font-semibold text-blue-600" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
