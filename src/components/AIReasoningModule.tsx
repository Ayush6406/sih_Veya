import React from "react";
import { Sparkles, Compass, ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { FeasibilityDetails } from "../types";

interface AIReasoningModuleProps {
  opportunity: FeasibilityDetails["opportunity"];
  swot: FeasibilityDetails["swot"];
  threats: FeasibilityDetails["threats"];
  narrativeTier: string;
}

export const AIReasoningModule: React.FC<AIReasoningModuleProps> = ({
  opportunity,
  swot,
  threats,
  narrativeTier,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#DFE7D8] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8EEE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Grounded Qualitative Intelligence</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              AI Reasoning · {narrativeTier}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C1D] mt-1">
            AI Opportunity Analysis & Threat Mitigations
          </h2>
          <p className="text-xs text-[#526354] mt-0.5">
            Gemini synthesized qualitative strategy grounded strictly in verified APMC numbers and Census demographics.
          </p>
        </div>
      </div>

      {/* Prime Opportunity & Suggested Niches */}
      <div className="bg-[#FAFDF8] rounded-2xl border border-[#DFEADD] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D2B] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1E5D38]" />
            <span>Prime Local Opportunity</span>
          </span>
          <span className="text-[10px] font-semibold text-[#5B6D5D]">
            Hyper-Local Niche Matching
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-[#142C1D]">
          {opportunity.potential_opportunity}
        </p>
        <p className="text-xs text-[#485D4D] leading-relaxed">
          {opportunity.reasoning}
        </p>

        {/* Suggested Niches */}
        <div className="pt-2">
          <span className="text-[10px] uppercase font-bold text-[#667A68] block mb-2">
            High-Margin Suggested Niches:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {opportunity.suggested_niches.map((niche, idx) => (
              <div
                key={idx}
                className="bg-white p-2.5 rounded-xl border border-[#DFE7DC] text-xs font-semibold text-[#183521] flex items-center gap-2 shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#EAF5EB] text-[#1E5D38] flex items-center justify-center text-[10px] shrink-0 font-bold">
                  {idx + 1}
                </span>
                <span>{niche}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2x2 SWOT Quadrant */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F3D27]">
            2×2 Rural Strategic SWOT Matrix
          </h3>
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            AI Reasoning
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Strengths */}
          <div className="bg-[#F3FAF4] p-4 rounded-2xl border border-[#CFE4D2] space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#154627] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strengths</span>
            </span>
            <ul className="space-y-1.5 text-[#2D4532]">
              {swot.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#EBE1C0] space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#614911] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Weaknesses</span>
            </span>
            <ul className="space-y-1.5 text-[#4E3F1F]">
              {swot.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-[#F3F7FA] p-4 rounded-2xl border border-[#CFDFEC] space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#153857] flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Opportunities</span>
            </span>
            <ul className="space-y-1.5 text-[#2D3F52]">
              {swot.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-[#FFF5F5] p-4 rounded-2xl border border-[#ECD1D1] space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#691818] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Threats</span>
            </span>
            <ul className="space-y-1.5 text-[#4D2323]">
              {swot.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Top 3 Operational Threats & 1-line Actionable Mitigations */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F3D27]">
          Top 3 Operational Threats & Actionable Mitigations
        </h3>

        <div className="space-y-2.5">
          {threats.map((th, idx) => (
            <div
              key={idx}
              className="bg-[#FAFDF9] p-4 rounded-2xl border border-[#E0EBDD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 sm:max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#142C1D]">{th.threat}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      th.risk_level === "HIGH"
                        ? "bg-rose-100 text-rose-800"
                        : th.risk_level === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {th.risk_level} RISK
                  </span>
                </div>
                <p className="text-[11px] text-[#556958]">{th.explanation}</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#DFE7DC] sm:max-w-xs w-full">
                <span className="text-[9px] uppercase font-bold text-[#1E5D38] block mb-0.5">
                  Actionable Mitigation
                </span>
                <p className="text-[11px] text-[#2C4130] font-medium leading-tight">
                  {th.mitigation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
