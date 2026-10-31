import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Boxes,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/seeker");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7ff] px-4 py-10">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-blue-900/10 lg:grid-cols-2">

        {/* Left Branding Section */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#101b35] via-[#172b50] to-[#244b83] p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-blue-400/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-950/30">
                <ShieldCheck size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  ShareSpace
                </h1>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-200">
                  RESOURCE SHARING PLATFORM
                </p>
              </div>
            </div>

            <div className="mt-24">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-4 py-2 text-xs font-medium text-blue-100">
                <Sparkles size={14} />
                Smarter Resource Management
              </div>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Make every institutional resource count.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-blue-100/80">
                Discover, share, and manage underutilized institutional
                equipment and spaces through one intelligent platform.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              {[
                "Discover available institutional resources",
                "Manage bookings and resource availability",
                "Get intelligent resource recommendations",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <CheckCircle2 size={15} />
                  </div>
                  <p className="text-sm text-blue-50/90">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-6">
            <Boxes size={20} className="text-blue-300" />
            <p className="text-xs text-blue-200/80">
              Share resources. Maximize institutional potential.
            </p>
          </div>
        </div>

        {/* Right Login Section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">

            {/* Mobile Brand */}
            <div className="mb-9 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <ShieldCheck size={29} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                ShareSpace
              </h1>

              <p className="mt-2 text-xs text-slate-500">
                AI-Powered Institutional Resource Sharing Platform
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                <Sparkles size={14} />
                Welcome to ShareSpace
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to your account and continue managing your institutional resources.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                  <Mail
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                  <Lock
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign In"}

                {!submitting && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 transition hover:text-indigo-700"
                >
                  Create account
                </Link>
              </p>
            </div>

            <p className="mt-8 text-center text-[11px] text-slate-400">
              Secure access to the ShareSpace platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;