import React from "react";
import { ArrowRight, CheckCircle2, TrendingUp, IndianRupee, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onStartClick: () => void;
  onExploreSample: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartClick,
  onExploreSample,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F8F1] via-[#FBFBF7] to-[#FBFBF7] pt-8 pb-14 border-b border-[#E6EDE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Mission & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#142C1D] tracking-tight leading-tight">
              Hyper-local business feasibility & concessional financing for rural India.
            </h1>

            <p className="text-base sm:text-lg text-[#374B3B] leading-relaxed max-w-2xl font-sans font-medium">
              VEYA tells a rural entrepreneur exactly what they need before they borrow — not just whether the idea sounds good.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/90 rounded-2xl p-4 border border-[#DFE7D8] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF5EC] text-[#1E5D38] flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#183120]">Dual Scores</h4>
                <p className="text-[11px] text-[#556457] mt-1 leading-relaxed">
                  Independent Go/No-Go Feasibility and Evidence Credibility indices.
                </p>
              </div>

              <div className="bg-white/90 rounded-2xl p-4 border border-[#DFE7D8] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF5EC] text-[#1E5D38] flex items-center justify-center mb-2.5">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#183120]">90% Concessional Loan</h4>
                <p className="text-[11px] text-[#556457] mt-1 leading-relaxed">
                  Official 6.5% - 8.0% interest schemes with 3 to 6-month repayment grace.
                </p>
              </div>

              <div className="bg-white/90 rounded-2xl p-4 border border-[#DFE7D8] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF5EC] text-[#1E5D38] flex items-center justify-center mb-2.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#183120]">Local Purchasing Power</h4>
                <p className="text-[11px] text-[#556457] mt-1 leading-relaxed">
                  Real APMC price benchmarks and reachable household demand modeling.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartClick}
                className="px-6 py-3 rounded-xl bg-[#1E5D38] hover:bg-[#154629] text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-[#1E5D38]/20 transition-all hover:scale-[1.01]"
              >
                <span>Assess Your Business Idea</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreSample}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#F3F6ED] text-[#203726] border border-[#CFD9CA] text-sm font-semibold transition-colors"
              >
                Load Sample Dairy Analysis
              </button>
            </div>
          </div>

          {/* Right Column: Visual Frame matching Sample Art Direction */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Illustration Container */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#E8EFE3] aspect-4/3 sm:aspect-square flex items-center justify-center">
                <img
                  src="/src/assets/images/veya_hero_illustration_1789662958962.jpg"
                  alt="Rural Indian Entrepreneur with VEYA Business Insights"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
