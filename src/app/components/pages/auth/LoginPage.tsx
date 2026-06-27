import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { BookOpen, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Welcome back!");
      navigate("/app");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: "linear-gradient(160deg, #0f2040 0%, #1a3461 100%)" }}
      >
        {/* Logo — clickable back to home */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#10b981" }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">DesignBook</span>
        </button>

        <div>
          <blockquote className="text-white/70 text-lg leading-relaxed italic mb-4">
            "Every great collection starts with a well-organized design catalog."
          </blockquote>
          <p className="text-white/40 text-sm">— Dubai Fashion Week</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            "https://images.unsplash.com/photo-1585914924626-15adac1e6402?w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1619449557564-f64e49c41d6e?w=200&auto=format&fit=crop",
          ].map((src, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden opacity-60">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#f4f6f9]">
        {/* Back to home link */}
        <div className="w-full max-w-sm mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        {/* Mobile logo — clickable */}
        <button onClick={() => navigate("/")} className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a3461" }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">DesignBook</span>
        </button>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your design workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#10b981] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#1a3461" }}
            >
              {loading ? "Signing in…" : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#1a3461] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
