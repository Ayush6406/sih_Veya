import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Database, ShieldAlert, Sparkles, Building } from "lucide-react";

interface LoadingAnalysisProps {
  category: string;
  location: string;
}

const STEPS = [
  "Resolving official Maharashtra state demographics for block...",
  "Running 100% deterministic concessional financial engine...",
  "Auditing competition density & addressable customer reach...",
  "Evaluating local consumer purchasing power & APMC price benchmarks...",
  "Calculating Final Go/No-Go Score & Independent Credibility Score...",
  "Synthesizing qualitative SWOT & operational threat mitigations...",
];

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({ category, location }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-[#DFE7D8] shadow-lg p-8 max-w-xl mx-auto my-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#E8F4E7] text-[#1E5D38] mx-auto flex items-center justify-center mb-4 relative">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <h3 className="text-xl font-serif font-bold text-[#142C1D]">
        VEYA is evaluating your {category} proposal
      </h3>
      <p className="text-xs text-[#526455] mt-1">
        Synthesizing Maharashtra state demographic data, concessional scheme logic, and market intelligence for {location}...
      </p>

      {/* Steps List */}
      <div className="mt-6 space-y-2.5 text-left border-t border-[#EAEFE6] pt-5">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={stepText}
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                isDone
                  ? "text-[#1E5D38] font-medium"
                  : isCurrent
                  ? "text-[#142C1D] font-bold"
                  : "text-[#8E9F90] opacity-50"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#1E5D38] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
              )}
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
