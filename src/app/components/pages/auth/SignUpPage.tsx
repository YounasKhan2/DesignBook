import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { BookOpen, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

type FormErrors = Partial<Record<"fullName" | "businessName" | "email" | "password" | "confirmPassword", string>>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function inputCls(hasError?: boolean) {
  return `w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#1a3461] focus:ring-[#1a3461]/10"
  }`;
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "Owner name is required.";
    if (!form.businessName.trim()) e.businessName = "Business name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const result = await signUp({
        ownerName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (result.needsEmailConfirmation) {
        toast.success("Account created. Please check your email to confirm your account.");
        navigate("/login");
      } else {
        toast.success("Account created! Welcome to DesignBook.");
        navigate("/app");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create your account. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: "linear-gradient(160deg, #0f2040 0%, #1a3461 100%)" }}
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#10b981" }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">DesignBook</span>
        </button>

        <div>
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Start organizing your designs today.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Join clothing shops and garment factories across Dubai who manage their entire design catalog in one private workspace.
          </p>
        </div>

        <div className="space-y-2">
          {["Save and search all your designs instantly", "Multiple photos per design", "Organize by company and dye"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-white/70 text-sm">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#10b981" }}>
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#f4f6f9]">
        <div className="w-full max-w-sm mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        <button onClick={() => navigate("/")} className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a3461" }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">DesignBook</span>
        </button>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">Set up your private design workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Mohammed Al Rashidi"
                className={inputCls(!!errors.fullName)}
              />
              <FieldError msg={errors.fullName} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={set("businessName")}
                placeholder="Al Barsha Textiles LLC"
                className={inputCls(!!errors.businessName)}
              />
              <FieldError msg={errors.businessName} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className={inputCls(!!errors.email)}
              />
              <FieldError msg={errors.email} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimum 8 characters"
                  className={`${inputCls(!!errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="••••••••"
                className={inputCls(!!errors.confirmPassword)}
              />
              <FieldError msg={errors.confirmPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#1a3461" }}
            >
              {loading ? "Creating account…" : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#1a3461] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
