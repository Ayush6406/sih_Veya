import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { RecommendationInfo } from "../types";

interface RecommendationBannerProps {
  recommendation: RecommendationInfo;
  onOpenWhatIf?: () => void;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
  recommendation,
  onOpenWhatIf,
}) => {
  const { status, summary_explanation, key_reasons, major_risks, suggested_action, validation_checks } = recommendation;

  const isRecommended = status === "RECOMMENDED";
  const isModifications = status === "RECOMMENDED WITH MODIFICATIONS";
  const isHighRisk = status === "HIGH RISK / RECONSIDER";

  const borderColor = isRecommended
    ? "border-[#347A4B]"
    : isModifications
    ? "border-amber-400"
    : "border-rose-400";

  const bgColor = isRecommended
    ? "bg-[#F3FAF4]"
    : isModifications
    ? "bg-[#FFFBF2]"
    : "bg-[#FFF5F5]";

  const statusBadgeColor = isRecommended
    ? "bg-[#1E5D38] text-white"
    : isModifications
    ? "bg-amber-600 text-white"
    : "bg-rose-700 text-white";

  return (
    <div className={`rounded-3xl border-2 ${borderColor} ${bgColor} p-6 sm:p-8 shadow-sm space-y-6`}>
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/5">
        <div className="flex items-center gap-2.5">
          {isRecommended ? (
            <CheckCircle2 className="w-7 h-7 text-[#1E5D38]" />
          ) : isModifications ? (
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          ) : (
            <AlertOctagon className="w-7 h-7 text-rose-600" />
          )}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A6D5D]">
              Advisory Decision
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide ${statusBadgeColor}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Provenance Tags */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Reasoning</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Modeled Estimate</span>
          </span>
        </div>
      </div>

      {/* Summary Explanation */}
      <div>
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#142C1D]">
          Executive Summary
        </h3>
        <p className="text-xs sm:text-sm text-[#3E5242] mt-1 leading-relaxed">
          {summary_explanation}
        </p>
      </div>

      {/* Reasons & Risks 2-column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Key Reasons */}
        <div className="bg-white/80 rounded-2xl p-4 border border-black/5 space-y-2">
          <h4 className="font-bold text-[#154627] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Key Supporting Factors</span>
          </h4>
          <ul className="space-y-1.5 text-[#304533]">
            {key_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Major Risks */}
        <div className="bg-white/80 rounded-2xl p-4 border border-black/5 space-y-2">
          <h4 className="font-bold text-[#6D4213] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Key Operational Risks</span>
          </h4>
          <ul className="space-y-1.5 text-[#4D3A24]">
            {major_risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Action Callout */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#566B59] block">
            Suggested Immediate Action
          </span>
          <p className="text-xs sm:text-sm font-bold text-[#142C1D] mt-0.5">
            {suggested_action}
          </p>
        </div>

        {onOpenWhatIf && (
          <button
            onClick={onOpenWhatIf}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1E5D38] hover:bg-[#16472A] text-white flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
          >
            <span>Simulate What-If</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Pre-Investment Validation Checks */}
      {validation_checks && validation_checks.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-bold text-[#344D38] block mb-2">
            Field Validation Checks (Recommended before applying for loan):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {validation_checks.map((check, idx) => (
              <div key={idx} className="bg-white/90 p-2.5 rounded-xl border border-black/5 text-[11px] text-[#425545] flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E5EFE6] text-[#1E5D38] font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
