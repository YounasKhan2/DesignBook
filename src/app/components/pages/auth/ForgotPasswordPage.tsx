import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { BookOpen, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent to your email.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f6f9] px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm">
        {/* Back to Home */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        {/* Clickable logo */}
        <button onClick={() => navigate("/")} className="flex items-center justify-center gap-2 mb-8 mx-auto hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a3461" }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">DesignBook</span>
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#1a346115" }}>
                <Mail className="w-6 h-6" style={{ color: "#1a3461" }} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Reset your password</h1>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Enter the email you registered with and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#1a3461" }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#10b98115" }}>
                <Mail className="w-6 h-6" style={{ color: "#10b981" }} />
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: "#1a3461" }}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-5">
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
