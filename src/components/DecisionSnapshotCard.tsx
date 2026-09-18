import React, { useState } from "react";
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  Info, 
  ChevronDown, 
  ChevronUp 
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
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  Modeled Estimate
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${goNoGoBadgeClass}`}>
                  {go_no_go.score >= 75 ? "High Feasibility" : go_no_go.score >= 60 ? "Viable with Care" : "Elevated Risk"}
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
                {go_no_go.supported_dimensions.map((dim) => (
                  <div key={dim.dimension} className="bg-[#FAFDF9] p-2.5 rounded-xl border border-[#E0EBDD]">
                    <div className="flex justify-between font-bold text-[#193522]">
                      <span>{dim.dimension}</span>
                      <span className="text-[#1E5D38]">
                        {dim.score} / {dim.max_score}
                      </span>
                    </div>
                    {dim.assessment && (
                      <p className="text-[11px] text-[#556958] mt-0.5">{dim.assessment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
        </div>
      </div>

      {/* Prominent Score Independence Banner Mandate */}
      <div className="bg-[#FFFDF6] border-2 border-[#EADAB2] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-[#524422]">
          <h4 className="font-bold text-[#3B3014] uppercase tracking-wide text-[11px]">
            Score Independence Notice:
          </h4>
          <p className="mt-0.5 leading-relaxed">
            <strong>These scores measure different things and should not be combined.</strong>{" "}
            The <em>Final Go/No-Go Model Score</em> reflects whether the business idea is viable under modeled market conditions. The <em>Credibility Score</em> reflects how much solid evidence was available to VEYA during analysis. A high Credibility Score does not guarantee profit, and a low Credibility Score simply means local field counts should be double-checked.
          </p>
        </div>
      </div>
    </div>
  );
};
