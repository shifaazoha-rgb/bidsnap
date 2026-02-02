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
    <div className="min-h-screen flex flex-col bg-[#FFF6FA]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF6FA] via-white to-[#FFF6FA]" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F8BBD0]/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#CDEAC0]/50 rounded-full blur-3xl" />
        
        <main className="relative z-10 max-w-3xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3FAF5] border border-[#EAD7E1] text-[#1F3B2C] text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[#7BC47F] rounded-full animate-pulse" />
            Smart Estimates for Smart Contractors
          </div>
          
          {/* Logo/Icon */}
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F8BBD0] to-[#F48FB1] shadow-lg shadow-[#F48FB1]/20">
            <span className="text-4xl">💰</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-4 tracking-tight">
            BidSnap
          </h1>
          <p className="text-xl md:text-2xl text-[#1F2937] mb-2 font-medium">
            Instant AI Estimates for Contractors
          </p>
          <p className="text-base md:text-lg text-[#6B7280] mb-10 max-w-lg mx-auto">
            Create professional quotes in minutes. Save time. Win more jobs. Maximize your profits.
          </p>
          
          <Link
            to="/estimate"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-[#4A1D2F] bg-[#F8BBD0] hover:bg-[#F48FB1] transition-all duration-300 shadow-xl shadow-[#F48FB1]/20 hover:shadow-2xl hover:shadow-[#F48FB1]/30 hover:scale-105"
          >
            Create Free Estimate
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
          
          <p className="mt-6 text-[#6B7280] text-sm">
            No signup required • 100% Free
          </p>
        </main>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white border-y border-[#EAD7E1]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#F48FB1]">{stat.value}</p>
              <p className="text-sm text-[#6B7280] mt-1">{stat.label}</p>
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
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white border border-[#EAD7E1] hover:border-[#F48FB1] hover:bg-[#FFF6FA] hover:shadow-lg hover:shadow-[#F48FB1]/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#CDEAC0] to-[#A7D7A0] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-[#A7D7A0]/30">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-[#F3FAF5]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1F2937] mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Enter Details", desc: "Fill in project type, area, and quality" },
              { step: "2", title: "AI Generates", desc: "Our AI creates a detailed quote instantly" },
              { step: "3", title: "Download & Win", desc: "Export PDF and send to your client" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#F8BBD0] text-[#4A1D2F] text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#F8BBD0]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A1D2F] mb-4">
            Ready to save hours on every estimate?
          </h2>
          <p className="text-[#4A1D2F]/80 mb-8">
            Join thousands of contractors who trust BidSnap for accurate quotes.
          </p>
          <Link
            to="/estimate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[#1F3B2C] bg-white hover:bg-[#F3FAF5] transition-all duration-300 shadow-lg hover:shadow-xl border border-[#EAD7E1]"
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
