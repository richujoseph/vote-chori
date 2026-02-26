import Link from "next/link";
import { Shield, Vote, BarChart3, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9ff] text-gray-900 px-4 md:px-6 font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3b368c]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a5b4fc]/10 rounded-full blur-[120px]" />

      <div className="max-w-4xl w-full text-center space-y-8 md:space-y-12 py-12 md:py-20 relative z-10">
        <div className="flex justify-center items-center mb-4 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#3b368c] rounded-[24px] flex items-center justify-center shadow-2xl shadow-[#3b368c]/30 transform hover:rotate-6 transition-transform duration-500">
            <Vote size={32} className="text-white md:w-10 md:h-10" />
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-[#1e1e2d] leading-[1.1]">
            iVOTE <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3b368c] to-[#6366f1]">System</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            Secure, transparent, and seamless online elections for the student community.
          </p>

          <div className="inline-flex px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm">
            <p className="text-[10px] md:text-xs font-black tracking-widest text-[#3b368c] uppercase">
              St. Joseph's College of Engineering and Technology, Palai
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-16 px-4">
          {[
            { icon: <Shield size={24} />, title: "Secure Voting", desc: "Domain-restricted authentication ensures only verified students can participate." },
            { icon: <Vote size={24} />, title: "Easy to Use", desc: "Cast your votes in minutes with an intuitive, clean interface accessible from any device." },
            { icon: <BarChart3 size={24} />, title: "Live Results", desc: "Track real-time election results with beautiful visualizations directly on your dashboard." }
          ].map((feature, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-lg p-6 md:p-8 rounded-[32px] border border-white/60 shadow-xl shadow-gray-200/40 hover:translate-y-[-4px] transition-all duration-300 text-left group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100/50 text-[#3b368c] group-hover:bg-[#3b368c] group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-black text-lg text-[#1e1e2d] mb-3 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-semibold opacity-80">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-8 md:pt-16">
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-3 bg-[#3b368c] text-white px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-[#3b368c]/30 hover:bg-[#2a266b] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="text-sm uppercase tracking-widest">Signup to Continue</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
