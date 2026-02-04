import { Link } from "react-router-dom";

const features = [
  {
    icon: "⚡",
    title: "AI-Powered Quotes",
    description: "Get instant, accurate estimates powered by advanced AI in seconds.",
  },
  {
    icon: "📋",
    title: "Detailed Line Items",
    description: "Auto-generated breakdown with materials, labor, and costs you can edit.",
  },
  {
    icon: "📄",
    title: "Professional PDFs",
    description: "Export beautiful proposals ready to share with clients.",
  },
];

const stats = [
  { value: "10K+", label: "Estimates Created" },
  { value: "₹50Cr+", label: "Projects Quoted" },
  { value: "4.9★", label: "User Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFF]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#EFF6FF_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#E0F2FE_0%,transparent_50%)]" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#60A5FA]/10 rounded-full blur-[120px]" />

        <main className="relative z-10 max-w-4xl w-full text-center">
          {/* glassmorphic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[#1D4ED8] text-sm font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]"></span>
            </span>
            Trusted by 10,000+ Contractors
          </div>

          {/* Logo/Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] shadow-2xl shadow-[#3B82F6]/25 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-5xl">💰</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-[#0F172A] tracking-tight mb-6 leading-[1.1]">
            Win More Jobs. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]">
              Accurate Estimates
            </span>
            <br /> in Minutes.
          </h1>

          <p className="text-xl md:text-2xl text-[#475569] mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Professional estimation software built for modern contractors. Eliminate paperwork and close deals faster.
          </p>

          <Link
            to="/estimate"
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white bg-[#3B82F6] hover:bg-[#1D4ED8] transition-all duration-300 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_50px_rgba(29,78,216,0.4)] hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Create Free Estimate
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>

          <p className="mt-6 text-[#6B7280] text-sm">
            No signup required • 100% Free
          </p>
        </main>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white border-y border-[#E2E8F0] relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <p className="text-4xl md:text-5xl font-black text-[#3B82F6] mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
              <p className="text-base font-semibold text-[#475569] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1F2937] mb-4">
            Why Contractors Love BidSnap
          </h2>
          <p className="text-center text-[#6B7280] mb-12 max-w-lg mx-auto">
            Stop guessing. Start winning. Our AI analyzes your project details and generates accurate estimates instantly.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-[2rem] bg-white border border-[#E2E8F0] hover:border-[#3B82F6] hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform duration-500 text-white shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#475569] text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#EFF6FF] to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#0F172A] mb-16">
            Everything You Need <br /> To Win The Project
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Enter Project Details", desc: "Choose project type, area, and quality materials." },
              { step: "02", title: "AI Magic Happens", desc: "Our engine computes labor, material, and buffer costs." },
              { step: "03", title: "Send & Close", desc: "Export a PDF and get it signed by your client." },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-8xl font-black text-[#3B82F6]/5 absolute -top-10 -left-4 select-none group-hover:text-[#3B82F6]/10 transition-colors duration-500">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{item.title}</h3>
                  <p className="text-[#475569] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ready to Take Your Business <br /> To the Next Level?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Stop wasting hours on manual spreadsheets. Join 10k+ contractors using BidSnap.
          </p>
          <Link
            to="/estimate"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-[#0F172A] bg-white hover:bg-[#EFF6FF] transition-all duration-300 shadow-xl"
          >
            Get Started Free
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#1F2937] text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">💰</span>
          <span className="text-white font-semibold text-lg">BidSnap</span>
        </div>
        <p className="text-gray-400 text-sm">
          © 2026 BidSnap. Built for contractors, by contractors.
        </p>
      </footer>
    </div>
  );
}
