import React, { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight, TrendingUp, IndianRupee, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { FinancialPlan, WhatIfResponse } from "../types";

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFinancials: FinancialPlan;
  category: string;
  location: any;
  currentGoNoGoScore: number;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentFinancials,
  category,
  location,
  currentGoNoGoScore,
}) => {
  const currentCap = currentFinancials.margin_capital.value;
  const [newCapital, setNewCapital] = useState<number>(currentCap * 1.5);
  const [simulation, setSimulation] = useState<WhatIfResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runSimulation(newCapital);
    }
  }, [isOpen]);

  const runSimulation = async (val: number) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          current_capital: currentCap,
          new_capital: val,
          location,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulation(data);
      }
    } catch (err) {
      console.error("Failed to run what-if simulation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const presets = [
    { label: "₹25k", val: 25000 },
    { label: "₹50k", val: 50000 },
    { label: "₹1.0L", val: 100000 },
    { label: "₹1.5L", val: 150000 },
    { label: "₹2.0L", val: 200000 },
    { label: "₹3.0L", val: 300000 },
    { label: "₹5.0L", val: 500000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#DFE7D8] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8EEE5] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F4E7] text-[#1E5D38] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#142C1D]">
                Interactive What-If Capital Simulator
              </h3>
              <p className="text-xs text-[#526354]">
                Explore how altering your promoter equity impacts loan eligibility, EMI, and viability scores.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6F0] hover:bg-[#EAEFE6] text-[#4A5D4D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Slider & Presets */}
          <div className="bg-[#FAFDF9] p-5 rounded-2xl border border-[#DFEADD] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5F7362] block">
                  Simulate New Margin Capital
                </span>
                <span className="text-2xl font-serif font-bold text-[#142C1D]">
                  ₹{newCapital.toLocaleString()}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#1E5D38] bg-[#E8F4E7] px-3 py-1 rounded-full border border-[#CCE0CD]">
                Current: ₹{currentCap.toLocaleString()}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={newCapital}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNewCapital(val);
                runSimulation(val);
              }}
              className="w-full accent-[#1E5D38] cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {presets.map((p) => (
                <button
                  key={p.val}
                  onClick={() => {
                    setNewCapital(p.val);
                    runSimulation(p.val);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    newCapital === p.val
                      ? "bg-[#1E5D38] text-white border-[#1E5D38]"
                      : "bg-white text-[#2F4433] border-[#D5DDD1] hover:bg-[#F3F6EE]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Output Cards */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#526354] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#1E5D38]" />
              <span>Recalculating deterministic financial engine & scores...</span>
            </div>
          ) : simulation ? (
            <div className="space-y-4">
              {/* Scheme change alert if threshold crossed */}
              {simulation.deltas.scheme_changed && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Scheme Boundary Crossed:</strong> Your revised project cost crossed the ₹1.40 Lakh threshold. The financial engine transitioned the loan from <em>{simulation.deltas.previous_scheme}</em> to <em>{simulation.deltas.new_scheme}</em> ({simulation.new_financials.scheme.interest_rate_percent}% p.a. with {simulation.new_financials.scheme.moratorium_months} months grace).
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Total Project Cost */}
                <div className="bg-[#FAFDF9] p-3.5 rounded-2xl border border-[#DFEADD]">
                  <span className="text-[10px] text-[#5F7362] uppercase font-bold block">
                    Total Project Cost
                  </span>
                  <span className="text-base font-bold text-[#142C1D] block mt-1">
                    {simulation.new_financials.project_cost.formatted}
                  </span>
                  <span className={`text-[10px] font-bold block mt-0.5 ${simulation.deltas.project_cost >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {simulation.deltas.project_cost_formatted}
                  </span>
                </div>

                {/* Concessional Loan */}
                <div className="bg-[#FAFDF9] p-3.5 rounded-2xl border border-[#DFEADD]">
                  <span className="text-[10px] text-[#5F7362] uppercase font-bold block">
                    Concessional Loan
                  </span>
                  <span className="text-base font-bold text-[#1E5D38] block mt-1">
                    {simulation.new_financials.loan_eligibility.formatted}
                  </span>
                  <span className={`text-[10px] font-bold block mt-0.5 ${simulation.deltas.loan >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {simulation.deltas.loan_formatted}
                  </span>
                </div>

                {/* Monthly Installment */}
                <div className="bg-[#FAFDF9] p-3.5 rounded-2xl border border-[#DFEADD]">
                  <span className="text-[10px] text-[#5F7362] uppercase font-bold block">
                    Monthly EMI
                  </span>
                  <span className="text-base font-bold text-[#142C1D] block mt-1">
                    {simulation.new_financials.emi.formatted}
                  </span>
                  <span className={`text-[10px] font-bold block mt-0.5 ${simulation.deltas.emi >= 0 ? "text-amber-700" : "text-emerald-700"}`}>
                    {simulation.deltas.emi_formatted}
                  </span>
                </div>

                {/* Recalculated Go/No-Go Model Score */}
                <div className="bg-[#FAFDF9] p-3.5 rounded-2xl border border-[#DFEADD]">
                  <span className="text-[10px] text-[#5F7362] uppercase font-bold block">
                    Go / No-Go Model Score
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-serif font-bold text-[#142C1D]">
                      {simulation.deltas.recalculated_go_no_go}
                    </span>
                    <span className="text-[10px] text-[#69796C]">/ 100</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#1E5D38] block mt-0.5">
                    Was {currentGoNoGoScore}/100
                  </span>
                </div>
              </div>

              {/* Working Capital Delta Card */}
              <div className="bg-[#EDF5EC] p-3.5 rounded-2xl border border-[#CFE1CE] text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#154726] block">
                    Required Working Capital Buffer: {simulation.new_financials.working_capital.formatted}
                  </span>
                  <span className="text-[11px] text-[#475C4B]">
                    Delta from current: {simulation.deltas.working_capital_formatted}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-[#1E5D38] border border-[#CCDDCB]">
                  {simulation.new_financials.scheme.scheme_name}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8FAF5] border-t border-[#E8EEE5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#1E5D38] text-white hover:bg-[#154628] transition-colors"
          >
            Done Simulating
          </button>
        </div>
      </div>
    </div>
  );
};
