import React, { useState } from "react";
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from "lucide-react";
import { DecisionSnapshot } from "../types";

interface DecisionSnapshotCardProps {
  snapshot: DecisionSnapshot;
}

export const DecisionSnapshotCard: React.FC<DecisionSnapshotCardProps> = ({ snapshot }) => {
  const [showGoNoGoDetails, setShowGoNoGoDetails] = useState(false);
  const [showCredibilityDetails, setShowCredibilityDetails] = useState(false);

  const { go_no_go, credibility } = snapshot;

  // Determine Go/No-Go Badge color
  const goNoGoBadgeClass =
    go_no_go.score >= 75
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : go_no_go.score >= 60
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-rose-100 text-rose-800 border-rose-300";

  const credibilityBadgeClass =
    credibility.score >= 75
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : credibility.score >= 60
      ? "bg-indigo-100 text-indigo-800 border-indigo-300"
      : "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <div className="space-y-4">
      {/* VEYA Decision Snapshot Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5D38] bg-[#E8F4E7] px-3 py-1 rounded-full border border-[#C6DECA]">
            Decision Intelligence Snapshot
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D] mt-2">
            VEYA Dual Independent Assessment Scores
          </h2>
        </div>
      </div>

      {/* Side-by-Side Dual Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ================= CARD 1: FINAL GO / NO-GO MODEL SCORE ================= */}
        <div className="bg-white rounded-3xl border-2 border-[#D3E4D2] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E5D38] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Card 1: Business Viability</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-[#1B4D2B] border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Calculation + AI Verification</span>
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${goNoGoBadgeClass}`}>
                  {go_no_go.score >= 75 ? "High Feasibility" : go_no_go.score >= 50 ? "Viable with Care" : "Critical Risk (<50)"}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-serif font-bold text-[#142C1D] mt-2">
              FINAL GO / NO-GO MODEL SCORE
            </h3>
            <p className="text-xs text-[#526354] mt-0.5">
              {go_no_go.meaning}
            </p>

            {/* Score Big Display */}
            <div className="my-5 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-[#142C1D] tracking-tight">
                {go_no_go.score}
              </span>
              <span className="text-xl font-bold text-[#6B7E6F]">/ 100</span>
            </div>

            {/* Visual Score Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-[#EBF2EA] h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-[#1E5D38] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, go_no_go.score))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#697E6E] font-medium">
                <span>0 (Unviable)</span>
                <span>50 (Marginal)</span>
                <span>100 (Exceptional)</span>
              </div>
            </div>
          </div>

          {/* Dimension Details Toggle */}
          <div className="mt-5 pt-4 border-t border-[#E8EFE5]">
            <button
              onClick={() => setShowGoNoGoDetails(!showGoNoGoDetails)}
              className="w-full text-xs font-semibold text-[#1E5D38] flex items-center justify-between hover:underline"
            >
              <span>View 6 Evaluated Viability Dimensions</span>
              {showGoNoGoDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGoNoGoDetails && (
              <div className="mt-3 space-y-2.5 pt-2 text-xs">
                {go_no_go.supported_dimensions.map((dim) => {
                  const isAIViabilityDim = dim.dimension.includes("AI Viability Dimension");
                  return (
                    <div
                      key={dim.dimension}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isAIViabilityDim
                          ? "bg-[#F2FAF4] border-[#B2DEB6] shadow-2xs"
                          : "bg-[#FAFDF9] border-[#E0EBDD]"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-[#193522]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isAIViabilityDim && <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                          <span>{dim.dimension}</span>
                          {isAIViabilityDim && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              AI Audited
                            </span>
                          )}
                        </div>
                        <span className={`shrink-0 ml-2 ${isAIViabilityDim ? "text-emerald-800 font-extrabold" : "text-[#1E5D38]"}`}>
                          {dim.score} / {dim.max_score}
                        </span>
                      </div>
                      {dim.assessment && (
                        <p className={`text-[11px] mt-1 leading-snug ${isAIViabilityDim ? "text-[#244C2D] font-medium" : "text-[#556958]"}`}>
                          {dim.assessment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* In-Card Score Indicator & Short Concise Meaning Notice */}
          <div className="mt-4 pt-3.5 border-t border-[#E8EFE5]">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F6FAF5] border border-[#DCEDDA]">
              <div className="mt-1 relative flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="absolute w-4 h-4 rounded-full bg-emerald-400 opacity-40 animate-ping" />
              </div>
              <div className="text-[11px] leading-relaxed text-[#2B4231]">
                <div className="flex items-center gap-1.5 font-bold text-[#142C1D]">
                  <span>Commercial Feasibility & Risk Measure</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Input-Sensitive
                  </span>
                </div>
                <p className="mt-0.5 text-[#3D5643]">
                  Evaluates whether this business can physically and financially succeed locally. Highly sensitive to promoter operational claims and costs. <em>Does not reflect data coverage completeness.</em>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CARD 2: CREDIBILITY SCORE ================= */}
        <div className="bg-white rounded-3xl border-2 border-[#D8DFEE] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2A487B] flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Card 2: Evidence Reliability</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Audit
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${credibilityBadgeClass}`}>
                  {credibility.score >= 75 ? "Strong Evidence" : "Moderate Coverage"}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-serif font-bold text-[#152744] mt-2">
              CREDIBILITY SCORE
            </h3>
            <p className="text-xs text-[#526075] mt-0.5">
              {credibility.meaning}
            </p>

            {/* Score Big Display */}
            <div className="my-5 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-[#152744] tracking-tight">
                {credibility.score}
              </span>
              <span className="text-xl font-bold text-[#6E7B8F]">/ 100</span>
            </div>

            {/* Visual Score Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-[#EBF0F8] h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-[#2A487B] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, credibility.score))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6E7B8F] font-medium">
                <span>0 (Sparse Data)</span>
                <span>50 (Proxied Data)</span>
                <span>100 (Full Field Audit)</span>
              </div>
            </div>
          </div>

          {/* Evidence Audit Toggle */}
          <div className="mt-5 pt-4 border-t border-[#E5ECF6]">
            <button
              onClick={() => setShowCredibilityDetails(!showCredibilityDetails)}
              className="w-full text-xs font-semibold text-[#2A487B] flex items-center justify-between hover:underline"
            >
              <span>Why this score? (Evidence Quality Audit)</span>
              {showCredibilityDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCredibilityDetails && (
              <div className="mt-3 space-y-2 pt-2 text-xs">
                {credibility.evidence_audit.map((audit, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-[#F7F9FC] border border-[#E3EAF5]"
                  >
                    {audit.status === "VERIFIED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="text-[#1F304B] font-medium block">{audit.label}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          audit.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {audit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* In-Card Score Indicator & Short Concise Meaning Notice */}
          <div className="mt-4 pt-3.5 border-t border-[#E5ECF6]">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F4F7FC] border border-[#DAE4F5]">
              <div className="mt-1 relative flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="absolute w-4 h-4 rounded-full bg-blue-400 opacity-40 animate-ping" />
              </div>
              <div className="text-[11px] leading-relaxed text-[#1D3254]">
                <div className="flex items-center gap-1.5 font-bold text-[#152744]">
                  <span>Evidence Rigor & Ground-Truth Belief</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Source-Verified
                  </span>
                </div>
                <p className="mt-0.5 text-[#3D4F6A]">
                  Measures the quantity and verification strength of official government records backing this case. <em>A high score confirms data authenticity, not guaranteed profitability.</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
