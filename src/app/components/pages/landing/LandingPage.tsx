import { useNavigate } from "react-router";
import { BookOpen, Layers, Building2, Droplets, Search, ArrowRight, Check } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Design Catalog",
    desc: "Save every design with multiple photos, design numbers, and full descriptions.",
  },
  {
    icon: Building2,
    title: "Company Directory",
    desc: "Keep all your clients and suppliers organized in one searchable place.",
  },
  {
    icon: Droplets,
    title: "Dye Reference",
    desc: "Track every dye name and number used across your entire design catalog.",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Find any design, company, or dye in seconds — no more paper notebooks.",
  },
];

const DEMO_CARDS = [
  {
    img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&auto=format&fit=crop",
    name: "Al Wasl Abaya",
    num: "DSN-001",
    dye: "Jet Black",
    count: 3,
  },
  {
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&auto=format&fit=crop",
    name: "Eid Kaftan",
    num: "DSN-003",
    dye: "Emirates Green",
    count: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop",
    name: "Desert Rose Thobe",
    num: "DSN-004",
    dye: "Pearl White",
    count: 4,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a3461" }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg tracking-tight">DesignBook</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: "#10b981" }}
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="pt-32 pb-24 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #1a3461 60%, #1e3d70 100%)" }}
      >
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              Built for Dubai's clothing & garment industry
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Your private design book
              <br />
              <span style={{ color: "#10b981" }}>for clothing shops</span>
              <br />
              and factories.
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-xl">
              Save every design, company, dye number, and reference image in one searchable workspace. Stop relying on paper notebooks and scattered WhatsApp photos.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#10b981" }}
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 font-medium px-6 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition-all"
              >
                Login
              </button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-7">
              {["No credit card required", "Private & secure", "Mobile-ready"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-white/50 text-xs">
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* App preview */}
          <div className="mt-16 relative">
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3 max-w-3xl mx-auto shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                <div className="flex-1 mx-3 bg-white/10 rounded h-5 flex items-center px-2">
                  <span className="text-white/40 text-[10px]">app.designbook.ae/designs</span>
                </div>
              </div>
              {/* Mock app content */}
              <div className="bg-[#f4f6f9] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Designs Gallery</h3>
                  <div className="bg-[#10b981] text-white text-xs px-3 py-1 rounded-lg font-medium">
                    + Add Design
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {DEMO_CARDS.map((card) => (
                    <div key={card.num} className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="aspect-[3/4] bg-gray-100">
                        <img
                          src={card.img}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-[8px] text-[#10b981] font-medium">{card.num}</p>
                        <p className="text-[9px] font-semibold text-gray-800 truncate">{card.name}</p>
                        <p className="text-[8px] text-gray-400">{card.dye}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { n: "500+", l: "Designs Organized" },
              { n: "50+", l: "Factories Using DesignBook" },
              { n: "1,000+", l: "Dye References Saved" },
            ].map(({ n, l }) => (
              <div key={l}>
                <p className="text-3xl font-bold" style={{ color: "#1a3461" }}>{n}</p>
                <p className="text-sm text-gray-500 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ backgroundColor: "#f4f6f9" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything your factory needs
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              A simple, focused tool for managing your design catalog — nothing more, nothing less.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#1a346115" }}>
                  <Icon className="w-5 h-5" style={{ color: "#1a3461" }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6" style={{ backgroundColor: "#10b981" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to organize your design catalog?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Start building your private design book today.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
            style={{ color: "#1a3461" }}
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ backgroundColor: "#0f2040" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#10b981" }}>
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-white/80 font-medium">DesignBook</span>
        </div>
        <p className="text-white/30 text-xs">
          © 2024 DesignBook. Built for Dubai's garment & fashion industry.
        </p>
      </footer>
    </div>
  );
}
