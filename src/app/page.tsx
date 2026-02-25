import Link from "next/link";
import { Shield, Vote, BarChart3, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-6 font-sans">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center items-center mb-8">
          <div className="w-16 h-16 bg-[#3b368c] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3b368c]/20">
            <Vote size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#1e1e2d]">
          iVOTE <span className="text-[#3b368c]">System</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          Secure, transparent, and seamless online elections for the student community.
        </p>

        <p className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
          St. Joseph's College of Engineering and Technology, Palai
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-100 text-left">
          <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-[#3b368c]">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#1e1e2d] mb-2">Secure Voting</h3>
            <p className="text-gray-500 text-sm">
              Domain-restricted authentication ensures only verified students can participate in the election process.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-[#3b368c]">
              <Vote size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#1e1e2d] mb-2">Easy to Use</h3>
            <p className="text-gray-500 text-sm">
              Cast your votes in minutes with an intuitive, clean interface accessible from any device.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-[#3b368c]">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#1e1e2d] mb-2">Live Results</h3>
            <p className="text-gray-500 text-sm">
              Track real-time election results with beautiful visualizations directly on your dashboard.
            </p>
          </div>
        </div>

        <div className="pt-12">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-[#3b368c] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#3b368c]/30 hover:bg-[#2a266b] hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Sign In to Vote
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
