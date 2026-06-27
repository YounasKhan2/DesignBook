import { useState } from "react";
import { User, Mail, Building2, Lock, Smartphone, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    ownerName: "Mohammed Al Rashidi",
    businessName: "Al Barsha Textiles LLC",
    email: "m.rashidi@albarsha.ae",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "pwa">("profile");

  const setP = (key: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((prev) => ({ ...prev, [key]: e.target.value }));

  const setPw = (key: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswords((prev) => ({ ...prev, [key]: e.target.value }));

  const saveProfile = async () => {
    if (!profile.ownerName.trim() || !profile.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingProfile(false);
    toast.success("Profile saved successfully.");
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSavingPass(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavingPass(false);
    setPasswords({ current: "", newPass: "", confirm: "" });
    toast.success("Password changed successfully.");
  };

  const TABS = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "password" as const, label: "Password", icon: Lock },
    { id: "pwa" as const, label: "Install App", icon: Smartphone },
  ];

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-7">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-7">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: "#1a3461" }}
            >
              {profile.ownerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile.ownerName}</p>
              <p className="text-sm text-gray-500">Owner</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <User className="w-3.5 h-3.5" />
                Owner Name
              </label>
              <input
                type="text"
                value={profile.ownerName}
                onChange={setP("ownerName")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Business Name
              </label>
              <input
                type="text"
                value={profile.businessName}
                onChange={setP("businessName")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={setP("email")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#1a3461" }}
            >
              {savingProfile ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Password tab */}
      {activeTab === "password" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Change Password</h2>
          <p className="text-sm text-gray-500 mb-6">Choose a strong password of at least 8 characters.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={passwords.current}
                  onChange={setPw("current")}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all pr-11"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={setPw("newPass")}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={setPw("confirm")}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>

            <button
              onClick={savePassword}
              disabled={savingPass}
              className="w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#1a3461" }}
            >
              {savingPass ? "Changing…" : "Change Password"}
            </button>
          </div>
        </div>
      )}

      {/* PWA tab */}
      {activeTab === "pwa" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1a346115" }}>
              <Smartphone className="w-6 h-6" style={{ color: "#1a3461" }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Install DesignBook</h2>
              <p className="text-sm text-gray-500">Add to your home screen</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-2">On iPhone / iPad (Safari)</p>
              <ol className="space-y-1.5 list-decimal list-inside text-gray-500">
                <li>Open DesignBook in Safari</li>
                <li>Tap the Share button at the bottom of the screen</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top-right corner</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-2">On Android (Chrome)</p>
              <ol className="space-y-1.5 list-decimal list-inside text-gray-500">
                <li>Open DesignBook in Chrome</li>
                <li>Tap the three-dot menu in the top-right</li>
                <li>Tap "Add to Home screen"</li>
                <li>Confirm by tapping "Add"</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-2">On Desktop (Chrome / Edge)</p>
              <ol className="space-y-1.5 list-decimal list-inside text-gray-500">
                <li>Look for the install icon in the address bar</li>
                <li>Click "Install DesignBook"</li>
                <li>The app will open in its own window</li>
              </ol>
            </div>

            <p className="text-xs text-gray-400 text-center pt-2">
              DesignBook works offline once installed on your device.
            </p>
          </div>
        </div>
      )}

      {/* App version */}
      <p className="text-center text-xs text-gray-400 mt-6">
        DesignBook v1.0 · Built for Dubai's garment industry
      </p>
    </div>
  );
}
